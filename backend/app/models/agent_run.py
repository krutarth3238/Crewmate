from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class AgentRun(Base):
    """
    Tracks an in-flight/completed objective execution. Not in the original frontend types,
    but required (blueprint §6) to support a real, resumable agent loop instead of the fake timeout.
    """
    __tablename__ = "agent_runs"

    id: Mapped[int] = mapped_column(primary_key=True)
    teammate_id: Mapped[int | None] = mapped_column(ForeignKey("teammates.id", ondelete="CASCADE"), nullable=True)
    objective_text: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="planning")
    plan_steps: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    resulting_mission_id: Mapped[int | None] = mapped_column(ForeignKey("missions.id"), nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    teammate: Mapped["Teammate | None"] = relationship(back_populates="agent_runs")
    resulting_mission: Mapped["Mission | None"] = relationship()
