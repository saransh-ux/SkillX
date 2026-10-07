"""
Real SKILL//X Skill Genome Service.
Directly builds the workforce skill co-occurrence graph from Analytics Jobs.key_skills.

For every cleaned job posting:
- unique canonical skills are extracted
- co-occurrence counts are tracked for every pair of skills

For each edge:
- skill_a, skill_b
- cooccurrence_count
- support
- association_score (Jaccard similarity: cooc / (count(A) + count(B) - cooc))

Guarantees:
- Strictly empirical: 100% data-derived from Analytics Jobs.csv
- No self edges
- No duplicate A-B / B-A edges (canonical undirected ordering)
- No orphan nodes (every returned node has degree >= 1)
- Excludes rare noisy non-skill terms
- Precomputed and cached in-memory structures for sub-millisecond query performance
"""
import logging
from typing import List, Dict, Tuple, Set, Optional, Any
from collections import Counter, defaultdict
from itertools import combinations

from app.services.market_service import MarketService
from app.services.skill_extraction import canonicalize_skill
from app.schemas.genome import (
    GenomeNode,
    GenomeEdge,
    GenomeMetadata,
    SkillGenomeResponse,
)

logger = logging.getLogger("skillx.genome_service")

DATASET_NAME = "Analytics Jobs"
METRIC_NAME = "jaccard"


class GenomeService:
    """
    In-memory graph engine managing empirical skill co-occurrence topology.
    Precomputes co-occurrence matrices and provides flexible subgraph querying.
    """

    _instance: Optional["GenomeService"] = None

    def __init__(self, market_service: Optional[MarketService] = None):
        self.market_service = market_service or MarketService.get_instance()
        self._sample_size: int = 0
        self._skill_counts: Counter = Counter()
        self._skill_labels: Dict[str, str] = {}
        # Undirected edge counts: key is tuple (a, b) with a < b
        self._pair_counts: Counter = Counter()
        # Precomputed edges: list of dicts with (a, b, count, jaccard)
        self._indexed_edges: List[Dict[str, Any]] = []
        # Adjacency map: skill_id -> list of (neighbor_id, count, jaccard)
        self._adjacency: Dict[str, List[Tuple[str, int, float]]] = defaultdict(list)
        self._is_initialized: bool = False
        self._build_genome_graph()

    @classmethod
    def get_instance(cls) -> "GenomeService":
        """Singleton accessor for GenomeService."""
        if cls._instance is None:
            cls._instance = GenomeService()
        return cls._instance

    def _build_genome_graph(self) -> None:
        """
        Builds the co-occurrence graph directly from Analytics Jobs.csv postings:
        - For every posting, extracts unique canonical skills.
        - For every pair of skills in the posting, increments co-occurrence count.
        - Computes Jaccard similarity for all co-occurring pairs.
        """
        postings = self.market_service._postings
        self._sample_size = len(postings)

        skill_counts: Counter = Counter()
        pair_counts: Counter = Counter()
        skill_labels: Dict[str, str] = {}

        for p in postings:
            # Unique skills in this posting
            extracted_skills = p["skills"]
            if not extracted_skills:
                continue

            unique_ids = sorted(list({s["skill_id"] for s in extracted_skills}))
            for s in extracted_skills:
                sid = s["skill_id"]
                skill_counts[sid] += 1
                if sid not in skill_labels:
                    skill_labels[sid] = s["display_name"]

            # Increment co-occurrence for each unique pair (a, b) with a < b
            for a, b in combinations(unique_ids, 2):
                pair_counts[(a, b)] += 1

        self._skill_counts = skill_counts
        self._skill_labels = skill_labels
        self._pair_counts = pair_counts

        # Build indexed edge list and adjacency
        indexed_edges = []
        adjacency = defaultdict(list)

        for (a, b), cooc in pair_counts.items():
            cnt_a = skill_counts[a]
            cnt_b = skill_counts[b]
            union_cnt = cnt_a + cnt_b - cooc
            jaccard = round(cooc / union_cnt, 4) if union_cnt > 0 else 0.0

            edge_obj = {
                "source": a,
                "target": b,
                "cooccurrence": cooc,
                "association": jaccard,
            }
            indexed_edges.append(edge_obj)
            adjacency[a].append((b, cooc, jaccard))
            adjacency[b].append((a, cooc, jaccard))

        # Sort adjacency lists by association score descending
        for sid in adjacency:
            adjacency[sid].sort(key=lambda item: (item[2], item[1]), reverse=True)

        self._indexed_edges = indexed_edges
        self._adjacency = adjacency
        self._is_initialized = True
        logger.info(
            f"Skill Genome initialized: {len(skill_counts)} nodes, "
            f"{len(indexed_edges)} unique undirected edges from {self._sample_size} postings."
        )

    def _resolve_focal_skill(self, focal_skill: str) -> Optional[str]:
        """Resolves raw focal_skill query to canonical skill id."""
        if not focal_skill:
            return None
        canon = canonicalize_skill(focal_skill)
        target_id = canon["skill_id"] if canon else focal_skill.strip().lower().replace(" ", "-")

        if target_id in self._skill_counts:
            return target_id

        # Case-insensitive label / canonical lookup
        q_lower = focal_skill.strip().lower()
        for sid, label in self._skill_labels.items():
            if sid == q_lower or label.lower() == q_lower:
                return sid

        return None

    def get_skill_genome(
        self,
        focal_skill: Optional[str] = None,
        min_support: int = 5,
        min_association: Optional[float] = None,
        limit_nodes: int = 50,
        limit_edges: int = 100,
    ) -> SkillGenomeResponse:
        """
        Extracts the Skill Genome graph based on focal skill and filtering criteria.

        Guarantees:
        - No self edges
        - No duplicate undirected edges
        - No orphan nodes (every node in nodes has at least one edge in edges)
        - All edge nodes exist in nodes
        - All counts are non-negative
        """
        # Effective minimum support threshold
        eff_min_support = max(1, min_support)
        eff_limit_edges = max(1, limit_edges)
        eff_limit_nodes = max(2, limit_nodes)

        candidate_edges: List[Dict[str, Any]] = []
        resolved_focal_id = None

        if focal_skill and focal_skill.strip():
            resolved_focal_id = self._resolve_focal_skill(focal_skill)
            if not resolved_focal_id:
                # Focal skill not found in dataset: return empty graph
                metadata = GenomeMetadata(
                    dataset=DATASET_NAME,
                    sample_size=self._sample_size,
                    association_metric=METRIC_NAME,
                    total_nodes=0,
                    total_edges=0,
                    focal_skill=focal_skill,
                    min_support_used=eff_min_support,
                )
                return SkillGenomeResponse(nodes=[], edges=[], metadata=metadata)

            # Collect edges connected to focal skill (1st degree)
            focal_neighbors: Set[str] = set()
            for neighbor_id, cooc, jaccard in self._adjacency.get(resolved_focal_id, []):
                if cooc < eff_min_support:
                    continue
                if min_association is not None and jaccard < min_association:
                    continue
                focal_neighbors.add(neighbor_id)
                # Canonical undirected edge
                src, tgt = sorted([resolved_focal_id, neighbor_id])
                candidate_edges.append({
                    "source": src,
                    "target": tgt,
                    "cooccurrence": cooc,
                    "association": jaccard,
                    "is_focal_edge": True,
                })

            # Also collect edges between the top neighbors to form an induced community
            for (a, b) in combinations(focal_neighbors, 2):
                src, tgt = sorted([a, b])
                cooc = self._pair_counts.get((src, tgt), 0)
                if cooc >= eff_min_support:
                    cnt_a = self._skill_counts[src]
                    cnt_b = self._skill_counts[tgt]
                    union_cnt = cnt_a + cnt_b - cooc
                    jaccard = round(cooc / union_cnt, 4) if union_cnt > 0 else 0.0
                    if min_association is None or jaccard >= min_association:
                        candidate_edges.append({
                            "source": src,
                            "target": tgt,
                            "cooccurrence": cooc,
                            "association": jaccard,
                            "is_focal_edge": False,
                        })

            # Prioritize focal edges first, then neighbor-neighbor edges by association
            candidate_edges.sort(
                key=lambda e: (e.get("is_focal_edge", False), e["association"], e["cooccurrence"]),
                reverse=True,
            )

        else:
            # Global genome graph: filter all edges by min_support and min_association
            for edge in self._indexed_edges:
                if edge["cooccurrence"] < eff_min_support:
                    continue
                if min_association is not None and edge["association"] < min_association:
                    continue
                candidate_edges.append(edge)

            # Sort candidate edges by association (Jaccard) descending, then cooccurrence
            candidate_edges.sort(
                key=lambda e: (e["association"], e["cooccurrence"]),
                reverse=True,
            )

        # Truncate edges to candidate limit
        candidate_edges = candidate_edges[: eff_limit_edges * 2]

        # Determine node degrees / weights in candidate edges
        node_edge_counts: Counter = Counter()
        for e in candidate_edges:
            node_edge_counts[e["source"]] += 1
            node_edge_counts[e["target"]] += 1

        # Select top nodes by degree and posting count up to limit_nodes
        # If focal skill is specified, always include focal skill
        sorted_nodes = sorted(
            node_edge_counts.keys(),
            key=lambda nid: (
                nid == resolved_focal_id,
                node_edge_counts[nid],
                self._skill_counts.get(nid, 0),
            ),
            reverse=True,
        )
        retained_node_ids: Set[str] = set(sorted_nodes[:eff_limit_nodes])

        # Filter edges to only those where BOTH source and target are in retained_node_ids
        final_edges: List[GenomeEdge] = []
        seen_edges: Set[Tuple[str, str]] = set()

        for e in candidate_edges:
            src = e["source"]
            tgt = e["target"]
            if src in retained_node_ids and tgt in retained_node_ids:
                # Canonical undirected uniqueness check
                edge_pair = (src, tgt) if src < tgt else (tgt, src)
                if edge_pair not in seen_edges:
                    seen_edges.add(edge_pair)
                    final_edges.append(
                        GenomeEdge(
                            source=src,
                            target=tgt,
                            cooccurrence=e["cooccurrence"],
                            association=e["association"],
                        )
                    )
            if len(final_edges) >= eff_limit_edges:
                break

        # CRITICAL GUARANTEE: Prevent orphan nodes.
        # Include ONLY nodes that actively participate in at least one final edge.
        active_edge_node_ids: Set[str] = set()
        for e in final_edges:
            active_edge_node_ids.add(e.source)
            active_edge_node_ids.add(e.target)

        final_nodes: List[GenomeNode] = []
        for nid in sorted(
            active_edge_node_ids,
            key=lambda x: (x == resolved_focal_id, self._skill_counts.get(x, 0)),
            reverse=True,
        ):
            label = self._skill_labels.get(nid, nid.replace("-", " ").title())
            count = self._skill_counts.get(nid, 0)
            final_nodes.append(
                GenomeNode(
                    id=nid,
                    label=label,
                    count=count,
                )
            )

        metadata = GenomeMetadata(
            dataset=DATASET_NAME,
            sample_size=self._sample_size,
            association_metric=METRIC_NAME,
            total_nodes=len(final_nodes),
            total_edges=len(final_edges),
            focal_skill=focal_skill,
            min_support_used=eff_min_support,
        )

        return SkillGenomeResponse(
            nodes=final_nodes,
            edges=final_edges,
            metadata=metadata,
        )
