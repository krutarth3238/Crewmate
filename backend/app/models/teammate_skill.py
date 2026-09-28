from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class TeammateSkill(Base):
    """Join table — the only real per-user mutation on the skill catalog (equip/unequip)."""
    __tablename__ = "teammate_skills"

    teammate_id: Mapped[int] = mapped_column(ForeignKey("teammates.id", ondelete="CASCADE"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True)
    equipped: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    equipped_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    teammate: Mapped["Teammate"] = relationship(back_populates="equipped_skills")
    skill: Mapped["Skill"] = relationship(back_populates="teammate_links")
