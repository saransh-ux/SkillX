"""
Tests for SKILL//X Grounded Analytics Copilot interface.
Validates deterministic intent routing across all hackathon datasets and ML models.
Verifies refusal of ungrounded questions and absence of fabricated statistics.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.copilot_service import CopilotService

client = TestClient(app)


def test_copilot_top_demanded_skills():
    """Verify routing and answer for 'What skills are most demanded?'"""
    resp = client.post("/api/copilot", json={"question": "What skills are most demanded?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Analytics Jobs.csv" in data["answer"]
    assert len(data["evidence"]) >= 3
    for ev in data["evidence"]:
        assert ev["source"] == "Analytics Jobs.csv"
        assert ev["sample_size"] > 10000
    assert len(data["caveats"]) > 0


def test_copilot_role_skills():
    """Verify routing and answer for 'What skills are common for Data Scientist?'"""
    resp = client.post("/api/copilot", json={"question": "What skills are common for Data Scientist?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Data Scientist" in data["answer"]
    assert "Python" in data["answer"] or "Machine Learning" in data["answer"]
    assert len(data["evidence"]) >= 3
    assert data["evidence"][0]["source"] == "Analytics Jobs.csv"


def test_copilot_role_from_context():
    """Verify contextual role injection."""
    resp = client.post(
        "/api/copilot",
        json={
            "question": "What skills are needed?",
            "context": {"role": "Business Analyst"},
        },
    )
    assert resp.status_code == 200
    data = resp.json()

    assert "Business Analyst" in data["answer"]


def test_copilot_skill_genome_cooccurrence():
    """Verify routing for 'What skills occur together?'"""
    resp = client.post("/api/copilot", json={"question": "What skills occur together?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Jaccard" in data["answer"] or "co-occur" in data["answer"]
    assert len(data["evidence"]) >= 1
    assert "Skill Genome" in data["evidence"][0]["source"]


def test_copilot_focal_skill_cooccurrence():
    """Verify routing for 'What skills are paired with Python?'"""
    resp = client.post("/api/copilot", json={"question": "What skills are paired with Python?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Python" in data["answer"]
    assert len(data["evidence"]) >= 1


def test_copilot_jds_career_model():
    """Verify routing for 'What does the career success model say?' and 'Which skills matter most in the JDS model?'"""
    resp = client.post("/api/copilot", json={"question": "What does the career success model say?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "LogisticRegression" in data["answer"]
    assert "Mathematics & Statistics" in data["answer"]
    assert "JDS Skill Traits.xlsx" in data["evidence"][0]["source"]
    assert data["evidence"][0]["sample_size"] == 139

    # Test alternative phrasing
    resp2 = client.post("/api/copilot", json={"question": "Which skills matter most in the JDS model?"})
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "Mathematics & Statistics" in data2["answer"]


def test_copilot_sds_senior_model():
    """Verify routing for 'What does the senior success model say?'"""
    resp = client.post("/api/copilot", json={"question": "What does the senior success model say?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "RandomForest" in data["answer"]
    assert "Conscientiousness" in data["answer"]
    assert "SDS Personality Traits.xlsx" in data["evidence"][0]["source"]
    assert data["evidence"][0]["sample_size"] == 161


def test_copilot_location_skills():
    """Verify routing for 'What skills are common in Bengaluru?'"""
    resp = client.post("/api/copilot", json={"question": "What skills are common in Bengaluru?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Bengaluru" in data["answer"]
    assert len(data["evidence"]) >= 2


def test_copilot_career_scan():
    """Verify routing for 'Give me a career scan for Data Scientist.'"""
    resp = client.post("/api/copilot", json={"question": "Give me a career scan for Data Scientist."})
    assert resp.status_code == 200
    data = resp.json()

    assert "Career Scan Summary" in data["answer"]
    assert "Market Demand" in data["answer"]
    assert "Career Success Model" in data["answer"]
    assert "Senior Leadership Model" in data["answer"]


def test_copilot_company_hiring():
    """Verify routing for 'What companies are hiring data scientists?'"""
    resp = client.post("/api/copilot", json={"question": "What companies are hiring data scientists?"})
    assert resp.status_code == 200
    data = resp.json()

    assert "Data Science Jobs.csv" in data["answer"]
    assert len(data["evidence"]) >= 2
    assert data["evidence"][0]["source"] == "Data Science Jobs.csv"
    assert data["evidence"][0]["sample_size"] == 1602


def test_copilot_rejection_of_unsupported_temporal_forecast():
    """Verify strict refusal when asked for 2027 future forecasts."""
    resp = client.post("/api/copilot", json={"question": "What is the skill forecast for 2027?"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["answer"] == "I don't have enough evidence in the supplied hackathon data to answer that."
    assert len(data["evidence"]) == 0
    assert any("longitudinal" in c.lower() or "future forecast" in c.lower() for c in data["caveats"])


def test_copilot_rejection_of_generic_unsupported_query():
    """Verify strict refusal when asked questions outside hackathon domain."""
    resp = client.post("/api/copilot", json={"question": "What is the capital of France?"})
    assert resp.status_code == 200
    data = resp.json()

    assert data["answer"] == "I don't have enough evidence in the supplied hackathon data to answer that."
    assert len(data["evidence"]) == 0
