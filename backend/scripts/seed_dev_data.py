"""
OPTIONAL dev helper: inserts a handful of real rows through the same
service functions the API uses, so you have something to look at when
testing endpoints manually or wiring up the frontend. This writes to
your actual configured database — it is not a mock or fake response
source, just a shortcut for populating one.

Usage (from the backend/ directory, with the database already migrated):
    python -m scripts.seed_dev_data
"""
from datetime import datetime, timedelta, timezone

from app.core.database import SessionLocal
from app.models.enums import ActivityType, AlertSeverity, ConnectionType
from app.schemas.activity import ActivityLogEntryCreate
from app.schemas.alert import SecurityAlertCreate
from app.schemas.camera import CameraCreate
from app.schemas.notification import NotificationCreate
from app.schemas.user import UserCreate
from app.services import activity_service, alert_service, camera_service, notification_service, user_service


def main() -> None:
    db = SessionLocal()
    try:
        existing = user_service.get_user_by_email(db, "aditi.rao@sentrion.io")
        if existing:
            print("Seed user already exists — skipping.")
            return

        user = user_service.create_user(
            db,
            UserCreate(email="aditi.rao@sentrion.io", password="changeme123", full_name="Aditi Rao"),
        )

        camera = camera_service.create_camera(
            db,
            CameraCreate(
                name="Front entrance",
                location="Main building, ground floor",
                connection_type=ConnectionType.ip_camera,
                ip_address="192.168.1.42",
            ),
            user.id,
        )

        now = datetime.now(timezone.utc)

        alert_service.create_alert(
            db,
            SecurityAlertCreate(
                camera_id=camera.id,
                type="Unknown person detected",
                detection_info="Confidence 91%",
                severity=AlertSeverity.critical,
                occurred_at=now - timedelta(minutes=12),
            ),
            user.id,
        )

        activity_service.create_activity_entry(
            db,
            ActivityLogEntryCreate(
                camera_id=camera.id,
                type=ActivityType.camera_connected,
                title="Camera connected",
                description="Front entrance camera came online and began streaming.",
                occurred_at=now - timedelta(minutes=20),
            ),
            user.id,
        )

        notification_service.create_notification(
            db,
            NotificationCreate(
                title="Unknown person detected",
                message="Front entrance camera flagged an unrecognized individual.",
                severity="critical",
            ),
            user.id,
        )

        print(f"Seeded user {user.email} (id={user.id}) with 1 camera, 1 alert, 1 activity entry, 1 notification.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
