"""
Pydantic schemas for Geographic Market Intelligence.
Derived 100% empirically from the location column of Analytics Jobs.csv.
Note: Analytics Jobs does NOT provide an official industry column.
Geographical location is used instead without fabricating industry data.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

from app.schemas.skill import DatasetMetadata
from app.schemas.role import (
    SkillProfileItem,
    DistributionItem,
    ExperienceSummary,
    SalarySummary,
)


class GeographicMarketItem(BaseModel):
    """Summary of workforce market demand in a specific geographical location."""
    location: str = Field(..., description="Geographical location / metropolitan hub")
    posting_count: int = Field(..., description="Number of observed job postings in this location")
    percentage_of_postings: float = Field(..., description="Percentage of total dataset postings")
    top_skills: List[str] = Field(default_factory=list, description="Top skills demanded in this location")
    average_salary: Optional[float] = Field(None, description="Mean annual salary (INR Lakhs) derived from parsed midpoints")
    median_salary: Optional[float] = Field(None, description="Median annual salary (INR Lakhs) derived from parsed midpoints")
    salary_currency: str = Field(default="INR (Lakhs per annum)")
    dominant_experience: Optional[str] = Field(None, description="Most frequent experience bracket")
    experience_summary: Optional[Dict[str, Any]] = Field(None, description="Experience overview metrics")


class GeographicMarketListResponse(BaseModel):
    """Collection response for geographic market hubs."""
    dimension: str = Field(default="LOCATION", description="Data segmentation dimension (LOCATION, not INDUSTRY)")
    total_locations: int = Field(..., description="Total active locations returned")
    sample_size: int = Field(..., description="Total eligible postings evaluated in dataset")
    data: List[GeographicMarketItem]
    metadata: DatasetMetadata


class GeographicMarketDetailResponse(BaseModel):
    """Detailed market structure breakdown for a specific geographical location."""
    dimension: str = Field(default="LOCATION", description="Data segmentation dimension (LOCATION, not INDUSTRY)")
    location: str = Field(..., description="Location name")
    posting_count: int = Field(..., description="Number of observed postings in this location")
    percentage_of_postings: float = Field(..., description="Percentage of total dataset postings")
    sample_size: int = Field(..., description="Total dataset postings evaluated")
    top_skills: List[SkillProfileItem] = Field(default_factory=list, description="Top skills demanded in this location")
    job_designations: List[DistributionItem] = Field(default_factory=list, description="Top designations in this location")
    job_types: List[DistributionItem] = Field(default_factory=list, description="Job type breakdown")
    salary_summary: Optional[SalarySummary] = Field(None, description="Salary bracket and parsed midpoint statistics")
    experience_summary: Optional[ExperienceSummary] = Field(None, description="Experience requirements distribution")
    data_caveats: List[str] = Field(default_factory=list, description="Explicit data constraints and limitations")
    metadata: DatasetMetadata
