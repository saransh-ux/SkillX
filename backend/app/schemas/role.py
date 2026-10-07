"""
Pydantic schemas for the SKILL//X Market Structure & Role Intelligence layer.
Strictly derived from Analytics Jobs.csv observations (15,841 job postings).
No invented 2023-2026 timelines or fabricated growth percentages.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.skill import DatasetMetadata


class SkillProfileItem(BaseModel):
    """Empirical skill observed within a specific job designation."""
    skill_id: str
    canonical_name: str
    display_name: str
    posting_count: int = Field(..., description="Postings within this designation mentioning the skill")
    prevalence: float = Field(..., description="Fraction of designation postings requiring the skill (0.0 to 1.0)")
    prevalence_pct: float = Field(..., description="Prevalence percentage (0.0% to 100.0%)")
    rank: int = Field(..., description="Rank among skills for this role")


class ExperienceDistributionItem(BaseModel):
    """Experience requirement bracket observed in job postings."""
    experience: str = Field(..., description="Experience range (e.g. '2-5 yrs')")
    count: int = Field(..., description="Postings with this requirement")
    percentage: float = Field(..., description="Percentage of designation postings")


class ExperienceSummary(BaseModel):
    """Aggregate experience profile for a job designation."""
    dominant_range: Optional[str] = Field(None, description="Most frequent experience bracket")
    min_experience_avg: Optional[float] = Field(None, description="Average minimum experience in years")
    max_experience_avg: Optional[float] = Field(None, description="Average maximum experience in years")
    breakdown: List[ExperienceDistributionItem] = Field(default_factory=list)


class SalaryBracketItem(BaseModel):
    """Empirical salary range observed in Analytics Jobs postings."""
    bracket: str = Field(..., description="Formatted bracket (e.g. '10-15 Lakhs')")
    raw_bracket: str = Field(..., description="Raw column value (e.g. '10to15')")
    count: int = Field(..., description="Postings in this salary bracket")
    percentage: float = Field(..., description="Percentage of postings")


class SalarySummary(BaseModel):
    """Salary distribution summary across observed job postings."""
    currency: str = Field(default="INR (Lakhs per annum)")
    dominant_bracket: Optional[str] = Field(None, description="Most frequent salary bracket")
    brackets: List[SalaryBracketItem] = Field(default_factory=list)
    caveat: str = Field(
        default="Categorical salary brackets observed in Analytics Jobs postings; not individual salaries"
    )


class DistributionItem(BaseModel):
    """Categorical distribution item (location, job_type, etc.)."""
    category: str = Field(..., description="Category label")
    count: int = Field(..., description="Number of observed postings")
    percentage: float = Field(..., description="Percentage of postings")


class RoleItem(BaseModel):
    """Overview item for an active workforce job designation."""
    role_id: str = Field(..., description="URL-safe slug")
    designation: str = Field(..., description="Canonical job designation title")
    posting_count: int = Field(..., description="Number of observed job postings")
    sample_size: int = Field(..., description="Total postings in dataset evaluated")
    prevalence: float = Field(..., description="Fraction of total dataset (0.0 to 1.0)")
    prevalence_pct: float = Field(..., description="Prevalence percentage (0.0% to 100.0%)")
    rank: int = Field(..., description="1-based popularity rank among designations")
    top_skills: List[str] = Field(default_factory=list, description="Top observed skills for this role")


class RoleListResponse(BaseModel):
    """List response for workforce designations."""
    total_roles: int
    sample_size: int
    data: List[RoleItem]
    metadata: DatasetMetadata


class RoleDetailResponse(BaseModel):
    """
    Comprehensive factual market profile for a specific job designation.
    Exposes empirical market structure rather than unsupported temporal evolution.
    """
    role_name: str
    designation: str
    posting_count: int
    sample_size: int
    prevalence: float
    prevalence_pct: float
    top_skills: List[SkillProfileItem]
    experience_distribution: ExperienceSummary
    job_type_distribution: List[DistributionItem]
    salary_summary: Optional[SalarySummary] = None
    location_summary: List[DistributionItem]
    data_caveats: List[str]
    metadata: DatasetMetadata


class RoleSkillsResponse(BaseModel):
    """Top skill requirements for a selected designation."""
    role_name: str
    designation: str
    posting_count: int
    sample_size: int
    skills: List[SkillProfileItem]
    metadata: DatasetMetadata


# Legacy compatibility models retained with ConfigDict
class RoleBase(BaseModel):
    name: str
    industry: Optional[str] = "Analytics & Tech"


class RoleResponse(RoleBase):
    id: int
    posting_count: Optional[int] = None
    model_config = {"from_attributes": True}


class SkillShift(BaseModel):
    skill: str
    weight: float
    type: str = Field(..., description="core, prominent, or adjacent")


class RoleEvolutionResponse(BaseModel):
    """
    Factual market structure response replacing unsupported temporal evolution.
    Provides real empirical skill shifts without invented 2023-2026 timelines.
    """
    role: str
    industry: Optional[str] = "Analytics & Tech"
    sample_size: int = 0
    top_skills: List[str] = Field(default_factory=list)
    stable_core_skills: List[str] = Field(default_factory=list)
    skill_composition: List[SkillShift] = Field(default_factory=list)
    is_real_data: bool = True
    caveat: str = "Empirical market snapshot from Analytics Jobs.csv; no longitudinal timestamps present in dataset"
