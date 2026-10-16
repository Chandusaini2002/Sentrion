import uuid
from datetime import datetime, timezone

from fastapi import HTTPException
from pydantic import ValidationError
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.camera import Camera
from app.models.enums import CameraStatus, ConnectionType
from app.schemas.camera import CameraCreate, CameraUpdate, NVRChannelsCreateRequest
from app.services.camera_connection_service import build_cp_plus_rtsp_url


def create_camera(
    db: Session,
    payload: CameraCreate,
    owner_id: uuid.UUID,
    connection_verified: bool = False,
) -> Camera:
    data = payload.model_dump(exclude={"user_id", "verify_connection"})
    camera = Camera(owner_id=owner_id, **data)
    if connection_verified:
        now = datetime.now(timezone.utc)
        camera.status = CameraStatus.online
        camera.last_connection_at = now
        camera.last_activity_at = now
    db.add(camera)
    db.commit()
    db.refresh(camera)
    return camera


def create_verified_nvr_channels(
    db: Session,
    payload: NVRChannelsCreateRequest,
    owner_id: uuid.UUID,
) -> list[Camera]:
    now = datetime.now(timezone.utc)
    cameras: list[Camera] = []
    for selected in payload.channels:
        camera = Camera(
            owner_id=owner_id,
            name=selected.name,
            location=selected.location,
            connection_type=ConnectionType.rtsp,
            ip_address=payload.address,
            rtsp_url=build_cp_plus_rtsp_url(
                payload.address,
                payload.rtsp_port,
                selected.channel,
                payload.stream_profile,
            ),
            username=payload.username,
            password=payload.password,
            status=CameraStatus.online,
            is_enabled=True,
            last_connection_at=now,
            last_activity_at=now,
            people_detected=0,
        )
        cameras.append(camera)

    db.add_all(cameras)
    db.commit()
    for camera in cameras:
        db.refresh(camera)
    return cameras


def list_cameras(db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100) -> list[Camera]:
    stmt = (
        select(Camera)
        .where(Camera.owner_id == user_id)
        .order_by(Camera.created_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_camera(db: Session, camera_id: uuid.UUID) -> Camera | None:
    return db.get(Camera, camera_id)


def update_camera(db: Session, camera: Camera, payload: CameraUpdate) -> Camera:
    updates = payload.model_dump(exclude_unset=True)
    try:
        CameraCreate.model_validate(
            {
                field: updates.get(field, getattr(camera, field))
                for field in CameraCreate.model_fields
                if field != "verify_connection"
            }
        )
    except ValidationError:
        raise HTTPException(422, "Provide a valid camera name and address.") from None
    if updates.get("is_enabled", True) is None:
        raise HTTPException(422, "Camera enabled state cannot be null.")
    if any(field in updates for field in ("rtsp_url", "ip_address", "username", "password", "connection_type")):
        camera.status = CameraStatus.offline
        camera.last_connection_at = None
    for field, value in updates.items():
        setattr(camera, field, value)
    db.commit()
    db.refresh(camera)
    return camera


def set_connection_state(db: Session, camera: Camera, online: bool) -> Camera:
    camera.status = CameraStatus.online if online else CameraStatus.offline
    camera.last_connection_at = datetime.now(timezone.utc) if online else None
    db.commit()
    db.refresh(camera)
    return camera


def delete_camera(db: Session, camera: Camera) -> None:
    db.delete(camera)
    db.commit()
