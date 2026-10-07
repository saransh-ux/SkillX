/**
 * INDUSTRIES API MODULE
 * Strictly aligned with FastAPI backend endpoints:
 * - GET /api/industries
 * - GET /api/industries/{industry}/skills
 *
 * Notes: Analytics Jobs does NOT contain an official industry column.
 * Backend router returns geographic market data with explicit metadata declaring
 * dimension is LOCATION, not INDUSTRY.
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local mock data.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import { mockIndustries } from '../data/mock/mockIndustries.js';

/**
 * Normalizes industry dataset for backward-compatible consumers.
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
 * Retrieves skills demanded within a specific industry vertical (or geographic proxy).
 */
export async function getIndustrySkills(industry) {
  const encoded = encodeURIComponent(industry);
  try {
    const data = await apiClient.get(`/api/industries/${encoded}/skills`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/industries/${industry}/skills fallback to mock:`, error.message);
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
    throw error;
  }
}

/**
 * GET /api/industries
 * Retrieves full comparative cross-sector adoption metrics for all skills.
 */
export async function getIndustryShifts() {
  try {
    const data = await apiClient.get('/api/industries');
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/industries fallback to mock dataset:', error.message);
      return mockIndustries.map(normalizeIndustryDataset);
    }
    throw error;
  }
}
