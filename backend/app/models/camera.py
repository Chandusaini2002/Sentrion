from app.core.encryption import EncryptedText
from urllib.parse import urlsplit
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import CameraStatus, ConnectionType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class Camera(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A registered security camera, owned by exactly one user.

    SECURITY NOTE: rtsp_url, username, and password can hold live
    connection secrets (an RTSP URL may itself embed credentials, e.g.
    rtsp://user:pass@host/stream). These columns are intentionally never
    included in the default Pydantic response schema (see
    schemas/camera.py: CameraRead) — only a redacted `address` and a
    `has_credentials` flag are exposed over the API. Treat this column
    data as sensitive if you extend the model further (encrypted at rest using the configured camera key).
    """

    __tablename__ = "cameras"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str | None] = mapped_column(String(255), nullable=True)

    connection_type: Mapped[ConnectionType] = mapped_column(
        Enum(ConnectionType, name="connection_type", native_enum=False, length=20),
        nullable=False,
        default=ConnectionType.rtsp,
    )

    # Connection details — sensitive, never serialized directly (see note above).
    ip_address: Mapped[str | None] = mapped_column(String(100), nullable=True)
    rtsp_url: Mapped[str | None] = mapped_column(EncryptedText(), nullable=True)
    username: Mapped[str | None] = mapped_column(EncryptedText(), nullable=True)
    password: Mapped[str | None] = mapped_column(EncryptedText(), nullable=True)

    status: Mapped[CameraStatus] = mapped_column(
        Enum(CameraStatus, name="camera_status", native_enum=False, length=20),
        nullable=False,
        default=CameraStatus.offline,
        server_default=CameraStatus.offline.value,
    )
    is_enabled: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")

    last_connection_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    last_activity_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    people_detected: Mapped[int] = mapped_column(nullable=False, default=0, server_default="0")

    owner: Mapped["User"] = relationship(back_populates="cameras")  # noqa: F821
    alerts: Mapped[list["SecurityAlert"]] = relationship(  # noqa: F821
        back_populates="camera", passive_deletes=True
    )
    activity_entries: Mapped[list["ActivityLogEntry"]] = relationship(  # noqa: F821
        back_populates="camera", passive_deletes=True
    )
    security_events: Mapped[list["SecurityEvent"]] = relationship(  # noqa: F821
        back_populates="camera", passive_deletes=True
    )

    @property
    def redacted_address(self) -> str | None:
        value = self.rtsp_url or self.ip_address
        if not value:
            return None
        try:
            parsed = urlsplit(value if "://" in value else "//" + value)
            return parsed.hostname
        except ValueError:
            return "Configured"

    @property
    def has_credentials(self) -> bool:
        return bool(self.username or self.password or (self.rtsp_url and "@" in self.rtsp_url))
