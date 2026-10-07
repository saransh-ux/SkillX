"""
Pydantic schemas for Senior Data Scientist Personality Traits ML model.
Predicts association with high/low professional success classification.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class SeniorSuccessInput(BaseModel):
    """Input Big Five personality trait scores (typically 10 - 80)."""
    neuroticism: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Neuroticism personality trait score",
        examples=[32.0],
    )
    extraversion: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Extraversion personality trait score",
        examples=[48.0],
    )
    openness_to_experience: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Openness to Experience personality trait score",
        examples=[46.0],
    )
    agreeableness: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Agreeableness personality trait score",
        examples=[45.0],
    )
    conscientiousness: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Conscientiousness personality trait score",
        examples=[52.0],
    )


class SeniorFeatureEvidence(BaseModel):
    """Deterministic explanation for a single personality trait contribution."""
    feature: str
    display_name: str
    value: float
    training_mean: float
    importance: float
    z_score: float
    impact_direction: str  # positive, negative, neutral
    importance_rank: int
    observation: str


class SeniorSuccessPrediction(BaseModel):
    """Prediction response for senior success classification."""
    predicted_class: int = Field(..., description="0 = Low success class, 1 = High success class")
    predicted_label: str = Field(..., description="'low' or 'high'")
    probability_high: float = Field(..., description="Estimated probability of belonging to high success class")
    probability_low: float = Field(..., description="Estimated probability of belonging to low success class")
    model: str = Field(..., description="Model identifier used for inference")
    evidence: List[SeniorFeatureEvidence] = Field(..., description="Trait contribution breakdown")
    interpretation: str = Field(..., description="Strictly observational interpretation statement")
    caveats: str = Field(..., description="Limitations and statistical caveats")


class SeniorModelMetrics(BaseModel):
    """Model evaluation metrics on holdout test set."""
    accuracy: float
    balanced_accuracy: float
    precision: float
    recall: float
    f1: float
    roc_auc: Optional[float] = None
    confusion_matrix: List[List[int]]
    confusion_matrix_breakdown: Optional[Dict[str, int]] = None
    sample_count: Optional[int] = None
    class_distribution: Optional[Dict[str, int]] = None


class SeniorFeatureImportanceItem(BaseModel):
    """Feature importance entry."""
    feature: str
    display_name: str
    importance: float
    coefficient: Optional[float] = None
    rank: int
    type: str


class SeniorModelMetadataResponse(BaseModel):
    """Metadata response describing the trained Senior Success ML model."""
    model_type: str
    selected_model_name: str
    selection_rationale: str
    training_dataset_name: str
    target: str
    dataset_size: int
    train_size: int
    test_size: int
    class_distribution: Dict[str, int]
    metrics: SeniorModelMetrics
    comparison_metrics: Dict[str, Any]
    feature_importance: List[SeniorFeatureImportanceItem]
    training_timestamp: str
    limitations: List[str]
    dataset_information: Dict[str, Any]
