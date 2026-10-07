"""Industries API router for industry verticals and skill distribution."""
from typing import List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.industry import IndustryResponse, IndustrySkillsResponse
from app.services.industry_service import IndustryService

router = APIRouter(prefix="/industries", tags=["Industries"])


@router.get("", response_model=List[IndustryResponse])
def get_industries(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieves list of tracked industry verticals."""
    return IndustryService.get_all_industries(db=db, skip=skip, limit=limit)


@router.get("/{industry}/skills", response_model=IndustrySkillsResponse)
def get_industry_skills(
    industry: str,
    db: Session = Depends(get_db),
):
    """Retrieves skills demanded within a specific industry vertical."""
    return IndustryService.get_industry_skills(db=db, industry_name=industry)
