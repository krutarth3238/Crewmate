"""
Integration test: approving a quest must produce both a new mission row and a correctly
updated teammate XP/level (blueprint §13 Phase-4 test criterion).
"""
import pytest
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.approval_quest import ApprovalQuest
from app.models.mission import Mission
from app.models.teammate import Teammate
from app.quests.service import approve_quest, reject_quest

pytestmark = pytest.mark.asyncio


async def _make_pending_quest(db_session: AsyncSession, teammate: Teammate, xp_reward: int = 150) -> ApprovalQuest:
    quest = ApprovalQuest(
        teammate_id=teammate.id,
        ref_code="QST-TEST0001",
        title="Send the investor update",
        reason="Requires communications permission not yet unlocked.",
        amount_or_scope="communications",
        systems=["Email"],
        xp_reward=xp_reward,
        details="{}",
        status="pending",
    )
    db_session.add(quest)
    await db_session.commit()
    await db_session.refresh(quest)
    return quest


async def test_approve_quest_creates_mission_and_awards_xp(db_session: AsyncSession, seeded_teammate: Teammate):
    quest = await _make_pending_quest(db_session, seeded_teammate, xp_reward=150)

    resolved_quest, mission, teammate = await approve_quest(db_session, quest)

    assert resolved_quest.status == "approved"
    assert resolved_quest.resulting_mission_id == mission.id
    assert mission.xp_awarded == 150
    assert mission.teammate_id == seeded_teammate.id
    # 150 XP crosses the Apprentice threshold (100) from the shared TEST_LEVELS fixture
    assert teammate.current_xp == 150
    assert teammate.current_level_id == 2

    # The mission must actually exist as a persisted row, not just an in-memory object.
    result = await db_session.execute(select(Mission).where(Mission.id == mission.id))
    assert result.scalar_one_or_none() is not None


async def test_reject_quest_creates_no_mission_and_awards_no_xp(db_session: AsyncSession, seeded_teammate: Teammate):
    quest = await _make_pending_quest(db_session, seeded_teammate, xp_reward=150)

    resolved_quest = await reject_quest(db_session, quest)

    assert resolved_quest.status == "rejected"
    assert resolved_quest.resulting_mission_id is None
    await db_session.refresh(seeded_teammate)
    assert seeded_teammate.current_xp == 0
    assert seeded_teammate.current_level_id == 1

    result = await db_session.execute(select(Mission).where(Mission.teammate_id == seeded_teammate.id))
    assert result.scalar_one_or_none() is None


async def test_approving_an_already_resolved_quest_raises(db_session: AsyncSession, seeded_teammate: Teammate):
    quest = await _make_pending_quest(db_session, seeded_teammate)
    await approve_quest(db_session, quest)

    with pytest.raises(Exception):  # forbidden() -> HTTPException; router maps this to 409
        await approve_quest(db_session, quest)
