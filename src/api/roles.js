/**
 * ROLES API MODULE
 * Implements role evolution trajectories and longitudinal timeline tracking.
 */

import { apiClient } from './client.js';
import { mockRoles } from '../data/mock/mockRoles.js';

/**
 * Normalizes role evolution response ensuring contract compliance:
 * {
 *   role: "Software Engineer",
 *   timeline: [{ year: "2023", skills: [...] }]
 * }
 */
export function normalizeRoleEvolution(raw) {
  if (!raw) return null;

  const roleName = raw.role || raw.title || 'Software Engineer';
  const id = raw.id || roleName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  const defaultMock = mockRoles.find(r => r.id === id || r.title.toLowerCase() === roleName.toLowerCase()) || mockRoles[0];

  const timeline = (raw.timeline || defaultMock.timeline || []).map((step, idx) => ({
    year: String(step.year || (2023 + idx)),
    period: step.period || (idx === 3 ? 'AGENTIC SYNTHESIS PHASE' : `PHASE 0${idx + 1}`),
    focus: step.focus || 'Modern Engineering Core',
    skills: Array.isArray(step.skills) ? step.skills : ['Python', 'Cloud', 'RAG'],
    dominantParadigm: step.dominantParadigm || 'Systems Orchestration',
    marketPrevalence: step.marketPrevalence || '75%'
  }));

  return {
    id,
    role: roleName,
    title: raw.title || roleName.toUpperCase(),
    code: raw.code || defaultMock.code || 'SOC:15-1252.00',
    evolutionIndex: raw.evolutionIndex || defaultMock.evolutionIndex || '+40.0%',
    volatility: raw.volatility || defaultMock.volatility || 'HIGH',
    insight: raw.insight || defaultMock.insight || `${roleName} requirements are consolidating around compound AI tooling.`,
    summary: raw.summary || defaultMock.summary || 'Longitudinal transition towards autonomous systems and vector indexing.',
    metrics: {
      skillHalfLife: raw.metrics?.skillHalfLife || defaultMock.metrics?.skillHalfLife || '16 months',
      aiAugmentationRatio: raw.metrics?.aiAugmentationRatio || defaultMock.metrics?.aiAugmentationRatio || '60%',
      velocityDelta: raw.metrics?.velocityDelta || defaultMock.metrics?.velocityDelta || '+30.0%'
    },
    timeline
  };
}

/**
 * GET /api/roles/{role}/evolution
 * Retrieves the longitudinal timeline and skill shift for a role.
 * Falls back to mockRoles when API is unreachable.
 */
export async function getRoleEvolution(roleId) {
  const roleKey = roleId ? roleId.toLowerCase().replace(/[^a-z0-9]+/g, '-') : 'software-engineer';
  try {
    const data = await apiClient.get(`/api/roles/${encodeURIComponent(roleKey)}/evolution`);
    return normalizeRoleEvolution(data);
  } catch (error) {
    console.warn(`[SKILL//X API] /api/roles/${roleKey}/evolution unavailable, falling back to mock dataset:`, error.message);
    const found = mockRoles.find(r => r.id === roleKey) || mockRoles[0];
    return normalizeRoleEvolution(found);
  }
}

/**
 * Retrieves the catalog of available workforce roles.
 */
export async function getRolesList() {
  try {
    const data = await apiClient.get('/api/roles');
    const list = Array.isArray(data) ? data : data?.roles || [];
    if (list.length > 0) {
      return list.map(r => ({
        id: r.id || (r.role || r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        title: (r.title || r.role || r.name || 'ROLE').toUpperCase()
      }));
    }
    return mockRoles.map(r => ({ id: r.id, title: r.title }));
  } catch {
    return mockRoles.map(r => ({ id: r.id, title: r.title }));
  }
}
