from sqlalchemy import ForeignKey, Integer, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Skill(Base):
    """Global skill catalog — close to static reference data (blueprint §6)."""
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(160), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    category_label: Mapped[str] = mapped_column(String(120), nullable=False)
    level_required: Mapped[int] = mapped_column(ForeignKey("autonomy_levels.id"), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    in_action_summary: Mapped[str] = mapped_column(Text, nullable=False)
    sample_objective: Mapped[str] = mapped_column(Text, nullable=False)
    supported_tools: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    accent_color: Mapped[str] = mapped_column(String(20), nullable=False)

    level_required_rel: Mapped["AutonomyLevel"] = relationship(back_populates="skills")
    teammate_links: Mapped[list["TeammateSkill"]] = relationship(back_populates="skill", cascade="all, delete-orphan")
