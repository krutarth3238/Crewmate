"""seed reference data — autonomy_levels + skills catalog

Revision ID: 0002
Revises: 0001
Create Date: 2026-09-26

IMPORTANT (blueprint §1/§13 Phase-1 test criterion): the frontend's real seed content
lives in `initialData.ts` (AUTONOMY_LEVELS, SKILLS). I don't have that file's literal
contents, so the rows below are a reasonable PLACEHOLDER standing in for it — same shape,
same 5-tier trust ladder, invented copy/numbers. Before treating this as done, replace the
values in `upgrade()` below with the exact content from your actual `initialData.ts` so
`GET /api/autonomy-levels` and `GET /api/skills` return byte-identical data to what the
frontend currently hardcodes.
"""
from alembic import op
import sqlalchemy as sa

revision = "0002"
down_revision = "0001"
branch_labels = None
depends_on = None

AUTONOMY_LEVELS = [
    {
        "id": 1, "name": "Shadow", "tagline": "Observes and researches — no outbound action yet.",
        "required_xp": 0, "unlocked_permissions": ["research"],
        "restricted_permissions": ["scheduling", "communications", "financial_records"],
        "failure_bound": "Cannot send communications, book meetings, or touch financial records.",
        "color": "#94a3b8", "bg_light": "#f1f5f9", "accent_border": "#cbd5e1",
    },
    {
        "id": 2, "name": "Apprentice", "tagline": "Can manage the calendar under supervision.",
        "required_xp": 150, "unlocked_permissions": ["research", "scheduling"],
        "restricted_permissions": ["communications", "financial_records"],
        "failure_bound": "Cannot send external communications or touch financial records.",
        "color": "#38bdf8", "bg_light": "#f0f9ff", "accent_border": "#bae6fd",
    },
    {
        "id": 3, "name": "Operator", "tagline": "Trusted to communicate externally on your behalf.",
        "required_xp": 400, "unlocked_permissions": ["research", "scheduling", "communications"],
        "restricted_permissions": ["financial_records"],
        "failure_bound": "Cannot post financial-record changes without approval.",
        "color": "#34d399", "bg_light": "#ecfdf5", "accent_border": "#a7f3d0",
    },
    {
        "id": 4, "name": "Partner", "tagline": "Full operational trust across every system.",
        "required_xp": 900, "unlocked_permissions": ["research", "scheduling", "communications", "financial_records"],
        "restricted_permissions": [],
        "failure_bound": "No hard restrictions — high-value actions still surface as quests by convention.",
        "color": "#a78bfa", "bg_light": "#f5f3ff", "accent_border": "#ddd6fe",
    },
    {
        "id": 5, "name": "Co-Founder", "tagline": "The trust ceiling — a genuine second decision-maker.",
        "required_xp": 2000, "unlocked_permissions": ["research", "scheduling", "communications", "financial_records"],
        "restricted_permissions": [],
        "failure_bound": "No hard restrictions.",
        "color": "#eab308", "bg_light": "#fefce8", "accent_border": "#fde047",
    },
]

SKILLS = [
    {
        "id": 1, "title": "Objective Research Briefs", "category": "research", "category_label": "Research",
        "level_required": 1,
        "description": "Turns a vague objective into a short, sourced research brief.",
        "in_action_summary": "Reads the objective, gathers context, returns a 3-5 bullet brief.",
        "sample_objective": "Find out what our top 3 competitors charge for their starter plan.",
        "supported_tools": ["research_web"], "accent_color": "#94a3b8",
    },
    {
        "id": 2, "title": "Meeting Scheduling", "category": "scheduling", "category_label": "Scheduling",
        "level_required": 2,
        "description": "Finds a slot and books a meeting on your behalf.",
        "in_action_summary": "Checks availability, proposes a time, sends the invite.",
        "sample_objective": "Set up a sync with our design contractor this week.",
        "supported_tools": ["schedule_meeting"], "accent_color": "#38bdf8",
    },
    {
        "id": 3, "title": "Investor Email Outreach", "category": "communications", "category_label": "Communications",
        "level_required": 3,
        "description": "Drafts and sends outbound emails to investors or partners.",
        "in_action_summary": "Writes a tailored email and sends it to the named contact.",
        "sample_objective": "Follow up with the investor we met last week.",
        "supported_tools": ["send_email"], "accent_color": "#34d399",
    },
    {
        "id": 4, "title": "Social Update Drafting", "category": "communications", "category_label": "Communications",
        "level_required": 3,
        "description": "Drafts a public update for a company social channel.",
        "in_action_summary": "Turns a milestone or announcement into a ready-to-post update.",
        "sample_objective": "Announce our new pricing tier on LinkedIn.",
        "supported_tools": ["post_social_update"], "accent_color": "#34d399",
    },
    {
        "id": 5, "title": "Financial Tracker Updates", "category": "financial_records", "category_label": "Finance",
        "level_required": 4,
        "description": "Updates the shared budget/expense tracker with new figures.",
        "in_action_summary": "Records a transaction or figure into the tracking sheet.",
        "sample_objective": "Log this month's AWS bill into the expense tracker.",
        "supported_tools": ["update_spreadsheet"], "accent_color": "#a78bfa",
    },
    {
        "id": 6, "title": "Full Autonomy Execution", "category": "financial_records", "category_label": "Finance",
        "level_required": 5,
        "description": "Can chain any of the above tools together for a multi-step objective.",
        "in_action_summary": "Plans and executes a multi-step objective end to end.",
        "sample_objective": "Close out this month: update the tracker, post the summary, and thank the team.",
        "supported_tools": ["send_email", "update_spreadsheet", "post_social_update", "schedule_meeting", "research_web"],
        "accent_color": "#eab308",
    },
]


def upgrade() -> None:
    conn = op.get_bind()
    conn.execute(
        sa.text(
            """INSERT INTO autonomy_levels
               (id, name, tagline, required_xp, unlocked_permissions, restricted_permissions,
                failure_bound, color, bg_light, accent_border)
               VALUES (:id, :name, :tagline, :required_xp, :unlocked_permissions, :restricted_permissions,
                       :failure_bound, :color, :bg_light, :accent_border)"""
        ),
        [
            {**lvl, "unlocked_permissions": _json(lvl["unlocked_permissions"]), "restricted_permissions": _json(lvl["restricted_permissions"])}
            for lvl in AUTONOMY_LEVELS
        ],
    )
    conn.execute(
        sa.text(
            """INSERT INTO skills
               (id, title, category, category_label, level_required, description,
                in_action_summary, sample_objective, supported_tools, accent_color)
               VALUES (:id, :title, :category, :category_label, :level_required, :description,
                       :in_action_summary, :sample_objective, :supported_tools, :accent_color)"""
        ),
        [{**s, "supported_tools": _json(s["supported_tools"])} for s in SKILLS],
    )


def _json(value) -> str:
    import json
    return json.dumps(value)


def downgrade() -> None:
    conn = op.get_bind()
    conn.execute(sa.text("DELETE FROM skills"))
    conn.execute(sa.text("DELETE FROM autonomy_levels"))
