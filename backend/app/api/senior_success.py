"""
Senior Data Scientist Personality Traits ML API endpoints.
Provides model benchmarks and deterministic profile inference
trained on the official SDS Personality Traits dataset.
"""
from fastapi import APIRouter, Depends

from app.schemas.senior_success import (
    SeniorSuccessInput,
    SeniorSuccessPrediction,
    SeniorModelMetadataResponse,
)
from app.services.senior_success_service import (
    SeniorSuccessService,
    get_senior_success_service,
)

router = APIRouter(prefix="/senior-success", tags=["Senior Success ML"])


@router.get("/model", response_model=SeniorModelMetadataResponse)
def get_senior_model_metadata(
    service: SeniorSuccessService = Depends(get_senior_success_service),
) -> SeniorModelMetadataResponse:
    """
    Returns empirical model architecture, holdout test metrics,
    trait importances, sample size, class distribution, and caveats.
    """
    return service.get_metadata()


@router.post("/predict", response_model=SeniorSuccessPrediction)
def predict_senior_success(
    payload: SeniorSuccessInput,
    service: SeniorSuccessService = Depends(get_senior_success_service),
) -> SeniorSuccessPrediction:
    """
    Predicts career success class association from Big Five personality trait scores.
    Provides mathematically deterministic feature evidence.
    Uses strictly association language without causal claims.
    """
    return service.predict(payload)
