"""initial schema — all 9 tables from blueprint §6

Revision ID: 0001
Revises:
Create Date: 2026-09-26

"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("firebase_uid", sa.String(128), nullable=False, unique=True),
        sa.Column("email", sa.String(320), nullable=False, unique=True),
        sa.Column("founder_name", sa.String(120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_users_firebase_uid", "users", ["firebase_uid"])
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "workspaces",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("owner_user_id", sa.Integer, sa.ForeignKey("users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("name", sa.String(160), nullable=False),
        sa.Column("business_type", sa.String(120), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_workspaces_owner_user_id", "workspaces", ["owner_user_id"])

    op.create_table(
        "autonomy_levels",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=False),
        sa.Column("name", sa.String(80), nullable=False),
        sa.Column("tagline", sa.String(200), nullable=False),
        sa.Column("required_xp", sa.Integer, nullable=False),
        sa.Column("unlocked_permissions", sa.JSON, nullable=False),
        sa.Column("restricted_permissions", sa.JSON, nullable=False),
        sa.Column("failure_bound", sa.String(200), nullable=False),
        sa.Column("color", sa.String(20), nullable=False),
        sa.Column("bg_light", sa.String(20), nullable=False),
        sa.Column("accent_border", sa.String(20), nullable=False),
    )

    op.create_table(
        "teammates",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("workspace_id", sa.Integer, sa.ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, unique=True),
        sa.Column("name", sa.String(120), nullable=False),
        sa.Column("avatar_seed", sa.String(120), nullable=False),
        sa.Column("visual_mark", sa.String(120), nullable=False),
        sa.Column("role_title", sa.String(120), nullable=False, server_default="AI Co-Founder"),
        sa.Column("current_level_id", sa.Integer, sa.ForeignKey("autonomy_levels.id"), nullable=False, server_default="1"),
        sa.Column("current_xp", sa.Integer, nullable=False, server_default="0"),
        sa.Column("streak_days", sa.Integer, nullable=False, server_default="0"),
        sa.Column("streak_shields", sa.Integer, nullable=False, server_default="0"),
        sa.Column("total_missions_completed", sa.Integer, nullable=False, server_default="0"),
        sa.Column("hours_saved", sa.Float, nullable=False, server_default="0"),
        sa.Column("accuracy_rate", sa.Float, nullable=False, server_default="100"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "skills",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("title", sa.String(160), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("category_label", sa.String(120), nullable=False),
        sa.Column("level_required", sa.Integer, sa.ForeignKey("autonomy_levels.id"), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("in_action_summary", sa.Text, nullable=False),
        sa.Column("sample_objective", sa.Text, nullable=False),
        sa.Column("supported_tools", sa.JSON, nullable=False),
        sa.Column("accent_color", sa.String(20), nullable=False),
    )

    op.create_table(
        "teammate_skills",
        sa.Column("teammate_id", sa.Integer, sa.ForeignKey("teammates.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("skill_id", sa.Integer, sa.ForeignKey("skills.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("equipped", sa.Boolean, nullable=False, server_default=sa.false()),
        sa.Column("equipped_at", sa.DateTime(timezone=True), nullable=True),
    )

    op.create_table(
        "missions",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("teammate_id", sa.Integer, sa.ForeignKey("teammates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ref_code", sa.String(40), nullable=False, unique=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("category", sa.String(80), nullable=False),
        sa.Column("status", sa.String(40), nullable=False, server_default="completed"),
        sa.Column("execution_duration", sa.String(40), nullable=False),
        sa.Column("systems_touched", sa.JSON, nullable=False),
        sa.Column("summary", sa.Text, nullable=False),
        sa.Column("audited_value", sa.String(200), nullable=True),
        sa.Column("confidence_score", sa.Float, nullable=False),
        sa.Column("verification_seal", sa.String(120), nullable=False),
        sa.Column("before_state", sa.Text, nullable=True),
        sa.Column("after_state", sa.Text, nullable=True),
        sa.Column("journal_lines_count", sa.Integer, nullable=False, server_default="0"),
        sa.Column("xp_awarded", sa.Integer, nullable=False, server_default="0"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    # Blueprint §6 scalability note: index mission-log pagination now, before it needs it.
    op.create_index("ix_missions_teammate_id_created_at", "missions", ["teammate_id", "created_at"])

    op.create_table(
        "approval_quests",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("teammate_id", sa.Integer, sa.ForeignKey("teammates.id", ondelete="CASCADE"), nullable=False),
        sa.Column("ref_code", sa.String(40), nullable=False, unique=True),
        sa.Column("title", sa.String(200), nullable=False),
        sa.Column("reason", sa.Text, nullable=False),
        sa.Column("amount_or_scope", sa.String(200), nullable=True),
        sa.Column("systems", sa.JSON, nullable=False),
        sa.Column("xp_reward", sa.Integer, nullable=False, server_default="0"),
        sa.Column("details", sa.Text, nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="pending"),
        sa.Column("resulting_mission_id", sa.Integer, sa.ForeignKey("missions.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("resolved_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_approval_quests_teammate_id", "approval_quests", ["teammate_id"])

    op.create_table(
        "agent_runs",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("teammate_id", sa.Integer, sa.ForeignKey("teammates.id", ondelete="CASCADE"), nullable=True),
        sa.Column("objective_text", sa.Text, nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="planning"),
        sa.Column("plan_steps", sa.JSON, nullable=False),
        sa.Column("resulting_mission_id", sa.Integer, sa.ForeignKey("missions.id"), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("agent_runs")
    op.drop_table("approval_quests")
    op.drop_index("ix_missions_teammate_id_created_at", table_name="missions")
    op.drop_table("missions")
    op.drop_table("teammate_skills")
    op.drop_table("skills")
    op.drop_table("teammates")
    op.drop_table("autonomy_levels")
    op.drop_table("workspaces")
    op.drop_table("users")
