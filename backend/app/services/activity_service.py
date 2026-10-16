import uuid

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.activity import ActivityLogEntry
from app.schemas.activity import ActivityLogEntryCreate


def create_activity_entry(db: Session, payload: ActivityLogEntryCreate, owner_id: uuid.UUID) -> ActivityLogEntry:
    data = payload.model_dump(exclude={"user_id"})
    entry = ActivityLogEntry(owner_id=owner_id, **data)
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def list_activity(
    db: Session, user_id: uuid.UUID, skip: int = 0, limit: int = 100
) -> list[ActivityLogEntry]:
    stmt = (
        select(ActivityLogEntry)
        .where(ActivityLogEntry.owner_id == user_id)
        .order_by(ActivityLogEntry.occurred_at.desc())
        .offset(skip)
        .limit(limit)
    )
    return list(db.scalars(stmt).all())


def get_activity_entry(db: Session, entry_id: uuid.UUID) -> ActivityLogEntry | None:
    return db.get(ActivityLogEntry, entry_id)
