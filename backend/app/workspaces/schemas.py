from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class WorkspaceCreate(BaseModel):
    name: str = Field(min_length=1, max_length=160)
    business_type: str = Field(min_length=1, max_length=120)
    location: str = Field(min_length=1, max_length=120)
    sub_niche: str = Field(min_length=1, max_length=120)
    competitors: str | None = Field(default=None, max_length=500)


class WorkspaceResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    owner_user_id: int
    name: str
    business_type: str
    location: str | None
    sub_niche: str | None
    competitors: str | None
    created_at: datetime


class TeammateCreate(BaseModel):
    """
    Onboarding step 4 payload. NOTE (blueprint §16 ASSUMPTION): the wizard also collects
    `timeDrain` / `firstPriority` in steps 2-3, but the current frontend never sends them
    anywhere. They're accepted here as optional so nothing is silently dropped if you wire
    them up later, but they don't yet affect starting skill selection.
    """
    name: str = Field(min_length=1, max_length=120)
    avatar_seed: str = Field(min_length=1, max_length=120)
    visual_mark: str = Field(min_length=1, max_length=120)
    time_drain: str | None = None
    first_priority: str | None = None
