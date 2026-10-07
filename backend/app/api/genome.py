"""
Skill Genome API endpoint.
Exposes empirical skill co-occurrence graph directly from Analytics Jobs.key_skills.
"""
from typing import Optional
from fastapi import APIRouter, Query

from app.schemas.genome import SkillGenomeResponse
from app.services.genome_service import GenomeService

router = APIRouter(prefix="/skill-genome", tags=["Skill Genome"])


@router.get("", response_model=SkillGenomeResponse)
@router.get("/", response_model=SkillGenomeResponse, include_in_schema=False)
def get_skill_genome(
    focal_skill: Optional[str] = Query(None, description="Optional focal skill to center the graph around (e.g. Python, SQL, Machine Learning)"),
    min_support: int = Query(5, ge=1, description="Minimum co-occurrence count threshold for an edge"),
    limit_nodes: int = Query(50, ge=2, le=500, description="Maximum number of nodes in the returned graph"),
    limit_edges: int = Query(100, ge=1, le=1000, description="Maximum number of edges in the returned graph"),
):
    """
    Retrieves the SKILL//X Skill Genome co-occurrence graph.
    Computed directly from Analytics Jobs.key_skills.

    Returns:
    - nodes: list of active skills with posting count
    - edges: list of co-occurrences with count and Jaccard association metric
    - metadata: dataset name, sample size, association metric
    """
    service = GenomeService.get_instance()
    return service.get_skill_genome(
        focal_skill=focal_skill,
        min_support=min_support,
        limit_nodes=limit_nodes,
        limit_edges=limit_edges,
    )
