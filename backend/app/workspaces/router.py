from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_guard import get_current_user
from app.models.user import User
from app.teammates.schemas import TeammateResponse
from app.workspaces import service
from app.workspaces.schemas import TeammateCreate, WorkspaceCreate, WorkspaceResponse

router = APIRouter(prefix="/api/workspaces", tags=["workspaces"])


@router.post("", response_model=WorkspaceResponse, status_code=201)
async def create_workspace(
    body: WorkspaceCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    workspace = await service.create_workspace(db, user, body)
    return WorkspaceResponse.model_validate(workspace)


@router.get("/{workspace_id}", response_model=WorkspaceResponse)
async def get_workspace(
    workspace_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> WorkspaceResponse:
    workspace = await service.get_workspace_for_owner(db, workspace_id, user)
    return WorkspaceResponse.model_validate(workspace)


@router.post("/{workspace_id}/teammate", response_model=TeammateResponse, status_code=201)
async def create_teammate(
    workspace_id: int,
    body: TeammateCreate,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TeammateResponse:
    workspace = await service.get_workspace_for_owner(db, workspace_id, user)
    teammate = await service.create_teammate(db, workspace, body)
    # re-load with current_level relationship + compute next_level_xp, same as GET /api/teammates/{id}
    from app.teammates.service import compute_next_level_xp, get_teammate_for_owner  # local import avoids a circular import at module load
    teammate = await get_teammate_for_owner(db, teammate.id, user)
    next_level_xp = await compute_next_level_xp(db, teammate)
    return TeammateResponse.build(teammate, next_level_xp)
