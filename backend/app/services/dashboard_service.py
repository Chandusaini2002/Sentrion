import uuid
from datetime import datetime, timedelta, timezone

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.camera import Camera
from app.models.enums import AlertStatus, CameraStatus
from app.models.alert import SecurityAlert
from app.models.security_event import SecurityEvent


def get_dashboard_stats(db: Session, user_id: uuid.UUID) -> dict:
    total_cameras = db.scalar(
        select(func.count()).select_from(Camera).where(Camera.owner_id == user_id)
    ) or 0

    cameras_online = db.scalar(
        select(func.count())
        .select_from(Camera)
        .where(Camera.owner_id == user_id, Camera.status == CameraStatus.online)
    ) or 0

    active_alerts = db.scalar(
        select(func.count())
        .select_from(SecurityAlert)
        .where(SecurityAlert.owner_id == user_id, SecurityAlert.status == AlertStatus.unresolved)
    ) or 0

    people_detected_today = db.scalar(
        select(func.coalesce(func.sum(Camera.people_detected), 0)).where(Camera.owner_id == user_id)
    ) or 0

    seven_days_ago = datetime.now(timezone.utc) - timedelta(days=7)
    security_events_7d = db.scalar(
        select(func.count())
        .select_from(SecurityEvent)
        .where(SecurityEvent.owner_id == user_id, SecurityEvent.occurred_at >= seven_days_ago)
    ) or 0

    return {
        "user_id": user_id,
        "total_cameras": total_cameras,
        "cameras_online": cameras_online,
        "cameras_offline": total_cameras - cameras_online,
        "active_alerts": active_alerts,
        "people_detected_today": people_detected_today,
        "security_events_7d": security_events_7d,
    }
