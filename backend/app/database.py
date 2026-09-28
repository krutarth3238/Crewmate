"""
Async SQLAlchemy engine + session factory.
"""
import json
from collections.abc import AsyncGenerator

from sqlalchemy import select, text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.config import get_settings
from app.models.base import Base

settings = get_settings()

engine = create_async_engine(settings.DATABASE_URL, echo=(settings.ENV == "development"), future=True)

AsyncSessionLocal = async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency — one session per request, closed automatically."""
    async with AsyncSessionLocal() as session:
        yield session


_AUTONOMY_LEVELS = [
    {"id": 1, "name": "Shadow", "tagline": "Observes and researches — no outbound action yet.",
     "required_xp": 0, "unlocked_permissions": ["research"],
     "restricted_permissions": ["scheduling", "communications", "financial_records", "financial_ops", "autonomous_ops"],
     "failure_bound": "Cannot send communications, book meetings, or touch financial records.",
     "color": "#38BDF8", "bg_light": "#0E1726", "accent_border": "#38BDF8"},
    {"id": 2, "name": "Assistant", "tagline": "Performs low-risk housekeeping under supervision.",
     "required_xp": 25, "unlocked_permissions": ["research", "scheduling"],
     "restricted_permissions": ["communications", "financial_records", "financial_ops", "autonomous_ops"],
     "failure_bound": "Cannot send external communications or touch financial records.",
     "color": "#1842FF", "bg_light": "#10172A", "accent_border": "#1842FF"},
    {"id": 3, "name": "Operator", "tagline": "Trusted to communicate externally on your behalf.",
     "required_xp": 65, "unlocked_permissions": ["research", "scheduling", "communications", "financial_records"],
     "restricted_permissions": ["financial_ops", "autonomous_ops"],
     "failure_bound": "Cannot generate invoices, proposals, or run autonomous ops without approval.",
     "color": "#00C853", "bg_light": "#0A1E14", "accent_border": "#00C853"},
    {"id": 4, "name": "Partner", "tagline": "Handles financial operations — invoices, proposals, tasks.",
     "required_xp": 110, "unlocked_permissions": ["research", "scheduling", "communications", "financial_records", "financial_ops"],
     "restricted_permissions": ["autonomous_ops"],
     "failure_bound": "Cannot run autonomous operations (P&L reports, complaint handling, presentations) without approval.",
     "color": "#a78bfa", "bg_light": "#13102A", "accent_border": "#a78bfa"},
    {"id": 5, "name": "Co-Founder", "tagline": "The trust ceiling — a genuine second decision-maker.",
     "required_xp": 200, "unlocked_permissions": ["research", "scheduling", "communications", "financial_records", "financial_ops", "autonomous_ops"],
     "restricted_permissions": [],
     "failure_bound": "No hard restrictions.",
     "color": "#D8F040", "bg_light": "#141A08", "accent_border": "#D8F040"},
]

_SKILLS = [
    {"id": 1, "title": "Objective Research", "category": "research", "category_label": "Research",
     "level_required": 1, "description": "Turns a vague objective into a sourced research brief.",
     "in_action_summary": "Reads the objective, gathers context, returns a 3-5 bullet brief.",
     "sample_objective": "Find out what our top 3 competitors charge for their starter plan.",
     "supported_tools": ["research_web"], "accent_color": "#38BDF8"},
    {"id": 2, "title": "Meeting Scheduling", "category": "scheduling", "category_label": "Scheduling",
     "level_required": 2, "description": "Finds a slot and books a meeting on your behalf.",
     "in_action_summary": "Checks availability, proposes a time, sends the invite.",
     "sample_objective": "Set up a sync with our design contractor this week.",
     "supported_tools": ["schedule_meeting"], "accent_color": "#1842FF"},
    {"id": 3, "title": "Email Outreach", "category": "communications", "category_label": "Communications",
     "level_required": 3, "description": "Drafts and sends outbound emails to investors or partners.",
     "in_action_summary": "Writes a tailored email and sends it to the named contact.",
     "sample_objective": "Follow up with the investor we met last week.",
     "supported_tools": ["send_email"], "accent_color": "#00C853"},
    {"id": 4, "title": "Social Updates", "category": "communications", "category_label": "Communications",
     "level_required": 3, "description": "Drafts public updates for company social channels.",
     "in_action_summary": "Turns a milestone into a ready-to-post update.",
     "sample_objective": "Announce our new pricing tier on LinkedIn.",
     "supported_tools": ["post_social_update"], "accent_color": "#00C853"},
    {"id": 5, "title": "Financial Tracking", "category": "financial_records", "category_label": "Finance",
     "level_required": 4, "description": "Updates the shared budget/expense tracker.",
     "in_action_summary": "Records a transaction or figure into the tracking sheet.",
     "sample_objective": "Log this month's AWS bill into the expense tracker.",
     "supported_tools": ["update_spreadsheet"], "accent_color": "#a78bfa"},
    {"id": 6, "title": "Full Autonomy", "category": "financial_records", "category_label": "Finance",
     "level_required": 5, "description": "Chains any tools together for a multi-step objective.",
     "in_action_summary": "Plans and executes a multi-step objective end to end.",
     "sample_objective": "Close out this month: update the tracker, post the summary, and thank the team.",
     "supported_tools": ["send_email", "update_spreadsheet", "post_social_update", "schedule_meeting", "research_web"],
     "accent_color": "#D8F040"},
]


async def _seed_reference_data(session: AsyncSession) -> None:
    """Insert autonomy levels and skills if the tables are empty."""
    result = await session.execute(text("SELECT COUNT(*) FROM autonomy_levels"))
    if result.scalar() > 0:
        return  # already seeded

    for lvl in _AUTONOMY_LEVELS:
        await session.execute(
            text("""INSERT INTO autonomy_levels
                    (id, name, tagline, required_xp, unlocked_permissions, restricted_permissions,
                     failure_bound, color, bg_light, accent_border)
                    VALUES (:id, :name, :tagline, :required_xp, :unlocked_permissions,
                            :restricted_permissions, :failure_bound, :color, :bg_light, :accent_border)"""),
            {**lvl,
             "unlocked_permissions": json.dumps(lvl["unlocked_permissions"]),
             "restricted_permissions": json.dumps(lvl["restricted_permissions"])},
        )
    for skill in _SKILLS:
        await session.execute(
            text("""INSERT INTO skills
                    (id, title, category, category_label, level_required, description,
                     in_action_summary, sample_objective, supported_tools, accent_color)
                    VALUES (:id, :title, :category, :category_label, :level_required, :description,
                            :in_action_summary, :sample_objective, :supported_tools, :accent_color)"""),
            {**skill, "supported_tools": json.dumps(skill["supported_tools"])},
        )
    await session.commit()


async def init_models() -> None:
    """Create all tables and seed reference data. Dev convenience — real schema changes via Alembic."""
    # Import models so Base.metadata is fully populated
    import app.models  # noqa: F401
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    async with AsyncSessionLocal() as session:
        await _seed_reference_data(session)

