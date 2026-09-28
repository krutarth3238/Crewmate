"""
Approve -> creates the resulting mission + awards XP (server-authoritative version of the
frontend's handleApproveQuest). Reject -> just closes the quest, no side effects.
"""
import secrets
from datetime import datetime, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.middleware.auth_guard import forbidden, not_found
from app.models.approval_quest import ApprovalQuest
from app.models.mission import Mission
from app.teammates import service as teammate_service


async def get_quest_for_owner(db: AsyncSession, quest_id: int, owner) -> ApprovalQuest:
    result = await db.execute(select(ApprovalQuest).where(ApprovalQuest.id == quest_id))
    quest = result.scalar_one_or_none()
    if quest is None:
        raise not_found("Quest not found.")
    await teammate_service.get_teammate_for_owner(db, quest.teammate_id, owner)  # ownership check
    return quest


def _new_ref_code(prefix: str) -> str:
    return f"{prefix}-{secrets.token_hex(4).upper()}"


async def approve_quest(db: AsyncSession, quest: ApprovalQuest, user=None):
    if quest.status != "pending":
        raise forbidden("This quest has already been resolved.")  # mapped to 409 by the router

    teammate = await teammate_service.get_teammate_for_owner_by_id_unsafe(db, quest.teammate_id)

    # Execute any real side-effects from the stored plan (single pass — collect results + follow_up_quests together)
    execution_notes = []
    all_follow_up_quests: list[dict] = []
    if quest.details:
        import json as _json
        try:
            plan_steps = _json.loads(quest.details)
            from app.agent.tools import run_tool
            for step in plan_steps:
                tool_name = step.get("tool")
                if not tool_name:
                    continue
                args = step.get("args", {})
                try:
                    result = await run_tool(tool_name, args, user=user)
                    execution_notes.append(f"[{tool_name}]: {result.output}")
                    # Collect any follow-up approval quests this tool wants to create
                    if result.follow_up_quests:
                        all_follow_up_quests.extend(result.follow_up_quests)
                except Exception as e:
                    execution_notes.append(f"{tool_name} execution error: {str(e)})")
        except Exception as e:
            execution_notes.append(f"Failed to parse or execute plan: {str(e)}")

    # Create follow-up ApprovalQuest records (e.g. "send reply email" after handle_complaint)
    import json as _json_fq
    follow_up_created = 0
    for fq in all_follow_up_quests:
        draft_body = ""
        if fq.get("plan") and fq["plan"][0].get("args", {}).get("draft_body"):
            draft_body = f"\n\n--- Email Draft ---\n{fq['plan'][0]['args']['draft_body']}"
        new_quest = ApprovalQuest(
            teammate_id=quest.teammate_id,
            ref_code=_new_ref_code("QST"),
            title=fq.get("title", "Follow-up action")[:200],
            reason=fq.get("reason", "Review and approve this follow-up action.") + draft_body,
            amount_or_scope="email",
            status="pending",
            details=_json_fq.dumps(fq.get("plan", [])),
            systems=["Email"],
            xp_reward=25,
        )
        db.add(new_quest)
        follow_up_created += 1

    notes_str = " | ".join(execution_notes) if execution_notes else ""
    if follow_up_created:
        notes_str += f" | {follow_up_created} reply approval(s) queued — check the Approvals tab."



    mission = Mission(
        teammate_id=quest.teammate_id,
        ref_code=_new_ref_code("MSN"),
        title=quest.title,
        category="approved-quest",
        status="completed",
        execution_duration="—",
        systems_touched=quest.systems,
        summary=f"Approved via quest {quest.ref_code}: {quest.reason}" + (f" | {notes_str}" if notes_str else ""),
        audited_value=quest.amount_or_scope,
        confidence_score=1.0,
        verification_seal=_new_ref_code("SEAL"),
        before_state=None,
        after_state=None,
        journal_lines_count=1,
        xp_awarded=quest.xp_reward,
    )
    db.add(mission)
    await db.flush()  # get mission.id before we reference it

    quest.status = "approved"
    quest.resulting_mission_id = mission.id
    quest.resolved_at = datetime.now(timezone.utc)
    await db.commit()

    teammate = await teammate_service.award_xp(db, teammate, quest.xp_reward)
    await teammate_service.record_mission_completion(db, teammate)

    await db.refresh(mission)
    await db.refresh(quest)
    return quest, mission, teammate


async def reject_quest(db: AsyncSession, quest: ApprovalQuest) -> ApprovalQuest:
    if quest.status != "pending":
        raise forbidden("This quest has already been resolved.")
    quest.status = "rejected"
    quest.resolved_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(quest)
    return quest
