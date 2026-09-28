"""
Import every model so Base.metadata is fully populated for Alembic autogenerate
and for init_models()'s create_all — importing app.models is enough to register all tables.
"""
from app.models.base import Base  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
from app.models.autonomy_level import AutonomyLevel  # noqa: F401
from app.models.teammate import Teammate  # noqa: F401
from app.models.skill import Skill  # noqa: F401
from app.models.teammate_skill import TeammateSkill  # noqa: F401
from app.models.mission import Mission  # noqa: F401
from app.models.approval_quest import ApprovalQuest  # noqa: F401
from app.models.agent_run import AgentRun  # noqa: F401

__all__ = [
    "Base", "User", "Workspace", "AutonomyLevel", "Teammate", "Skill",
    "TeammateSkill", "Mission", "ApprovalQuest", "AgentRun",
]
