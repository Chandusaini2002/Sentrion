"""
Python enums shared between SQLAlchemy models and Pydantic schemas.
Stored as plain VARCHAR + CHECK constraint (native_enum=False) rather than
native PostgreSQL enum types, so adding a new value later is a simple
Alembic column-default migration instead of an `ALTER TYPE`.
"""
import enum


class AccountStatus(str, enum.Enum):
    active = "active"
    suspended = "suspended"
    pending = "pending"


class ConnectionType(str, enum.Enum):
    ip_camera = "ip_camera"
    rtsp = "rtsp"
    network_camera = "network_camera"


class CameraStatus(str, enum.Enum):
    online = "online"
    offline = "offline"


class AlertSeverity(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class AlertStatus(str, enum.Enum):
    resolved = "resolved"
    unresolved = "unresolved"


class ActivityType(str, enum.Enum):
    camera_connected = "camera_connected"
    camera_disconnected = "camera_disconnected"
    person_detected = "person_detected"
    face_matched = "face_matched"
    unknown_person_detected = "unknown_person_detected"
    profile_updated = "profile_updated"
    camera_settings_changed = "camera_settings_changed"
    security_alert_generated = "security_alert_generated"


class NotificationSeverity(str, enum.Enum):
    info = "info"
    warning = "warning"
    critical = "critical"
