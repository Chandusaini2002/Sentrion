from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.ownership import validate_camera_owner
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.activity import ActivityLogEntryCreate, ActivityLogEntryRead
from app.services import activity_service

router = APIRouter(prefix="/activity", tags=["Activity"])


@router.post("", response_model=ActivityLogEntryRead, status_code=status.HTTP_201_CREATED)
def create_activity_entry(
    payload: ActivityLogEntryCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> ActivityLogEntryRead:
    validate_camera_owner(db, payload.camera_id, user.id)
    return activity_service.create_activity_entry(db, payload, user.id)


@router.get("", response_model=list[ActivityLogEntryRead])
def list_activity(
     skip: int = 0, limit: int = 100, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[ActivityLogEntryRead]:
    return activity_service.list_activity(db, user_id=user.id, skip=skip, limit=limit)


@router.get("/{entry_id}", response_model=ActivityLogEntryRead)
def get_activity_entry(entry_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> ActivityLogEntryRead:
    entry = activity_service.get_activity_entry(db, entry_id)
    if not entry or entry.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Activity entry not found.")
    return entry
