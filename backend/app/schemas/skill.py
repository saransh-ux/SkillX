"""Pydantic schemas for Skills, Trends, and Emergence Index."""
from typing import List, Optional
from pydantic import BaseModel, Field


class SkillBase(BaseModel):
    name: str
    canonical_name: str
    category: str
    description: Optional[str] = None


class SkillCreate(SkillBase):
    pass


class SkillResponse(SkillBase):
    id: int

    class Config:
        from_attributes = True


class EmergingSkillItem(BaseModel):
    id: str = Field(..., description="Unique slug or identifier")
    name: str = Field(..., description="Skill name")
    canonical_name: str = Field(..., description="Normalized canonical skill entity")
    category: str = Field(..., description="Skill domain taxonomy category")
    emergence_score: float = Field(..., description="SKILL//X Emergence Index (0-100)")
    growth_rate: float = Field(..., description="Normalized year-over-year growth rate")
    acceleration: float = Field(..., description="First derivative of growth rate")
    cross_industry_adoption: float = Field(..., description="Entropy/dispersion across industries")
    co_occurrence_score: float = Field(default=0.0, description="Synergy score with complementary skills")
    confidence: float = Field(..., description="Confidence metric based on observation sample size")
    demand_volume: Optional[int] = Field(default=0, description="Observed posting volume in current period")
    trajectory: List[float] = Field(default_factory=list, description="Historical demand trajectory points")
    co_occurring: List[str] = Field(default_factory=list, description="Top co-occurring complementary skills")
    description: Optional[str] = Field(default=None, description="Domain explanation of skill")


class EmergingSkillsResponse(BaseModel):
    total: int
    data: List[EmergingSkillItem]
    is_real_data: bool = Field(default=False, description="True if derived from real processed dataset")


class SkillTrendPoint(BaseModel):
    year: int
    demand: float
    growth_rate: float
    acceleration: float
    cross_industry_adoption: float


class SkillTrendResponse(BaseModel):
    skill: str
    canonical_name: str
    category: Optional[str] = None
    timeline: List[SkillTrendPoint]
    is_real_data: bool = False
