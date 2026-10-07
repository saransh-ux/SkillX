"""
Comprehensive tests for SKILL//X Market Intelligence Layer.
Tested against authentic Analytics Jobs.csv hackathon dataset.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.skill_extraction import (
    clean_raw_token,
    to_canonical_display_name,
    canonicalize_skill,
    extract_and_canonicalize_skills,
)
from app.services.market_service import MarketService
from app.services.skill_service import SkillService

client = TestClient(app)


# ---------------------------------------------------------------------------
# 1. Skill Extraction & Normalization Tests
# ---------------------------------------------------------------------------

def test_clean_raw_token_noise_and_ellipses():
    """Verify cleaning of ellipsis, trailing punctuation, and whitespace."""
    assert clean_raw_token("   Python...   ") == "Python"
    assert clean_raw_token("...SQL...") == "SQL"
    assert clean_raw_token("---Machine Learning---") == "Machine Learning"
    assert clean_raw_token('"Tableau"') == "Tableau"
    assert clean_raw_token("...") is None
    assert clean_raw_token("..") is None
    assert clean_raw_token("etc") is None
    assert clean_raw_token("na") is None
    assert clean_raw_token("null") is None
    assert clean_raw_token("") is None


def test_clean_raw_token_single_characters():
    """Verify that single-letter languages (R, C) are preserved, while noise is discarded."""
    assert clean_raw_token("R") == "R"
    assert clean_raw_token("r") == "R"
    assert clean_raw_token("C") == "C"
    assert clean_raw_token("c") == "C"
    assert clean_raw_token("x") is None
    assert clean_raw_token("a") is None


def test_canonicalize_skill_punctuation_and_aliases():
    """Verify normalization of punctuation variants and aliases without aggressive merging."""
    # PL/SQL variations
    plsql1 = canonicalize_skill("PL/SQL")
    plsql2 = canonicalize_skill("plsql")
    plsql3 = canonicalize_skill("PL SQL")
    assert plsql1 == plsql2 == plsql3
    assert plsql1["skill_id"] == "pl-sql"
    assert plsql1["canonical_name"] == "pl/sql"
    assert plsql1["display_name"] == "PL/SQL"

    # Power BI variations
    pbi1 = canonicalize_skill("Power BI")
    pbi2 = canonicalize_skill("PowerBI")
    pbi3 = canonicalize_skill("power-bi")
    assert pbi1 == pbi2 == pbi3
    assert pbi1["skill_id"] == "power-bi"
    assert pbi1["display_name"] == "Power BI"

    # C++ and C#
    cpp = canonicalize_skill("C++")
    cpp_spaced = canonicalize_skill("c ++")
    assert cpp == cpp_spaced
    assert cpp["skill_id"] == "c-plus-plus"
    assert cpp["display_name"] == "C++"

    csharp = canonicalize_skill("C#")
    assert csharp["skill_id"] == "c-sharp"
    assert csharp["display_name"] == "C#"

    # .NET
    dotnet1 = canonicalize_skill(".NET")
    dotnet2 = canonicalize_skill("dotnet")
    assert dotnet1 == dotnet2
    assert dotnet1["skill_id"] == "dot-net"
    assert dotnet1["display_name"] == ".NET"

    # Distinct database engines must NOT be aggressively merged
    mysql = canonicalize_skill("MySQL")
    pgsql = canonicalize_skill("PostgreSQL")
    nosql = canonicalize_skill("NoSQL")
    assert mysql["skill_id"] != pgsql["skill_id"]
    assert mysql["skill_id"] != nosql["skill_id"]
    assert pgsql["skill_id"] != nosql["skill_id"]


def test_extract_and_canonicalize_skills_deduplication():
    """Verify deduplication per posting and comma/semicolon splitting."""
    raw = "Python, python, PYTHON, Machine Learning, ML, R, R, SQL; SQL..."
    extracted = extract_and_canonicalize_skills(raw)
    skill_ids = [s["skill_id"] for s in extracted]

    # Python, Machine Learning, R, SQL should each occur exactly once
    assert len(skill_ids) == 4
    assert set(skill_ids) == {"python", "machine-learning", "r", "sql"}


# ---------------------------------------------------------------------------
# 2. Real Analytics Jobs Dataset Market Service Tests
# ---------------------------------------------------------------------------

def test_market_service_loads_real_dataset():
    """Verify MarketService loads and indexes real Analytics Jobs.csv data."""
    ms = MarketService.get_instance()
    assert ms.total_eligible_postings > 15000  # Analytics Jobs.csv has 15,841 rows
    assert len(ms._skill_posting_indices) > 1000


def test_canonical_skill_representation_and_prevalence():
    """Verify canonical representation, prevalence definition, and rank."""
    ms = MarketService.get_instance()
    res = ms.get_skills(limit=10, min_count=5)

    assert res.total_skills > 0
    assert res.sample_size == ms.total_eligible_postings
    assert len(res.data) <= 10

    # Top skills must include SQL, Python, Analytics
    skill_names = [s.canonical_name for s in res.data]
    assert "sql" in skill_names or "analytics" in skill_names or "python" in skill_names

    # Check structure of each skill
    for rank_idx, skill in enumerate(res.data, start=1):
        assert skill.rank == rank_idx
        assert skill.skill_id
        assert skill.canonical_name
        assert skill.display_name
        assert skill.posting_count > 0
        # Prevalence strictly defined as posting_count / total eligible postings
        expected_prev = round(skill.posting_count / res.sample_size, 4)
        assert abs(skill.prevalence - expected_prev) < 1e-4


def test_minimum_support_filtering():
    """Verify rare noise terms below min_count are filtered out."""
    ms = MarketService.get_instance()
    res_high_support = ms.get_skills(min_count=50, limit=1000)
    for skill in res_high_support.data:
        assert skill.posting_count >= 50

    res_default = ms.get_skills(min_count=5, limit=1000)
    for skill in res_default.data:
        assert skill.posting_count >= 5


def test_skill_radar_structure():
    """Verify Skill Radar service returns exact required structure."""
    ms = MarketService.get_instance()
    radar = ms.get_skill_radar(limit=5)

    assert radar.sample_size == ms.total_eligible_postings
    assert len(radar.data) == 5

    for item in radar.data:
        item_dict = item.model_dump()
        # Required keys: skill, posting_count, prevalence, rank, sample_size
        assert "skill" in item_dict and isinstance(item_dict["skill"], str)
        assert "posting_count" in item_dict and isinstance(item_dict["posting_count"], int)
        assert "prevalence" in item_dict and isinstance(item_dict["prevalence"], float)
        assert "rank" in item_dict and isinstance(item_dict["rank"], int)
        assert "sample_size" in item_dict and isinstance(item_dict["sample_size"], int)
        assert item_dict["sample_size"] == radar.sample_size


def test_supported_filters():
    """Verify role, location, and job_type filtering; confirm no industry column."""
    ms = MarketService.get_instance()

    # Filter by role
    ds_skills = ms.get_skills(role="Data Scientist", limit=10)
    assert 0 < ds_skills.sample_size < ms.total_eligible_postings
    top_ds_names = [s.canonical_name for s in ds_skills.data]
    assert "machine learning" in top_ds_names or "python" in top_ds_names

    # Filter by location
    blr_skills = ms.get_skills(location="Bengaluru", limit=5)
    assert 0 < blr_skills.sample_size < ms.total_eligible_postings

    # Filter by job_type
    analytics_type = ms.get_skills(job_type="Analytics", limit=5)
    assert 0 < analytics_type.sample_size < ms.total_eligible_postings


def test_metadata_transparency():
    """Verify transparency metadata attributes."""
    ms = MarketService.get_instance()
    res = ms.get_skills(limit=5)
    meta = res.metadata

    assert "Analytics Jobs.csv" in meta.dataset_name
    assert meta.sample_size == ms.total_eligible_postings
    assert "Empirical frequency counting" in meta.methodology
    assert "no official industry column" in meta.limitations


def test_skill_detail_and_co_occurrence():
    """Verify skill detail, Jaccard association, lift, and supporting sample count."""
    ms = MarketService.get_instance()
    python_detail = ms.get_skill_detail("python")

    assert python_detail is not None
    assert python_detail.canonical_name == "python"
    assert python_detail.posting_count > 0
    assert python_detail.supporting_sample_count == python_detail.posting_count
    assert python_detail.sample_size == ms.total_eligible_postings

    # Associated skills must be present and sorted
    assert len(python_detail.top_associated_skills) > 0
    first_assoc = python_detail.top_associated_skills[0]
    assert first_assoc.skill_id
    assert first_assoc.co_occurrence_count > 0
    assert 0.0 < first_assoc.association_strength <= 1.0
    assert first_assoc.lift > 0.0

    # Associated with Python usually includes Machine Learning
    assoc_names = [a.canonical_name for a in python_detail.top_associated_skills]
    assert "machine learning" in assoc_names or "sql" in assoc_names or "r" in assoc_names


# ---------------------------------------------------------------------------
# 3. HTTP API Endpoint Tests
# ---------------------------------------------------------------------------

def test_api_get_skills_list():
    """Test GET /api/skills endpoint."""
    response = client.get("/api/skills?limit=10")
    assert response.status_code == 200
    data = response.json()
    assert "data" in data
    assert "metadata" in data
    assert len(data["data"]) == 10
    assert data["sample_size"] > 15000


def test_api_get_skills_with_search_and_filters():
    """Test GET /api/skills with search, role, and location parameters."""
    response = client.get("/api/skills?search=python&location=bengaluru")
    assert response.status_code == 200
    data = response.json()
    assert data["sample_size"] > 0
    for item in data["data"]:
        assert "python" in item["canonical_name"].lower() or "python" in item["display_name"].lower()


def test_api_get_skill_radar():
    """Test GET /api/skills/radar endpoint."""
    response = client.get("/api/skills/radar?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) == 5
    for item in data["data"]:
        assert "skill" in item
        assert "posting_count" in item
        assert "prevalence" in item
        assert "rank" in item
        assert "sample_size" in item


def test_api_get_skill_detail():
    """Test GET /api/skills/{skill_name} endpoint."""
    response = client.get("/api/skills/sql")
    assert response.status_code == 200
    data = response.json()
    assert data["canonical_name"] == "sql"
    assert data["posting_count"] > 0
    assert data["supporting_sample_count"] == data["posting_count"]
    assert "top_associated_skills" in data
    assert len(data["top_associated_skills"]) > 0


def test_api_get_skill_detail_not_found():
    """Test GET /api/skills/{skill_name} 404 for nonexistent skill."""
    response = client.get("/api/skills/this_skill_does_not_exist_at_all_xyz")
    assert response.status_code == 404
