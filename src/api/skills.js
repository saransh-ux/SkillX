/**
 * SKILLS API MODULE
 * Strictly aligned with FastAPI backend endpoints:
 * - GET /api/skills
 * - GET /api/skills/radar
 * - GET /api/skills/emerging
 * - GET /api/skills/{skill_name}
 * - GET /api/skills/{skill_name}/trend
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local mock data.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import { mockSkills } from '../data/mock/mockSkills.js';

/**
 * Normalizes backend CanonicalSkill or SkillRadarItem or fallback mock into stable frontend model.
 */
export function normalizeSkill(raw) {
  if (!raw) return null;

  const name = raw.display_name || raw.canonical_name || raw.name || raw.skill || 'SKILL';
  const id = raw.skill_id || raw.id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const count = raw.posting_count ?? raw.count ?? 0;
  const prevalencePct = raw.prevalence_pct ?? (typeof raw.prevalence === 'number' ? (raw.prevalence * 100) : 0);

  return {
    id,
    skill_id: id,
    name,
    display_name: name,
    canonical_name: raw.canonical_name || name,
    fullName: raw.fullName || name,
    posting_count: count,
    postingsVolume: count.toLocaleString ? count.toLocaleString() : String(count),
    prevalence: raw.prevalence ?? (prevalencePct / 100),
    prevalence_pct: Number(prevalencePct.toFixed(1)),
    growth: raw.growth || `+${Number(prevalencePct).toFixed(1)}%`,
    growthValue: typeof raw.growthValue === 'number' ? raw.growthValue : Number(prevalencePct.toFixed(1)),
    emergenceScore: raw.emergence_score ?? raw.emergenceScore ?? Math.min(99, Math.round(prevalencePct * 2)),
    category: raw.category || 'Data & Analytics',
    rank: raw.rank || 1,
    signalStrength: raw.signalStrength || (prevalencePct > 20 ? 'CRITICAL' : prevalencePct > 10 ? 'HIGH' : 'STABLE'),
    description: raw.description || `Canonical skill observed in ${count.toLocaleString ? count.toLocaleString() : count} postings (${Number(prevalencePct).toFixed(1)}% market prevalence).`,
    coOccurring: (raw.top_associated_skills || raw.coOccurring || []).map(s => s.display_name || s.skill || s.name || s)
  };
}

/**
 * GET /api/skills
 * Retrieves skills ranked by actual posting count and prevalence.
 * Query params: search, role, location, job_type, min_count, limit.
 */
export async function getSkills(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.location) query.set('location', params.location);
  if (params.job_type) query.set('job_type', params.job_type);
  if (params.min_count !== undefined) query.set('min_count', String(params.min_count));
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const endpoint = `/api/skills${qs}`;

  try {
    const data = await apiClient.get(endpoint);
    const list = Array.isArray(data) ? data : data?.data || [];
    return {
      total_skills: data?.total_skills ?? list.length,
      sample_size: data?.sample_size ?? 15841,
      filters_applied: data?.filters_applied ?? {},
      data: list.map(normalizeSkill),
      metadata: data?.metadata ?? null
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/skills fallback to mockSkills:', error.message);
      let list = mockSkills;
      if (params.search) {
        list = list.filter(s => s.name.toLowerCase().includes(params.search.toLowerCase()));
      }
      return {
        total_skills: list.length,
        sample_size: 15841,
        filters_applied: {},
        data: list.slice(0, params.limit || 25).map(normalizeSkill),
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * GET /api/skills/radar
 * Retrieves the Skill Radar dataset.
 */
export async function getSkillRadar(params = {}) {
  const query = new URLSearchParams();
  if (params.role) query.set('role', params.role);
  if (params.location) query.set('location', params.location);
  if (params.job_type) query.set('job_type', params.job_type);
  if (params.min_count !== undefined) query.set('min_count', String(params.min_count));
  if (params.limit !== undefined) query.set('limit', String(params.limit));

  const qs = query.toString() ? `?${query.toString()}` : '';
  const endpoint = `/api/skills/radar${qs}`;

  try {
    const data = await apiClient.get(endpoint);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/skills/radar fallback to mock:', error.message);
      return {
        total_skills: mockSkills.length,
        sample_size: 15841,
        filters_applied: {},
        data: mockSkills.slice(0, params.limit || 50).map((s, idx) => ({
          skill: s.name,
          posting_count: parseInt(s.postingsVolume.replace(/[^0-9]/g, '')) || 1000,
          prevalence: (s.growthValue || 10) / 100,
          rank: idx + 1,
          sample_size: 15841
        })),
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * GET /api/skills/emerging
 * Retrieves skills ranked by empirical demand.
 */
export async function getEmergingSkills(limit = 20) {
  try {
    const data = await apiClient.get(`/api/skills/emerging?limit=${limit}`);
    const list = Array.isArray(data) ? data : data?.skills || data?.data || [];
    return list.map(normalizeSkill);
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/skills/emerging fallback to mock:', error.message);
      return mockSkills.slice(0, limit).map(normalizeSkill);
    }
    throw error;
  }
}

/**
 * GET /api/skills/{skill_name}
 * Retrieves detailed profile for an individual skill.
 */
export async function getSkillDetail(skillName, topAssociatedLimit = 10) {
  const encoded = encodeURIComponent(skillName);
  try {
    const data = await apiClient.get(`/api/skills/${encoded}?top_associated_limit=${topAssociatedLimit}`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/skills/${skillName} fallback to mock:`, error.message);
      const found = mockSkills.find(
        s => s.id === skillName || s.name.toLowerCase() === skillName.toLowerCase()
      ) || mockSkills[0];
      return {
        skill_id: found.id,
        canonical_name: found.name,
        display_name: found.name,
        posting_count: parseInt(found.postingsVolume.replace(/[^0-9]/g, '')) || 2500,
        prevalence: (found.growthValue || 15) / 100,
        prevalence_pct: found.growthValue || 15.0,
        rank: 1,
        supporting_sample_count: 2500,
        sample_size: 15841,
        top_associated_skills: (found.coOccurring || []).map((co, i) => ({
          skill_id: co.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          display_name: co,
          co_occurrence_count: 1200 - i * 150,
          jaccard_similarity: 0.45 - i * 0.05,
          association_strength: 'STRONG'
        })),
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}

/**
 * GET /api/skills/{skill_name}/trend
 * Longitudinal trend trajectory for a specific skill.
 */
export async function getSkillTrend(skillName) {
  const encoded = encodeURIComponent(skillName);
  try {
    const data = await apiClient.get(`/api/skills/${encoded}/trend`);
    return data;
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn(`[SKILL//X DEMO MODE] /api/skills/${skillName}/trend fallback to mock:`, error.message);
      const found = mockSkills.find(
        s => s.id === skillName || s.name.toLowerCase() === skillName.toLowerCase()
      ) || mockSkills[0];
      return {
        skill: found.name,
        canonical_name: found.name,
        category: found.category,
        timeline: (found.trajectory || [40, 50, 60, 70, 80]).map((score, i) => ({
          period: `Cohort 0${i + 1}`,
          prevalence_pct: score,
          posting_count: score * 50
        })),
        is_real_data: false,
        metadata: { demo_mode: true }
      };
    }
    throw error;
  }
}
