/**
 * CAREER & SENIOR SUCCESS ML API MODULE
 * Strictly aligned with FastAPI backend endpoints:
 * - GET  /api/career-success/model
 * - POST /api/career-success/predict
 * - GET  /api/senior-success/model
 * - POST /api/senior-success/predict
 * - POST /api/career-scan
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local simulation data.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import {
  mockJuniorModel,
  mockSeniorModel,
  simulateJuniorPrediction,
  simulateSeniorPrediction,
  simulateCareerScan
} from '../data/mock/mockCareer.js';

/**
 * Maps incoming skill list or rating dictionary into backend CareerSuccessInput:
 * {
 *   big_data_skills: 1.0 - 5.0,
 *   maths_stats_skills: 1.0 - 5.0,
 *   coding_skills: 1.0 - 5.0,
 *   ai_and_ml_skills: 1.0 - 5.0,
 *   dashboard_and_storytelling_skills: 1.0 - 5.0
 * }
 */
export function buildCareerSuccessPayload(input) {
  // If already in rating object format
  if (input && typeof input === 'object' && !Array.isArray(input)) {
    return {
      big_data_skills: Number(input.big_data_skills ?? input.bigData ?? 3.5),
      maths_stats_skills: Number(input.maths_stats_skills ?? input.mathsStats ?? 3.5),
      coding_skills: Number(input.coding_skills ?? input.coding ?? 3.5),
      ai_and_ml_skills: Number(input.ai_and_ml_skills ?? input.aiMl ?? 3.5),
      dashboard_and_storytelling_skills: Number(input.dashboard_and_storytelling_skills ?? input.dashboardStorytelling ?? 3.5)
    };
  }

  // If passed an array of skill strings, compute continuous trait ratings (1.0 to 5.0)
  const skills = Array.isArray(input) ? input : (input?.skills || []);
  const lower = skills.map(s => String(s).toLowerCase());

  const has = (...terms) => terms.some(t => lower.some(s => s.includes(t)));

  return {
    big_data_skills: has('big data', 'hadoop', 'spark', 'hive', 'kafka') ? 4.5 : has('sql', 'database') ? 3.5 : 2.0,
    maths_stats_skills: has('statistic', 'math', 'r', 'hypothesis', 'probability') ? 4.8 : 2.5,
    coding_skills: has('python', 'coding', 'programming', 'java', 'c++') ? 4.5 : has('git') ? 3.5 : 2.0,
    ai_and_ml_skills: has('machine learning', 'deep learning', 'ai', 'tensor', 'scikit') ? 4.8 : has('python') ? 3.5 : 2.0,
    dashboard_and_storytelling_skills: has('tableau', 'power bi', 'visualization', 'dashboard', 'excel') ? 4.5 : 2.5
  };
}

/**
 * Maps Big Five personality trait scores into backend SeniorSuccessInput:
 * {
 *   neuroticism: 0.0 - 100.0,
 *   extraversion: 0.0 - 100.0,
 *   openness_to_experience: 0.0 - 100.0,
 *   agreeableness: 0.0 - 100.0,
 *   conscientiousness: 0.0 - 100.0
 * }
 */
export function buildSeniorSuccessPayload(input = {}) {
  // Scale helper: if scores are 1.0 - 5.0, map to 0 - 100. If already > 5.0, keep as is.
  const scale = (val, defaultVal) => {
    const raw = Number(val ?? defaultVal);
    if (isNaN(raw)) return defaultVal;
    if (raw <= 5.0) return Math.min(100, Math.max(0, raw * 20));
    return Math.min(100, Math.max(0, raw));
  };

  return {
    neuroticism: scale(input.neuroticism ?? input.Neuroticism, 25.0),
    extraversion: scale(input.extraversion ?? input.Extraversion, 50.0),
    openness_to_experience: scale(input.openness_to_experience ?? input.openness ?? input.Openness, 70.0),
    agreeableness: scale(input.agreeableness ?? input.Agreeableness, 50.0),
    conscientiousness: scale(input.conscientiousness ?? input.Conscientiousness, 75.0)
  };
}

/**
 * GET /api/career-success/model
 * Junior model metadata and holdout evaluation metrics.
 */
export async function getJuniorModel() {
  try {
    const data = await apiClient.get('/api/career-success/model');
    // Normalize into backward-compatible shape for UI and tests
    return {
      modelName: data.selected_model_name ? `${data.selected_model_name} (StandardScaler)` : mockJuniorModel.modelName,
      modelType: data.model_type || mockJuniorModel.modelType,
      target: data.target || "salary_hike_high_or_low",
      metric: `${((data.metrics?.balanced_accuracy ?? 0.8578) * 100).toFixed(1)}% Balanced Accuracy`,
      baselinePositiveRate: "52.5%",
      description: data.selection_rationale || mockJuniorModel.description,
      caveat: (data.limitations && data.limitations[0]) || mockJuniorModel.caveat,
      features: (data.feature_importance || []).map((f, i) => ({
        name: f.display_name || f.feature,
        importance: f.importance ?? f.coefficient ?? 0.2,
        rank: `0${i + 1}`,
        category: "Skill Trait Rating"
      })),
      rawMetadata: data
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/career-success/model fallback to mock:', error.message);
      return mockJuniorModel;
    }
    throw error;
  }
}

/**
 * POST /api/career-success/predict
 * Junior model prediction against 5 skill trait categories.
 */
export async function predictJuniorSuccess(selectedSkills = []) {
  const payload = buildCareerSuccessPayload(selectedSkills);
  try {
    const response = await apiClient.post('/api/career-success/predict', payload);
    const isHigh = response.predicted_label === 'high' || response.predicted_class === 1;
    return {
      target: "salary_hike_high_or_low",
      predicted_class: response.predicted_class,
      predicted_label: response.predicted_label,
      predictedSalaryHikeClass: isHigh ? "High" : "Low",
      highSalaryHikeProbability: response.probability_high,
      probability_high: response.probability_high,
      probability_low: response.probability_low,
      model: response.model,
      evidence: response.evidence || [],
      featureSignals: (response.evidence || []).map(e => ({
        feature: e.display_name,
        importance: e.importance,
        association: `${e.impact_direction.toUpperCase()} impact: ${e.display_name} rating contributes to hike classification.`
      })),
      summary: response.interpretation,
      caveats: response.caveats
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/career-success/predict fallback to simulation:', error.message);
      const skillsList = Array.isArray(selectedSkills) ? selectedSkills : (selectedSkills?.skills || []);
      return simulateJuniorPrediction(skillsList);
    }
    throw error;
  }
}

/**
 * GET /api/senior-success/model
 * Senior model metadata and Big Five feature benchmarks.
 */
export async function getSeniorModel() {
  try {
    const data = await apiClient.get('/api/senior-success/model');
    return {
      modelName: data.selected_model_name ? `${data.selected_model_name} Classifier` : mockSeniorModel.modelName,
      modelType: data.model_type || mockSeniorModel.modelType,
      target: data.target || "success_classification_high_low",
      metric: `${((data.metrics?.balanced_accuracy ?? 0.9282) * 100).toFixed(1)}% Balanced Accuracy`,
      baselinePositiveRate: "52.8%",
      description: data.selection_rationale || mockSeniorModel.description,
      caveat: (data.limitations && data.limitations[0]) || mockSeniorModel.caveat,
      features: (data.feature_importance || []).map(f => {
        // Map canonical feature names to concise Big Five labels
        let shortName = "Openness";
        if (f.feature.includes("conscientious")) shortName = "Conscientiousness";
        else if (f.feature.includes("openness")) shortName = "Openness";
        else if (f.feature.includes("extraversion")) shortName = "Extraversion";
        else if (f.feature.includes("agreeable")) shortName = "Agreeableness";
        else if (f.feature.includes("neuroticism")) shortName = "Neuroticism";

        return {
          name: shortName,
          rawFeature: f.feature,
          importance: f.importance,
          coefficient: f.coefficient !== null ? String(f.coefficient) : null,
          signalDirection: shortName === "Neuroticism" ? "Inverse association" : "Positive association",
          description: `Empirical Big Five trait dimension: ${f.display_name}.`
        };
      }),
      rawMetadata: data
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/senior-success/model fallback to mock:', error.message);
      return mockSeniorModel;
    }
    throw error;
  }
}

/**
 * POST /api/senior-success/predict
 * Senior model prediction against Big Five personality traits.
 */
export async function predictSeniorSuccess(personalityScores = {}) {
  const payload = buildSeniorSuccessPayload(personalityScores);
  try {
    const response = await apiClient.post('/api/senior-success/predict', payload);
    const isHigh = response.predicted_label === 'high' || response.predicted_class === 1;
    return {
      target: "success_classification_high_low",
      predicted_class: response.predicted_class,
      predicted_label: response.predicted_label,
      predictedSuccessClass: isHigh ? "High" : "Low",
      highSuccessProbability: response.probability_high,
      probability_high: response.probability_high,
      probability_low: response.probability_low,
      model: response.model,
      evidence: response.evidence || [],
      traitSignals: (response.evidence || []).map(e => ({
        trait: e.display_name,
        score: e.raw_score,
        association: `${e.impact_direction.toUpperCase()} impact on senior success classification.`
      })),
      summary: response.interpretation,
      caveats: response.caveats
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/senior-success/predict fallback to simulation:', error.message);
      return simulateSeniorPrediction(personalityScores);
    }
    throw error;
  }
}

/**
 * POST /api/career-scan
 * Multi-layer career scan synthesizing Market Demand, JDS, and SDS layers.
 */
export async function runCareerScan(profilePayload = {}) {
  // Normalize payload into CareerScanInput
  const targetRole = profilePayload.target_role || profilePayload.targetRole || "Data Scientist";
  const location = profilePayload.location || profilePayload.targetLocation || "Bengaluru";

  const skillProfile = profilePayload.skill_profile || buildCareerSuccessPayload(profilePayload.currentSkills || profilePayload.skills || []);
  const personalityProfile = profilePayload.personality_profile || buildSeniorSuccessPayload(profilePayload.personalityScores || {});

  const requestBody = {
    target_role: targetRole,
    location: location,
    skill_profile: skillProfile,
    personality_profile: personalityProfile
  };

  try {
    const response = await apiClient.post('/api/career-scan', requestBody);

    // Provide backward-compatible field mapping for both UI components
    const marketSignals = (response.market_evidence || []).map(m => ({
      signal: `${m.title}: ${m.prevalence_pct}% prevalence (${m.posting_count.toLocaleString()} postings)`,
      source: "Analytics Jobs.csv",
      ...m
    }));

    const relevantSkills = (response.priority_skills || []).map(ps => ps.skill_name);

    const modelAssociatedSkills = (response.career_model?.evidence || []).map(ev => ({
      skill: ev.display_name,
      status: "Evaluated in profile",
      modelImpact: `${ev.impact_direction.toUpperCase()} impact`
    }));

    const recommendations = (response.recommendations || []).map(r => r.actionable_guidance);

    return {
      targetRole,
      experienceLevel: profilePayload.experienceLevel || "Mid",
      location,
      marketSignals,
      relevantSkills,
      modelAssociatedSkills,
      evidenceDerivedRecommendations: recommendations,
      highSuccessProbability: null, // Strictly non-fabricated probability
      // Raw backend response fields for FutureScan.jsx / deep renderers:
      market_evidence: response.market_evidence,
      career_model: response.career_model,
      senior_model: response.senior_model,
      priority_skills: response.priority_skills,
      recommendations: response.recommendations,
      caveats: response.caveats
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/career-scan fallback to simulation:', error.message);
      return simulateCareerScan(profilePayload);
    }
    throw error;
  }
}
