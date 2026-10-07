"""
Industries Compatibility API router.

IMPORTANT:
Analytics Jobs does NOT provide an official industry field according to the supplied hackathon data description.
Therefore, this router returns clearly labeled geographic market data with an explicit metadata field
declaring that the dimension is LOCATION, not INDUSTRY.
Never claims location is industry.
"""
from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.industry import IndustryCompatibilityResponse, IndustrySkillsResponse
from app.services.industry_service import IndustryService

router = APIRouter(prefix="/industries", tags=["Industries Compatibility"])


@router.get("", response_model=IndustryCompatibilityResponse)
@router.get("/", response_model=IndustryCompatibilityResponse, include_in_schema=False)
def get_industries(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
):
    """
    Compatibility endpoint for legacy frontend calls to /api/industries.
    Returns geographic market hub data with explicit metadata declaring the dimension is LOCATION, not INDUSTRY.
    """
    return IndustryService.get_all_industries(skip=skip, limit=limit)


@router.get("/{industry}/skills", response_model=IndustrySkillsResponse)
def get_industry_skills(
    industry: str,
):
    """
    Compatibility endpoint returning skills demanded in the queried geographic hub.
    Explicitly clarifies that data reflects geographic location demand, not industry.
    """
    return IndustryService.get_industry_skills(industry_name=industry)
