import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.enums import CameraStatus
from app.models.user import User
from app.schemas.camera import (
    CameraConnectionTestRequest,
    CameraConnectionTestResponse,
    CameraCreate,
    CameraRead,
    CameraStreamResponse,
    CameraUpdate,
    NVRChannelProbe,
    NVRChannelScanRequest,
    NVRChannelScanResponse,
    NVRChannelsCreateRequest,
)
from app.services import camera_service
from app.services.camera_connection_service import (
    build_cp_plus_rtsp_url,
    scan_cp_plus_channels,
    test_cp_plus_channel_numbers,
    test_rtsp_connection,
)
from app.services.media_server_service import MediaServerError, ensure_camera_path, remove_camera_path

router = APIRouter(prefix="/cameras", tags=["Cameras"])


def _run_test(payload: CameraConnectionTestRequest):
    if payload.device_type == "cp_plus_nvr":
        rtsp_url = build_cp_plus_rtsp_url(
            payload.address,
            payload.rtsp_port,
            payload.channel,
            payload.stream_profile,
        )
    else:
        rtsp_url = payload.address.strip()

    result = test_rtsp_connection(rtsp_url, payload.username, payload.password)
    return rtsp_url, result


@router.post("/test-connection", response_model=CameraConnectionTestResponse)
def test_camera_connection(
    payload: CameraConnectionTestRequest,
    user: User = Depends(get_current_user),
) -> CameraConnectionTestResponse:
    del user
    try:
        _, result = _run_test(payload)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None
    return CameraConnectionTestResponse(
        success=result.success,
        reachable=result.reachable,
        stream_verified=result.stream_verified,
        message=result.message,
        rtsp_url=result.redacted_url,
        host=result.host,
        port=result.port,
        codec=result.codec,
        width=result.width,
        height=result.height,
    )


@router.post("/scan-nvr", response_model=NVRChannelScanResponse)
def scan_nvr(
    payload: NVRChannelScanRequest,
    user: User = Depends(get_current_user),
) -> NVRChannelScanResponse:
    del user
    try:
        rows = scan_cp_plus_channels(
            host=payload.address,
            port=payload.rtsp_port,
            channel_count=payload.channel_count,
            stream_profile=payload.stream_profile,
            username=payload.username,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None

    probes = [
        NVRChannelProbe(
            channel=channel,
            success=result.success,
            reachable=result.reachable,
            stream_verified=result.stream_verified,
            message=result.message,
            rtsp_url=result.redacted_url,
            codec=result.codec,
            width=result.width,
            height=result.height,
        )
        for channel, result in rows
    ]
    return NVRChannelScanResponse(
        address=payload.address,
        rtsp_port=payload.rtsp_port,
        channel_count=payload.channel_count,
        stream_profile=payload.stream_profile,
        successful_channels=sum(1 for probe in probes if probe.success),
        channels=probes,
    )


@router.post("/nvr-channels", response_model=list[CameraRead], status_code=status.HTTP_201_CREATED)
def create_nvr_channels(
    payload: NVRChannelsCreateRequest,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CameraRead]:
    # Re-verify every selected channel on the backend so a stale browser scan
    # can never save a channel that is no longer returning video.
    selected_numbers = {item.channel for item in payload.channels}
    try:
        rows = test_cp_plus_channel_numbers(
            host=payload.address,
            port=payload.rtsp_port,
            channels=sorted(selected_numbers),
            stream_profile=payload.stream_profile,
            username=payload.username,
            password=payload.password,
        )
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None

    failures = [channel for channel, result in rows if channel in selected_numbers and not result.success]
    if failures:
        joined = ", ".join(str(channel) for channel in failures)
        raise HTTPException(status_code=422, detail=f"Channel test failed for channel(s): {joined}.")

    cameras = camera_service.create_verified_nvr_channels(db, payload, user.id)
    # MediaMTX registration is best-effort here. The stream endpoint retries
    # registration, so saving cameras still works when MediaMTX is temporarily stopped.
    for camera in cameras:
        try:
            ensure_camera_path(camera)
        except MediaServerError:
            pass
    return cameras


@router.post("", response_model=CameraRead, status_code=status.HTTP_201_CREATED)
def create_camera(
    payload: CameraCreate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CameraRead:
    verified = False
    if payload.verify_connection:
        try:
            result = test_rtsp_connection(payload.rtsp_url or "", payload.username, payload.password)
        except ValueError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from None
        if not result.success:
            raise HTTPException(status_code=422, detail=result.message)
        verified = True
    camera = camera_service.create_camera(db, payload, user.id, connection_verified=verified)
    if verified:
        try:
            ensure_camera_path(camera)
        except MediaServerError:
            pass
    return camera


@router.get("", response_model=list[CameraRead])
def list_cameras(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> list[CameraRead]:
    return camera_service.list_cameras(db, user_id=user.id, skip=skip, limit=limit)


@router.post("/{camera_id}/test-connection", response_model=CameraConnectionTestResponse)
def test_saved_camera_connection(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CameraConnectionTestResponse:
    camera = camera_service.get_camera(db, camera_id)
    if not camera or camera.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found.")
    if not camera.rtsp_url:
        raise HTTPException(status_code=422, detail="This camera does not have an RTSP URL configured.")
    try:
        result = test_rtsp_connection(camera.rtsp_url, camera.username, camera.password)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from None
    camera_service.set_connection_state(db, camera, result.success)
    if result.success:
        try:
            ensure_camera_path(camera)
        except MediaServerError:
            pass
    return CameraConnectionTestResponse(
        success=result.success,
        reachable=result.reachable,
        stream_verified=result.stream_verified,
        message=result.message,
        rtsp_url=result.redacted_url,
        host=result.host,
        port=result.port,
        codec=result.codec,
        width=result.width,
        height=result.height,
    )


@router.get("/{camera_id}/stream", response_model=CameraStreamResponse)
def get_camera_stream(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CameraStreamResponse:
    camera = camera_service.get_camera(db, camera_id)
    if not camera or camera.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found.")
    if not camera.is_enabled:
        return CameraStreamResponse(available=False, message="This camera is disabled.")
    if camera.status != CameraStatus.online:
        return CameraStreamResponse(
            available=False,
            message="Camera is offline. Test the connection again before opening Live Monitoring.",
        )
    try:
        stream = ensure_camera_path(camera)
    except MediaServerError as exc:
        return CameraStreamResponse(available=False, message=str(exc))
    return CameraStreamResponse(
        available=True,
        message="Live stream is ready through MediaMTX.",
        path_name=stream.path_name,
        webrtc_url=stream.webrtc_url,
        hls_url=stream.hls_url,
    )


@router.get("/{camera_id}", response_model=CameraRead)
def get_camera(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CameraRead:
    camera = camera_service.get_camera(db, camera_id)
    if not camera or camera.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found.")
    return camera


@router.patch("/{camera_id}", response_model=CameraRead)
def update_camera(
    camera_id: uuid.UUID,
    payload: CameraUpdate,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> CameraRead:
    camera = camera_service.get_camera(db, camera_id)
    if not camera or camera.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found.")
    remove_camera_path(camera)
    return camera_service.update_camera(db, camera, payload)


@router.delete("/{camera_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_camera(
    camera_id: uuid.UUID,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
) -> None:
    camera = camera_service.get_camera(db, camera_id)
    if not camera or camera.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Camera not found.")
    remove_camera_path(camera)
    camera_service.delete_camera(db, camera)
