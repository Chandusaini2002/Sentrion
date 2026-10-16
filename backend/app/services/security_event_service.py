import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from app.models.security_event import SecurityEvent
from app.schemas.security_event import SecurityEventCreate


def create_event(db: Session, payload: SecurityEventCreate, owner_id: uuid.UUID) -> SecurityEvent:
    data = payload.model_dump(exclude={"user_id"})
    event = SecurityEvent(owner_id=owner_id, **data)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def list_events(
    db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 50
) -> list[SecurityEvent]:
    stmt = (
        select(SecurityEvent)
        .options(joinedload(SecurityEvent.camera))
        .where(SecurityEvent.owner_id == user_id)
        .order_by(SecurityEvent.occurred_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).unique().all())


def get_event(db: Session, event_id: uuid.UUID) -> SecurityEvent | None:
    stmt = (
        select(SecurityEvent)
        .options(joinedload(SecurityEvent.camera))
        .where(SecurityEvent.id == event_id)
    )
    return db.scalars(stmt).unique().first()


def to_read_dict(event: SecurityEvent) -> dict:
    return {
        "id": event.id,
        "owner_id": event.owner_id,
        "camera_id": event.camera_id,
        "camera_name": event.camera.name if event.camera and event.camera.owner_id == event.owner_id else None,
        "event_type": event.event_type,
        "detection_result": event.detection_result,
        "severity": event.severity,
        "status": event.status,
        "occurred_at": event.occurred_at,
        "created_at": event.created_at,
    }
