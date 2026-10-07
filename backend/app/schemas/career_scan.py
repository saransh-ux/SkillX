"""
Pydantic schemas for the SKILL//X Career Scan multi-layer intelligence engine.
Combines Market Demand (Analytics Jobs), Junior Success (JDS), and Senior Success (SDS).
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.career_success import (
    CareerSuccessInput,
    CareerSuccessPrediction,
)
from app.schemas.senior_success import (
    SeniorSuccessInput,
    SeniorSuccessPrediction,
)


class CareerScanInput(BaseModel):
    """Input payload for Career Scan combining market targets and individual profiles."""
    target_role: str = Field(
        default="Data Scientist",
        description="Target job role / designation in the analytics market (e.g. Data Scientist, Business Analyst)",
        examples=["Data Scientist"],
    )
    location: Optional[str] = Field(
        default=None,
        description="Optional geographic market filter (e.g. Bengaluru, Mumbai, Pune, Delhi NCR)",
        examples=["Bengaluru"],
    )
    skill_profile: CareerSuccessInput = Field(
        ...,
        description="Proficiency ratings across 5 technical skill trait categories (1.0 to 5.0)",
    )
    personality_profile: SeniorSuccessInput = Field(
        ...,
        description="Psychometric scores across Big Five personality traits (0.0 to 100.0)",
    )


class MarketEvidenceItem(BaseModel):
    """Factual market demand evidence point from Analytics Jobs.csv."""
    dimension: str  # role, location, skill_prevalence, compensation
    title: str
    posting_count: int
    prevalence_pct: float
    summary: str
    sample_size: int
    dataset: str = "Analytics Jobs.csv"


class PrioritySkillItem(BaseModel):
    """Evidence-driven priority skill recommendation."""
    skill_name: str
    canonical_name: str
    category: str
    market_posting_count: int
    market_prevalence_pct: float
    trait_alignment: str
    user_proficiency: float
    model_weight: float
    priority_tier: str  # High Demand & High Leverage, Core Baseline, Specialized Focus
    rationale: str


class RecommendationItem(BaseModel):
    """Deterministic, evidence-grounded career recommendation."""
    recommendation_type: str  # skill_development, market_alignment, senior_trait
    title: str
    actionable_guidance: str
    evidence: str
    source_dataset: str
    sample_size: int
    confidence: str
    caveat: str


class CareerScanResponse(BaseModel):
    """Response combining all 3 evidence layers without future forecasting."""
    market_evidence: List[MarketEvidenceItem]
    career_model: CareerSuccessPrediction
    senior_model: SeniorSuccessPrediction
    priority_skills: List[PrioritySkillItem]
    recommendations: List[RecommendationItem]
    caveats: List[str]
