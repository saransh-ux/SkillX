/**
 * SKILL//X Grounded API Client.
 * Connects directly to FastAPI backend endpoints.
 * Never silently falls back to mock data.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

async function fetchJSON(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let errorDetail = `HTTP ${res.status}: ${res.statusText}`;
      try {
        const errorJson = await res.json();
        if (errorJson.detail) {
          errorDetail = typeof errorJson.detail === 'string' 
            ? errorJson.detail 
            : JSON.stringify(errorJson.detail);
        }
      } catch (e) {
        // ignore JSON parse error on non-json error responses
      }
      throw new Error(errorDetail);
    }

    return await res.json();
  } catch (err) {
    console.error(`API Error on ${url}:`, err);
    throw err;
  }
}

// -------------------------------------------------------------
// 01 / SKILL RADAR & CANONICAL TAXONOMY
// -------------------------------------------------------------
export async function getSkills(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.role) query.set('role', params.role);
  if (params.location) query.set('location', params.location);
  if (params.job_type) query.set('job_type', params.job_type);
  if (params.limit) query.set('limit', params.limit);
  if (params.min_count) query.set('min_count', params.min_count);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchJSON(`/skills${qs}`);
}

export async function getSkillDetail(skillName) {
  return fetchJSON(`/skills/${encodeURIComponent(skillName)}`);
}

// -------------------------------------------------------------
// 02 / SKILL GENOME (CO-OCCURRENCE NETWORK)
// -------------------------------------------------------------
export async function getSkillGenome(params = {}) {
  const query = new URLSearchParams();
  if (params.focal_skill) query.set('focal_skill', params.focal_skill);
  if (params.min_support) query.set('min_support', params.min_support);
  if (params.limit_nodes) query.set('limit_nodes', params.limit_nodes);
  if (params.limit_edges) query.set('limit_edges', params.limit_edges);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchJSON(`/skill-genome${qs}`);
}

// -------------------------------------------------------------
// 03 / ROLE MARKET STRUCTURE (FORMERLY ROLE EVOLUTION)
// -------------------------------------------------------------
export async function getRoles(params = {}) {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.limit) query.set('limit', params.limit);

  const qs = query.toString() ? `?${query.toString()}` : '';
  return fetchJSON(`/roles${qs}`);
}

export async function getRoleDetail(roleName) {
  return fetchJSON(`/roles/${encodeURIComponent(roleName)}`);
}

export async function getRoleSkills(roleName, limit = 10) {
  return fetchJSON(`/roles/${encodeURIComponent(roleName)}/skills?limit=${limit}`);
}

// -------------------------------------------------------------
// 04 / GEOGRAPHIC MARKET INTELLIGENCE (FORMERLY INDUSTRY SHIFT)
// -------------------------------------------------------------
export async function getGeographicMarkets(limit = 10) {
  return fetchJSON(`/market/geography?limit=${limit}`);
}

export async function getGeographicMarketDetail(location) {
  return fetchJSON(`/market/geography/${encodeURIComponent(location)}`);
}

// -------------------------------------------------------------
// 05 / SUPERVISED ML MODELS
// -------------------------------------------------------------
export async function getCareerModelMetadata() {
  return fetchJSON('/career-success/model');
}

export async function predictCareerSuccess(profile) {
  return fetchJSON('/career-success/predict', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

export async function getSeniorModelMetadata() {
  return fetchJSON('/senior-success/model');
}

export async function predictSeniorSuccess(profile) {
  return fetchJSON('/senior-success/predict', {
    method: 'POST',
    body: JSON.stringify(profile),
  });
}

// -------------------------------------------------------------
// 06 / CAREER SCAN (MULTI-LAYER SYNTHESIS)
// -------------------------------------------------------------
export async function runCareerScan(payload) {
  return fetchJSON('/career-scan', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// -------------------------------------------------------------
// 07 / COPILOT GROUNDED ANALYTICS
// -------------------------------------------------------------
export async function askCopilot(payload) {
  return fetchJSON('/copilot', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
