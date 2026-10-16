"""
SQLAlchemy engine, session factory, and declarative base.

Every model in app/models imports `Base` from here so Alembic's
autogenerate (see alembic/env.py) can discover the full schema.
"""
from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.core.config import settings

engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, future=True, hide_parameters=True)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, future=True)


class Base(DeclarativeBase):
    """Shared declarative base for all ORM models."""

    pass


def get_db() -> Generator:
    """
    FastAPI dependency that yields a request-scoped SQLAlchemy session and
    guarantees it's closed afterwards, even if the request raises.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
