"""
Pydantic schemas for the SKILL//X Copilot grounded analytics interface.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class CopilotContext(BaseModel):
    """Optional contextual filters passed alongside the question."""
    role: Optional[str] = Field(None, description="Optional active job role filter")
    location: Optional[str] = Field(None, description="Optional active location filter")


class CopilotInput(BaseModel):
    """Input query and optional contextual hints for Copilot."""
    question: str = Field(
        ...,
        description="User question regarding skills, roles, co-occurrences, or ML model findings",
        examples=["What skills are most demanded?"],
    )
    context: Optional[CopilotContext] = Field(
        default=None,
        description="Optional context for active role or location",
    )


class EvidenceItem(BaseModel):
    """Factual evidence point directly referencing empirical datasets."""
    source: str = Field(..., description="Dataset name or model artifact")
    metric: str = Field(..., description="Specific metric name")
    value: str = Field(..., description="Empirical numerical value or observation")
    sample_size: int = Field(..., description="Supporting sample size")


class CopilotResponse(BaseModel):
    """Deterministic, grounded response to user query."""
    answer: str = Field(..., description="Factual answer derived strictly from official data")
    evidence: List[EvidenceItem] = Field(default_factory=list, description="List of empirical evidence items")
    methodology: str = Field(..., description="Analytical or algorithmic methodology")
    caveats: List[str] = Field(default_factory=list, description="Methodological limitations and caveats")
