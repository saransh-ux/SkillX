/**
 * SKILLS API MODULE
 * Implements contracts for emerging skills, trend trajectories, and relationships.
 */

import { apiClient } from './client.js';
import { mockSkills, genomeNetwork } from '../data/mock/mockSkills.js';

/**
 * Normalizes raw skill payload (from FastAPI backend or local mock) into
 * the standard frontend contract.
 */
export function normalizeSkill(raw) {
  if (!raw) return null;
  const name = raw.name || raw.skill || 'UNKNOWN';
  const id = raw.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const growthNum = typeof raw.growth === 'number'
    ? raw.growth
    : typeof raw.growthValue === 'number'
      ? raw.growthValue
      : parseFloat(String(raw.growth || '0').replace(/[^0-9.-]+/g, '')) || 0;

  const growthStr = typeof raw.growth === 'string' && raw.growth.includes('%')
    ? raw.growth
    : `${growthNum >= 0 ? '+' : ''}${growthNum.toFixed(1)}%`;

  const emergenceScore = typeof raw.emergenceScore === 'number'
    ? raw.emergenceScore
    : typeof raw.score === 'number'
      ? raw.score
      : 50;

  return {
    id,
    skill: name,
    name,
    fullName: raw.fullName || raw.name || raw.skill || name,
    growth: growthStr,
    growthValue: growthNum,
    emergenceScore,
    category: raw.category || 'AI Architecture',
    adoption: typeof raw.adoption === 'number' ? raw.adoption : Math.min(100, Math.round(emergenceScore * 0.85)),
    trend: raw.trend || (emergenceScore >= 80 ? 'rising' : 'stable'),
    signalStrength: raw.signalStrength || (emergenceScore >= 80 ? 'CRITICAL' : 'SURGE'),
    postingsVolume: raw.postingsVolume || '120,000+',
    trajectory: Array.isArray(raw.trajectory) ? raw.trajectory : [40, 52, 63, 75, emergenceScore],
    coOccurring: Array.isArray(raw.coOccurring)
      ? raw.coOccurring
      : ['AI Architecture', 'FastAPI', 'Vector Databases'],
    description: raw.description || `Emerging capability showing strong market demand and acceleration.`
  };
}

/**
 * GET /api/skills/emerging
 * Retrieves the list of currently emerging skills.
 * Falls back to mockSkills if backend is unreachable.
 */
export async function getEmergingSkills() {
  try {
    const data = await apiClient.get('/api/skills/emerging');
    const list = Array.isArray(data) ? data : data?.skills || data?.data || [];
    if (list.length > 0) {
      return list.map(normalizeSkill);
    }
    return mockSkills.map(normalizeSkill);
  } catch (error) {
    console.warn('[SKILL//X API] /api/skills/emerging unavailable, falling back to mock dataset:', error.message);
    return mockSkills.map(normalizeSkill);
  }
}

/**
 * GET /api/skills/{skill}/trend
 * Longitudinal trend trajectory for a specific skill.
 */
export async function getSkillTrend(skill) {
  const encoded = encodeURIComponent(skill);
  try {
    const data = await apiClient.get(`/api/skills/${encoded}/trend`);
    return data;
  } catch (error) {
    console.warn(`[SKILL//X API] /api/skills/${skill}/trend fallback to mock:`, error.message);
    const found = mockSkills.find(
      s => s.id === skill || s.name.toLowerCase() === skill.toLowerCase()
    ) || mockSkills[0];
    return {
      skill: found.name,
      growth: found.growthValue,
      emergenceScore: found.emergenceScore,
      trajectory: found.trajectory,
      trend: found.signalStrength.toLowerCase()
    };
  }
}

/**
 * GET /api/skills/top
 * Retrieves the top demanded skills across the workforce corpus.
 */
export async function getTopSkills(limit = 10, category = 'all') {
  try {
    const query = new URLSearchParams();
    if (limit) query.set('limit', String(limit));
    if (category && category !== 'all') query.set('category', category);
    const queryString = query.toString();
    const endpoint = `/api/skills/top${queryString ? `?${queryString}` : ''}`;

    const data = await apiClient.get(endpoint);
    const list = Array.isArray(data) ? data : data?.skills || data?.data || [];
    if (list.length > 0) {
      return list.map(normalizeSkill);
    }
    return mockSkills.slice(0, limit).map(normalizeSkill);
  } catch (error) {
    console.warn('[SKILL//X API] /api/skills/top unavailable, falling back to mock dataset:', error.message);
    let filtered = mockSkills;
    if (category && category !== 'all') {
      filtered = mockSkills.filter(s => s.category.toLowerCase().includes(category.toLowerCase()));
    }
    return filtered.slice(0, limit).map(normalizeSkill);
  }
}

/**
 * GET /api/skills/{skill}/related
 * Retrieves co-occurring and related skills for a given anchor skill.
 */
export async function getRelatedSkills(skill) {
  const encoded = encodeURIComponent(skill);
  try {
    const data = await apiClient.get(`/api/skills/${encoded}/related`);
    return data;
  } catch (error) {
    console.warn(`[SKILL//X API] /api/skills/${skill}/related fallback to mock:`, error.message);
    const targetId = skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const links = genomeNetwork.links.filter(
      l => l.source === targetId || l.target === targetId
    );
    const neighborIds = links.map(l => (l.source === targetId ? l.target : l.source));
    const relatedNodes = genomeNetwork.nodes.filter(n => neighborIds.includes(n.id));

    return {
      skill,
      relatedSkills: relatedNodes.map(n => ({
        id: n.id,
        name: n.label,
        weight: 0.75,
        category: n.cluster
      }))
    };
  }
}

/**
 * GET /api/skills/{skill}/relationships
 * Co-occurring links and related cluster nodes for a skill.
 */
export async function getSkillRelationships(skill) {
  const encoded = encodeURIComponent(skill);
  try {
    const data = await apiClient.get(`/api/skills/${encoded}/relationships`);
    return data;
  } catch (error) {
    console.warn(`[SKILL//X API] /api/skills/${skill}/relationships fallback to mock:`, error.message);
    const targetId = skill.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const links = genomeNetwork.links.filter(
      l => l.source === targetId || l.target === targetId
    );
    const neighborIds = links.map(l => (l.source === targetId ? l.target : l.source));
    const nodes = genomeNetwork.nodes.filter(n => n.id === targetId || neighborIds.includes(n.id));

    return {
      skill,
      nodes,
      links
    };
  }
}

