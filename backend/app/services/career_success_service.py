"""
Career Success Service.
Manages trained ML model lifecycle, provides model metadata, and handles predictive inference.
"""
from datetime import datetime, timezone
import logging
from pathlib import Path
from typing import Any, Dict, Optional
import pandas as pd

from app.ml.career_model import (
    DEFAULT_ARTIFACTS_DIR,
    load_artifacts,
    predict_career_success,
    save_artifacts,
    train_and_compare_models,
)
from app.ml.evaluation import extract_feature_importance
from app.ml.preprocessing import (
    RAW_FEATURE_COLS,
    TARGET_COL,
    get_train_test_split,
    load_and_validate_dataset,
    prepare_features_and_target,
)
from app.schemas.career_success import (
    CareerSuccessInput,
    CareerSuccessPrediction,
    ModelMetadataResponse,
)

logger = logging.getLogger("skillx.services.career_success")


class CareerSuccessService:
    """Service for career success ML model predictions and metadata."""

    def __init__(self, artifacts_dir: Optional[Path] = None):
        self.artifacts_dir = artifacts_dir or DEFAULT_ARTIFACTS_DIR
        self._pipeline = None
        self._metadata = None

    def _ensure_model_loaded(self) -> None:
        """Ensure model pipeline and metadata are loaded into memory, training if needed."""
        if self._pipeline is not None and self._metadata is not None:
            return

        try:
            self._pipeline, self._metadata = load_artifacts(self.artifacts_dir)
            logger.info(
                "Loaded ML model '%s' from %s",
                self._metadata.get("selected_model_name"),
                self.artifacts_dir,
            )
        except Exception as e:
            logger.warning(
                "Model artifacts not found or invalid (%s). Training now from raw dataset...",
                e,
            )
            self._train_and_save_pipeline()

    def _train_and_save_pipeline(self) -> None:
        """Train baseline and comparison models on JDS dataset and save winning model."""
        df = load_and_validate_dataset()
        X, y = prepare_features_and_target(df)
        X_train, X_test, y_train, y_test = get_train_test_split(
            X, y, test_size=0.25, random_state=42
        )

        selected_name, winning_pipeline, comparison_summary, models_dict = (
            train_and_compare_models(
                X_train, y_train, X_test, y_test, random_state=42
            )
        )

        winning_metrics = comparison_summary["models"][selected_name]
        feat_importance = extract_feature_importance(winning_pipeline, RAW_FEATURE_COLS)

        class_dist = {
            "class_0_low": int((y == 0).sum()),
            "class_1_high": int((y == 1).sum()),
        }

        metadata = {
            "model_type": (
                "StandardScaler + LogisticRegression (balanced)"
                if selected_name == "LogisticRegression"
                else "RandomForestClassifier (balanced)"
            ),
            "selected_model_name": selected_name,
            "selection_rationale": comparison_summary["selection_rationale"],
            "training_dataset_name": "JDS Skill Traits.xlsx",
            "target": TARGET_COL,
            "dataset_size": int(len(df)),
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
            "class_distribution": class_dist,
            "metrics": winning_metrics,
            "comparison_metrics": comparison_summary["models"],
            "feature_importance": feat_importance,
            "training_timestamp": datetime.now(timezone.utc).isoformat(),
            "limitations": [
                "Observational data only from JDS Skill Traits dataset (sample size: 139 roles).",
                "Does not establish causality: high skill ratings correlate with higher salary-hike classes but do not guarantee salary growth.",
                "Binary target (salary_hike_high_or_low) simplifies continuous career compensation dynamics.",
                "Model should not be used as an automated determinant in personnel or hiring decisions.",
            ],
        }

        save_artifacts(winning_pipeline, metadata, self.artifacts_dir)
        self._pipeline = winning_pipeline
        self._metadata = metadata
        logger.info("Successfully trained and cached ML artifacts.")

    def get_metadata(self) -> ModelMetadataResponse:
        """Return model metadata, evaluation metrics, and feature importances."""
        self._ensure_model_loaded()
        return ModelMetadataResponse(**self._metadata)

    def predict(self, input_data: CareerSuccessInput) -> CareerSuccessPrediction:
        """Generate prediction and deterministic feature evidence."""
        self._ensure_model_loaded()
        input_dict = input_data.model_dump()
        result = predict_career_success(self._pipeline, input_dict, self._metadata)
        return CareerSuccessPrediction(**result)


# Singleton instance
_service_instance: Optional[CareerSuccessService] = None


def get_career_success_service() -> CareerSuccessService:
    """FastAPI dependency for CareerSuccessService."""
    global _service_instance
    if _service_instance is None:
        _service_instance = CareerSuccessService()
    return _service_instance
