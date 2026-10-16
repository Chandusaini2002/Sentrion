from datetime import datetime, timedelta, timezone
import jwt
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, EmailStr, Field, field_validator
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.security import hash_password, verify_password
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.models.enums import AccountStatus
from app.schemas.user import UserCreate
from app.schemas.profile import ProfileRead
from app.services import user_service, profile_service

router = APIRouter(prefix="/auth", tags=["Authentication"])
DUMMY_HASH = hash_password("invalid-account-timing-placeholder")

class LoginRequest(BaseModel):
    email: EmailStr
    password: str = Field(max_length=1024, repr=False)
    _normalize = field_validator("email", mode="before")(UserCreate.normalize_email.__func__)

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: ProfileRead

@router.post("/signup", response_model=ProfileRead, status_code=201)
def signup(payload: UserCreate, db: Session = Depends(get_db)):
    if user_service.get_user_by_email(db, payload.email):
        raise HTTPException(409, "A user with this email already exists.")
    try:
        user = user_service.create_user(db, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A user with this email already exists.")
    return profile_service.get_profile_view(user)

@router.post("/login", response_model=LoginResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = user_service.get_user_by_email(db, payload.email)
    valid = verify_password(payload.password, user.hashed_password if user else DUMMY_HASH)
    if not user or not valid or user.account_status != AccountStatus.active:
        raise HTTPException(401, "Incorrect email or password.", headers={"WWW-Authenticate": "Bearer"})
    now = datetime.now(timezone.utc)
    token = jwt.encode({"sub": str(user.id), "iat": now, "exp": now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES), "type": "access"}, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)
    return {"access_token": token, "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60, "user": profile_service.get_profile_view(user)}

@router.get("/me", response_model=ProfileRead)
def me(user: User = Depends(get_current_user)):
    return profile_service.get_profile_view(user)
