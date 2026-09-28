"""
Read-only from the API by design (blueprint §11 — missions is an append-only audit log;
no edit/delete endpoint exists here on purpose). Rows are only ever created internally,
by quests.service.approve_quest or agent.engine.
"""
import base64

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_guard import get_current_user, not_found
from app.missions.schemas import MissionDetail, MissionListResponse, MissionSummary
from app.models.mission import Mission
from app.models.user import User
from app.teammates.service import get_teammate_for_owner

router = APIRouter(prefix="/api/missions", tags=["missions"])


def _encode_cursor(mission_id: int) -> str:
    return base64.urlsafe_b64encode(str(mission_id).encode()).decode()


def _decode_cursor(cursor: str) -> int:
    return int(base64.urlsafe_b64decode(cursor.encode()).decode())


@router.get("", response_model=MissionListResponse)
async def list_missions(
    teammate_id: int,
    limit: int = Query(default=20, ge=1, le=100),
    cursor: str | None = None,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MissionListResponse:
    await get_teammate_for_owner(db, teammate_id, user)  # ownership check — 403/404 as needed

    stmt = select(Mission).where(Mission.teammate_id == teammate_id).order_by(Mission.id.desc())
    if cursor:
        stmt = stmt.where(Mission.id < _decode_cursor(cursor))
    stmt = stmt.limit(limit + 1)

    result = await db.execute(stmt)
    rows = result.scalars().all()

    has_more = len(rows) > limit
    rows = rows[:limit]
    next_cursor = _encode_cursor(rows[-1].id) if has_more and rows else None

    return MissionListResponse(
        missions=[MissionSummary.model_validate(m) for m in rows],
        next_cursor=next_cursor,
    )


@router.get("/{mission_id}", response_model=MissionDetail)
async def get_mission(
    mission_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> MissionDetail:
    result = await db.execute(select(Mission).where(Mission.id == mission_id))
    mission = result.scalar_one_or_none()
    if mission is None:
        raise not_found("Mission not found.")
    await get_teammate_for_owner(db, mission.teammate_id, user)  # ownership check via the parent teammate
    return MissionDetail.model_validate(mission)
