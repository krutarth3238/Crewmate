from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.middleware.auth_guard import forbidden, not_found
from app.models.teammate import Teammate
from app.models.user import User
from app.models.workspace import Workspace
from app.workspaces.schemas import TeammateCreate, WorkspaceCreate


async def create_workspace(db: AsyncSession, owner: User, body: WorkspaceCreate) -> Workspace:
    workspace = Workspace(owner_user_id=owner.id, name=body.name, business_type=body.business_type, location=body.location, sub_niche=body.sub_niche, competitors=body.competitors)
    db.add(workspace)
    await db.commit()
    await db.refresh(workspace)
    return workspace


async def get_workspace_for_owner(db: AsyncSession, workspace_id: int, owner: User) -> Workspace:
    result = await db.execute(select(Workspace).where(Workspace.id == workspace_id))
    workspace = result.scalar_one_or_none()
    if workspace is None:
        raise not_found("Workspace not found.")
    if workspace.owner_user_id != owner.id:
        raise forbidden("You do not own this workspace.")
    return workspace


async def create_teammate(db: AsyncSession, workspace: Workspace, body: TeammateCreate) -> Teammate:
    existing = await db.execute(select(Teammate).where(Teammate.workspace_id == workspace.id))
    if existing.scalar_one_or_none() is not None:
        raise forbidden("This workspace already has a teammate (one per workspace today).")

    teammate = Teammate(
        workspace_id=workspace.id,
        name=body.name,
        avatar_seed=body.avatar_seed,
        visual_mark=body.visual_mark,
        current_level_id=1,  # Shadow — everyone starts at the bottom of the trust ladder
        current_xp=0,
    )
    db.add(teammate)
    await db.commit()
    await db.refresh(teammate)
    return teammate
