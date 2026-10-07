/**
 * ROLES API MODULE
 * Strictly aligned with FastAPI backend endpoints:
 * - GET /api/roles
 * - GET /api/roles/{role_name}
 * - GET /api/roles/{role_name}/skills
 * - GET /api/roles/{role_name}/evolution
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local mock data.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import { mockRoles } from '../data/mock/mockRoles.js';

/**
 * GET /api/roles
 * Retrieves active job designations from Analytics Jobs.csv.
 */
export async function getRoles(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : '';
  try {
    const data = await apiClient.get(`/api/roles${qs}`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/roles fallback to mockRoles:', error.message);
      return {
        total_designations: mockRoles.length,
        sample_size: 15841,
        data: mockRoles.map(r => ({
          designation: r.title,
          posting_count: 1200,
          percentage_of_postings: 7.5,
          sample_size: 15841
        })),
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * Backward-compatible catalog list format.
 */
export async function getRolesList() {
  const resp = await getRoles({ limit: 50 });
  const list = resp?.data || [];
  return list.map(r => ({
    id: (r.designation || r.title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
    title: (r.designation || r.title || '').toUpperCase()
  }));
}

/**
 * GET /api/roles/{role_name}
 * Retrieves comprehensive factual market structure profile for a designation.
 */
export async function getRoleDetail(roleName) {
  const encoded = encodeURIComponent(roleName);
  try {
    const data = await apiClient.get(`/api/roles/${encoded}`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/roles/${roleName} fallback to mock:`, error.message);
      const found = mockRoles.find(
        r => r.id === roleName || r.title.toLowerCase() === roleName.toLowerCase()
      ) || mockRoles[0];
      return {
        role_name: found.title,
        posting_count: 2400,
        percentage_of_postings: 15.2,
        sample_size: 15841,
        top_skills: (found.timeline?.[0]?.skills || ['Python', 'SQL']).map((s, idx) => ({
          skill: s,
          count: 1800 - idx * 200,
          prevalence_pct: 75.0 - idx * 10
        })),
        experience_distribution: [],
        job_type_distribution: [],
        salary_summary: null,
        location_summary: [],
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * GET /api/roles/{role_name}/skills
 * Retrieves top empirical skills required for the selected designation.
 */
export async function getRoleSkills(roleName, limit = 20) {
  const encoded = encodeURIComponent(roleName);
  try {
    const data = await apiClient.get(`/api/roles/${encoded}/skills?limit=${limit}`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/roles/${roleName}/skills fallback to mock:`, error.message);
      return {
        role_name: roleName,
        total_skills_observed: 5,
        sample_size: 15841,
        top_skills: [
          { skill: "Python", posting_count: 1800, prevalence_pct: 75.0 },
          { skill: "SQL", posting_count: 1500, prevalence_pct: 62.5 }
        ],
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * GET /api/roles/{role_name}/evolution
 * Factual market transition profile for a role.
 */
export async function getRoleEvolution(roleName) {
  const encoded = encodeURIComponent(roleName);
  try {
    const data = await apiClient.get(`/api/roles/${encoded}/evolution`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/roles/${roleName}/evolution fallback to mock:`, error.message);
      const found = mockRoles.find(
        r => r.id === roleName || r.title.toLowerCase() === roleName.toLowerCase()
      ) || mockRoles[0];
      return {
        role_name: found.title,
        timeline: (found.timeline || []).map((t, i) => ({
          year: t.year || `202${3 + i}`,
          period: t.period,
          focus: t.focus,
          skills: t.skills
        })),
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}
