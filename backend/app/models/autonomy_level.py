from sqlalchemy import JSON, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship


from app.models.base import Base


class AutonomyLevel(Base):
    """The 5 static trust tiers (Shadow -> Co-Founder). Seeded once via migration, never edited via API."""
    __tablename__ = "autonomy_levels"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)  # 1..5, deliberately not autoincrement-only
    name: Mapped[str] = mapped_column(String(80), nullable=False)
    tagline: Mapped[str] = mapped_column(String(200), nullable=False)
    required_xp: Mapped[int] = mapped_column(Integer, nullable=False)
    unlocked_permissions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    restricted_permissions: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    failure_bound: Mapped[str] = mapped_column(String(200), nullable=False)
    color: Mapped[str] = mapped_column(String(20), nullable=False)
    bg_light: Mapped[str] = mapped_column(String(20), nullable=False)
    accent_border: Mapped[str] = mapped_column(String(20), nullable=False)

    teammates: Mapped[list["Teammate"]] = relationship(back_populates="current_level")
    skills: Mapped[list["Skill"]] = relationship(back_populates="level_required_rel")
