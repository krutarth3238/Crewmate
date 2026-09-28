"""
THE TRUST ENGINE.

Blueprint §11: "The trust/XP system is the product's core promise — treat it as the
highest-value target." This module is the ONLY place XP is ever written. It replaces
App.tsx's client-side handleMissionCompleted reducer, which trusted whatever XP number
it was handed — a real backend must never accept `{xp: 500}` from a client and store it.

Every caller (quests.service.approve_quest, agent.engine after a completed run) goes
through award_xp() so level-up transitions are computed in exactly one place.
"""
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.middleware.auth_guard import forbidden, not_found
from app.models.autonomy_level import AutonomyLevel
from app.models.teammate import Teammate
from app.models.user import User
from app.models.workspace import Workspace


async def get_teammate_for_owner(db: AsyncSession, teammate_id: int, owner: User) -> Teammate:
    result = await db.execute(
        select(Teammate)
        .options(selectinload(Teammate.current_level), selectinload(Teammate.workspace))
        .where(Teammate.id == teammate_id)
    )
    teammate = result.scalar_one_or_none()
    if teammate is None:
        raise not_found("Teammate not found.")
    if teammate.workspace.owner_user_id != owner.id:
        raise forbidden("You do not own this teammate.")
    return teammate


async def compute_next_level_xp(db: AsyncSession, teammate: Teammate) -> int | None:
    """None at the max level (5) — there is nothing above Co-Founder to progress toward."""
    result = await db.execute(
        select(AutonomyLevel).where(AutonomyLevel.id == teammate.current_level_id + 1)
    )
    next_level = result.scalar_one_or_none()
    return next_level.required_xp if next_level is not None else None


async def award_xp(db: AsyncSession, teammate: Teammate, xp_amount: int) -> Teammate:
    """
    The one and only place current_xp and current_level_id are mutated.

    Boundary rule (this is the exact behavior tests/test_teammates_xp.py pins down):
    a teammate levels up as soon as current_xp >= the NEXT level's required_xp — not
    strictly greater than. XP one point below a threshold must NOT level up; XP exactly
    at the threshold MUST. Handles multi-level jumps in a single award (e.g. a big mission
    granting enough XP to skip two tiers at once) by looping rather than checking once.
    """
    if xp_amount < 0:
        raise ValueError("xp_amount must be non-negative")

    teammate.current_xp += xp_amount

    while True:
        result = await db.execute(
            select(AutonomyLevel).where(AutonomyLevel.id == teammate.current_level_id + 1)
        )
        next_level = result.scalar_one_or_none()
        if next_level is None:
            break  # already at the max level (5) — nothing left to level up into
        if teammate.current_xp >= next_level.required_xp:
            teammate.current_level_id = next_level.id
        else:
            break

    await db.commit()
    await db.refresh(teammate)
    # refresh may have dropped eagerly-loaded relationships depending on the driver;
    # re-fetch with them attached so the caller can always safely read teammate.current_level
    return await get_teammate_for_owner_by_id_unsafe(db, teammate.id)


async def get_teammate_for_owner_by_id_unsafe(db: AsyncSession, teammate_id: int) -> Teammate:
    """Internal helper — re-fetches with relationships loaded, no ownership check (caller already checked)."""
    result = await db.execute(
        select(Teammate)
        .options(selectinload(Teammate.current_level), selectinload(Teammate.workspace))
        .where(Teammate.id == teammate_id)
    )
    return result.scalar_one()


async def record_mission_completion(db: AsyncSession, teammate: Teammate) -> None:
    """Bumps the lightweight stat counters that ride alongside a completed mission."""
    teammate.total_missions_completed += 1
    await db.commit()
