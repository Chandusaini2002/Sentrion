import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.common import ORMModel


class SecurityAlertCreate(BaseModel):
    camera_id: uuid.UUID | None = None
    type: str = Field(min_length=1, max_length=255)
    detection_info: str | None = Field(default=None, max_length=500)
    severity: AlertSeverity
    occurred_at: datetime


class SecurityAlertRead(ORMModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    camera_id: uuid.UUID | None
    camera_name: str | None = None
    type: str
    detection_info: str | None
    severity: AlertSeverity
    status: AlertStatus
    occurred_at: datetime
    resolved_at: datetime | None
    created_at: datetime
