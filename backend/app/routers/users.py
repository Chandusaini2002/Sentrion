from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.user import UserRead, UserUpdate
from app.services import user_service
router = APIRouter(prefix="/users", tags=["Users"])
@router.get("/me", response_model=UserRead)
def me(user: User = Depends(get_current_user)):
    return user
@router.patch("/me", response_model=UserRead)
def update_me(payload: UserUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    existing = user_service.get_user_by_email(db, payload.email)
    if existing and existing.id != user.id:
        raise HTTPException(409, "A user with this email already exists.")
    try:
        return user_service.update_user(db, user, payload)
    except IntegrityError:
        db.rollback()
        raise HTTPException(409, "A user with this email already exists.")
