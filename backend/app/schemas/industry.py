"""Pydantic schemas for Industry analytics and cross-industry skill diffusion."""
from typing import List, Optional
from pydantic import BaseModel, Field


class IndustryBase(BaseModel):
    name: str


class IndustryResponse(IndustryBase):
    id: int

    class Config:
        from_attributes = True


class IndustrySkillDemand(BaseModel):
    skill: str
    canonical_name: str
    category: str
    demand_share: float
    growth_rate: float
    rank: int


class IndustrySkillsResponse(BaseModel):
    industry: str
    total_skills: int
    top_skills: List[IndustrySkillDemand] = Field(default_factory=list)
    is_real_data: bool = False
