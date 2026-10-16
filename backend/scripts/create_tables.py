"""
Dev convenience only: create every table directly from the SQLAlchemy
models, skipping Alembic. Handy for a first local run against an empty
database.

Once you have a schema running, use Alembic migrations
(`alembic revision --autogenerate` / `alembic upgrade head`) for every
further change instead of re-running this script — it does not track
history the way migrations do.

Usage (from the backend/ directory):
    python -m scripts.create_tables
"""
import app.models  # noqa: F401  (registers every model on Base.metadata)
from app.core.database import Base, engine


def main() -> None:
    Base.metadata.create_all(bind=engine)
    print("Tables created (or already existed).")


if __name__ == "__main__":
    main()
