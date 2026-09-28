"""
Skills are close to static reference data (blueprint §6) — the catalog itself has no
write endpoint. The only real mutation is per-teammate equip/unequip.
"""
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.middleware.auth_guard import get_current_user
from app.models.skill import Skill
from app.models.teammate_skill import TeammateSkill
from app.models.user import User
from app.skills.schemas import SkillResponse, TeammateSkillResponse, ToggleSkillResponse
from app.teammates.service import get_teammate_for_owner

router = APIRouter(tags=["skills"])


@router.get("/api/skills", response_model=list[SkillResponse])
async def list_skills(db: AsyncSession = Depends(get_db)) -> list[SkillResponse]:
    result = await db.execute(select(Skill).order_by(Skill.level_required, Skill.id))
    skills = result.scalars().all()
    return [SkillResponse.model_validate(s) for s in skills]


@router.get("/api/teammates/{teammate_id}/skills", response_model=list[TeammateSkillResponse])
async def list_teammate_skills(
    teammate_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> list[TeammateSkillResponse]:
    await get_teammate_for_owner(db, teammate_id, user)

    skills_result = await db.execute(select(Skill).order_by(Skill.level_required, Skill.id))
    skills = skills_result.scalars().all()

    links_result = await db.execute(select(TeammateSkill).where(TeammateSkill.teammate_id == teammate_id))
    equipped_ids = {link.skill_id for link in links_result.scalars().all() if link.equipped}

    return [
        TeammateSkillResponse(**SkillResponse.model_validate(s).model_dump(), equipped=s.id in equipped_ids)
        for s in skills
    ]


@router.post("/api/teammates/{teammate_id}/skills/{skill_id}/toggle", response_model=ToggleSkillResponse)
async def toggle_skill(
    teammate_id: int,
    skill_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ToggleSkillResponse:
    await get_teammate_for_owner(db, teammate_id, user)

    result = await db.execute(
        select(TeammateSkill).where(
            TeammateSkill.teammate_id == teammate_id, TeammateSkill.skill_id == skill_id
        )
    )
    link = result.scalar_one_or_none()

    if link is None:
        link = TeammateSkill(teammate_id=teammate_id, skill_id=skill_id, equipped=True, equipped_at=datetime.now(timezone.utc))
        db.add(link)
    else:
        link.equipped = not link.equipped
        link.equipped_at = datetime.now(timezone.utc) if link.equipped else None

    await db.commit()
    return ToggleSkillResponse(skill_id=skill_id, equipped=link.equipped)
