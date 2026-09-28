"""
POST /api/agent/execute — the core endpoint (blueprint §7).
  * Authenticated + owns teammate_id -> real, persisted plan/execute/verify/mission loop.
  * No Authorization header -> anonymous demo mode for the public landing page:
    rate-limited per client IP, nothing persisted.
GET /api/agent/runs/{id} — poll an in-flight/completed run.
"""
import time

from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.agent import engine
from app.agent.schemas import AgentExecuteRequest, AgentExecuteResponse, AgentRunResponse
from app.config import get_settings
from app.database import get_db
from app.middleware.auth_guard import get_current_user, get_optional_firebase_claims, not_found
from app.models.agent_run import AgentRun
from app.models.user import User
from app.teammates.service import get_teammate_for_owner

router = APIRouter(prefix="/api/agent", tags=["agent"])

# In-memory sliding-window rate limiter for the anonymous demo. Blueprint §3: "Redis
# ... skippable for the hackathon ... an in-process dict is enough for a 48-hour build."
# NOTE: resets on process restart and does not share state across multiple server
# instances — fine for a single-dyno hackathon deploy, not for a scaled production one.
_demo_hits: dict[str, list[float]] = {}


def _check_demo_rate_limit(client_ip: str) -> None:
    settings = get_settings()
    now = time.time()
    window_start = now - 3600
    hits = [t for t in _demo_hits.get(client_ip, []) if t > window_start]
    if len(hits) >= settings.AGENT_DEMO_RATE_LIMIT_PER_HOUR:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail={"error": {"code": "RATE_LIMITED", "message": "Demo limit reached — sign up for unlimited access."}},
        )
    hits.append(now)
    _demo_hits[client_ip] = hits


@router.post("/execute", response_model=AgentExecuteResponse)
async def execute_objective(
    body: AgentExecuteRequest,
    request: Request,
    claims: dict | None = Depends(get_optional_firebase_claims),
    db: AsyncSession = Depends(get_db),
) -> AgentExecuteResponse:
    if claims is not None:
        # Authenticated path — resolve the local user (rather than depending on
        # get_current_user directly) since this route must also accept requests with NO
        # Authorization header at all for the anonymous demo path below.
        result = await db.execute(select(User).where(User.firebase_uid == claims["uid"]))
        user = result.scalar_one_or_none()
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail={"error": {"code": "UNAUTHENTICATED", "message": "No local account yet — call /api/auth/sync first."}},
            )
        if body.teammate_id is None:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail={"error": {"code": "INVALID_INPUT", "message": "teammate_id is required when authenticated.", "field": "teammate_id"}},
            )
        teammate = await get_teammate_for_owner(db, body.teammate_id, user)
        outcome = await engine.execute_for_teammate(db, teammate, user, body.objective)

        if outcome["status"] == "completed":
            from app.missions.schemas import MissionDetail
            return AgentExecuteResponse(status="completed", mission=MissionDetail.model_validate(outcome["mission"]))
        else:
            from app.quests.schemas import QuestResponse
            return AgentExecuteResponse(status="needs_approval", quest=QuestResponse.model_validate(outcome["quest"]))

    # Anonymous demo path — the public landing-page box.
    client_ip = request.client.host if request.client else "unknown"
    _check_demo_rate_limit(client_ip)
    outcome = await engine.execute_anonymous_demo(body.objective)
    return AgentExecuteResponse(
        status="demo_completed",
        demo_objective=outcome["objective"],
        demo_plan_steps=outcome["plan_steps"],
        demo_summary=outcome["summary"],
        demo_systems_touched=outcome["systems_touched"],
    )


@router.get("/runs/{run_id}", response_model=AgentRunResponse)
async def get_run(
    run_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> AgentRunResponse:
    result = await db.execute(select(AgentRun).where(AgentRun.id == run_id))
    run = result.scalar_one_or_none()
    if run is None:
        raise not_found("Agent run not found.")
    if run.teammate_id is not None:
        await get_teammate_for_owner(db, run.teammate_id, user)  # ownership check
    return AgentRunResponse.model_validate(run)
