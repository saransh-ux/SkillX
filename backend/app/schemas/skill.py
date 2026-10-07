"""
Pydantic schemas for Skills, Skill Radar, and Market Intelligence layer.
All fields are strictly data-derived from the official SAS hackathon Analytics Jobs.csv.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class DatasetMetadata(BaseModel):
    """Transparency metadata reporting real dataset attributes and methodology."""
    dataset_name: str = Field(default="Analytics Jobs.csv (Official Hackathon Dataset)")
    sample_size: int = Field(..., description="Total eligible job postings evaluated in the current query/cohort")
    methodology: str = Field(
        default="Empirical frequency counting and normalized co-occurrence from observed job postings in Analytics Jobs.csv"
    )
    limitations: str = Field(
        default="Cross-sectional job listing data without historical timestamps; reflects current market snapshot; no official industry column present in dataset"
    )


class CanonicalSkill(BaseModel):
    """Canonical representation of an observed workforce skill."""
    skill_id: str = Field(..., description="Unique URL-safe skill identifier slug")
    canonical_name: str = Field(..., description="Normalized internal canonical skill name")
    display_name: str = Field(..., description="Human-readable canonical display label")
    posting_count: int = Field(..., description="Number of job postings mentioning this skill")
    prevalence: float = Field(..., description="postings mentioning skill / total eligible Analytics Jobs postings")
    prevalence_pct: Optional[float] = Field(None, description="Prevalence expressed as percentage (0.0% to 100.0%)")
    rank: int = Field(..., description="1-based popularity rank sorted by posting frequency")


# Alias for backward compatibility
SkillItem = CanonicalSkill


class SkillRadarItem(BaseModel):
    """
    Skill Radar entry formatted for radar visualization.
    Matches exact required schema:
    {
      "skill": "...",
      "posting_count": number,
      "prevalence": number,
      "rank": number,
      "sample_size": number
    }
    """
    skill: str = Field(..., description="Canonical display name of the skill")
    skill_id: Optional[str] = Field(None, description="URL-safe skill identifier")
    canonical_name: Optional[str] = Field(None, description="Normalized canonical name")
    display_name: Optional[str] = Field(None, description="Canonical display name")
    posting_count: int = Field(..., description="Total postings mentioning the skill")
    prevalence: float = Field(..., description="postings mentioning skill / total eligible postings")
    rank: int = Field(..., description="Rank in current cohort")
    sample_size: int = Field(..., description="Total eligible sample size in cohort")


class AssociatedSkill(BaseModel):
    """Skill co-occurring with a target skill in job postings."""
    skill_id: str
    canonical_name: str
    display_name: str
    co_occurrence_count: int = Field(..., description="Number of job postings mentioning both skills")
    association_strength: float = Field(
        ..., description="Jaccard similarity coefficient: count(A & B) / count(A | B)"
    )
    lift: float = Field(
        ..., description="Observed co-occurrence frequency relative to expected independent occurrence"
    )


# Alias for backward compatibility
AssociatedSkillItem = AssociatedSkill


class SkillDetailResponse(BaseModel):
    """Detailed profile of an individual observed skill with co-occurrence network."""
    skill_id: str
    canonical_name: str
    display_name: str
    posting_count: int
    prevalence: float
    prevalence_pct: float
    rank: int
    supporting_sample_count: int = Field(..., description="Number of supporting job postings (posting_count)")
    sample_size: int = Field(..., description="Total eligible dataset sample size")
    skill_information: Optional[Dict[str, Any]] = None
    top_associated_skills: List[AssociatedSkill]
    top_hiring_roles: Optional[List[Dict[str, Any]]] = None
    top_locations: Optional[List[Dict[str, Any]]] = None
    metadata: DatasetMetadata


class SkillListResponse(BaseModel):
    """Paginated or filtered list of observed workforce skills."""
    total_skills: int
    sample_size: int
    filters_applied: Dict[str, Any]
    data: List[CanonicalSkill]
    metadata: DatasetMetadata


class SkillRadarResponse(BaseModel):
    """Collection response for Skill Radar visualization."""
    total_skills: int
    sample_size: int
    filters_applied: Dict[str, Any]
    data: List[SkillRadarItem]
    metadata: DatasetMetadata


# Legacy/compatibility schemas retained for existing endpoint routes if needed
class SkillResponse(BaseModel):
    id: int = 0
    name: str
    canonical_name: str
    category: Optional[str] = None
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class EmergingSkillItem(BaseModel):
    id: str
    name: str
    canonical_name: str
    category: Optional[str] = "General"
    emergence_score: float = 0.0
    growth_rate: float = 0.0
    acceleration: float = 0.0
    cross_industry_adoption: float = 0.0
    co_occurrence_score: float = 0.0
    confidence: float = 1.0
    demand_volume: int = 0
    trajectory: List[int] = []
    co_occurring: List[str] = []
    description: str = ""


class EmergingSkillsResponse(BaseModel):
    total: int
    data: List[EmergingSkillItem]
    is_real_data: bool = True
    metadata: Optional[DatasetMetadata] = None


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
    timeline: List[SkillTrendPoint] = []
    is_real_data: bool = False
    metadata: Optional[DatasetMetadata] = None
