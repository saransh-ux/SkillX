/**
 * GENOME API MODULE
 * Strictly aligned with FastAPI backend endpoint:
 * - GET /api/skill-genome (alias: /api/skills/genome)
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local mock data.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import { genomeNetwork } from '../data/mock/mockSkills.js';

/**
 * Normalizes graph network nodes and links ensuring required coordinate
 * and topological fields are present.
 */
export function normalizeGenomeNetwork(raw) {
  if (!raw) return { nodes: [], edges: [], links: [] };

  const rawNodes = raw.nodes || [];
  const rawEdges = raw.edges || raw.links || [];

  const defaultMap = new Map((genomeNetwork?.nodes || []).map(n => [n.id, n]));

  const nodes = rawNodes.map((node, idx) => {
    const id = node.id || node.skill_id || `node-${idx}`;
    const label = node.label || node.display_name || node.canonical_name || node.name || id;
    const count = node.count ?? node.posting_count ?? 0;

    return {
      id,
      skill_id: id,
      label,
      name: label,
      count,
      posting_count: count,
      degree: node.degree ?? (rawEdges.filter(e => e.source === id || e.target === id).length),
      type: node.type || 'empirical',
      cluster: node.cluster || 'data-science'
    };
  });

  const edges = rawEdges.map(edge => {
    const source = typeof edge.source === 'object' ? edge.source.id : edge.source;
    const target = typeof edge.target === 'object' ? edge.target.id : edge.target;
    const cooccurrence = edge.cooccurrence ?? edge.co_occurrence_count ?? 0;
    const association = typeof edge.association === 'number'
      ? edge.association
      : (typeof edge.weight === 'number' ? edge.weight : (edge.jaccard_similarity ?? 0));

    return {
      source,
      target,
      cooccurrence,
      co_occurrence_count: cooccurrence,
      association,
      weight: association,
      jaccard_similarity: association
    };
  });

  return {
    nodes,
    edges,
    links: edges, // Alias for backward compatibility
    metadata: raw.metadata || null
  };
}

/**
 * GET /api/skill-genome
 * Retrieves topological skill graph networks and co-occurrence clusters.
 */
export async function getSkillGenome(params = {}) {
  const query = new URLSearchParams();
  if (params.focal_skill) query.set('focal_skill', params.focal_skill);
  if (params.min_support !== undefined) query.set('min_support', String(params.min_support));
  if (params.limit_nodes !== undefined) query.set('limit_nodes', String(params.limit_nodes));
  if (params.limit_edges !== undefined) query.set('limit_edges', String(params.limit_edges));

  const qs = query.toString() ? `?${query.toString()}` : '';

  try {
    const data = await apiClient.get(`/api/skill-genome${qs}`);
    return normalizeGenomeNetwork(data);
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/skill-genome fallback to mock graph:', error.message);
      return normalizeGenomeNetwork(genomeNetwork);
    }
    throw error;
  }
}

/**
 * Backward compatibility alias for getSkillGenome
 */
export const getGenomeNetwork = getSkillGenome;
