from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.ownership import validate_camera_owner
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.security_event import SecurityEventCreate, SecurityEventRead
from app.services import security_event_service

router = APIRouter(prefix="/security-events", tags=["Security Events"])


@router.post("", response_model=SecurityEventRead, status_code=status.HTTP_201_CREATED)
def create_event(payload: SecurityEventCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    validate_camera_owner(db, payload.camera_id, user.id)
    event = security_event_service.create_event(db, payload, user.id)
    return security_event_service.to_read_dict(event)


@router.get("", response_model=list[SecurityEventRead])
def list_events(
     skip: int = 0, limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[dict]:
    events = security_event_service.list_events(db, user_id=user.id, skip=skip, limit=limit)
    return [security_event_service.to_read_dict(e) for e in events]


@router.get("/{event_id}", response_model=SecurityEventRead)
def get_event(event_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    event = security_event_service.get_event(db, event_id)
    if not event or event.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Security event not found.")
    return security_event_service.to_read_dict(event)
