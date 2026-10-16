from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db
from app.models.user import User
from app.schemas.profile import ProfileRead, ProfileUpdate
from app.services import profile_service
router = APIRouter(prefix="/profile", tags=["Profile"])
@router.get("/me", response_model=ProfileRead)
def get_my_profile(user: User = Depends(get_current_user)):
    return profile_service.get_profile_view(user)
@router.patch("/me", response_model=ProfileRead)
def update_profile(payload: ProfileUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return profile_service.update_profile(db, user, payload)
