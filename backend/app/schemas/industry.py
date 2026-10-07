"""
Pydantic schemas for Industry / Geographic Compatibility layer.

IMPORTANT NOTICE:
Analytics Jobs does NOT provide an official industry field according to the supplied hackathon data description.
Therefore: DO NOT infer or fabricate industries. Location is used instead.

Every response explicitly labels that the dimension is LOCATION, not INDUSTRY.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.skill import DatasetMetadata
from app.schemas.geography import GeographicMarketItem


class IndustryCompatibilityItem(BaseModel):
    """Compatibility representation mapping geographic market hubs."""
    id: int = Field(..., description="1-based popularity rank")
    name: str = Field(..., description="Geographical location hub (e.g. Bengaluru, Mumbai)")
    location: str = Field(..., description="Geographical location hub")
    dimension: str = Field(default="LOCATION", description="Explicit dimension flag: LOCATION, not INDUSTRY")
    posting_count: int = Field(..., description="Job postings in this location")
    percentage_of_postings: float = Field(..., description="Share of total dataset postings")
    top_skills: List[str] = Field(default_factory=list, description="Top skills demanded in this location")
    average_salary: Optional[float] = Field(None, description="Average salary in INR Lakhs")
    note: str = Field(
        default="This metric represents geographic market location because Analytics Jobs does not contain an official industry column."
    )


class IndustryCompatibilityResponse(BaseModel):
    """Compatibility list response for /api/industries endpoint."""
    dimension: str = Field(default="LOCATION", description="Explicit declaration that dimension is LOCATION, not INDUSTRY")
    notice: str = Field(
        default="Analytics Jobs.csv does not contain an official industry column. Geographic market location data is returned with clear labeling."
    )
    total_locations: int
    sample_size: int
    data: List[IndustryCompatibilityItem]
    metadata: DatasetMetadata


class IndustrySkillDemand(BaseModel):
    skill: str
    canonical_name: str
    category: str = "Technical"
    demand_share: float
    posting_count: int = 0
    rank: int


class IndustrySkillsResponse(BaseModel):
    """Compatibility response for /api/industries/{industry}/skills endpoint."""
    dimension: str = Field(default="LOCATION", description="Explicit declaration that dimension is LOCATION, not INDUSTRY")
    target_entity: str = Field(..., description="Queried location/industry term")
    notice: str = Field(
        default="Analytics Jobs.csv does not contain an official industry column. Skills reflect geographic market demand."
    )
    total_skills: int
    sample_size: int = 0
    top_skills: List[IndustrySkillDemand] = Field(default_factory=list)
    is_real_data: bool = True
    metadata: DatasetMetadata


# Legacy models retained for backwards compatibility
class IndustryBase(BaseModel):
    name: str


class IndustryResponse(IndustryBase):
    id: int
    dimension: str = "LOCATION"
    location: Optional[str] = None
    posting_count: Optional[int] = None
    model_config = {"from_attributes": True}
