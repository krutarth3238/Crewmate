from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class AutonomyLevelResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    tagline: str
    required_xp: int
    unlocked_permissions: list[str]
    restricted_permissions: list[str]
    failure_bound: str
    color: str
    bg_light: str
    accent_border: str


class TeammateResponse(BaseModel):
    """
    NOTE: next_level_xp is NOT read off the ORM object — it's derived server-side in
    teammates/service.py::compute_next_level_xp and passed in explicitly by the router.
    This is deliberate (models/teammate.py's docstring): storing it on the row risked the
    exact drift bug the original frontend reducer had. None only at level 5 (max).
    """
    model_config = ConfigDict(from_attributes=True)

    id: int
    workspace_id: int
    name: str
    avatar_seed: str
    visual_mark: str
    role_title: str
    current_level: AutonomyLevelResponse
    current_xp: int
    next_level_xp: int | None
    streak_days: int
    streak_shields: int
    total_missions_completed: int
    hours_saved: float
    accuracy_rate: float

    @classmethod
    def build(cls, teammate, next_level_xp: int | None) -> "TeammateResponse":
        return cls(
            id=teammate.id,
            workspace_id=teammate.workspace_id,
            name=teammate.name,
            avatar_seed=teammate.avatar_seed,
            visual_mark=teammate.visual_mark,
            role_title=teammate.role_title,
            current_level=AutonomyLevelResponse.model_validate(teammate.current_level),
            current_xp=teammate.current_xp,
            next_level_xp=next_level_xp,
            streak_days=teammate.streak_days,
            streak_shields=teammate.streak_shields,
            total_missions_completed=teammate.total_missions_completed,
            hours_saved=teammate.hours_saved,
            accuracy_rate=teammate.accuracy_rate,
        )
