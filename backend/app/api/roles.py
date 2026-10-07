"""
Roles API router for factual workforce market structure and designation intelligence.
Directly derived from Analytics Jobs.csv observations (15,841 job postings).
No fabricated 2023-2026 timelines or invented growth percentages.
"""
from typing import Optional
from fastapi import APIRouter, Query, HTTPException

from app.schemas.role import (
    RoleListResponse,
    RoleDetailResponse,
    RoleSkillsResponse,
    RoleEvolutionResponse,
)
from app.services.role_service import RoleService

router = APIRouter(prefix="/roles", tags=["Roles"])


@router.get("", response_model=RoleListResponse)
@router.get("/", response_model=RoleListResponse, include_in_schema=False)
def get_roles(
    search: Optional[str] = Query(None, description="Search term to filter job designations"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of designations to return"),
):
    """
    Retrieves active job designations ranked by actual posting counts in Analytics Jobs.csv.
    """
    return RoleService.get_roles(search=search, limit=limit)


@router.get("/{role_name}", response_model=RoleDetailResponse)
def get_role_detail(
    role_name: str,
):
    """
    Retrieves comprehensive factual market structure profile for a designation:
    - role name & posting count
    - top skills with within-role prevalence
    - experience distribution
    - job type distribution
    - salary summary (broad categorical INR Lakhs brackets)
    - location summary
    - sample size and transparency data caveats
    """
    detail = RoleService.get_role_detail(role_name=role_name)
    if not detail:
        raise HTTPException(
            status_code=404,
            detail=f"Role designation '{role_name}' not found in Analytics Jobs.csv corpus."
        )
    return detail


@router.get("/{role_name}/skills", response_model=RoleSkillsResponse)
def get_role_skills(
    role_name: str,
    limit: int = Query(20, ge=1, le=100, description="Max top skills to return for role"),
):
    """
    Retrieves the top empirical skills required for the selected designation.
    """
    skills_resp = RoleService.get_role_skills(role_name=role_name, limit=limit)
    if not skills_resp:
        raise HTTPException(
            status_code=404,
            detail=f"Role designation '{role_name}' not found in Analytics Jobs.csv corpus."
        )
    return skills_resp


@router.get("/{role_name}/evolution", response_model=RoleEvolutionResponse)
def get_role_evolution(
    role_name: str,
):
    """
    Backward-compatible role endpoint exposing factual market structure rather
    than unsupported temporal evolution (no fabricated 2023-2026 timelines).
    """
    return RoleService.get_role_evolution(role_name=role_name)
