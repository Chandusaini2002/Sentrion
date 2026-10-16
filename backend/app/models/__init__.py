"""
Importing every model here ensures they're all registered on Base.metadata
before Alembic autogenerate or Base.metadata.create_all() run.
"""
from app.models.user import User, UserProfile  # noqa: F401
from app.models.camera import Camera  # noqa: F401
from app.models.alert import SecurityAlert  # noqa: F401
from app.models.activity import ActivityLogEntry  # noqa: F401
from app.models.security_event import SecurityEvent  # noqa: F401
from app.models.notification import Notification  # noqa: F401

__all__ = [
    "User",
    "UserProfile",
    "Camera",
    "SecurityAlert",
    "ActivityLogEntry",
    "SecurityEvent",
    "Notification",
]
