"""
Comprehensive tests for Geographic Market Intelligence.
Validates location distributions, top skills per location, parsed salaries,
experience summaries, and the transparent industry compatibility layer.
Directly derived from Analytics Jobs.csv.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.market_service import MarketService
from app.services.industry_service import IndustryService

client = TestClient(app)


@pytest.fixture(scope="module")
def market_service():
    """Provides initialized MarketService singleton."""
    return MarketService.get_instance()


# ---------------------------------------------------------------------------
# 1. MarketService Geographic Market Methods
# ---------------------------------------------------------------------------

def test_get_geographic_markets_unit(market_service):
    """Verify get_geographic_markets returns empirical location hubs."""
    res = market_service.get_geographic_markets(limit=10)

    assert res.dimension == "LOCATION"
    assert res.sample_size > 15000
    assert len(res.data) <= 10

    city_names = [item.location for item in res.data]
    assert "Bengaluru" in city_names
    assert "Mumbai" in city_names

    for hub in res.data:
        assert hub.posting_count > 0
        assert hub.percentage_of_postings > 0.0
        assert len(hub.top_skills) > 0
        assert hub.salary_currency == "INR (Lakhs per annum)"
        # Average and median salary parsed from bracket midpoints
        if hub.average_salary is not None:
            assert hub.average_salary > 0.0
        if hub.median_salary is not None:
            assert hub.median_salary > 0.0
        assert hub.dominant_experience is not None

    # Check transparency metadata
    meta = res.metadata
    assert "Analytics Jobs.csv" in meta.dataset_name
    assert "industry" in meta.limitations.lower()


def test_get_geographic_market_detail_unit(market_service):
    """Verify get_geographic_market_detail for a specific hub (Bengaluru)."""
    detail = market_service.get_geographic_market_detail("Bengaluru")

    assert detail is not None
    assert detail.dimension == "LOCATION"
    assert detail.location == "Bengaluru"
    assert detail.posting_count > 3000
    assert detail.percentage_of_postings > 20.0
    assert detail.sample_size == market_service.total_eligible_postings

    # Top skills
    assert len(detail.top_skills) > 0
    top_skill_names = [s.canonical_name for s in detail.top_skills]
    assert "sql" in top_skill_names or "python" in top_skill_names or "analytics" in top_skill_names

    # Job designations
    assert len(detail.job_designations) > 0
    for desig in detail.job_designations:
        assert desig.count > 0
        assert desig.percentage > 0.0

    # Job types
    assert len(detail.job_types) > 0

    # Salary summary
    assert detail.salary_summary is not None
    assert len(detail.salary_summary.brackets) > 0

    # Experience summary
    assert detail.experience_summary is not None
    assert detail.experience_summary.dominant_range is not None

    # Data caveats must explicitly state lack of industry column
    caveats_str = " ".join(detail.data_caveats).lower()
    assert "industry" in caveats_str
    assert "cross-sectional" in caveats_str


def test_get_geographic_market_detail_not_found(market_service):
    """Verify non-existent location returns None."""
    detail = market_service.get_geographic_market_detail("nonexistent_city_xyz_999")
    assert detail is None


# ---------------------------------------------------------------------------
# 2. HTTP API Geographic Endpoints
# ---------------------------------------------------------------------------

def test_api_get_market_geography():
    """Verify GET /api/market/geography endpoint."""
    response = client.get("/api/market/geography?limit=10")
    assert response.status_code == 200
    data = response.json()

    assert data["dimension"] == "LOCATION"
    assert data["sample_size"] > 15000
    assert "data" in data
    assert len(data["data"]) <= 10

    first_hub = data["data"][0]
    assert "location" in first_hub
    assert "posting_count" in first_hub
    assert "percentage_of_postings" in first_hub
    assert "top_skills" in first_hub
    assert "average_salary" in first_hub
    assert "median_salary" in first_hub
    assert "dominant_experience" in first_hub
    assert "experience_summary" in first_hub

    # Metadata validation
    assert "metadata" in data
    assert "Analytics Jobs" in data["metadata"]["dataset_name"]
    assert "industry" in data["metadata"]["limitations"].lower()


def test_api_get_market_geography_detail():
    """Verify GET /api/market/geography/{location} endpoint."""
    response = client.get("/api/market/geography/Mumbai")
    assert response.status_code == 200
    data = response.json()

    assert data["dimension"] == "LOCATION"
    assert data["location"] == "Mumbai"
    assert data["posting_count"] > 1000
    assert "top_skills" in data
    assert "job_designations" in data
    assert "job_types" in data
    assert "salary_summary" in data
    assert "experience_summary" in data
    assert "data_caveats" in data
    assert any("industry" in c.lower() for c in data["data_caveats"])


def test_api_get_market_geography_detail_404():
    """Verify GET /api/market/geography/{location} returns 404 for unknown location."""
    response = client.get("/api/market/geography/unknown_city_12345")
    assert response.status_code == 404


# ---------------------------------------------------------------------------
# 3. Industry Compatibility Endpoint Tests
# ---------------------------------------------------------------------------

def test_api_get_industries_compatibility():
    """
    Verify GET /api/industries returns geographic market data with explicit
    metadata declaring the dimension is LOCATION, not INDUSTRY.
    """
    response = client.get("/api/industries?limit=10")
    assert response.status_code == 200
    data = response.json()

    assert data["dimension"] == "LOCATION"
    assert "notice" in data
    assert "LOCATION, not INDUSTRY" in data["notice"]
    assert data["sample_size"] > 15000
    assert len(data["data"]) <= 10

    first_item = data["data"][0]
    assert first_item["dimension"] == "LOCATION"
    assert "location" in first_item
    assert "posting_count" in first_item
    assert "This metric represents geographic market location" in first_item["note"]


def test_api_get_industry_skills_compatibility():
    """Verify GET /api/industries/{industry}/skills endpoint."""
    response = client.get("/api/industries/Bengaluru/skills")
    assert response.status_code == 200
    data = response.json()

    assert data["dimension"] == "LOCATION"
    assert data["target_entity"] == "Bengaluru"
    assert data["total_skills"] > 0
    assert data["sample_size"] > 0
    assert data["is_real_data"] is True
    assert "does not contain an official industry column" in data["notice"].lower()
