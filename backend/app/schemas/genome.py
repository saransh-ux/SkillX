"""
Pydantic schemas for the SKILL//X Skill Genome co-occurrence graph.
Strictly derived from Analytics Jobs.key_skills co-occurrence analysis.
"""
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field


class GenomeNode(BaseModel):
    """Node representing an empirical workforce skill in the genome network."""
    id: str = Field(..., description="Canonical skill identifier slug")
    label: str = Field(..., description="Human-readable canonical display label")
    count: int = Field(..., description="Total postings mentioning the skill (non-negative)")


class GenomeEdge(BaseModel):
    """Undirected co-occurrence relationship between two skills."""
    source: str = Field(..., description="Source node canonical id")
    target: str = Field(..., description="Target node canonical id")
    cooccurrence: int = Field(..., description="Job postings mentioning both skills (co-occurrence count)")
    association: float = Field(
        ..., description="Jaccard similarity association metric: cooc / (count(A) + count(B) - cooc)"
    )


class GenomeMetadata(BaseModel):
    """Metadata describing the Skill Genome graph extraction."""
    dataset: str = Field(default="Analytics Jobs", description="Source dataset name")
    sample_size: int = Field(..., description="Total eligible job postings evaluated")
    association_metric: str = Field(default="jaccard", description="Primary normalized association metric")
    total_nodes: Optional[int] = Field(None, description="Number of active nodes in response")
    total_edges: Optional[None | int] = Field(None, description="Number of active edges in response")
    focal_skill: Optional[str] = Field(None, description="Focal skill applied, if any")
    min_support_used: Optional[int] = Field(None, description="Minimum co-occurrence support threshold applied")


class SkillGenomeResponse(BaseModel):
    """Full Skill Genome graph response."""
    nodes: List[GenomeNode]
    edges: List[GenomeEdge]
    metadata: GenomeMetadata
