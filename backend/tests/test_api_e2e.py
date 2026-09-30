"""
Full end-to-end HTTP test: sync user -> create workspace -> create teammate -> execute an
objective -> list missions -> toggle a skill -> full quest approve/reject cycle.

Firebase verification is swapped out via FastAPI's dependency-override mechanism (this is
the one seam explicitly designed for that: get_current_firebase_claims) rather than any
real network call to Firebase, so this suite runs with zero external credentials.
"""
import pytest
import pytest_asyncio
from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.database import get_db
from app.main import app
from app.middleware.auth_guard import get_current_firebase_claims, get_optional_firebase_claims, optional_bearer_scheme
from app.models import Base
from app.models.autonomy_level import AutonomyLevel
from app.models.skill import Skill
from tests.conftest import TEST_LEVELS

pytestmark = pytest.mark.asyncio

FAKE_CLAIMS = {"uid": "e2e-test-uid", "email": "e2e@example.com"}


@pytest_asyncio.fixture
async def client():
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:", connect_args={"check_same_thread": False}, poolclass=StaticPool
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

    async def override_get_db():
        async with session_factory() as session:
            yield session

    async def override_claims():
        return FAKE_CLAIMS

    async def override_optional_claims(
        credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
    ):
        # Mirrors get_optional_firebase_claims' real branching (None iff no header sent)
        # without a live Firebase call — so the anonymous-demo test genuinely exercises
        # the "no Authorization header" path rather than always looking authenticated.
        return FAKE_CLAIMS if credentials is not None else None

    # Seed the trust-ladder reference data the same way the real seed migration would.
    async with session_factory() as session:
        for lvl in TEST_LEVELS:
            session.add(
                AutonomyLevel(
                    id=lvl["id"], name=lvl["name"], tagline="t", required_xp=lvl["required_xp"],
                    unlocked_permissions=["research", "scheduling", "communications", "financial_records"]
                    if lvl["id"] >= 3 else (["research", "scheduling"] if lvl["id"] == 2 else ["research"]),
                    restricted_permissions=[], failure_bound="f", color="#000", bg_light="#fff", accent_border="#ccc",
                )
            )
        session.add(
            Skill(
                id=1, title="Objective Research Briefs", category="research", category_label="Research",
                level_required=1, description="d", in_action_summary="s", sample_objective="o",
                supported_tools=["research_web"], accent_color="#94a3b8",
            )
        )
        await session.commit()

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_firebase_claims] = override_claims
    app.dependency_overrides[get_optional_firebase_claims] = override_optional_claims

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()
    await engine.dispose()


async def test_full_onboarding_and_mission_flow(client: AsyncClient):
    # 1. First sync creates the local user row.
    resp = await client.post("/api/auth/sync", json={"founder_name": "Ada Lovelace"}, headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200, resp.text
    assert resp.json()["founder_name"] == "Ada Lovelace"

    # 2. Repeat sync just fetches, doesn't overwrite.
    resp = await client.post("/api/auth/sync", json={}, headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert resp.json()["founder_name"] == "Ada Lovelace"

    # 3. Create a workspace.
    resp = await client.post("/api/workspaces", json={"name": "Ada Co", "business_type": "SaaS", "location": "London", "sub_niche": "AI"}, headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 201, resp.text
    workspace_id = resp.json()["id"]

    # 4. Onboarding step 4 — create the teammate.
    resp = await client.post(
        f"/api/workspaces/{workspace_id}/teammate",
        json={"name": "Copilot", "avatar_seed": "seed1", "visual_mark": "C"},
        headers={"Authorization": "Bearer fake"},
    )
    assert resp.status_code == 201, resp.text
    teammate_id = resp.json()["id"]
    assert resp.json()["current_level"]["name"] == "Shadow"
    assert resp.json()["next_level_xp"] == 100

    # 5. Autonomy levels are public reference data (no auth needed).
    resp = await client.get("/api/autonomy-levels")
    assert resp.status_code == 200
    assert len(resp.json()) == 5

    # 6. Skill catalog + per-teammate equip state.
    resp = await client.get("/api/skills")
    assert resp.status_code == 200
    skill_id = resp.json()[0]["id"]

    resp = await client.get(f"/api/teammates/{teammate_id}/skills", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert all(s["equipped"] is False for s in resp.json())

    resp = await client.post(f"/api/teammates/{teammate_id}/skills/{skill_id}/toggle", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert resp.json()["equipped"] is True

    # 7. Execute an objective that should stay within Shadow's "research" permission ->
    #    completes as a real mission, no approval needed.
    resp = await client.post(
        "/api/agent/execute",
        json={"objective": "Research our top 3 competitors' pricing", "teammate_id": teammate_id},
        headers={"Authorization": "Bearer fake"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "completed"
    assert body["mission"]["xp_awarded"] > 0

    # 8. Mission shows up in the paginated list.
    resp = await client.get(f"/api/missions?teammate_id={teammate_id}", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert len(resp.json()["missions"]) == 1

    # 9. Teammate XP actually increased server-side.
    resp = await client.get(f"/api/teammates/{teammate_id}", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert resp.json()["current_xp"] == body["mission"]["xp_awarded"]

    # 10. Objective requiring an unlocked-later permission (email/communications) must
    #     produce a pending quest, NOT silently execute.
    resp = await client.post(
        "/api/agent/execute",
        json={"objective": "Send an email to our lead investor", "teammate_id": teammate_id},
        headers={"Authorization": "Bearer fake"},
    )
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "needs_approval"
    quest_id = body["quest"]["id"]

    resp = await client.get(f"/api/quests?teammate_id={teammate_id}", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200
    assert len(resp.json()) == 1

    # 11. Approving it creates a mission and returns updated teammate XP.
    resp = await client.post(f"/api/quests/{quest_id}/approve", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 200, resp.text
    approval = resp.json()
    assert approval["quest"]["status"] == "approved"
    assert approval["mission"] is not None
    assert approval["teammate"]["current_xp"] > 0

    # 12. Approving the same quest again is a 409, not a silent success.
    resp = await client.post(f"/api/quests/{quest_id}/approve", headers={"Authorization": "Bearer fake"})
    assert resp.status_code == 409


async def test_anonymous_demo_mode_requires_no_auth(client: AsyncClient):
    resp = await client.post("/api/agent/execute", json={"objective": "Draft a launch announcement post"})
    assert resp.status_code == 200, resp.text
    body = resp.json()
    assert body["status"] == "demo_completed"
    assert body["demo_plan_steps"] is not None


async def test_protected_route_without_auth_is_401(client: AsyncClient):
    app.dependency_overrides.pop(get_current_firebase_claims, None)  # exercise the REAL guard, not the override
    resp = await client.get("/api/teammates/1")
    assert resp.status_code in (401, 403)  # missing bearer -> FastAPI's own 401/403 from HTTPBearer
