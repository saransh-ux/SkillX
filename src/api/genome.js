/**
 * GENOME API MODULE
 * Retrieves topological skill graph networks and co-occurrence clusters.
 */

import { apiClient } from './client.js';
import { genomeNetwork } from '../data/mock/mockSkills.js';
import { getSkillRelationships } from './skills.js';

export { getSkillRelationships };

/**
 * Normalizes graph network nodes and links ensuring required coordinate
 * and topological fields are present.
 */
export function normalizeGenomeNetwork(raw) {
  if (!raw || !Array.isArray(raw.nodes) || !Array.isArray(raw.links)) {
    return genomeNetwork;
  }

  // Preserve existing node positions or default positions if backend omits x/y
  const defaultMap = new Map(genomeNetwork.nodes.map(n => [n.id, n]));

  const nodes = raw.nodes.map((node, idx) => {
    const fallback = defaultMap.get(node.id) || {};
    return {
      id: node.id || `node-${idx}`,
      label: node.label || node.name || node.id || 'SKILL',
      type: node.type || fallback.type || 'frontier',
      cluster: node.cluster || fallback.cluster || 'ai',
      x: typeof node.x === 'number' ? node.x : fallback.x || (150 + (idx % 4) * 120),
      y: typeof node.y === 'number' ? node.y : fallback.y || (120 + Math.floor(idx / 4) * 80),
      r: typeof node.r === 'number' ? node.r : fallback.r || 7,
      score: typeof node.score === 'number' ? node.score : fallback.score || 80,
      featured: node.featured ?? fallback.featured ?? false
    };
  });

  const links = raw.links.map(link => ({
    source: typeof link.source === 'object' ? link.source.id : link.source,
    target: typeof link.target === 'object' ? link.target.id : link.target,
    weight: typeof link.weight === 'number' ? link.weight : 0.75,
    emergent: link.emergent ?? (link.weight > 0.8),
    highlight: link.highlight ?? (link.weight > 0.85)
  }));

  return { nodes, links };
}

/**
 * GET /api/skills/genome or /api/skills/relationships
 * Retrieves the full topological graph network.
 * Falls back to local genomeNetwork mock.
 */
export async function getGenomeNetwork() {
  try {
    const data = await apiClient.get('/api/skills/genome');
    return normalizeGenomeNetwork(data);
  } catch (error) {
    console.warn('[SKILL//X API] /api/skills/genome unavailable, falling back to mock graph:', error.message);
    return normalizeGenomeNetwork(genomeNetwork);
  }
}
