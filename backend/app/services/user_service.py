import uuid

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User, UserProfile
from app.schemas.user import UserCreate, UserUpdate


def create_user(db: Session, payload: UserCreate) -> User:
    user = User(email=payload.email, hashed_password=hash_password(payload.password))
    db.add(user)
    db.flush()  # populate user.id before creating the dependent profile row

    profile = UserProfile(user_id=user.id, full_name=payload.full_name)
    db.add(profile)

    db.commit()
    db.refresh(user)
    return user


def list_users(db: Session, skip: int = 0, limit: int = 50) -> list[User]:
    stmt = select(User).offset(skip).limit(limit).order_by(User.created_at.desc())
    return list(db.scalars(stmt).all())


def get_user(db: Session, user_id: uuid.UUID) -> User | None:
    return db.get(User, user_id)


def get_user_by_email(db: Session, email: str) -> User | None:
    stmt = select(User).where(func.lower(func.trim(User.email)) == email.strip().lower())
    return db.scalars(stmt).first()


def update_user(db: Session, user: User, payload: UserUpdate) -> User:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user, field, value)
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user: User) -> None:
    db.delete(user)
    db.commit()
