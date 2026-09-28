"""
Shared test fixtures. Uses an in-memory SQLite DB (aiosqlite) rather than Postgres so the
unit/integration tests for the trust engine and quest workflow run with zero external
services — exactly what blueprint §14 asks for ("design tests so they run without real
credentials whenever practical").
"""
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool

from app.models import Base
from app.models.autonomy_level import AutonomyLevel
from app.models.teammate import Teammate
from app.models.user import User
from app.models.workspace import Workspace


@pytest_asyncio.fixture
async def db_session() -> AsyncSession:
    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)
    async with session_factory() as session:
        yield session

    await engine.dispose()


# Small, deliberately round thresholds so boundary math in test assertions stays readable.
# Independent of the placeholder seed migration content (alembic/versions/0002_...) on purpose.
TEST_LEVELS = [
    {"id": 1, "name": "Shadow", "required_xp": 0},
    {"id": 2, "name": "Apprentice", "required_xp": 100},
    {"id": 3, "name": "Operator", "required_xp": 300},
    {"id": 4, "name": "Partner", "required_xp": 700},
    {"id": 5, "name": "Co-Founder", "required_xp": 1500},
]


@pytest_asyncio.fixture
async def seeded_teammate(db_session: AsyncSession) -> Teammate:
    for lvl in TEST_LEVELS:
        db_session.add(
            AutonomyLevel(
                id=lvl["id"], name=lvl["name"], tagline="t", required_xp=lvl["required_xp"],
                unlocked_permissions=[], restricted_permissions=[],
                failure_bound="f", color="#000", bg_light="#fff", accent_border="#ccc",
            )
        )
    await db_session.flush()

    user = User(firebase_uid="uid-1", email="founder@example.com", founder_name="Test Founder")
    db_session.add(user)
    await db_session.flush()

    workspace = Workspace(owner_user_id=user.id, name="Test Co", business_type="SaaS")
    db_session.add(workspace)
    await db_session.flush()

    teammate = Teammate(
        workspace_id=workspace.id, name="Ada", avatar_seed="ada", visual_mark="A",
        current_level_id=1, current_xp=0,
    )
    db_session.add(teammate)
    await db_session.commit()
    await db_session.refresh(teammate)
    return teammate
