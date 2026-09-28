from datetime import datetime

from pydantic import BaseModel, ConfigDict


class MissionSummary(BaseModel):
    """List-view shape — matches what MissionLog.tsx's row needs, without the heavier detail fields."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    ref_code: str
    title: str
    category: str
    status: str
    execution_duration: str
    systems_touched: list[str]
    summary: str
    confidence_score: float
    xp_awarded: int
    created_at: datetime


class MissionDetail(BaseModel):
    """Full shape — feeds MissionDetailModal.tsx."""
    model_config = ConfigDict(from_attributes=True)

    id: int
    teammate_id: int
    ref_code: str
    title: str
    category: str
    status: str
    execution_duration: str
    systems_touched: list[str]
    summary: str
    audited_value: str | None
    confidence_score: float
    verification_seal: str
    before_state: str | None
    after_state: str | None
    journal_lines_count: int
    xp_awarded: int
    created_at: datetime


class MissionListResponse(BaseModel):
    missions: list[MissionSummary]
    next_cursor: str | None
