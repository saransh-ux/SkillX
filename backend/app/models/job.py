"""Job posting model."""
from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, Index
from sqlalchemy.orm import relationship
from app.core.database import Base


class Job(Base):
    __tablename__ = "jobs"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    role = Column(String(128), nullable=False, index=True)
    industry = Column(String(128), nullable=False, index=True)
    region = Column(String(64), nullable=False, index=True)
    year = Column(Integer, nullable=False, index=True)
    description = Column(Text, nullable=True)
    source = Column(String(64), nullable=True, default="unknown")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    job_skills = relationship("JobSkill", back_populates="job", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_jobs_role_industry_year", "role", "industry", "year"),
    )
