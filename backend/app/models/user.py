import uuid

from sqlalchemy import Enum, ForeignKey, String, Index, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import AccountStatus
from app.models.mixins import TimestampMixin, UUIDPrimaryKeyMixin


class User(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    Account-level record: identity and credentials. Profile details
    (name, phone, avatar, timezone) live in UserProfile — kept separate
    so the "Users" and "User profiles" resources map cleanly to their own
    router/service pair, per the API design.
    """

    __tablename__ = "users"

    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)

    # Hashed with passlib (bcrypt). No plaintext password is ever stored or
    # returned. Login/token issuance is NOT implemented in this stage —
    # this column only prepares the schema for the future JWT auth stage.
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)

    account_status: Mapped[AccountStatus] = mapped_column(
        Enum(AccountStatus, name="account_status", native_enum=False, length=20),
        default=AccountStatus.active,
        server_default=AccountStatus.active.value,
        nullable=False,
    )

    profile: Mapped["UserProfile"] = relationship(
        back_populates="user", uselist=False, cascade="all, delete-orphan"
    )
    cameras: Mapped[list["Camera"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
    alerts: Mapped[list["SecurityAlert"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
    activity_entries: Mapped[list["ActivityLogEntry"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
    security_events: Mapped[list["SecurityEvent"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        back_populates="owner", cascade="all, delete-orphan"
    )


class UserProfile(UUIDPrimaryKeyMixin, TimestampMixin, Base):
    """
    One-to-one profile record. Created automatically alongside its User
    (see services/user_service.create_user) so GET /api/profile/{user_id}
    always has a row to return, even before the person fills anything in.
    """

    __tablename__ = "user_profiles"

    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False
    )

    full_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    avatar_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    timezone: Mapped[str] = mapped_column(String(100), nullable=False, default="UTC")

    user: Mapped["User"] = relationship(back_populates="profile")

Index("uq_users_email_normalized", func.lower(func.trim(User.email)), unique=True)
