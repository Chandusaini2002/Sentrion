import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import ActivityType
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class ActivityLogEntry(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """An audit-style entry in the account's activity log."""

    __tablename__ = "activity_log_entries"

    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    camera_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True, index=True
    )

    type: Mapped[ActivityType] = mapped_column(
        Enum(ActivityType, name="activity_type", native_enum=False, length=40), nullable=False
    )
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)

    occurred_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)

    owner: Mapped["User"] = relationship(back_populates="activity_entries")  # noqa: F821
    camera: Mapped["Camera | None"] = relationship(back_populates="activity_entries")  # noqa: F821
