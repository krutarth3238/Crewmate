from pydantic import BaseModel, ConfigDict


class SkillResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    category: str
    category_label: str
    level_required: int
    description: str
    in_action_summary: str
    sample_objective: str
    supported_tools: list[str]
    accent_color: str


class TeammateSkillResponse(SkillResponse):
    equipped: bool


class ToggleSkillResponse(BaseModel):
    skill_id: int
    equipped: bool
