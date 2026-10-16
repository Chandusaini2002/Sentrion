import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.common import ORMModel


class SecurityEventCreate(BaseModel):
    camera_id: uuid.UUID | None = None
    event_type: str = Field(min_length=1, max_length=255)
    detection_result: str | None = Field(default=None, max_length=500)
    severity: AlertSeverity
    status: AlertStatus = AlertStatus.unresolved
    occurred_at: datetime


class SecurityEventRead(ORMModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    camera_id: uuid.UUID | None
    camera_name: str | None = None
    event_type: str
    detection_result: str | None
    severity: AlertSeverity
    status: AlertStatus
    occurred_at: datetime
    created_at: datetime
