from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class Teammate(Base, TimestampMixin):
    """The AI teammate itself. One per workspace today (blueprint §16 — no multi-teammate UI exists)."""
    __tablename__ = "teammates"

    id: Mapped[int] = mapped_column(primary_key=True)
    workspace_id: Mapped[int] = mapped_column(ForeignKey("workspaces.id", ondelete="CASCADE"), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    avatar_seed: Mapped[str] = mapped_column(String(120), nullable=False)
    visual_mark: Mapped[str] = mapped_column(String(120), nullable=False)
    role_title: Mapped[str] = mapped_column(String(120), nullable=False, default="AI Co-Founder")

    current_level_id: Mapped[int] = mapped_column(ForeignKey("autonomy_levels.id"), nullable=False, default=1)
    current_xp: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    streak_days: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    streak_shields: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    total_missions_completed: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    hours_saved: Mapped[float] = mapped_column(Float, nullable=False, default=0.0)
    accuracy_rate: Mapped[float] = mapped_column(Float, nullable=False, default=100.0)

    workspace: Mapped["Workspace"] = relationship(back_populates="teammate")
    current_level: Mapped["AutonomyLevel"] = relationship(back_populates="teammates")
    missions: Mapped[list["Mission"]] = relationship(back_populates="teammate", cascade="all, delete-orphan")
    approval_quests: Mapped[list["ApprovalQuest"]] = relationship(back_populates="teammate", cascade="all, delete-orphan")
    agent_runs: Mapped[list["AgentRun"]] = relationship(back_populates="teammate", cascade="all, delete-orphan")
    equipped_skills: Mapped[list["TeammateSkill"]] = relationship(back_populates="teammate", cascade="all, delete-orphan")

    # NOTE (blueprint §16, deliberate design decision): next_level_xp is NOT a column.
    # It is always derived at read time from current_level_id + 1's required_xp
    # (see teammates/service.py::compute_next_level_xp) so it can never drift from
    # the autonomy_levels table the way the frontend's own hand-rolled reducer did.
