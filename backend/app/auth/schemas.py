from datetime import datetime

from pydantic import BaseModel, ConfigDict


class SyncUserRequest(BaseModel):
    founder_name: str | None = None  # only required/used on a user's very first sync call


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    firebase_uid: str
    email: str
    founder_name: str
    created_at: datetime
    google_connected: bool


class WorkspaceSummary(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    business_type: str


class UserWithWorkspaces(BaseModel):
    user: UserResponse
    workspaces: list[WorkspaceSummary]
