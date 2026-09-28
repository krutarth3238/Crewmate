from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_guard import get_current_user
from app.missions.schemas import MissionDetail
from app.models.approval_quest import ApprovalQuest
from app.models.user import User
from app.quests import service
from app.quests.schemas import QuestResolutionResponse, QuestResponse
from app.teammates.schemas import TeammateResponse
from app.teammates.service import compute_next_level_xp, get_teammate_for_owner

router = APIRouter(prefix="/api/quests", tags=["quests"])


@router.get("", response_model=list[QuestResponse])
async def list_quests(
    teammate_id: int,
    status_filter: str = "pending",
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[QuestResponse]:
    await get_teammate_for_owner(db, teammate_id, user)  # ownership check
    stmt = select(ApprovalQuest).where(ApprovalQuest.teammate_id == teammate_id)
    if status_filter != "all":
        stmt = stmt.where(ApprovalQuest.status == status_filter)
    stmt = stmt.order_by(ApprovalQuest.created_at.desc())
    result = await db.execute(stmt)
    quests = result.scalars().all()
    return [QuestResponse.model_validate(q) for q in quests]


@router.post("/{quest_id}/approve", response_model=QuestResolutionResponse)
async def approve_quest(
    quest_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuestResolutionResponse:
    quest = await service.get_quest_for_owner(db, quest_id, user)
    if quest.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "INVALID_STATE", "message": "This quest has already been resolved."}},
        )
    quest, mission, teammate = await service.approve_quest(db, quest, user)
    next_level_xp = await compute_next_level_xp(db, teammate)
    return QuestResolutionResponse(
        quest=QuestResponse.model_validate(quest),
        mission=MissionDetail.model_validate(mission),
        teammate=TeammateResponse.build(teammate, next_level_xp),
    )


@router.post("/{quest_id}/reject", response_model=QuestResponse)
async def reject_quest(
    quest_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> QuestResponse:
    quest = await service.get_quest_for_owner(db, quest_id, user)
    if quest.status != "pending":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"error": {"code": "INVALID_STATE", "message": "This quest has already been resolved."}},
        )
    quest = await service.reject_quest(db, quest)
    return QuestResponse.model_validate(quest)
