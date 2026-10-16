"""Re-exported here so routers import dependencies from one place
(`app.dependencies`) rather than reaching into `app.core` directly."""
from app.core.database import get_db

__all__ = ["get_db"]
