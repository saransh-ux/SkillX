"""Skill entity model."""
from sqlalchemy import Column, Integer, String, Text, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Skill(Base):
    __tablename__ = "skills"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(128), nullable=False, unique=True, index=True)
    canonical_name = Column(String(128), nullable=False, index=True)
    category = Column(String(64), nullable=False, index=True)
    description = Column(Text, nullable=True)

    # Relationships
    job_skills = relationship("JobSkill", back_populates="skill", cascade="all, delete-orphan")
    trends = relationship("SkillTrend", back_populates="skill", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_skills_canonical_category", "canonical_name", "category"),
    )
