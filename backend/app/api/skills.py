"""Skill endpoints for catalog, emergence index, and historical trends."""
from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.skill import SkillResponse, EmergingSkillsResponse, SkillTrendResponse
from app.services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=List[SkillResponse])
def get_skills(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
):
    """Retrieves all registered skills from the taxonomy."""
    return SkillService.get_all_skills(db=db, skip=skip, limit=limit)


@router.get("/emerging", response_model=EmergingSkillsResponse)
def get_emerging_skills(
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    """
    Retrieves skills ranked by the SKILL//X Emergence Index.
    When data has not yet been ingested, returns clearly marked empty state.
    """
    return SkillService.get_emerging_skills(db=db, limit=limit)


@router.get("/{skill}/trend", response_model=SkillTrendResponse)
def get_skill_trend(
    skill: str,
    db: Session = Depends(get_db),
):
    """Retrieves temporal demand, growth, and acceleration metrics for a given skill."""
    return SkillService.get_skill_trend(db=db, skill_name=skill)
