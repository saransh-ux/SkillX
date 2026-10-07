"""
Career Success ML API endpoints.
Provides model evaluation benchmarks and deterministic profile inference
trained strictly on official JDS Skill Traits dataset.
"""
from fastapi import APIRouter, Depends

from app.schemas.career_success import (
    CareerSuccessInput,
    CareerSuccessPrediction,
    ModelMetadataResponse,
)
from app.services.career_success_service import (
    CareerSuccessService,
    get_career_success_service,
)

router = APIRouter(prefix="/career-success", tags=["Career Success ML"])


@router.get("/model", response_model=ModelMetadataResponse)
def get_career_model_metadata(
    service: CareerSuccessService = Depends(get_career_success_service),
) -> ModelMetadataResponse:
    """
    Returns empirical model architecture, holdout evaluation metrics,
    feature coefficients / importance, dataset sample size, class distribution,
    and methodological limitations.
    """
    return service.get_metadata()


@router.post("/predict", response_model=CareerSuccessPrediction)
def predict_career_success(
    payload: CareerSuccessInput,
    service: CareerSuccessService = Depends(get_career_success_service),
) -> CareerSuccessPrediction:
    """
    Predicts career salary-hike class association from skill proficiencies (1.0 to 5.0).
    Provides mathematically deterministic evidence explaining feature contributions.
    Uses strictly observational language (no causal claims).
    """
    return service.predict(payload)
