from typing import TYPE_CHECKING
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.teammate import Teammate


class Workspace(Base, TimestampMixin):
    """A business. ASSUMPTION (flagged in blueprint §16): one user may own several."""
    __tablename__ = "workspaces"

    id: Mapped[int] = mapped_column(primary_key=True)
    owner_user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    name: Mapped[str] = mapped_column(String(160), nullable=False)
    business_type: Mapped[str] = mapped_column(String(120), nullable=False)
    location: Mapped[str | None] = mapped_column(String(120), nullable=True)
    sub_niche: Mapped[str | None] = mapped_column(String(120), nullable=True)
    competitors: Mapped[str | None] = mapped_column(String(500), nullable=True)

    owner: Mapped["User"] = relationship(back_populates="workspaces")
    teammate: Mapped["Teammate | None"] = relationship(back_populates="workspace", uselist=False, cascade="all, delete-orphan")
