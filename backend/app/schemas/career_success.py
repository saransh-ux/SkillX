"""
Pydantic schemas for Career Success ML model input, prediction, and metadata.
"""
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field, field_validator


class CareerSuccessInput(BaseModel):
    """Input skill proficiency ratings (1.0 to 5.0)."""
    big_data_skills: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Proficiency rating in Big Data technologies (1.0 - 5.0)",
        examples=[4.2],
    )
    maths_stats_skills: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Proficiency rating in Mathematics and Statistics (1.0 - 5.0)",
        examples=[4.5],
    )
    coding_skills: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Proficiency rating in Coding / Programming (1.0 - 5.0)",
        examples=[4.0],
    )
    ai_and_ml_skills: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Proficiency rating in AI & Machine Learning (1.0 - 5.0)",
        examples=[4.8],
    )
    dashboard_and_storytelling_skills: float = Field(
        ...,
        ge=1.0,
        le=5.0,
        description="Proficiency rating in Dashboards and Data Storytelling (1.0 - 5.0)",
        examples=[4.5],
    )


class FeatureEvidence(BaseModel):
    """Deterministic explanation for a single skill trait contribution."""
    feature: str
    display_name: str
    value: float
    training_mean: float
    coefficient: Optional[float] = None
    log_odds_contribution: float
    impact_direction: str  # positive, negative, neutral
    importance_rank: int
    observation: str


class CareerSuccessPrediction(BaseModel):
    """Response payload for career success prediction."""
    predicted_class: int = Field(..., description="0 = Low hike class, 1 = High hike class")
    predicted_label: str = Field(..., description="'low' or 'high'")
    probability_high: float = Field(..., description="Model probability of belonging to high hike class")
    probability_low: float = Field(..., description="Model probability of belonging to low hike class")
    model: str = Field(..., description="Model identifier used for inference")
    evidence: List[FeatureEvidence] = Field(..., description="Deterministic feature evidence breakdown")
    interpretation: str = Field(..., description="Observational interpretation statement")
    caveats: str = Field(..., description="Model limitations and statistical caveats")


class ModelMetrics(BaseModel):
    """Performance metrics on the holdout test set."""
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


class FeatureImportanceItem(BaseModel):
    """Feature importance or coefficient entry."""
    feature: str
    display_name: str
    coefficient: Optional[float] = None
    odds_ratio: Optional[float] = None
    importance: float
    rank: int
    type: str


class ModelMetadataResponse(BaseModel):
    """Metadata response describing the trained ML model."""
    model_type: str
    selected_model_name: str
    selection_rationale: str
    training_dataset_name: str
    target: str
    dataset_size: int
    train_size: int
    test_size: int
    class_distribution: Dict[str, int]
    metrics: ModelMetrics
    comparison_metrics: Dict[str, Any]
    feature_importance: List[FeatureImportanceItem]
    training_timestamp: str
    limitations: List[str]
