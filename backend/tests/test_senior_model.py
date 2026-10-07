"""
Tests for Senior Data Scientist Personality Traits ML Model,
API endpoints, holdout evaluation metrics, and deterministic observational evidence.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.ml.senior_model import (
    load_and_validate_sds_dataset,
    prepare_sds_features_and_target,
    get_sds_train_test_split,
    train_and_compare_senior_models,
    SDS_FEATURE_COLS,
    SDS_TARGET_COL,
)
from app.schemas.senior_success import SeniorSuccessInput
from app.services.senior_success_service import get_senior_success_service

client = TestClient(app)


def test_sds_dataset_loading_and_validation():
    """Verify SDS dataset loading, whitespace column normalization, and class balance."""
    df = load_and_validate_sds_dataset()
    assert len(df) == 161
    assert SDS_TARGET_COL in df.columns
    for col in SDS_FEATURE_COLS:
        assert col in df.columns
        assert df[col].isnull().sum() == 0
        assert df[col].min() >= 0
        assert df[col].max() <= 100

    counts = df[SDS_TARGET_COL].value_counts().to_dict()
    assert counts[0] == 76
    assert counts[1] == 85


def test_sds_train_test_split_stratification():
    """Verify reproducible stratified splitting for SDS."""
    df = load_and_validate_sds_dataset()
    X, y = prepare_sds_features_and_target(df)
    X_train, X_test, y_train, y_test = get_sds_train_test_split(X, y, test_size=0.25, random_state=42)

    assert len(X_train) == 120
    assert len(X_test) == 41

    train_pos_ratio = (y_train == 1).mean()
    test_pos_ratio = (y_test == 1).mean()
    # 63/120 = 52.5% vs 22/41 = 53.66%
    assert pytest.approx(train_pos_ratio, abs=0.03) == test_pos_ratio


def test_senior_model_training_and_benchmark():
    """Verify model training and factual benchmark metrics."""
    df = load_and_validate_sds_dataset()
    X, y = prepare_sds_features_and_target(df)
    X_train, X_test, y_train, y_test = get_sds_train_test_split(X, y, test_size=0.25, random_state=42)

    selected_name, winning_pipeline, comparison_summary, models_dict = (
        train_and_compare_senior_models(X_train, y_train, X_test, y_test, random_state=42)
    )

    assert selected_name == "RandomForestClassifier"
    rf_metrics = comparison_summary["models"]["RandomForestClassifier"]
    lr_metrics = comparison_summary["models"]["LogisticRegression"]

    # Factual empirical metrics check
    assert rf_metrics["accuracy"] == 0.9268
    assert rf_metrics["balanced_accuracy"] == 0.9282
    assert rf_metrics["precision"] == 0.9524
    assert rf_metrics["recall"] == 0.9091
    assert rf_metrics["f1"] == 0.9302
    assert rf_metrics["roc_auc"] == 0.9952

    assert lr_metrics["accuracy"] == 0.9268
    assert lr_metrics["balanced_accuracy"] == 0.9246
    assert lr_metrics["precision"] == 0.9130
    assert lr_metrics["recall"] == 0.9545
    assert lr_metrics["f1"] == 0.9333
    assert lr_metrics["roc_auc"] == 0.9402

    # Confusion matrices
    assert rf_metrics["confusion_matrix"] == [[18, 1], [2, 20]]
    assert lr_metrics["confusion_matrix"] == [[17, 2], [1, 21]]


def test_senior_feature_importance():
    """Verify personality trait importance ranking."""
    service = get_senior_success_service()
    meta = service.get_metadata()

    assert len(meta.feature_importance) == 5
    top_feature = meta.feature_importance[0]
    # Conscientiousness is top trait
    assert top_feature.feature == "conscientiousness"
    assert top_feature.importance > 0.30

    second_feature = meta.feature_importance[1]
    assert second_feature.feature == "openness_to_experience"
    assert second_feature.importance > 0.25


def test_senior_deterministic_evidence_and_wording():
    """
    Verify strictly observational wording:
    - NO causal claims (e.g. 'causes', 'guarantees')
    - Sample-specific limitation disclaimer present
    """
    service = get_senior_success_service()
    sample_input = SeniorSuccessInput(
        neuroticism=30.0,
        extraversion=50.0,
        openness_to_experience=55.0,
        agreeableness=48.0,
        conscientiousness=58.0,
    )
    pred = service.predict(sample_input)

    assert pred.predicted_class == 1
    assert pred.predicted_label == "high"
    assert pred.probability_high > 0.5

    # Check evidence wording
    for item in pred.evidence:
        obs = item.observation.lower()
        assert "causes" not in obs
        assert "guarantees" not in obs
        assert item.impact_direction in ["positive", "negative", "neutral"]

    # Check interpretation and caveats
    assert "associates this personality trait profile" in pred.interpretation.lower()
    assert "not claim personality causes" in pred.caveats.lower()
    assert "not be interpreted as a universal rule" in pred.caveats.lower()


def test_api_get_senior_model_metadata():
    """Test GET /api/senior-success/model endpoint."""
    resp = client.get("/api/senior-success/model")
    assert resp.status_code == 200
    data = resp.json()

    assert data["selected_model_name"] == "RandomForestClassifier"
    assert data["training_dataset_name"] == "SDS Personality Traits.xlsx"
    assert data["target"] == "success_classification_high_low"
    assert data["dataset_size"] == 161
    assert data["train_size"] == 120
    assert data["test_size"] == 41

    assert data["metrics"]["balanced_accuracy"] == 0.9282
    assert data["metrics"]["roc_auc"] == 0.9952

    assert "comparison_metrics" in data
    assert "LogisticRegression" in data["comparison_metrics"]
    assert "RandomForestClassifier" in data["comparison_metrics"]

    assert len(data["feature_importance"]) == 5
    assert len(data["limitations"]) > 0
    assert "dataset_information" in data


def test_api_predict_senior_high_profile():
    """Test POST /api/senior-success/predict with strong alignment profile."""
    payload = {
        "neuroticism": 28.0,
        "extraversion": 52.0,
        "openness_to_experience": 56.0,
        "agreeableness": 49.0,
        "conscientiousness": 60.0,
    }
    resp = client.post("/api/senior-success/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["predicted_class"] == 1
    assert data["predicted_label"] == "high"
    assert data["probability_high"] > 0.5
    assert len(data["evidence"]) == 5

    for ev in data["evidence"]:
        assert "causes" not in ev["observation"].lower()
        assert "guarantees" not in ev["observation"].lower()


def test_api_predict_senior_low_profile():
    """Test POST /api/senior-success/predict with low alignment profile."""
    payload = {
        "neuroticism": 55.0,
        "extraversion": 25.0,
        "openness_to_experience": 25.0,
        "agreeableness": 30.0,
        "conscientiousness": 25.0,
    }
    resp = client.post("/api/senior-success/predict", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert data["predicted_class"] == 0
    assert data["predicted_label"] == "low"
    assert data["probability_low"] > 0.5
    assert data["probability_high"] < 0.5


def test_api_predict_senior_validation_errors():
    """Test POST /api/senior-success/predict validation rules."""
    # Out of bounds value
    bad_payload = {
        "neuroticism": 150.0,
        "extraversion": 50.0,
        "openness_to_experience": 50.0,
        "agreeableness": 50.0,
        "conscientiousness": 50.0,
    }
    resp = client.post("/api/senior-success/predict", json=bad_payload)
    assert resp.status_code == 422

    # Negative value
    negative_payload = {
        "neuroticism": -5.0,
        "extraversion": 50.0,
        "openness_to_experience": 50.0,
        "agreeableness": 50.0,
        "conscientiousness": 50.0,
    }
    resp = client.post("/api/senior-success/predict", json=negative_payload)
    assert resp.status_code == 422

    # Incomplete payload
    incomplete_payload = {
        "neuroticism": 30.0,
        "extraversion": 50.0,
    }
    resp = client.post("/api/senior-success/predict", json=incomplete_payload)
    assert resp.status_code == 422
