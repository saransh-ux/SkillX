"""
Skill endpoints for workforce market intelligence layer,
canonical taxonomy, radar visualizations, and co-occurrence networks.
Derived 100% empirically from Analytics Jobs.csv.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from app.schemas.skill import (
    SkillListResponse,
    SkillRadarResponse,
    SkillDetailResponse,
    EmergingSkillsResponse,
    SkillTrendResponse,
)
from app.schemas.genome import SkillGenomeResponse
from app.services.skill_service import SkillService

router = APIRouter(prefix="/skills", tags=["Skills"])


@router.get("", response_model=SkillListResponse)
@router.get("/", response_model=SkillListResponse, include_in_schema=False)
def get_skills(
    search: Optional[str] = Query(None, description="Search term for skill name or alias"),
    role: Optional[str] = Query(None, description="Filter by job role / designation (e.g. Data Scientist, Analyst)"),
    location: Optional[str] = Query(None, description="Filter by location (e.g. Bengaluru, Mumbai, Pune, Delhi NCR)"),
    job_type: Optional[str] = Query(None, description="Filter by job type (e.g. Analytics)"),
    min_experience: Optional[int] = Query(None, description="Filter by minimum experience required (years)"),
    max_experience: Optional[int] = Query(None, description="Filter by maximum experience required (years)"),
    experience: Optional[str] = Query(None, description="Filter by experience text pattern (e.g. '2-5 yrs')"),
    min_count: int = Query(5, ge=1, description="Minimum posting count support threshold (filters rare noise)"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of skills to return"),
):
    """
    Retrieves canonical skills from Analytics Jobs.csv ranked by posting count and prevalence.
    Supports multi-dimensional filtering by role, location, job_type, and experience.
    Industry filter is excluded because Analytics Jobs does not contain an official industry column.
    """
    return SkillService.get_skills(
        search=search,
        role=role,
        location=location,
        job_type=job_type,
        min_experience=min_experience,
        max_experience=max_experience,
        experience=experience,
        min_count=min_count,
        limit=limit,
    )


@router.get("/radar", response_model=SkillRadarResponse)
def get_skill_radar(
    role: Optional[str] = Query(None, description="Filter by job role / designation"),
    location: Optional[str] = Query(None, description="Filter by location"),
    job_type: Optional[str] = Query(None, description="Filter by job type"),
    min_experience: Optional[int] = Query(None, description="Filter by min experience years"),
    max_experience: Optional[int] = Query(None, description="Filter by max experience years"),
    min_count: int = Query(5, ge=1, description="Minimum posting count support threshold"),
    limit: int = Query(50, ge=1, le=200, description="Number of radar data points"),
):
    """
    Retrieves the Skill Radar dataset returning canonical skill points:
    {
      "skill": "...",
      "posting_count": number,
      "prevalence": number,
      "rank": number,
      "sample_size": number
    }
    """
    return SkillService.get_skill_radar(
        role=role,
        location=location,
        job_type=job_type,
        min_experience=min_experience,
        max_experience=max_experience,
        min_count=min_count,
        limit=limit,
    )


@router.get("/emerging", response_model=EmergingSkillsResponse)
def get_emerging_skills(
    limit: int = Query(20, ge=1, le=100),
):
    """
    Retrieves skills ranked by empirical demand from Analytics Jobs.csv.
    All data is derived from authentic hackathon records.
    """
    return SkillService.get_emerging_skills(limit=limit)


@router.get("/genome", response_model=SkillGenomeResponse)
@router.get("/skill-genome", response_model=SkillGenomeResponse, include_in_schema=False)
def get_skills_genome_alias(
    focal_skill: Optional[str] = Query(None, description="Optional focal skill to center graph around"),
    min_support: int = Query(5, ge=1, description="Minimum co-occurrence count threshold"),
    limit_nodes: int = Query(50, ge=2, le=500, description="Max nodes"),
    limit_edges: int = Query(100, ge=1, le=1000, description="Max edges"),
):
    """Retrieves Skill Genome co-occurrence graph."""
    from app.services.genome_service import GenomeService
    return GenomeService.get_instance().get_skill_genome(
        focal_skill=focal_skill,
        min_support=min_support,
        limit_nodes=limit_nodes,
        limit_edges=limit_edges,
    )


@router.get("/{skill_name}", response_model=SkillDetailResponse)
def get_skill_detail(
    skill_name: str,
    top_associated_limit: int = Query(10, ge=1, le=50, description="Number of associated co-occurring skills to return"),
):
    """
    Retrieves detailed profile for an individual skill:
    - skill information
    - posting count
    - prevalence
    - top associated skills (Jaccard association strength and lift)
    - supporting sample count
    - dataset metadata and limitations
    """
    detail = SkillService.get_skill_detail(skill_name=skill_name, top_n_associated=top_associated_limit)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Skill '{skill_name}' not found in Analytics Jobs.csv corpus."
        )
    return detail


@router.get("/{skill_name}/trend", response_model=SkillTrendResponse)
def get_skill_trend(
    skill_name: str,
):
    """
    Retrieves empirical demand volume and prevalence for a given skill.
    Transparently notes that Analytics Jobs is a cross-sectional dataset.
    """
    return SkillService.get_skill_trend(skill_name=skill_name)
