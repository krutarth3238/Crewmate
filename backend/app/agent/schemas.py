from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field

from app.missions.schemas import MissionDetail
from app.quests.schemas import QuestResponse


class AgentExecuteRequest(BaseModel):
    objective: str = Field(min_length=1, max_length=2000)
    teammate_id: int | None = None  # required when authenticated; ignored in anonymous demo mode


class AgentExecuteResponse(BaseModel):
    """
    Discriminated by `status`:
      - "completed"      -> mission is set (authenticated, within current trust level)
      - "needs_approval" -> quest is set (authenticated, exceeds current trust level)
      - "demo_completed" -> demo_* fields set (anonymous landing-page mode, nothing persisted)
    """
    status: str
    mission: MissionDetail | None = None
    quest: QuestResponse | None = None
    demo_objective: str | None = None
    demo_plan_steps: list[dict] | None = None
    demo_summary: str | None = None
    demo_systems_touched: list[str] | None = None


class AgentRunResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    teammate_id: int | None
    objective_text: str
    status: str
    plan_steps: list[dict]
    resulting_mission_id: int | None
    started_at: datetime
    completed_at: datetime | None
