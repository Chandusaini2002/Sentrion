import uuid
from datetime import datetime
from typing import Literal
from urllib.parse import urlsplit

from pydantic import BaseModel, Field, field_validator, model_validator

from app.models.enums import CameraStatus, ConnectionType
from app.schemas.common import ORMModel


class CameraCreate(BaseModel):
    """Request body for POST /api/cameras.

    Credentials and RTSP URLs are write-only and encrypted at rest. Setting
    verify_connection=true makes the backend verify the RTSP stream before
    inserting the camera.
    """

    name: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    connection_type: ConnectionType = ConnectionType.rtsp
    ip_address: str | None = Field(default=None, max_length=100)
    rtsp_url: str | None = Field(default=None, max_length=1024)
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, max_length=255)
    verify_connection: bool = False

    @field_validator("ip_address")
    @classmethod
    def safe_host(cls, value):
        if value and any(char in value for char in "/@?# "):
            raise ValueError("Camera address must be an IP address or hostname.")
        return value

    @field_validator("rtsp_url")
    @classmethod
    def valid_rtsp(cls, value):
        if value:
            try:
                parsed = urlsplit(value)
                if parsed.scheme not in ("rtsp", "rtsps") or not parsed.hostname:
                    raise ValueError()
                _ = parsed.port
            except ValueError:
                raise ValueError("Provide a valid RTSP URL.") from None
        return value

    @model_validator(mode="after")
    def require_an_address(self) -> "CameraCreate":
        if not self.ip_address and not self.rtsp_url:
            raise ValueError("Provide either ip_address or rtsp_url.")
        if self.verify_connection and not self.rtsp_url:
            raise ValueError("A real connection test requires an RTSP URL.")
        return self


class CameraUpdate(BaseModel):
    """PATCH body — every field optional, only supplied fields change."""

    name: str | None = Field(default=None, max_length=255)
    location: str | None = Field(default=None, max_length=255)
    connection_type: ConnectionType | None = None
    ip_address: str | None = Field(default=None, max_length=100)
    rtsp_url: str | None = Field(default=None, max_length=1024)
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, max_length=255)
    is_enabled: bool | None = None


class CameraConnectionTestRequest(BaseModel):
    device_type: Literal["cp_plus_nvr", "generic_rtsp"] = "cp_plus_nvr"
    address: str = Field(min_length=1, max_length=1024)
    rtsp_port: int = Field(default=554, ge=1, le=65535)
    channel: int = Field(default=1, ge=1, le=128)
    stream_profile: Literal["main", "sub"] = "sub"
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, max_length=255)


class CameraConnectionTestResponse(BaseModel):
    success: bool
    reachable: bool
    stream_verified: bool
    message: str
    rtsp_url: str
    host: str
    port: int
    codec: str | None = None
    width: int | None = None
    height: int | None = None


class NVRChannelScanRequest(BaseModel):
    address: str = Field(min_length=1, max_length=255)
    rtsp_port: int = Field(default=554, ge=1, le=65535)
    channel_count: int = Field(default=4, ge=1, le=32)
    stream_profile: Literal["main", "sub"] = "sub"
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, max_length=255)


class NVRChannelProbe(BaseModel):
    channel: int
    success: bool
    reachable: bool
    stream_verified: bool
    message: str
    rtsp_url: str
    codec: str | None = None
    width: int | None = None
    height: int | None = None


class NVRChannelScanResponse(BaseModel):
    address: str
    rtsp_port: int
    channel_count: int
    stream_profile: Literal["main", "sub"]
    successful_channels: int
    channels: list[NVRChannelProbe]


class NVRChannelSelection(BaseModel):
    channel: int = Field(ge=1, le=128)
    name: str = Field(min_length=1, max_length=255)
    location: str | None = Field(default=None, max_length=255)


class NVRChannelsCreateRequest(BaseModel):
    address: str = Field(min_length=1, max_length=255)
    rtsp_port: int = Field(default=554, ge=1, le=65535)
    stream_profile: Literal["main", "sub"] = "sub"
    username: str | None = Field(default=None, max_length=255)
    password: str | None = Field(default=None, max_length=255)
    channels: list[NVRChannelSelection] = Field(min_length=1, max_length=32)

    @model_validator(mode="after")
    def unique_channels(self) -> "NVRChannelsCreateRequest":
        channel_numbers = [item.channel for item in self.channels]
        if len(channel_numbers) != len(set(channel_numbers)):
            raise ValueError("Each NVR channel can only be selected once.")
        return self


class CameraStreamResponse(BaseModel):
    available: bool
    message: str
    path_name: str | None = None
    webrtc_url: str | None = None
    hls_url: str | None = None


class CameraRead(ORMModel):
    """Public camera response. Secrets are intentionally excluded."""

    id: uuid.UUID
    owner_id: uuid.UUID
    name: str
    location: str | None
    connection_type: ConnectionType
    address: str | None = Field(validation_alias="redacted_address")
    has_credentials: bool
    status: CameraStatus
    is_enabled: bool
    last_connection_at: datetime | None
    last_activity_at: datetime | None
    people_detected: int
    created_at: datetime
    updated_at: datetime
