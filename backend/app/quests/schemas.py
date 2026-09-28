from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.missions.schemas import MissionDetail
from app.teammates.schemas import TeammateResponse


class QuestResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    teammate_id: int
    ref_code: str
    title: str
    reason: str
    amount_or_scope: str | None
    systems: list[str]
    xp_reward: int
    details: str | None
    status: str
    resulting_mission_id: int | None
    created_at: datetime
    resolved_at: datetime | None


class QuestResolutionResponse(BaseModel):
    """Returned by approve — includes the new mission and updated teammate so the UI can animate XP/level changes."""
    quest: QuestResponse
    mission: MissionDetail | None = None
    teammate: TeammateResponse | None = None
