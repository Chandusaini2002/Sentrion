import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AlertSeverity, AlertStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class SecurityEvent(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    A broader activity feed row shown on the dashboard's "Recent security
    events" table. Distinct from SecurityAlert: events may or may not
    require action, alerts always do.
    """

    __tablename__ = "security_events"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    camera_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True, index=True
    )

    event_type: Mapped[str] = mapped_column(String(255), nullable=False)
    detection_result: Mapped[str | None] = mapped_column(String(500), nullable=True)

    severity: Mapped[AlertSeverity] = mapped_column(
        Enum(AlertSeverity, name="event_severity", native_enum=False, length=20), nullable=False
    )
    status: Mapped[AlertStatus] = mapped_column(
        Enum(AlertStatus, name="event_status", native_enum=False, length=20),
        nullable=False,
        default=AlertStatus.unresolved,
        server_default=AlertStatus.unresolved.value,
    )

    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    owner: Mapped["User"] = relationship(back_populates="security_events")  # noqa: F821
    camera: Mapped["Camera | None"] = relationship(back_populates="security_events")  # noqa: F821
