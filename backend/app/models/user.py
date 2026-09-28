from datetime import datetime
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.workspace import Workspace

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class User(Base, TimestampMixin):
    """The real account, replacing the frontend's fake free-text login."""
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    firebase_uid: Mapped[str] = mapped_column(String(128), unique=True, index=True, nullable=False)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    founder_name: Mapped[str] = mapped_column(String(120), nullable=False)

    google_refresh_token: Mapped[str | None] = mapped_column(String(500), nullable=True)
    google_access_token: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    google_token_expiry: Mapped[datetime | None] = mapped_column(nullable=True)
    google_connected: Mapped[bool] = mapped_column(default=False)

    workspaces: Mapped[list["Workspace"]] = relationship(back_populates="owner", cascade="all, delete-orphan")
