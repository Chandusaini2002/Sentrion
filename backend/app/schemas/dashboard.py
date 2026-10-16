import uuid

from pydantic import BaseModel


class DashboardStats(BaseModel):
    """
    Aggregate counts for the dashboard summary cards. Every number is a
    real query result against the current data — cameras/alerts that
    don't exist yet simply produce 0, not a placeholder value.
    people_detected_today stays 0 until the AI detection pipeline (a
    later stage) starts writing to Camera.people_detected.
    """

    user_id: uuid.UUID
    total_cameras: int
    cameras_online: int
    cameras_offline: int
    active_alerts: int
    people_detected_today: int
    security_events_7d: int
