import uuid
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.alert import SecurityAlert
from app.models.enums import AlertSeverity, AlertStatus
from app.schemas.alert import SecurityAlertCreate


def create_alert(db: Session, payload: SecurityAlertCreate, owner_id: uuid.UUID) -> SecurityAlert:
    data = payload.model_dump(exclude={"user_id"})
    alert = SecurityAlert(owner_id=owner_id, **data)
    db.add(alert)
    db.commit()
    db.refresh(alert)
    return alert


def list_alerts(
    db: Session,
    user_id: uuid.UUID,
    severity: AlertSeverity | None = None,
    status: AlertStatus | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[SecurityAlert]:
    stmt = (
        select(SecurityAlert)
        .options(joinedload(SecurityAlert.camera))
        .where(SecurityAlert.owner_id == user_id)
    )
    if severity is not None:
        stmt = stmt.where(SecurityAlert.severity == severity)
    if status is not None:
        stmt = stmt.where(SecurityAlert.status == status)
    stmt = stmt.order_by(SecurityAlert.occurred_at.desc()).offset(skip).limit(limit)
    return list(db.scalars(stmt).unique().all())


def get_alert(db: Session, alert_id: uuid.UUID) -> SecurityAlert | None:
    stmt = (
        select(SecurityAlert)
        .options(joinedload(SecurityAlert.camera))
        .where(SecurityAlert.id == alert_id)
    )
    return db.scalars(stmt).unique().first()


def resolve_alert(db: Session, alert: SecurityAlert) -> SecurityAlert:
    alert.status = AlertStatus.resolved
    alert.resolved_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(alert)
    return alert


def delete_alert(db: Session, alert: SecurityAlert) -> None:
    db.delete(alert)
    db.commit()


def to_read_dict(alert: SecurityAlert) -> dict:
    """Flattens camera.name onto the response without a separate query."""
    return {
        "id": alert.id,
        "owner_id": alert.owner_id,
        "camera_id": alert.camera_id,
        "camera_name": alert.camera.name if alert.camera and alert.camera.owner_id == alert.owner_id else None,
        "type": alert.type,
        "detection_info": alert.detection_info,
        "severity": alert.severity,
        "status": alert.status,
        "occurred_at": alert.occurred_at,
        "resolved_at": alert.resolved_at,
        "created_at": alert.created_at,
    }
