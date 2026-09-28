from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.database import get_db
from app.middleware.auth_guard import get_current_user
from app.models.autonomy_level import AutonomyLevel
from app.models.user import User
from app.teammates import service
from app.teammates.schemas import AutonomyLevelResponse, TeammateResponse

router = APIRouter(tags=["teammates"])


@router.get("/api/autonomy-levels", response_model=list[AutonomyLevelResponse])
async def list_autonomy_levels(db: AsyncSession = Depends(get_db)) -> list[AutonomyLevelResponse]:
    result = await db.execute(select(AutonomyLevel).order_by(AutonomyLevel.id))
    levels = result.scalars().all()
    return [AutonomyLevelResponse.model_validate(lvl) for lvl in levels]


@router.get("/api/teammates/{teammate_id}", response_model=TeammateResponse)
async def get_teammate(
    teammate_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TeammateResponse:
    teammate = await service.get_teammate_for_owner(db, teammate_id, user)
    next_level_xp = await service.compute_next_level_xp(db, teammate)
    return TeammateResponse.build(teammate, next_level_xp)


@router.get("/api/teammates", response_model=list[TeammateResponse])
async def list_teammates(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TeammateResponse]:
    """Returns all teammates owned by the current user — used to restore session on login."""
    from sqlalchemy import select as _select
    from sqlalchemy.orm import selectinload
    from app.models.teammate import Teammate
    from app.models.workspace import Workspace
    result = await db.execute(
        _select(Teammate)
        .join(Workspace, Teammate.workspace_id == Workspace.id)
        .where(Workspace.owner_user_id == user.id)
        .options(selectinload(Teammate.current_level))
        .order_by(Teammate.id)
    )
    teammates = result.scalars().all()
    out = []
    for t in teammates:
        next_level_xp = await service.compute_next_level_xp(db, t)
        out.append(TeammateResponse.build(t, next_level_xp))
    return out


# ---------------------------------------------------------------------------
# DEV-ONLY manual level override.
#
# Blueprint §16 / §11: "The manual level slider (onSimulateLevelChange) must not exist
# as a real endpoint — or if you keep it for judge-demo convenience, gate it behind a
# clearly separate /api/dev/* path that's disabled outside a demo flag, never the same
# path real progression uses." This route:
#   1. lives under /api/dev/, never /api/teammates/{id} itself
#   2. 404s outright unless DEV_MODE_ENABLED=true is set in the environment
#   3. still requires auth + ownership — it is a demo convenience, not an open door
# Set DEV_MODE_ENABLED=false (or unset it) before any real/judged deployment.
# ---------------------------------------------------------------------------
@router.post("/api/dev/teammates/{teammate_id}/set-level", response_model=TeammateResponse)
async def dev_set_level(
    teammate_id: int,
    level_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TeammateResponse:
    settings = get_settings()
    if not settings.DEV_MODE_ENABLED:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Not found.")

    teammate = await service.get_teammate_for_owner(db, teammate_id, user)
    result = await db.execute(select(AutonomyLevel).where(AutonomyLevel.id == level_id))
    level = result.scalar_one_or_none()
    if level is None:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail={"error": {"code": "INVALID_INPUT", "message": "Unknown level_id.", "field": "level_id"}},
        )
    teammate.current_level_id = level.id
    teammate.current_xp = max(teammate.current_xp, level.required_xp)
    await db.commit()
    teammate = await service.get_teammate_for_owner_by_id_unsafe(db, teammate.id)
    next_level_xp = await service.compute_next_level_xp(db, teammate)
    return TeammateResponse.build(teammate, next_level_xp)
