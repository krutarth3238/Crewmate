"""
The single most important regression test in the whole backend (blueprint §14):
exact XP->level boundary cases. One point below a threshold must NOT level up;
exactly at the threshold MUST.
"""
import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.teammate import Teammate
from app.teammates.service import award_xp, compute_next_level_xp, get_teammate_for_owner_by_id_unsafe

pytestmark = pytest.mark.asyncio


async def test_one_xp_below_threshold_does_not_level_up(db_session: AsyncSession, seeded_teammate: Teammate):
    # Apprentice requires 100 XP. Award 99 -> must stay at Shadow (level 1).
    updated = await award_xp(db_session, seeded_teammate, 99)
    assert updated.current_xp == 99
    assert updated.current_level_id == 1


async def test_exact_threshold_levels_up(db_session: AsyncSession, seeded_teammate: Teammate):
    # Award exactly 100 -> must reach Apprentice (level 2), not stay at Shadow.
    updated = await award_xp(db_session, seeded_teammate, 100)
    assert updated.current_xp == 100
    assert updated.current_level_id == 2


async def test_one_xp_above_threshold_still_levels_up(db_session: AsyncSession, seeded_teammate: Teammate):
    updated = await award_xp(db_session, seeded_teammate, 101)
    assert updated.current_level_id == 2


async def test_multi_level_jump_in_a_single_award(db_session: AsyncSession, seeded_teammate: Teammate):
    # A single large award should walk through every threshold it clears, not just the next one.
    # 700 XP clears Apprentice (100), Operator (300), and lands exactly on Partner (700).
    updated = await award_xp(db_session, seeded_teammate, 700)
    assert updated.current_xp == 700
    assert updated.current_level_id == 4  # Partner


async def test_xp_awards_accumulate_across_calls(db_session: AsyncSession, seeded_teammate: Teammate):
    await award_xp(db_session, seeded_teammate, 60)
    updated = await award_xp(db_session, seeded_teammate, 60)  # 60 + 60 = 120, crosses the 100 threshold
    assert updated.current_xp == 120
    assert updated.current_level_id == 2


async def test_max_level_has_no_next_level_xp(db_session: AsyncSession, seeded_teammate: Teammate):
    updated = await award_xp(db_session, seeded_teammate, 1500)
    assert updated.current_level_id == 5
    next_xp = await compute_next_level_xp(db_session, updated)
    assert next_xp is None


async def test_below_max_level_reports_correct_next_level_xp(db_session: AsyncSession, seeded_teammate: Teammate):
    teammate = await get_teammate_for_owner_by_id_unsafe(db_session, seeded_teammate.id)
    next_xp = await compute_next_level_xp(db_session, teammate)
    assert next_xp == 100  # Shadow -> Apprentice threshold


async def test_negative_xp_is_rejected(db_session: AsyncSession, seeded_teammate: Teammate):
    with pytest.raises(ValueError):
        await award_xp(db_session, seeded_teammate, -10)
