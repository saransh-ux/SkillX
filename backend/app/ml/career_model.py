"""
Model definitions, training pipelines, persistence, deterministic evidence extraction, and inference.
"""
from datetime import datetime, timezone
import json
import logging
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple, Union
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.ml.preprocessing import (
    FEATURE_DISPLAY_NAMES,
    RAW_FEATURE_COLS,
    TARGET_COL,
    normalize_input_features,
)
from app.ml.evaluation import evaluate_classifier, extract_feature_importance

logger = logging.getLogger("skillx.ml.career_model")

DEFAULT_ARTIFACTS_DIR = Path(__file__).parent / "artifacts"


def build_logistic_regression_pipeline(
    random_state: int = 42,
    C: float = 1.0,
) -> Pipeline:
    """Build Logistic Regression pipeline with standard scaling."""
    return Pipeline([
        ("scaler", StandardScaler()),
        (
            "clf",
            LogisticRegression(
                class_weight="balanced",
                random_state=random_state,
                C=C,
                max_iter=1000,
            ),
        ),
    ])


def build_random_forest_pipeline(
    random_state: int = 42,
    n_estimators: int = 100,
    max_depth: int = 4,
) -> Pipeline:
    """Build Random Forest pipeline."""
    return Pipeline([
        (
            "clf",
            RandomForestClassifier(
                n_estimators=n_estimators,
                max_depth=max_depth,
                class_weight="balanced",
                random_state=random_state,
            ),
        )
    ])


def train_and_compare_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    random_state: int = 42,
) -> Tuple[str, Pipeline, Dict[str, Any], Dict[str, Pipeline]]:
    """
    Train both LogisticRegression and RandomForestClassifier, evaluate them,
    and select the best performing model.
    """
    # 1. Train Logistic Regression
    lr_pipe = build_logistic_regression_pipeline(random_state=random_state)
    lr_pipe.fit(X_train, y_train)
    lr_pred = lr_pipe.predict(X_test)
    lr_prob = lr_pipe.predict_proba(X_test)[:, 1]
    lr_metrics = evaluate_classifier(y_test, lr_pred, lr_prob)

    # 2. Train Random Forest
    rf_pipe = build_random_forest_pipeline(random_state=random_state)
    rf_pipe.fit(X_train, y_train)
    rf_pred = rf_pipe.predict(X_test)
    rf_prob = rf_pipe.predict_proba(X_test)[:, 1]
    rf_metrics = evaluate_classifier(y_test, rf_pred, rf_prob)

    models_dict = {
        "LogisticRegression": lr_pipe,
        "RandomForestClassifier": rf_pipe,
    }
    metrics_dict = {
        "LogisticRegression": lr_metrics,
        "RandomForestClassifier": rf_metrics,
    }

    # Defensible selection logic: Balanced Accuracy first, then ROC-AUC, then interpretability
    lr_bal = lr_metrics["balanced_accuracy"]
    rf_bal = rf_metrics["balanced_accuracy"]

    if lr_bal > rf_bal or (abs(lr_bal - rf_bal) < 1e-4 and (lr_metrics["roc_auc"] or 0) >= (rf_metrics["roc_auc"] or 0)):
        selected_name = "LogisticRegression"
        rationale = (
            f"LogisticRegression selected as primary model. Balanced Accuracy ({lr_bal:.4f} vs {rf_bal:.4f}), "
            f"ROC-AUC ({lr_metrics['roc_auc']} vs {rf_metrics['roc_auc']}), Precision ({lr_metrics['precision']} vs {rf_metrics['precision']}), "
            "and direct signed linear interpretability."
        )
    else:
        selected_name = "RandomForestClassifier"
        rationale = (
            f"RandomForestClassifier selected as primary model. Balanced Accuracy ({rf_bal:.4f} vs {lr_bal:.4f})."
        )

    comparison_summary = {
        "selected_model": selected_name,
        "selection_rationale": rationale,
        "models": metrics_dict,
    }

    return selected_name, models_dict[selected_name], comparison_summary, models_dict


def save_artifacts(
    pipeline: Pipeline,
    metadata: Dict[str, Any],
    artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
) -> None:
    """Save trained scikit-learn pipeline and JSON metadata."""
    dir_path = Path(artifacts_dir)
    dir_path.mkdir(parents=True, exist_ok=True)

    model_path = dir_path / "model.joblib"
    meta_path = dir_path / "metadata.json"

    joblib.dump(pipeline, model_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Saved ML model artifacts to %s", dir_path)


def load_artifacts(
    artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """Load model pipeline and metadata from disk."""
    dir_path = Path(artifacts_dir)
    model_path = dir_path / "model.joblib"
    meta_path = dir_path / "metadata.json"

    if not model_path.exists() or not meta_path.exists():
        raise FileNotFoundError(
            f"Model artifacts not found in {dir_path}. Run training script first."
        )

    pipeline = joblib.load(model_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return pipeline, metadata


def compute_deterministic_evidence(
    pipeline: Pipeline,
    input_df: pd.DataFrame,
    metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Compute mathematically deterministic evidence explaining feature contributions.
    For LogisticRegression:
    z_i = w_i * (x_i - mean_i) / scale_i
    Explains directional push toward high or low salary-hike class.
    Strictly uses observational wording.
    """
    evidence_list: List[Dict[str, Any]] = []

    # Check if pipeline has scaler and logistic regression
    if "scaler" in pipeline.named_steps and "clf" in pipeline.named_steps:
        scaler: StandardScaler = pipeline.named_steps["scaler"]
        clf = pipeline.named_steps["clf"]

        if hasattr(clf, "coef_"):
            coefs = clf.coef_[0]
            means = scaler.mean_
            scales = scaler.scale_

            contributions = []
            for idx, col in enumerate(RAW_FEATURE_COLS):
                val = float(input_df[col].iloc[0])
                mean = float(means[idx])
                scale = float(scales[idx])
                coef = float(coefs[idx])

                z_score = (val - mean) / (scale if scale > 0 else 1.0)
                contribution = coef * z_score

                contributions.append({
                    "col": col,
                    "val": val,
                    "mean": mean,
                    "coef": coef,
                    "contribution": contribution,
                    "abs_contrib": abs(contribution),
                })

            # Sort by absolute contribution descending
            contributions.sort(key=lambda x: x["abs_contrib"], reverse=True)

            for rank, item in enumerate(contributions, start=1):
                col = item["col"]
                disp_name = FEATURE_DISPLAY_NAMES.get(col, col)
                val = item["val"]
                mean = item["mean"]
                coef = item["coef"]
                contrib = item["contribution"]

                if contrib > 0.05:
                    direction = "positive"
                    obs = (
                        f"Rating of {val:.1f} in {disp_name} is above the training sample benchmark ({mean:.2f}), "
                        f"contributing positively (+{contrib:.2f} log-odds) toward association with the high salary-hike class."
                    )
                elif contrib < -0.05:
                    direction = "negative"
                    obs = (
                        f"Rating of {val:.1f} in {disp_name} is below the training sample benchmark ({mean:.2f}), "
                        f"contributing negatively ({contrib:.2f} log-odds) toward association with the high salary-hike class."
                    )
                else:
                    direction = "neutral"
                    obs = (
                        f"Rating of {val:.1f} in {disp_name} is close to the sample benchmark ({mean:.2f}), "
                        f"with minimal directional impact ({contrib:.2f} log-odds)."
                    )

                evidence_list.append({
                    "feature": col,
                    "display_name": disp_name,
                    "value": round(val, 2),
                    "training_mean": round(mean, 2),
                    "coefficient": round(coef, 4),
                    "log_odds_contribution": round(contrib, 4),
                    "impact_direction": direction,
                    "importance_rank": rank,
                    "observation": obs,
                })
            return evidence_list

    # Fallback for non-linear models (e.g. Random Forest)
    clf = pipeline.named_steps.get("clf", pipeline)
    importances = getattr(clf, "feature_importances_", [0.2] * len(RAW_FEATURE_COLS))
    indices = np.argsort(importances)[::-1]

    for rank, idx in enumerate(indices, start=1):
        col = RAW_FEATURE_COLS[idx]
        disp_name = FEATURE_DISPLAY_NAMES.get(col, col)
        val = float(input_df[col].iloc[0])
        imp = float(importances[idx])

        evidence_list.append({
            "feature": col,
            "display_name": disp_name,
            "value": round(val, 2),
            "training_mean": 4.0,
            "coefficient": None,
            "log_odds_contribution": 0.0,
            "impact_direction": "positive" if val >= 4.0 else "negative",
            "importance_rank": rank,
            "observation": (
                f"Feature importance for {disp_name} is {imp:.3f} (rank {rank}). "
                f"Rating {val:.1f} informs the model's tree partition structure."
            ),
        })

    return evidence_list


def predict_career_success(
    pipeline: Pipeline,
    raw_input: Dict[str, float],
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Perform inference and generate deterministic observational explanation.
    Strictly observational wording only.
    """
    input_df = normalize_input_features(raw_input)
    pred_class = int(pipeline.predict(input_df)[0])
    probs = pipeline.predict_proba(input_df)[0]
    prob_low = float(probs[0])
    prob_high = float(probs[1])

    pred_label = "high" if pred_class == 1 else "low"
    prob_target_pct = round(prob_high * 100, 1)

    evidence = compute_deterministic_evidence(pipeline, input_df, metadata)

    model_name = (
        metadata.get("selected_model_name", "Supervised Classifier")
        if metadata
        else "Supervised Classifier"
    )

    # Observational interpretation adhering strictly to constraints
    interpretation = (
        f"Based on empirical patterns in the JDS Skill Traits dataset, the model associates this skill profile "
        f"with the {pred_label} salary-hike class (estimated probability: {prob_target_pct}%)."
    )

    caveats = (
        "Observational association only. The model reflects correlations within the supplied JDS Skill Traits "
        "sample (n=139) and does not establish causal relationships. High skill ratings are statistically correlated "
        "with higher salary-hike frequency in this sample, but do not guarantee promotion or compensation increases."
    )

    return {
        "predicted_class": pred_class,
        "predicted_label": pred_label,
        "probability_high": round(prob_high, 4),
        "probability_low": round(prob_low, 4),
        "model": model_name,
        "evidence": evidence,
        "interpretation": interpretation,
        "caveats": caveats,
    }
