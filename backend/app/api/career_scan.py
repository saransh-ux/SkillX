"""
Career Scan API endpoint.
Combines Market Demand (Analytics Jobs), Junior Career Success (JDS),
and Senior Success (SDS) into an integrated, explainable career evaluation.
"""
from fastapi import APIRouter

from app.schemas.career_scan import CareerScanInput, CareerScanResponse
from app.services.career_scan_service import CareerScanService

router = APIRouter(prefix="/career-scan", tags=["Career Scan"])


@router.post("", response_model=CareerScanResponse)
@router.post("/", response_model=CareerScanResponse, include_in_schema=False)
def run_career_scan(payload: CareerScanInput) -> CareerScanResponse:
    """
    Executes an evidence-grounded SKILL//X Career Scan across three empirical layers:
    1. Market Demand (Analytics Jobs.csv: role prevalence, skill demand, location distribution)
    2. Junior Career Success (JDS Skill Traits.xlsx: salary hike classification & feature importance)
    3. Senior Success (SDS Personality Traits.xlsx: success classification & Big Five traits)

    Returns:
    - market_evidence: factual market listings context
    - career_model: salary-hike prediction and evidence
    - senior_model: success classification and trait evidence
    - priority_skills: evidence-aligned skill priorities with explicit tiers
    - recommendations: deterministic actionable guidance with source datasets and sample sizes
    - caveats: explicit methodological disclaimers (no future forecasting, non-causal associations)
    """
    return CareerScanService.run_career_scan(payload)
