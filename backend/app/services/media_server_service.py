"""MediaMTX integration for authenticated camera streams.

The MediaMTX Control API is intentionally expected to listen only on localhost.
Camera credentials are sent only from this backend to the local MediaMTX API;
they are never returned to the browser.
"""
from __future__ import annotations

import json
import urllib.error
import urllib.request
from dataclasses import dataclass
from urllib.parse import quote

from app.core.config import settings
from app.models.camera import Camera
from app.services.camera_connection_service import with_credentials


class MediaServerError(RuntimeError):
    pass


@dataclass(slots=True)
class CameraStreamInfo:
    path_name: str
    webrtc_url: str
    hls_url: str


def camera_path_name(camera: Camera) -> str:
    return f"camera-{camera.id}"


def _api_url(path: str) -> str:
    return f"{settings.MEDIAMTX_API_URL.rstrip('/')}{path}"


def _request(method: str, path: str, payload: dict | None = None) -> tuple[int, dict | None]:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    request = urllib.request.Request(
        _api_url(path),
        data=body,
        method=method,
        headers={"Content-Type": "application/json"},
    )
    try:
        with urllib.request.urlopen(request, timeout=4.0) as response:
            raw = response.read().decode("utf-8")
            if not raw:
                return response.status, None
            try:
                return response.status, json.loads(raw)
            except json.JSONDecodeError:
                return response.status, None
    except urllib.error.HTTPError as exc:
        # Never return MediaMTX response bodies to callers because a future
        # MediaMTX version could include source configuration in an error.
        return exc.code, None
    except (urllib.error.URLError, TimeoutError, OSError) as exc:
        raise MediaServerError(
            "MediaMTX is not reachable. Start MediaMTX and try Live Monitoring again."
        ) from exc


def mediamtx_available() -> bool:
    try:
        status, _ = _request("GET", "/v3/config/global/get")
    except MediaServerError:
        return False
    return 200 <= status < 300


def ensure_camera_path(camera: Camera) -> CameraStreamInfo:
    if not camera.rtsp_url:
        raise MediaServerError("This camera does not have an RTSP stream configured.")

    path_name = camera_path_name(camera)
    encoded_name = quote(path_name, safe="")
    source = with_credentials(camera.rtsp_url, camera.username, camera.password)

    config = {
        "source": source,
        "sourceOnDemand": True,
        "sourceOnDemandStartTimeout": "15s",
        "sourceOnDemandCloseAfter": "15s",
        "rtspTransport": "tcp",
        "maxReaders": 10,
        "record": False,
    }

    status, _ = _request("GET", f"/v3/config/paths/get/{encoded_name}")
    if status == 200:
        status, _ = _request("PATCH", f"/v3/config/paths/patch/{encoded_name}", config)
    elif status == 404:
        status, _ = _request("POST", f"/v3/config/paths/add/{encoded_name}", config)
    else:
        raise MediaServerError("MediaMTX could not read its camera path configuration.")

    if not 200 <= status < 300:
        raise MediaServerError("MediaMTX could not register this camera stream.")

    return CameraStreamInfo(
        path_name=path_name,
        webrtc_url=f"{settings.MEDIAMTX_WEBRTC_URL.rstrip('/')}/{path_name}",
        hls_url=f"{settings.MEDIAMTX_HLS_URL.rstrip('/')}/{path_name}/index.m3u8",
    )


def remove_camera_path(camera: Camera) -> None:
    path_name = camera_path_name(camera)
    encoded_name = quote(path_name, safe="")
    try:
        _request("DELETE", f"/v3/config/paths/delete/{encoded_name}")
    except MediaServerError:
        # Camera deletion must not fail just because MediaMTX is stopped.
        pass
