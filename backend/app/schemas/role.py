"""Pydantic schemas for Role evolution and role intelligence."""
from typing import List, Optional
from pydantic import BaseModel, Field


class RoleBase(BaseModel):
    name: str
    industry: str


class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True


class SkillShift(BaseModel):
    skill: str
    weight: float
    type: str = Field(..., description="core, emerging, declining, or adjacent")


class RoleEvolutionResponse(BaseModel):
    role: str
    industry: Optional[str] = None
    historical_years: List[int] = Field(default_factory=list)
    top_emerging_skills: List[str] = Field(default_factory=list)
    declining_skills: List[str] = Field(default_factory=list)
    stable_core_skills: List[str] = Field(default_factory=list)
    skill_composition: List[SkillShift] = Field(default_factory=list)
    is_real_data: bool = False
