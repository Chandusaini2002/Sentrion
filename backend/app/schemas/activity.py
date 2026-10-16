import uuid
from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import ActivityType
from app.schemas.common import ORMModel


class ActivityLogEntryCreate(BaseModel):
    camera_id: uuid.UUID | None = None
    type: ActivityType
    title: str = Field(min_length=1, max_length=255)
    description: str = Field(min_length=1)
    occurred_at: datetime


class ActivityLogEntryRead(ORMModel):
    id: uuid.UUID
    owner_id: uuid.UUID
    camera_id: uuid.UUID | None
    type: ActivityType
    title: str
    description: str
    occurred_at: datetime
    created_at: datetime
