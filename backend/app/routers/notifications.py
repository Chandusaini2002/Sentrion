from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.ownership import validate_camera_owner
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.notification import NotificationCreate, NotificationRead
from app.services import notification_service

router = APIRouter(prefix="/notifications", tags=["Notifications"])


@router.post("", response_model=NotificationRead, status_code=status.HTTP_201_CREATED)
def create_notification(
    payload: NotificationCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> NotificationRead:
    return notification_service.create_notification(db, payload, user.id)


@router.get("", response_model=list[NotificationRead])
def list_notifications(
     skip: int = 0, limit: int = 50, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> list[NotificationRead]:
    return notification_service.list_notifications(db, user_id=user.id, skip=skip, limit=limit)


@router.patch("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_read(
    notification_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)
) -> NotificationRead:
    notification = notification_service.get_notification(db, notification_id)
    if not notification or notification.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    return notification_service.mark_read(db, notification)


@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_notification(notification_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    notification = notification_service.get_notification(db, notification_id)
    if not notification or notification.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Notification not found.")
    notification_service.delete_notification(db, notification)
