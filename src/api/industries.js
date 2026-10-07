/**
 * INDUSTRIES API MODULE
 * Implements cross-sector skill penetration and adoption differentials.
 */

import { apiClient } from './client.js';
import { mockIndustries } from '../data/mock/mockIndustries.js';

/**
 * Normalizes industry shift dataset.
 */
export function normalizeIndustryDataset(raw) {
  if (!raw) return null;

  const sectors = (raw.sectors || []).map((sec, idx) => ({
    name: sec.name || 'SECTOR',
    code: sec.code || `SEC${idx + 1}`,
    adoptionRate: typeof sec.adoptionRate === 'number' ? sec.adoptionRate : 50,
    yoyGrowth: sec.yoyGrowth || '+25.0%',
    penetrationLevel: sec.penetrationLevel || 'ACTIVE ADOPTION',
    rank: sec.rank || `0${idx + 1}`,
    primaryUseCases: sec.primaryUseCases || 'Enterprise AI application deployments'
  }));

  return {
    skillKey: raw.skillKey || 'ai-agents',
    skillLabel: raw.skillLabel || 'EMERGING CAPABILITY',
    definition: raw.definition || 'Cross-vertical enterprise penetration of modern skill clusters',
    medianAdoption: raw.medianAdoption || '55.0%',
    sectors
  };
}

/**
 * GET /api/industries/{industry}/skills
 * Retrieves skills demanded within a specific industry vertical.
 */
export async function getIndustrySkills(industry) {
  const encoded = encodeURIComponent(industry);
  try {
    const data = await apiClient.get(`/api/industries/${encoded}/skills`);
    return data;
  } catch (error) {
    console.warn(`[SKILL//X API] /api/industries/${industry}/skills fallback to mock:`, error.message);
    const indUpper = industry.toUpperCase();
    const matches = [];
    mockIndustries.forEach(item => {
      const sec = item.sectors.find(s => s.name === indUpper || s.code === indUpper);
      if (sec) {
        matches.push({
          skill: item.skillLabel,
          skillKey: item.skillKey,
          adoptionRate: sec.adoptionRate,
          yoyGrowth: sec.yoyGrowth,
          useCases: sec.primaryUseCases
        });
      }
    });
    return matches;
  }
}

/**
 * GET /api/industries/shift
 * Retrieves full comparative cross-sector adoption metrics for all skills.
 * Falls back to mockIndustries when API is unreachable.
 */
export async function getIndustryShifts() {
  try {
    const data = await apiClient.get('/api/industries/shift');
    const list = Array.isArray(data) ? data : data?.industries || [];
    if (list.length > 0) {
      return list.map(normalizeIndustryDataset);
    }
    return mockIndustries.map(normalizeIndustryDataset);
  } catch (error) {
    console.warn('[SKILL//X API] /api/industries/shift unavailable, falling back to mock dataset:', error.message);
    return mockIndustries.map(normalizeIndustryDataset);
  }
}
