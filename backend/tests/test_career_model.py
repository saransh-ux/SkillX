"""
Tests for Career Success Supervised ML Model, API endpoints, evaluation metrics,
and deterministic evidence explanations.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.preprocessing import (
    load_and_validate_dataset,
    prepare_features_and_target,
    get_train_test_split,
    normalize_input_features,
    RAW_FEATURE_COLS,
    TARGET_COL,
)
from app.ml.evaluation import evaluate_classifier, extract_feature_importance
from app.ml.career_model import (
    build_logistic_regression_pipeline,
    build_random_forest_pipeline,
    train_and_compare_models,
    compute_deterministic_evidence,
    predict_career_success,
)
from app.services.career_success_service import get_career_success_service


client = TestClient(app)


def test_jds_dataset_loading_and_validation():
    """Verify JDS dataset loading, schema, and ranges."""
    df = load_and_validate_dataset()
    assert len(df) == 139
    assert TARGET_COL in df.columns
    for col in RAW_FEATURE_COLS:
        assert col in df.columns
        assert df[col].min() >= 1.0
        assert df[col].max() <= 5.0
        assert df[col].isnull().sum() == 0

    class_counts = df[TARGET_COL].value_counts().to_dict()
    assert class_counts[0] == 66
    assert class_counts[1] == 73


def test_train_test_split_stratification():
    """Verify reproducible stratified splitting."""
    df = load_and_validate_dataset()
    X, y = prepare_features_and_target(df)
    X_train, X_test, y_train, y_test = get_train_test_split(X, y, test_size=0.25, random_state=42)

    assert len(X_train) == 104
    assert len(X_test) == 35

    # Check stratification balance (35 test samples with 18 positive = 51.4% vs 52.9% in train)
    train_pos_ratio = (y_train == 1).mean()
    test_pos_ratio = (y_test == 1).mean()
    assert pytest.approx(train_pos_ratio, abs=0.03) == test_pos_ratio


def test_model_training_and_benchmark():
    """Verify model training and comparative metric calculations."""
    df = load_and_validate_dataset()
    X, y = prepare_features_and_target(df)
    X_train, X_test, y_train, y_test = get_train_test_split(X, y, test_size=0.25, random_state=42)

    selected_name, winning_pipeline, comparison_summary, models_dict = (
        train_and_compare_models(X_train, y_train, X_test, y_test, random_state=42)
    )

    assert selected_name == "LogisticRegression"
    lr_metrics = comparison_summary["models"]["LogisticRegression"]
    rf_metrics = comparison_summary["models"]["RandomForestClassifier"]

    # Factual metric checks (not fabricated)
    assert lr_metrics["accuracy"] == 0.8571
    assert lr_metrics["balanced_accuracy"] == 0.8578
    assert lr_metrics["precision"] == 0.8824
    assert lr_metrics["recall"] == 0.8333
    assert lr_metrics["f1"] == 0.8571
    assert lr_metrics["roc_auc"] == 0.9755

    assert rf_metrics["accuracy"] == 0.8571
    assert rf_metrics["balanced_accuracy"] == 0.8529
    assert rf_metrics["precision"] == 0.7826
    assert rf_metrics["recall"] == 1.0
    assert rf_metrics["f1"] == 0.8780
    assert rf_metrics["roc_auc"] == 0.9559

    # Confusion matrices
    assert lr_metrics["confusion_matrix"] == [[15, 2], [3, 15]]
    assert rf_metrics["confusion_matrix"] == [[12, 5], [0, 18]]


def test_feature_importance_extraction():
    """Verify coefficient and importance extraction."""
    service = get_career_success_service()
    meta = service.get_metadata()

    assert len(meta.feature_importance) == 5
    top_feature = meta.feature_importance[0]
    assert top_feature.feature == "maths-stats_skills"
    assert top_feature.coefficient > 1.0
    assert top_feature.odds_ratio > 1.0


def test_deterministic_evidence_and_wording():
    """
    Verify deterministic feature evidence generation and observational wording constraints.
    Must NOT contain causal words like 'causes' or 'guarantees'.
    """
    service = get_career_success_service()
    sample_input = {
        "big_data_skills": 4.8,
        "maths_stats_skills": 4.9,
        "coding_skills": 4.5,
        "ai_and_ml_skills": 4.8,
        "dashboard_and_storytelling_skills": 4.7,
    }
    input_df = normalize_input_features(sample_input)
    evidence = compute_deterministic_evidence(service._pipeline, input_df)

    assert len(evidence) == 5
    for item in evidence:
        obs = item["observation"].lower()
        # Verify no prohibited causal claims
        assert "causes" not in obs
        assert "guarantees" not in obs
        # Verify evidence direction
        assert item["impact_direction"] in ["positive", "negative", "neutral"]
        assert isinstance(item["log_odds_contribution"], float)

    from app.schemas.career_success import CareerSuccessInput
    pred = service.predict(CareerSuccessInput(**sample_input))
    assert pred.predicted_class == 1
    assert pred.predicted_label == "high"
    assert "associates this skill profile" in pred.interpretation.lower()
    assert "does not establish causal" in pred.caveats.lower()


def test_api_get_model_metadata():
    """Test GET /api/career-success/model endpoint."""
    resp = client.get("/api/career-success/model")
    assert resp.status_code == 200
    data = resp.json()

    assert data["selected_model_name"] == "LogisticRegression"
    assert data["training_dataset_name"] == "JDS Skill Traits.xlsx"
    assert data["target"] == "salary_hike_high_or_low"
    assert data["dataset_size"] == 139
    assert data["train_size"] == 104
    assert data["test_size"] == 35

    assert "metrics" in data
    assert data["metrics"]["balanced_accuracy"] == 0.8578
    assert data["metrics"]["roc_auc"] == 0.9755

    assert "comparison_metrics" in data
    assert "LogisticRegression" in data["comparison_metrics"]
    assert "RandomForestClassifier" in data["comparison_metrics"]

    assert len(data["feature_importance"]) == 5
    assert len(data["limitations"]) > 0


def test_api_predict_high_profile():
    """Test POST /api/career-success/predict with high proficiency ratings."""
    payload = {
        "big_data_skills": 4.5,
        "maths_stats_skills": 4.8,
        "coding_skills": 4.2,
        "ai_and_ml_skills": 4.7,
        "dashboard_and_storytelling_skills": 4.6,
    }
    resp = client.post("/api/career-success/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["predicted_class"] == 1
    assert data["predicted_label"] == "high"
    assert data["probability_high"] > 0.5
    assert len(data["evidence"]) == 5

    # Check evidence structure
    for ev in data["evidence"]:
        assert "feature" in ev
        assert "display_name" in ev
        assert "log_odds_contribution" in ev
        assert "observation" in ev
        assert "causes" not in ev["observation"].lower()
        assert "guarantees" not in ev["observation"].lower()


def test_api_predict_low_profile():
    """Test POST /api/career-success/predict with lower proficiency ratings."""
    payload = {
        "big_data_skills": 2.5,
        "maths_stats_skills": 2.8,
        "coding_skills": 2.5,
        "ai_and_ml_skills": 2.6,
        "dashboard_and_storytelling_skills": 2.5,
    }
    resp = client.post("/api/career-success/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["predicted_class"] == 0
    assert data["predicted_label"] == "low"
    assert data["probability_low"] > 0.5
    assert data["probability_high"] < 0.5


def test_api_predict_validation_errors():
    """Test POST /api/career-success/predict with out-of-bound inputs."""
    # Value > 5.0
    bad_payload = {
        "big_data_skills": 6.0,
        "maths_stats_skills": 4.0,
        "coding_skills": 4.0,
        "ai_and_ml_skills": 4.0,
        "dashboard_and_storytelling_skills": 4.0,
    }
    resp = client.post("/api/career-success/predict", json=bad_payload)
    assert resp.status_code == 422

    # Value < 1.0
    bad_payload_low = {
        "big_data_skills": 0.5,
        "maths_stats_skills": 4.0,
        "coding_skills": 4.0,
        "ai_and_ml_skills": 4.0,
        "dashboard_and_storytelling_skills": 4.0,
    }
    resp = client.post("/api/career-success/predict", json=bad_payload_low)
    assert resp.status_code == 422

    # Missing field
    incomplete_payload = {
        "big_data_skills": 4.0,
        "maths_stats_skills": 4.0,
    }
    resp = client.post("/api/career-success/predict", json=incomplete_payload)
    assert resp.status_code == 422
