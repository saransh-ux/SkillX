"""
Comprehensive tests for SKILL//X Skill Genome co-occurrence engine.
Validates the graph topology computed directly from Analytics Jobs.key_skills.
"""
import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.genome_service import GenomeService
from app.schemas.genome import SkillGenomeResponse

client = TestClient(app)


@pytest.fixture(scope="module")
def genome_service():
    """Provides initialized GenomeService singleton."""
    return GenomeService.get_instance()


# ---------------------------------------------------------------------------
# 1. Graph Topology Integrity & Invariant Validation Tests
# ---------------------------------------------------------------------------

def test_genome_graph_no_self_edges(genome_service):
    """Validation rule: No self edges allowed in any graph output."""
    global_res = genome_service.get_skill_genome(min_support=5, limit_nodes=50, limit_edges=100)
    for edge in global_res.edges:
        assert edge.source != edge.target, f"Self edge detected on {edge.source}"

    focal_res = genome_service.get_skill_genome(focal_skill="python", min_support=5, limit_nodes=30, limit_edges=50)
    for edge in focal_res.edges:
        assert edge.source != edge.target, f"Self edge detected on {edge.source}"


def test_genome_graph_no_duplicate_edges(genome_service):
    """Validation rule: No duplicate A-B or B-A edges."""
    global_res = genome_service.get_skill_genome(min_support=5, limit_nodes=60, limit_edges=100)
    seen_undirected = set()
    for edge in global_res.edges:
        pair = (edge.source, edge.target) if edge.source < edge.target else (edge.target, edge.source)
        assert pair not in seen_undirected, f"Duplicate edge detected: {pair}"
        seen_undirected.add(pair)

    focal_res = genome_service.get_skill_genome(focal_skill="machine learning", min_support=5, limit_nodes=40, limit_edges=60)
    seen_focal = set()
    for edge in focal_res.edges:
        pair = (edge.source, edge.target) if edge.source < edge.target else (edge.target, edge.source)
        assert pair not in seen_focal, f"Duplicate edge detected in focal graph: {pair}"
        seen_focal.add(pair)


def test_genome_graph_all_edge_nodes_exist(genome_service):
    """Validation rule: All nodes referenced in edges must exist in nodes list."""
    global_res = genome_service.get_skill_genome(min_support=5, limit_nodes=40, limit_edges=80)
    node_ids = {n.id for n in global_res.nodes}
    for edge in global_res.edges:
        assert edge.source in node_ids, f"Edge source {edge.source} missing from nodes"
        assert edge.target in node_ids, f"Edge target {edge.target} missing from nodes"

    focal_res = genome_service.get_skill_genome(focal_skill="sql", min_support=5, limit_nodes=30, limit_edges=50)
    focal_node_ids = {n.id for n in focal_res.nodes}
    for edge in focal_res.edges:
        assert edge.source in focal_node_ids, f"Focal edge source {edge.source} missing from nodes"
        assert edge.target in focal_node_ids, f"Focal edge target {edge.target} missing from nodes"


def test_genome_graph_no_orphan_nodes(genome_service):
    """Validation rule: Prevent orphan nodes (every returned node must have degree >= 1)."""
    global_res = genome_service.get_skill_genome(min_support=5, limit_nodes=50, limit_edges=70)
    connected_nodes = set()
    for edge in global_res.edges:
        connected_nodes.add(edge.source)
        connected_nodes.add(edge.target)

    for node in global_res.nodes:
        assert node.id in connected_nodes, f"Orphan node found with zero degree: {node.id} ({node.label})"

    focal_res = genome_service.get_skill_genome(focal_skill="python", min_support=10, limit_nodes=20, limit_edges=30)
    focal_connected = set()
    for edge in focal_res.edges:
        focal_connected.add(edge.source)
        focal_connected.add(edge.target)

    for node in focal_res.nodes:
        assert node.id in focal_connected, f"Orphan node in focal graph: {node.id}"


def test_genome_graph_non_negative_counts(genome_service):
    """Validation rule: All counts must be non-negative and associations normalized [0, 1]."""
    res = genome_service.get_skill_genome(min_support=5, limit_nodes=50, limit_edges=100)
    assert res.metadata.sample_size > 0

    for node in res.nodes:
        assert node.count >= 0, f"Negative posting count on node {node.id}"

    for edge in res.edges:
        assert edge.cooccurrence >= 0, f"Negative co-occurrence count on edge {edge}"
        assert 0.0 <= edge.association <= 1.0, f"Association out of bounds [0, 1] on edge {edge}"


def test_genome_graph_contains_actual_skills_from_dataset(genome_service):
    """Validation rule: Graph contains actual skills from Analytics Jobs.csv."""
    res = genome_service.get_skill_genome(min_support=5, limit_nodes=100, limit_edges=200)
    all_node_ids = {n.id for n in res.nodes}

    # Common analytics jobs skills that must be present in the graph
    expected_pool = {"python", "sql", "machine-learning", "r", "analytics", "hadoop", "apache-spark"}
    intersection = expected_pool.intersection(all_node_ids)
    assert len(intersection) >= 3, f"Expected known skills from dataset, found: {intersection}"


# ---------------------------------------------------------------------------
# 2. Focal Skill, Minimum Support, and Bounds Filtering
# ---------------------------------------------------------------------------

def test_focal_skill_filtering(genome_service):
    """Verify focal skill ego-network extraction."""
    res = genome_service.get_skill_genome(focal_skill="python", min_support=10, limit_nodes=20, limit_edges=30)

    # Focal node must be in the graph
    node_ids = [n.id for n in res.nodes]
    assert "python" in node_ids

    # Real co-occurrences with Python in Analytics Jobs
    edges_with_python = [
        e for e in res.edges if e.source == "python" or e.target == "python"
    ]
    assert len(edges_with_python) > 0

    neighbor_ids = {
        e.target if e.source == "python" else e.source for e in edges_with_python
    }
    # Python co-occurs with machine learning, R, SQL, Java in Analytics Jobs.csv
    assert "machine-learning" in neighbor_ids or "r" in neighbor_ids or "sql" in neighbor_ids


def test_min_support_filtering(genome_service):
    """Verify edges strictly respect minimum support threshold."""
    min_sup = 25
    res = genome_service.get_skill_genome(min_support=min_sup, limit_edges=50)
    for edge in res.edges:
        assert edge.cooccurrence >= min_sup, f"Edge cooccurrence {edge.cooccurrence} below min_support {min_sup}"


def test_limits_respected(genome_service):
    """Verify limit_nodes and limit_edges bounds are strictly respected."""
    res = genome_service.get_skill_genome(limit_nodes=12, limit_edges=10)
    assert len(res.nodes) <= 12
    assert len(res.edges) <= 10


def test_focal_skill_nonexistent(genome_service):
    """Verify querying a non-existent focal skill returns clean empty graph."""
    res = genome_service.get_skill_genome(focal_skill="nonexistent_skill_xyz_123")
    assert len(res.nodes) == 0
    assert len(res.edges) == 0
    assert res.metadata.sample_size > 0


# ---------------------------------------------------------------------------
# 3. HTTP API Endpoint Verification
# ---------------------------------------------------------------------------

def test_api_get_skill_genome():
    """Verify GET /api/skill-genome endpoint."""
    response = client.get("/api/skill-genome?min_support=10&limit_nodes=20&limit_edges=25")
    assert response.status_code == 200
    data = response.json()

    # Validate schema
    assert "nodes" in data and isinstance(data["nodes"], list)
    assert "edges" in data and isinstance(data["edges"], list)
    assert "metadata" in data and isinstance(data["metadata"], dict)

    assert data["metadata"]["dataset"] == "Analytics Jobs"
    assert data["metadata"]["sample_size"] > 15000
    assert data["metadata"]["association_metric"] == "jaccard"

    assert len(data["nodes"]) <= 20
    assert len(data["edges"]) <= 25

    if data["edges"]:
        first_edge = data["edges"][0]
        assert "source" in first_edge
        assert "target" in first_edge
        assert "cooccurrence" in first_edge
        assert "association" in first_edge


def test_api_get_skill_genome_with_focal_skill():
    """Verify GET /api/skill-genome with focal_skill query parameter."""
    response = client.get("/api/skill-genome?focal_skill=python&min_support=5&limit_nodes=15&limit_edges=20")
    assert response.status_code == 200
    data = response.json()

    node_ids = [n["id"] for n in data["nodes"]]
    assert "python" in node_ids
    assert len(data["edges"]) > 0


def test_api_get_skill_genome_alias_routes():
    """Verify alias routes /api/skills/genome resolve successfully."""
    response = client.get("/api/skills/genome?limit_nodes=10&limit_edges=10")
    assert response.status_code == 200
    data = response.json()
    assert "nodes" in data
    assert "edges" in data
