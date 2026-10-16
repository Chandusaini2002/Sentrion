from app.dependencies.auth import get_current_user
from app.models.user import User
from app.dependencies.ownership import validate_camera_owner
import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.dependencies.db import get_db
from app.schemas.dashboard import DashboardStats
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/summary", response_model=DashboardStats)
def get_dashboard_summary( db: Session = Depends(get_db), user: User = Depends(get_current_user)) -> dict:
    return dashboard_service.get_dashboard_stats(db, user_id=user.id)
