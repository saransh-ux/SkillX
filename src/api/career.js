/**
 * CAREER PREDICTIVE API MODULE
 * Integrates with Junior Data Scientist and Senior Data Scientist model endpoints:
 * - GET  /api/career/junior/model
 * - POST /api/career/junior/predict
 * - GET  /api/career/senior/model
 * - POST /api/career/senior/predict
 * - POST /api/career/scan
 *
 * Grounded in empirical dataset variables without claiming causality.
 */

import { apiClient } from './client.js';
import {
  mockJuniorModel,
  mockSeniorModel,
  simulateJuniorPrediction,
  simulateSeniorPrediction,
  simulateCareerScan
} from '../data/mock/mockCareer.js';

/**
 * GET /api/career/junior/model
 * Dynamically retrieves junior model features, target, and baseline metrics.
 */
export async function getJuniorModel() {
  try {
    const data = await apiClient.get('/api/career/junior/model');
    if (data && typeof data === 'object') {
      return {
        ...mockJuniorModel,
        ...data,
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features : mockJuniorModel.features
      };
    }
    return mockJuniorModel;
  } catch (error) {
    console.warn('[SKILL//X API] /api/career/junior/model unavailable, using empirical fallback:', error.message);
    return mockJuniorModel;
  }
}

/**
 * POST /api/career/junior/predict
 * Evaluates candidate technical skill vector against the salary hike model.
 * Target: salary_hike_high_or_low
 */
export async function predictJuniorSuccess(selectedSkills = []) {
  try {
    const payload = Array.isArray(selectedSkills) ? { skills: selectedSkills } : selectedSkills;
    const response = await apiClient.post('/api/career/junior/predict', payload);
    return response;
  } catch (error) {
    console.warn('[SKILL//X API] /api/career/junior/predict unavailable, using simulated model signal:', error.message);
    const skillsList = Array.isArray(selectedSkills) ? selectedSkills : (selectedSkills?.skills || []);
    return simulateJuniorPrediction(skillsList);
  }
}

/**
 * GET /api/career/senior/model
 * Retrieves the Senior Data Scientist personality model (Big Five features).
 * Target: success_classification_high_low
 */
export async function getSeniorModel() {
  try {
    const data = await apiClient.get('/api/career/senior/model');
    if (data && typeof data === 'object') {
      return {
        ...mockSeniorModel,
        ...data,
        features: Array.isArray(data.features) && data.features.length > 0 ? data.features : mockSeniorModel.features
      };
    }
    return mockSeniorModel;
  } catch (error) {
    console.warn('[SKILL//X API] /api/career/senior/model unavailable, using empirical fallback:', error.message);
    return mockSeniorModel;
  }
}

/**
 * POST /api/career/senior/predict
 * Evaluates Big Five personality scores against senior success classification.
 * Target: success_classification_high_low
 */
export async function predictSeniorSuccess(personalityScores = {}) {
  try {
    const response = await apiClient.post('/api/career/senior/predict', personalityScores);
    return response;
  } catch (error) {
    console.warn('[SKILL//X API] /api/career/senior/predict unavailable, using simulated model signal:', error.message);
    return simulateSeniorPrediction(personalityScores);
  }
}

/**
 * POST /api/career/scan
 * Runs evidence-based career scan returning market signals, relevant skills,
 * model-associated skill signals, and evidence-derived recommendations.
 * Does NOT invent match probabilities.
 */
export async function runCareerScan(profilePayload = {}) {
  try {
    const response = await apiClient.post('/api/career/scan', profilePayload);
    return response;
  } catch (error) {
    console.warn('[SKILL//X API] /api/career/scan unavailable, using empirical evidence fallback:', error.message);
    return simulateCareerScan(profilePayload);
  }
}
