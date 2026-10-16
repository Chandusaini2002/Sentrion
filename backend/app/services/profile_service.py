from sqlalchemy.orm import Session

from app.models.user import User
from app.schemas.profile import ProfileUpdate


def _profile_completion(user: User) -> int:
    """
    Simple, transparent completion score: each of these four fields is
    worth 25 points if filled in. Mirrors the progress bar on the
    frontend's Profile page.
    """
    profile = user.profile
    fields_filled = sum(
        [
            bool(profile.full_name),
            bool(profile.phone),
            bool(profile.avatar_url),
            bool(user.email),
        ]
    )
    return fields_filled * 25


def get_profile_view(user: User) -> dict:
    """
    Assembles the combined User + UserProfile response dict consumed by
    ProfileRead. Kept as a plain dict (rather than a second ORM query)
    since the values already live on the two related objects.
    """
    profile = user.profile
    return {
        "id": profile.id,
        "user_id": user.id,
        "email": user.email,
        "full_name": profile.full_name,
        "phone": profile.phone,
        "avatar_url": profile.avatar_url,
        "timezone": profile.timezone,
        "account_status": user.account_status,
        "profile_completion": _profile_completion(user),
        "created_at": profile.created_at,
        "updated_at": profile.updated_at,
    }


def update_profile(db: Session, user: User, payload: ProfileUpdate) -> dict:
    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(user.profile, field, value)
    db.commit()
    db.refresh(user)
    return get_profile_view(user)
