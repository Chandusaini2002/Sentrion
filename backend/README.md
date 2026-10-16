# Sentrion backend

The authentication milestone uses FastAPI, PostgreSQL and SQLAlchemy with bcrypt passwords, expiring JWT sessions, verified owner-scoped APIs, and encrypted camera fields.

Read [the project README](../README.md) for the authoritative setup, **existing-database upgrade instructions**, endpoints, test commands and milestone boundaries. Run backend commands from this directory. Use Python 3.11 or 3.12. Do not reset an existing database or replace its migration history.

Configuration is in `.env.example`; both `SECRET_KEY` and `CAMERA_ENCRYPTION_KEY` are required. Apply migrations before starting the API. Camera testing, streaming and AI processing are not implemented in this milestone.
