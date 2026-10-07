"""
Comprehensive tests for Role Market Structure intelligence.
Validates factual role profiles, skills, experience, salary, and location distributions from Analytics Jobs.csv.
Ensures NO fabricated 2023-2026 timelines or fake growth percentages are served.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.role_service import RoleService

client = TestClient(app)


@pytest.fixture(scope="module")
def role_service():
    """Provides initialized RoleService singleton."""
    return RoleService


# ---------------------------------------------------------------------------
# 1. Role Service Unit & Aggregation Tests
# ---------------------------------------------------------------------------

def test_get_roles_factual_counts(role_service):
    """Verify get_roles returns actual designation counts from Analytics Jobs.csv."""
    roles_resp = role_service.get_roles(limit=20)

    assert roles_resp.sample_size > 15000
    assert len(roles_resp.data) == 20

    # Business Analyst and Data Scientist must be among top designations
    designations = [r.designation for r in roles_resp.data]
    assert "Business Analyst" in designations or "Data Scientist" in designations

    for idx, role in enumerate(roles_resp.data, start=1):
        assert role.rank == idx
        assert role.posting_count > 0
        assert role.prevalence > 0.0
        assert len(role.top_skills) > 0


def test_get_roles_search_filter(role_service):
    """Verify search filtering by designation keyword."""
    roles_resp = role_service.get_roles(search="analyst", limit=10)
    assert len(roles_resp.data) > 0
    for r in roles_resp.data:
        assert "analyst" in r.designation.lower()


def test_get_role_detail_factual_profile(role_service):
    """Verify factual role market structure profile for Data Scientist."""
    detail = role_service.get_role_detail("Data Scientist")
    assert detail is not None
    assert detail.posting_count > 0
    assert detail.sample_size > 15000

    # Top skills must reflect empirical machine learning / python / R dominance
    skill_names = [s.display_name for s in detail.top_skills]
    assert "Python" in skill_names or "Machine Learning" in skill_names

    # Experience distribution
    assert detail.experience_distribution.dominant_range is not None
    assert len(detail.experience_distribution.breakdown) > 0
    for exp_item in detail.experience_distribution.breakdown:
        assert exp_item.count > 0
        assert exp_item.percentage > 0.0

    # Salary summary
    assert detail.salary_summary is not None
    assert len(detail.salary_summary.brackets) > 0
    bracket_labels = [b.bracket for b in detail.salary_summary.brackets]
    assert any("Lakhs" in b for b in bracket_labels)

    # Location distribution
    assert len(detail.location_summary) > 0
    locations = [loc.category for loc in detail.location_summary]
    assert "Bengaluru" in locations or "Mumbai" in locations

    # Data caveats must be explicit
    assert len(detail.data_caveats) >= 3
    caveat_text = " ".join(detail.data_caveats).lower()
    assert "cross-sectional" in caveat_text or "timestamps" in caveat_text


def test_get_role_skills(role_service):
    """Verify top skills endpoint for a designation."""
    skills_resp = role_service.get_role_skills("Business Analyst", limit=10)
    assert skills_resp is not None
    assert skills_resp.posting_count > 0
    assert len(skills_resp.skills) <= 10

    for s in skills_resp.skills:
        assert s.posting_count > 0
        assert 0.0 <= s.prevalence <= 1.0
        assert s.prevalence_pct == round(s.prevalence * 100.0, 2)


def test_no_fabricated_temporal_timelines(role_service):
    """Ensure NO fabricated 2023, 2024, 2025, 2026 timeline arrays are returned."""
    detail = role_service.get_role_detail("Data Scientist")
    detail_dict = detail.model_dump()

    # Verify no temporal fake fields exist
    assert "historical_years" not in detail_dict
    assert "timeline" not in detail_dict
    assert "year_2023" not in detail_dict
    assert "year_2026" not in detail_dict

    # Check backward compatibility method
    evo = role_service.get_role_evolution(role_name="Data Scientist")
    evo_dict = evo.model_dump()
    assert "historical_years" not in evo_dict
    assert evo.is_real_data is True


# ---------------------------------------------------------------------------
# 2. HTTP API Endpoint Tests
# ---------------------------------------------------------------------------

def test_api_get_roles():
    """Verify GET /api/roles returns designation counts."""
    response = client.get("/api/roles?limit=15")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert len(data["data"]) == 15
    assert data["sample_size"] > 15000

    first_role = data["data"][0]
    assert "designation" in first_role
    assert "posting_count" in first_role
    assert "top_skills" in first_role


def test_api_get_roles_search():
    """Verify GET /api/roles with search query."""
    response = client.get("/api/roles?search=engineer")
    assert response.status_code == 200
    data = response.json()
    for item in data["data"]:
        assert "engineer" in item["designation"].lower()


def test_api_get_role_detail():
    """Verify GET /api/roles/{role_name} returns full factual market structure."""
    response = client.get("/api/roles/Data%20Scientist")
    assert response.status_code == 200
    data = response.json()

    assert data["role_name"] == "Data Scientist"
    assert data["posting_count"] > 0
    assert "top_skills" in data
    assert "experience_distribution" in data
    assert "salary_summary" in data
    assert "location_summary" in data
    assert "job_type_distribution" in data
    assert "data_caveats" in data


def test_api_get_role_skills():
    """Verify GET /api/roles/{role_name}/skills."""
    response = client.get("/api/roles/Data%20Scientist/skills?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "skills" in data
    assert len(data["skills"]) == 5
    assert data["posting_count"] > 0

    first_skill = data["skills"][0]
    assert "skill_id" in first_skill
    assert "display_name" in first_skill
    assert "posting_count" in first_skill
    assert "prevalence" in first_skill


def test_api_get_role_detail_not_found():
    """Verify 404 on non-existent role."""
    response = client.get("/api/roles/completely_unknown_role_title_xyz")
    assert response.status_code == 404
