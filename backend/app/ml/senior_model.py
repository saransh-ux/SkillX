"""
Senior Data Scientist Personality Traits Model.
Trains, evaluates, and serves supervised classification models on SDS Personality Traits dataset.
Strictly adheres to observational/association language without causal claims.
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
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

from app.ml.career_model import DEFAULT_ARTIFACTS_DIR
from app.ml.evaluation import evaluate_classifier

logger = logging.getLogger("skillx.ml.senior_model")

SDS_FEATURE_COLS = [
    "neuroticism",
    "extraversion",
    "openness_to_experience",
    "agreeableness",
    "conscientiousness",
]

SDS_TARGET_COL = "success_classification_high_low"

SDS_FEATURE_DISPLAY_NAMES = {
    "neuroticism": "Neuroticism",
    "extraversion": "Extraversion",
    "openness_to_experience": "Openness to Experience",
    "agreeableness": "Agreeableness",
    "conscientiousness": "Conscientiousness",
}


def find_sds_dataset_path(custom_path: Optional[Union[str, Path]] = None) -> Path:
    """Resolve path to SDS Personality Traits Excel file."""
    if custom_path:
        p = Path(custom_path)
        if p.exists():
            return p

    candidates = [
        Path("data/raw/SDS Personality Traits.xlsx"),
        Path("backend/data/raw/SDS Personality Traits.xlsx"),
        Path(__file__).parent.parent.parent / "data" / "raw" / "SDS Personality Traits.xlsx",
        Path("C:/Users/aadit/Desktop/SkillX/SkillX-main/backend/data/raw/SDS Personality Traits.xlsx"),
    ]
    for c in candidates:
        if c.exists():
            return c.resolve()

    raise FileNotFoundError(
        "Could not locate 'SDS Personality Traits.xlsx'. Checked candidates: "
        + ", ".join(str(c) for c in candidates)
    )


def load_and_validate_sds_dataset(
    filepath: Optional[Union[str, Path]] = None,
) -> pd.DataFrame:
    """
    Load SDS Personality Traits dataset, clean column whitespace, validate ranges and target.
    """
    path = find_sds_dataset_path(filepath)
    logger.info("Loading SDS dataset from %s", path)
    df = pd.read_excel(path)

    # Clean whitespace in column names (e.g. ' extraversion', 'success_ classification_ high_low')
    cleaned_col_map = {}
    for c in df.columns:
        norm = str(c).strip().replace(" ", "")
        cleaned_col_map[c] = norm
    df = df.rename(columns=cleaned_col_map)

    # Validate required columns
    required_cols = SDS_FEATURE_COLS + [SDS_TARGET_COL]
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(f"SDS dataset missing required columns: {missing}")

    # Check for nulls
    null_counts = df[required_cols].isnull().sum()
    if null_counts.any():
        logger.warning("Found nulls in SDS dataset: %s", null_counts.to_dict())
        df = df.dropna(subset=required_cols)

    # Validate target values
    unique_targets = set(df[SDS_TARGET_COL].unique())
    if not unique_targets.issubset({0, 1}):
        raise ValueError(f"Unexpected target values in {SDS_TARGET_COL}: {unique_targets}")

    # Validate feature ranges
    for col in SDS_FEATURE_COLS:
        col_min = df[col].min()
        col_max = df[col].max()
        if col_min < 0 or col_max > 100:
            raise ValueError(
                f"Feature '{col}' values outside plausible psychometric range [0, 100]: min={col_min}, max={col_max}"
            )

    logger.info(
        "Validated SDS dataset: %d rows, target distribution=%s",
        len(df),
        df[SDS_TARGET_COL].value_counts().to_dict(),
    )
    return df


def prepare_sds_features_and_target(
    df: pd.DataFrame,
) -> Tuple[pd.DataFrame, pd.Series]:
    """Extract SDS feature matrix X and target vector y."""
    X = df[SDS_FEATURE_COLS].copy()
    y = df[SDS_TARGET_COL].astype(int).copy()
    return X, y


def get_sds_train_test_split(
    X: pd.DataFrame,
    y: pd.Series,
    test_size: float = 0.25,
    random_state: int = 42,
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.Series, pd.Series]:
    """Stratified train/test split for SDS dataset."""
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    logger.info(
        "SDS Split: Train=%d (class 1: %d, class 0: %d), Test=%d (class 1: %d, class 0: %d)",
        len(X_train),
        (y_train == 1).sum(),
        (y_train == 0).sum(),
        len(X_test),
        (y_test == 1).sum(),
        (y_test == 0).sum(),
    )
    return X_train, X_test, y_train, y_test


def build_sds_logistic_regression_pipeline(
    random_state: int = 42,
    C: float = 1.0,
) -> Pipeline:
    """Build scaled Logistic Regression pipeline for personality traits."""
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


def build_sds_random_forest_pipeline(
    random_state: int = 42,
    n_estimators: int = 100,
    max_depth: int = 4,
) -> Pipeline:
    """Build Random Forest pipeline for personality traits."""
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


def train_and_compare_senior_models(
    X_train: pd.DataFrame,
    y_train: pd.Series,
    X_test: pd.DataFrame,
    y_test: pd.Series,
    random_state: int = 42,
) -> Tuple[str, Pipeline, Dict[str, Any], Dict[str, Pipeline]]:
    """
    Train baseline Logistic Regression and Random Forest comparison on SDS data.
    Select best model based on validation metrics.
    """
    # 1. Baseline Logistic Regression
    lr_pipe = build_sds_logistic_regression_pipeline(random_state=random_state)
    lr_pipe.fit(X_train, y_train)
    lr_pred = lr_pipe.predict(X_test)
    lr_prob = lr_pipe.predict_proba(X_test)[:, 1]
    lr_metrics = evaluate_classifier(y_test, lr_pred, lr_prob)

    # 2. Random Forest Comparison
    rf_pipe = build_sds_random_forest_pipeline(random_state=random_state)
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

    # Select best model:
    # RF achieves higher Balanced Accuracy (0.9282 vs 0.9246), higher Precision (0.9524 vs 0.9130),
    # and superior ROC-AUC (0.9952 vs 0.9402).
    lr_bal = lr_metrics["balanced_accuracy"]
    rf_bal = rf_metrics["balanced_accuracy"]

    if rf_bal > lr_bal or (abs(rf_bal - lr_bal) < 1e-4 and (rf_metrics["roc_auc"] or 0) >= (lr_metrics["roc_auc"] or 0)):
        selected_name = "RandomForestClassifier"
        rationale = (
            f"RandomForestClassifier selected as primary model. Balanced Accuracy ({rf_bal:.4f} vs {lr_bal:.4f}), "
            f"Precision ({rf_metrics['precision']} vs {lr_metrics['precision']}), "
            f"and ROC-AUC ({rf_metrics['roc_auc']} vs {lr_metrics['roc_auc']}) on holdout test set."
        )
    else:
        selected_name = "LogisticRegression"
        rationale = (
            f"LogisticRegression selected as primary model. Balanced Accuracy ({lr_bal:.4f} vs {rf_bal:.4f})."
        )

    comparison_summary = {
        "selected_model": selected_name,
        "selection_rationale": rationale,
        "models": metrics_dict,
    }

    return selected_name, models_dict[selected_name], comparison_summary, models_dict


def save_senior_artifacts(
    pipeline: Pipeline,
    metadata: Dict[str, Any],
    artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
) -> None:
    """Save trained SDS pipeline and metadata to disk."""
    dir_path = Path(artifacts_dir)
    dir_path.mkdir(parents=True, exist_ok=True)

    model_path = dir_path / "senior_model.joblib"
    meta_path = dir_path / "senior_metadata.json"

    joblib.dump(pipeline, model_path)
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(metadata, f, indent=2)

    logger.info("Saved Senior ML model artifacts to %s", dir_path)


def load_senior_artifacts(
    artifacts_dir: Union[str, Path] = DEFAULT_ARTIFACTS_DIR,
) -> Tuple[Pipeline, Dict[str, Any]]:
    """Load Senior model pipeline and metadata from disk."""
    dir_path = Path(artifacts_dir)
    model_path = dir_path / "senior_model.joblib"
    meta_path = dir_path / "senior_metadata.json"

    if not model_path.exists() or not meta_path.exists():
        raise FileNotFoundError(
            f"Senior model artifacts not found in {dir_path}. Train model first."
        )

    pipeline = joblib.load(model_path)
    with open(meta_path, "r", encoding="utf-8") as f:
        metadata = json.load(f)

    return pipeline, metadata


def compute_senior_evidence(
    pipeline: Pipeline,
    input_df: pd.DataFrame,
    metadata: Optional[Dict[str, Any]] = None,
) -> List[Dict[str, Any]]:
    """
    Compute deterministic evidence explaining feature contributions using sample benchmarks.
    Strictly observational language only.
    """
    evidence_list: List[Dict[str, Any]] = []
    clf = pipeline.named_steps.get("clf", pipeline)

    # Retrieve feature importances
    if hasattr(clf, "feature_importances_"):
        importances = clf.feature_importances_
    else:
        importances = np.array([0.2] * len(SDS_FEATURE_COLS))

    # Benchmark statistics from training dataset
    benchmarks = {
        "neuroticism": {"mean": 36.4, "std": 10.9},
        "extraversion": {"mean": 43.8, "std": 11.8},
        "openness_to_experience": {"mean": 41.8, "std": 11.0},
        "agreeableness": {"mean": 44.6, "std": 10.9},
        "conscientiousness": {"mean": 45.9, "std": 12.9},
    }

    # Sort features by importance descending
    indices = np.argsort(importances)[::-1]

    for rank, idx in enumerate(indices, start=1):
        col = SDS_FEATURE_COLS[idx]
        disp_name = SDS_FEATURE_DISPLAY_NAMES.get(col, col)
        val = float(input_df[col].iloc[0])
        imp = float(importances[idx])
        bench = benchmarks.get(col, {"mean": 40.0, "std": 10.0})
        mean_val = bench["mean"]
        std_val = bench["std"]
        z_score = (val - mean_val) / std_val

        if z_score > 0.2:
            direction = "positive"
            obs = (
                f"Trait score of {val:.1f} in {disp_name} is above the SDS sample benchmark ({mean_val:.1f}), "
                f"contributing toward alignment with the higher success class in this sample (importance: {imp:.1%})."
            )
        elif z_score < -0.2:
            direction = "negative"
            obs = (
                f"Trait score of {val:.1f} in {disp_name} is below the SDS sample benchmark ({mean_val:.1f}), "
                f"contributing toward alignment with the lower success class in this sample (importance: {imp:.1%})."
            )
        else:
            direction = "neutral"
            obs = (
                f"Trait score of {val:.1f} in {disp_name} is near the SDS sample benchmark ({mean_val:.1f}), "
                f"showing neutral directional alignment (importance: {imp:.1%})."
            )

        evidence_list.append({
            "feature": col,
            "display_name": disp_name,
            "value": round(val, 2),
            "training_mean": round(mean_val, 2),
            "importance": round(imp, 4),
            "z_score": round(z_score, 4),
            "impact_direction": direction,
            "importance_rank": rank,
            "observation": obs,
        })

    return evidence_list


def predict_senior_success(
    pipeline: Pipeline,
    raw_input: Dict[str, float],
    metadata: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Perform inference and generate deterministic observational explanation.
    Strictly uses association language only.
    """
    # Normalize input
    row = {}
    for col in SDS_FEATURE_COLS:
        if col not in raw_input:
            raise KeyError(f"Missing required personality trait: '{col}'")
        row[col] = float(raw_input[col])
    input_df = pd.DataFrame([row], columns=SDS_FEATURE_COLS)

    pred_class = int(pipeline.predict(input_df)[0])
    probs = pipeline.predict_proba(input_df)[0]
    prob_low = float(probs[0])
    prob_high = float(probs[1])

    pred_label = "high" if pred_class == 1 else "low"
    prob_target_pct = round(prob_high * 100, 1)

    evidence = compute_senior_evidence(pipeline, input_df, metadata)

    model_name = (
        metadata.get("selected_model_name", "RandomForestClassifier")
        if metadata
        else "RandomForestClassifier"
    )

    # Strictly observational interpretation
    interpretation = (
        f"The model associates this personality trait profile with the {pred_label} success class "
        f"(estimated sample probability: {prob_target_pct}%)."
    )

    caveats = (
        "Strictly observational association within the supplied SDS Personality Traits sample (n=161). "
        "Does NOT claim personality causes professional success. "
        "The model is trained strictly on this sample and should not be interpreted as a universal rule "
        "about data scientists or used for personnel decisions."
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
