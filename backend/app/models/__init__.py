"""Models package initialization exporting all SQLAlchemy entities."""
from app.models.job import Job
from app.models.skill import Skill
from app.models.role import Role
from app.models.industry import Industry
from app.models.job_skill import JobSkill
from app.models.skill_trend import SkillTrend

__all__ = ["Job", "Skill", "Role", "Industry", "JobSkill", "SkillTrend"]
