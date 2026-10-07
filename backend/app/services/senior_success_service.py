"""
Senior Success Service.
Manages trained Senior Data Scientist Personality Traits ML model lifecycle,
serves model metadata, and handles predictive profile inferences.
"""
from datetime import datetime, timezone
import logging
from pathlib import Path
from typing import Any, Dict, Optional
import numpy as np

from app.ml.career_model import DEFAULT_ARTIFACTS_DIR
from app.ml.senior_model import (
    SDS_FEATURE_COLS,
    SDS_TARGET_COL,
    SDS_FEATURE_DISPLAY_NAMES,
    get_sds_train_test_split,
    load_and_validate_sds_dataset,
    load_senior_artifacts,
    predict_senior_success,
    prepare_sds_features_and_target,
    save_senior_artifacts,
    train_and_compare_senior_models,
)
from app.schemas.senior_success import (
    SeniorSuccessInput,
    SeniorSuccessPrediction,
    SeniorModelMetadataResponse,
)

logger = logging.getLogger("skillx.services.senior_success")


class SeniorSuccessService:
    """Service for Senior Data Scientist personality traits ML model predictions and metadata."""

    def __init__(self, artifacts_dir: Optional[Path] = None):
        self.artifacts_dir = artifacts_dir or DEFAULT_ARTIFACTS_DIR
        self._pipeline = None
        self._metadata = None

    def _ensure_model_loaded(self) -> None:
        """Ensure model pipeline and metadata are loaded into memory, training if needed."""
        if self._pipeline is not None and self._metadata is not None:
            return

        try:
            self._pipeline, self._metadata = load_senior_artifacts(self.artifacts_dir)
            logger.info(
                "Loaded Senior ML model '%s' from %s",
                self._metadata.get("selected_model_name"),
                self.artifacts_dir,
            )
        except Exception as e:
            logger.warning(
                "Senior model artifacts not found or invalid (%s). Training now from raw dataset...",
                e,
            )
            self._train_and_save_pipeline()

    def _train_and_save_pipeline(self) -> None:
        """Train baseline and comparison models on SDS dataset and persist winning pipeline."""
        df = load_and_validate_sds_dataset()
        X, y = prepare_sds_features_and_target(df)
        X_train, X_test, y_train, y_test = get_sds_train_test_split(
            X, y, test_size=0.25, random_state=42
        )

        selected_name, winning_pipeline, comparison_summary, models_dict = (
            train_and_compare_senior_models(
                X_train, y_train, X_test, y_test, random_state=42
            )
        )

        winning_metrics = comparison_summary["models"][selected_name]

        # Extract feature importances
        clf = winning_pipeline.named_steps.get("clf", winning_pipeline)
        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
        else:
            importances = np.abs(clf.coef_[0])

        indices = np.argsort(importances)[::-1]
        feature_importance_list = []
        for rank, idx in enumerate(indices, start=1):
            fname = SDS_FEATURE_COLS[idx]
            feature_importance_list.append({
                "feature": fname,
                "display_name": SDS_FEATURE_DISPLAY_NAMES.get(fname, fname),
                "importance": round(float(importances[idx]), 4),
                "coefficient": None if hasattr(clf, "feature_importances_") else round(float(clf.coef_[0][idx]), 4),
                "rank": rank,
                "type": "gini_importance" if hasattr(clf, "feature_importances_") else "standardized_coefficient",
            })

        class_dist = {
            "class_0_low": int((y == 0).sum()),
            "class_1_high": int((y == 1).sum()),
        }

        metadata = {
            "model_type": (
                "RandomForestClassifier (n_estimators=100, max_depth=4, balanced)"
                if selected_name == "RandomForestClassifier"
                else "StandardScaler + LogisticRegression (balanced)"
            ),
            "selected_model_name": selected_name,
            "selection_rationale": comparison_summary["selection_rationale"],
            "training_dataset_name": "SDS Personality Traits.xlsx",
            "target": SDS_TARGET_COL,
            "dataset_size": int(len(df)),
            "train_size": int(len(X_train)),
            "test_size": int(len(X_test)),
            "class_distribution": class_dist,
            "metrics": winning_metrics,
            "comparison_metrics": comparison_summary["models"],
            "feature_importance": feature_importance_list,
            "training_timestamp": datetime.now(timezone.utc).isoformat(),
            "limitations": [
                "Observational study on a specific cohort of data scientists (n=161).",
                "Does NOT establish that personality traits cause professional success.",
                "Personality inventories vary across instruments and cultural contexts.",
                "This model must not be interpreted as a universal rule about data scientists or used for hiring/promotions.",
            ],
            "dataset_information": {
                "source": "SDS Personality Traits.xlsx",
                "features": SDS_FEATURE_COLS,
                "target": SDS_TARGET_COL,
                "positive_label": "High success classification (1)",
                "negative_label": "Low success classification (0)",
            },
        }

        save_senior_artifacts(winning_pipeline, metadata, self.artifacts_dir)
        self._pipeline = winning_pipeline
        self._metadata = metadata
        logger.info("Successfully trained and saved Senior ML artifacts.")

    def get_metadata(self) -> SeniorModelMetadataResponse:
        """Return model metadata, holdout test metrics, and trait importances."""
        self._ensure_model_loaded()
        return SeniorModelMetadataResponse(**self._metadata)

    def predict(self, input_data: SeniorSuccessInput) -> SeniorSuccessPrediction:
        """Generate prediction and deterministic feature evidence using association wording."""
        self._ensure_model_loaded()
        input_dict = input_data.model_dump()
        result = predict_senior_success(self._pipeline, input_dict, self._metadata)
        return SeniorSuccessPrediction(**result)


# Singleton instance
_senior_service_instance: Optional[SeniorSuccessService] = None


def get_senior_success_service() -> SeniorSuccessService:
    """FastAPI dependency for SeniorSuccessService."""
    global _senior_service_instance
    if _senior_service_instance is None:
        _senior_service_instance = SeniorSuccessService()
    return _senior_service_instance
