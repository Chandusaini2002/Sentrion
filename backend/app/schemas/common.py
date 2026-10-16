"""Small shared schema building blocks."""
from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for every response schema that's built from a SQLAlchemy row."""

    model_config = ConfigDict(from_attributes=True)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str
    environment: str
