from datetime import datetime

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base


class Mission(Base):
    """
    Append-only audit log. NEVER exposed via an edit/delete endpoint (blueprint §11) —
    only the agent engine or an approved quest may INSERT a row here.
    """
    __tablename__ = "missions"

    id: Mapped[int] = mapped_column(primary_key=True)
    teammate_id: Mapped[int] = mapped_column(ForeignKey("teammates.id", ondelete="CASCADE"), index=True, nullable=False)
    ref_code: Mapped[str] = mapped_column(String(40), unique=True, nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    status: Mapped[str] = mapped_column(String(40), nullable=False, default="completed")
    execution_duration: Mapped[str] = mapped_column(String(40), nullable=False)
    systems_touched: Mapped[list] = mapped_column(JSON, nullable=False, default=list)
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    audited_value: Mapped[str] = mapped_column(String(200), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    verification_seal: Mapped[str] = mapped_column(String(120), nullable=False)
    before_state: Mapped[str] = mapped_column(Text, nullable=True)
    after_state: Mapped[str] = mapped_column(Text, nullable=True)
    journal_lines_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    xp_awarded: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    teammate: Mapped["Teammate"] = relationship(back_populates="missions")
