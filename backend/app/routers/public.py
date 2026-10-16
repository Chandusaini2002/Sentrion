from fastapi import APIRouter, Query

from app.services import visitor_service

router = APIRouter(prefix="/public", tags=["Visitor Access"])


@router.get("/dashboard/summary")
def dashboard_summary() -> dict:
    return visitor_service.get_dashboard_summary()


@router.get("/cameras")
def cameras() -> list[dict]:
    return visitor_service.get_cameras()


@router.get("/alerts")
def alerts() -> list[dict]:
    return visitor_service.get_alerts()


@router.get("/security-events")
def security_events(limit: int = Query(default=5, ge=1, le=20)) -> list[dict]:
    return visitor_service.get_events(limit)


@router.get("/notifications")
def notifications() -> list[dict]:
    return visitor_service.get_notifications()


@router.get("/detection/{camera_id}")
def detection(camera_id: str) -> dict:
    return visitor_service.get_detection(camera_id)
