"""
Tests for SKILL//X Career Scan multi-layer intelligence engine.
Validates combination of Market Demand, Junior Success (JDS), and Senior Success (SDS).
Verifies deterministic rules, evidence requirements, and absence of temporal forecasting.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.career_scan import CareerScanInput
from app.services.career_scan_service import CareerScanService

client = TestClient(app)


def test_career_scan_full_pipeline():
    """Verify Career Scan integration across all three empirical evidence layers."""
    payload = {
        "target_role": "Data Scientist",
        "location": "Bengaluru",
        "skill_profile": {
            "big_data_skills": 4.5,
            "maths_stats_skills": 4.8,
            "coding_skills": 4.2,
            "ai_and_ml_skills": 4.7,
            "dashboard_and_storytelling_skills": 4.6,
        },
        "personality_profile": {
            "neuroticism": 28.0,
            "extraversion": 52.0,
            "openness_to_experience": 56.0,
            "agreeableness": 48.0,
            "conscientiousness": 60.0,
        },
    }
    resp = client.post("/api/career-scan", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    # 1. Market Evidence Layer
    assert "market_evidence" in data
    assert len(data["market_evidence"]) >= 2
    dimensions = [item["dimension"] for item in data["market_evidence"]]
    assert "role_demand" in dimensions
    assert "skill_demand" in dimensions
    for item in data["market_evidence"]:
        assert item["sample_size"] > 0
        assert item["dataset"] == "Analytics Jobs.csv"
        assert len(item["summary"]) > 0

    # 2. Junior Career Success Layer (JDS Model)
    assert "career_model" in data
    career_m = data["career_model"]
    assert career_m["predicted_class"] == 1
    assert career_m["predicted_label"] == "high"
    assert career_m["probability_high"] > 0.5
    assert len(career_m["evidence"]) == 5

    # 3. Senior Success Layer (SDS Model)
    assert "senior_model" in data
    senior_m = data["senior_model"]
    assert senior_m["predicted_class"] == 1
    assert senior_m["predicted_label"] == "high"
    assert senior_m["probability_high"] > 0.5
    assert len(senior_m["evidence"]) == 5

    # 4. Priority Skills
    assert "priority_skills" in data
    assert len(data["priority_skills"]) > 0
    for ps in data["priority_skills"]:
        assert "skill_name" in ps
        assert "category" in ps
        assert "priority_tier" in ps
        assert "rationale" in ps
        assert ps["priority_tier"] in [
            "High Demand & High Leverage",
            "Core Baseline Requirement",
            "Specialized Differentiation",
        ]
        assert ps["market_prevalence_pct"] >= 0.0
        assert ps["model_weight"] > 0.0

    # 5. Recommendations (Evidence-driven)
    assert "recommendations" in data
    assert len(data["recommendations"]) >= 3
    for rec in data["recommendations"]:
        assert len(rec["title"]) > 0
        assert len(rec["actionable_guidance"]) > 0
        assert len(rec["evidence"]) > 0
        assert rec["source_dataset"] in [
            "Analytics Jobs.csv",
            "JDS Skill Traits.xlsx",
            "SDS Personality Traits.xlsx",
        ]
        assert rec["sample_size"] > 0
        assert len(rec["confidence"]) > 0
        assert len(rec["caveat"]) > 0

    # 6. Methodological Caveats
    assert "caveats" in data
    assert len(data["caveats"]) >= 3
    full_caveats_text = " ".join(data["caveats"]).lower()
    assert "no future forecast" in full_caveats_text
    assert "observational" in full_caveats_text


def test_career_scan_alternative_role_and_no_location():
    """Verify Career Scan works with different role queries and without location."""
    payload = {
        "target_role": "Business Analyst",
        "location": None,
        "skill_profile": {
            "big_data_skills": 2.5,
            "maths_stats_skills": 3.0,
            "coding_skills": 2.5,
            "ai_and_ml_skills": 2.2,
            "dashboard_and_storytelling_skills": 4.5,
        },
        "personality_profile": {
            "neuroticism": 45.0,
            "extraversion": 40.0,
            "openness_to_experience": 38.0,
            "agreeableness": 42.0,
            "conscientiousness": 40.0,
        },
    }
    resp = client.post("/api/career-scan", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    assert any("Business Analyst" in item["title"] for item in data["market_evidence"])
    assert data["career_model"]["predicted_class"] == 0
    assert data["career_model"]["predicted_label"] == "low"
    assert len(data["priority_skills"]) > 0


def test_career_scan_strictly_non_causal_language():
    """Verify that generated recommendations do not use causal words like 'causes' or 'guarantees'."""
    payload = {
        "target_role": "Data Scientist",
        "skill_profile": {
            "big_data_skills": 4.0,
            "maths_stats_skills": 4.5,
            "coding_skills": 4.0,
            "ai_and_ml_skills": 4.0,
            "dashboard_and_storytelling_skills": 4.0,
        },
        "personality_profile": {
            "neuroticism": 35.0,
            "extraversion": 45.0,
            "openness_to_experience": 45.0,
            "agreeableness": 45.0,
            "conscientiousness": 50.0,
        },
    }
    resp = client.post("/api/career-scan", json=payload)
    assert resp.status_code == 200
    data = resp.json()

    for rec in data["recommendations"]:
        guidance = rec["actionable_guidance"].lower()
        evidence = rec["evidence"].lower()
        assert "personality causes" not in guidance
        assert "coding causes salary growth" not in guidance
        assert "guarantees promotion" not in guidance
        assert "guarantees salary" not in evidence


def test_career_scan_validation_errors():
    """Verify input validation on skill ratings and personality scores."""
    # Out of range skill rating
    bad_skill_payload = {
        "target_role": "Data Scientist",
        "skill_profile": {
            "big_data_skills": 6.5,  # Invalid: > 5.0
            "maths_stats_skills": 4.0,
            "coding_skills": 4.0,
            "ai_and_ml_skills": 4.0,
            "dashboard_and_storytelling_skills": 4.0,
        },
        "personality_profile": {
            "neuroticism": 30.0,
            "extraversion": 45.0,
            "openness_to_experience": 45.0,
            "agreeableness": 45.0,
            "conscientiousness": 50.0,
        },
    }
    resp = client.post("/api/career-scan", json=bad_skill_payload)
    assert resp.status_code == 422

    # Out of range personality score
    bad_p_payload = {
        "target_role": "Data Scientist",
        "skill_profile": {
            "big_data_skills": 4.0,
            "maths_stats_skills": 4.0,
            "coding_skills": 4.0,
            "ai_and_ml_skills": 4.0,
            "dashboard_and_storytelling_skills": 4.0,
        },
        "personality_profile": {
            "neuroticism": 120.0,  # Invalid: > 100.0
            "extraversion": 45.0,
            "openness_to_experience": 45.0,
            "agreeableness": 45.0,
            "conscientiousness": 50.0,
        },
    }
    resp = client.post("/api/career-scan", json=bad_p_payload)
    assert resp.status_code == 422
