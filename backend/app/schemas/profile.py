import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import AccountStatus
from app.schemas.common import ORMModel


class ProfileUpdate(BaseModel):
    """PATCH body — every field optional, only supplied fields change."""

    full_name: str | None = Field(default=None, max_length=255)
    phone: str | None = Field(default=None, max_length=50)
    avatar_url: str | None = Field(default=None, max_length=512)
    timezone: str | None = Field(default=None, max_length=100)


class ProfileRead(ORMModel):
    """
    Combines the UserProfile row with a few read-only fields from its
    parent User, so the frontend can render the Profile page from one
    response — matching the shape of the existing `User` TypeScript type.
    """

    id: uuid.UUID
    user_id: uuid.UUID
    email: EmailStr
    full_name: str
    phone: str | None
    avatar_url: str | None
    timezone: str
    account_status: AccountStatus
    profile_completion: int = Field(
        description="0-100, derived from how many profile fields are filled in."
    )
    created_at: datetime
    updated_at: datetime
