from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.ownership import validate_camera_owner
import uuid

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.alert import SecurityAlertCreate, SecurityAlertRead
from app.services import alert_service

router = APIRouter(prefix="/alerts", tags=["Security Alerts"])


@router.post("", response_model=SecurityAlertRead, status_code=status.HTTP_201_CREATED)
def create_alert(payload: SecurityAlertCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    validate_camera_owner(db, payload.camera_id, user.id)
    alert = alert_service.create_alert(db, payload, user.id)
    return alert_service.to_read_dict(alert)


@router.get("", response_model=list[SecurityAlertRead])
def list_alerts(
    
    severity: AlertSeverity | None = None,
    status_filter: AlertStatus | None = Query(default=None, alias="status"),
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db), user: User = Depends(get_current_user),
) -> list[dict]:
    alerts = alert_service.list_alerts(
        db, user_id=user.id, severity=severity, status=status_filter, skip=skip, limit=limit
    )
    return [alert_service.to_read_dict(a) for a in alerts]


@router.get("/{alert_id}", response_model=SecurityAlertRead)
def get_alert(alert_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    alert = alert_service.get_alert(db, alert_id)
    if not alert or alert.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    return alert_service.to_read_dict(alert)


@router.patch("/{alert_id}/resolve", response_model=SecurityAlertRead)
def resolve_alert(alert_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    alert = alert_service.get_alert(db, alert_id)
    if not alert or alert.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    alert = alert_service.resolve_alert(db, alert)
    return alert_service.to_read_dict(alert)


@router.delete("/{alert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_alert(alert_id: uuid.UUID, db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> None:
    alert = alert_service.get_alert(db, alert_id)
    if not alert or alert.owner_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Alert not found.")
    alert_service.delete_alert(db, alert)
