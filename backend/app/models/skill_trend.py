"""Aggregated skill temporal trend metrics across role, industry, region, and year."""
from sqlalchemy import Column, Integer, String, Float, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class SkillTrend(Base):
    __tablename__ = "skill_trends"

    id = Column(Integer, primary_key=True, index=True)
    skill_id = Column(Integer, ForeignKey("skills.id", ondelete="CASCADE"), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    role = Column(String(128), nullable=True, index=True)
    industry = Column(String(128), nullable=True, index=True)
    region = Column(String(64), nullable=True, index=True)

    # Core temporal metrics
    demand = Column(Float, nullable=False, default=0.0)
    growth_rate = Column(Float, nullable=False, default=0.0)
    acceleration = Column(Float, nullable=False, default=0.0)
    cross_industry_adoption = Column(Float, nullable=False, default=0.0)
    co_occurrence_score = Column(Float, nullable=False, default=0.0)

    # Relationship
    skill = relationship("Skill", back_populates="trends")

    __table_args__ = (
        Index("ix_trends_skill_year_role_industry", "skill_id", "year", "role", "industry"),
        Index("ix_trends_skill_year_region", "skill_id", "year", "region"),
    )
