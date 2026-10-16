import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import NotificationSeverity
from app.schemas.common import ORMModel


class NotificationCreate(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    message: str = Field(min_length=1, max_length=1000)
    severity: NotificationSeverity | None = None


class NotificationRead(ORMModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    title: str
    message: str
    severity: NotificationSeverity | None
    is_read: bool
    created_at: datetime
