import uuid
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict
from app.models.enums import AccountStatus
from app.schemas.common import ORMModel

class UserCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    password: str = Field(min_length=8, max_length=72, repr=False)
    full_name: str = Field(min_length=1, max_length=255)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value):
        return value.strip().lower() if isinstance(value, str) else value

    @field_validator("full_name")
    @classmethod
    def name_not_blank(cls, value):
        if not value.strip():
            raise ValueError("Full name is required.")
        return value.strip()

    @field_validator("password")
    @classmethod
    def password_bytes(cls, value):
        if len(value.encode("utf-8")) > 72:
            raise ValueError("Password must be at most 72 UTF-8 bytes.")
        return value

class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    email: EmailStr
    _normalize_email = field_validator("email", mode="before")(UserCreate.normalize_email.__func__)

class UserRead(ORMModel):
    id: uuid.UUID
    email: EmailStr
    account_status: AccountStatus
    created_at: datetime
    updated_at: datetime
