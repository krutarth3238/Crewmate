from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class ApprovalQuest(Base):
    """Pending human-approval items. approve -> creates a mission + awards XP; reject just closes it."""
    __tablename__ = "approval_quests"

    id: Mapped[int] = mapped_column(primary_key=True)
    teammate_id: Mapped[int] = mapped_column(ForeignKey("teammates.id", ondelete="CASCADE"), index=True, nullable=False)
    ref_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    amount_or_scope: Mapped[str] = mapped_column(String(200), nullable=True)
    systems: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    xp_reward: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    details: Mapped[str] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")  # pending|approved|rejected
    resulting_mission_id: Mapped[int | None] = mapped_column(ForeignKey("missions.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    resolved_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    teammate: Mapped["Teammate"] = relationship(back_populates="approval_quests")
    resulting_mission: Mapped["Mission | None"] = relationship()
