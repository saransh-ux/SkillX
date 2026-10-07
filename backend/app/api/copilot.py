"""
Copilot API endpoint.
Thin grounded analytics interface answering strictly from the official hackathon datasets.
"""
from fastapi import APIRouter

from app.schemas.copilot import CopilotInput, CopilotResponse
from app.services.copilot_service import CopilotService

router = APIRouter(prefix="/copilot", tags=["Copilot"])


@router.post("", response_model=CopilotResponse)
@router.post("/", response_model=CopilotResponse, include_in_schema=False)
def ask_copilot(payload: CopilotInput) -> CopilotResponse:
    """
    Answers workforce intelligence queries grounded strictly in the official hackathon datasets:
    - Analytics Jobs.csv (skills, roles, geography)
    - Data Science Jobs.csv (employers, salary ranges)
    - JDS Skill Traits.xlsx (salary hike model & feature coefficients)
    - SDS Personality Traits.xlsx (senior success model & tree importances)
    - Skill Genome (Jaccard co-occurrence graph)
    - Career Scan (multi-layer profile evaluation)

    Rejects unsupported queries with:
    "I don't have enough evidence in the supplied hackathon data to answer that."
    """
    return CopilotService.answer_query(payload)
