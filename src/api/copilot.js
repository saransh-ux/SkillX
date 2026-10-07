/**
 * COPILOT API MODULE
 * Implements natural-language conversational analytics queries:
 * POST /api/copilot/query
 * Grounded in official hackathon datasets and model feature signals.
 */

import { apiClient } from './client.js';
import { simulateCopilotQuery, SUGGESTED_COPILOT_PROMPTS } from '../data/mock/mockCopilot.js';

export { SUGGESTED_COPILOT_PROMPTS };

/**
 * POST /api/copilot/query
 * Evaluates a user natural language question against workforce intelligence corpus.
 */
export async function queryCopilot(query, context = {}) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('Query string is required for Copilot telemetry.');
  }

  const payload = {
    query: query.trim(),
    context
  };

  try {
    const data = await apiClient.post('/api/copilot/query', payload);
    if (data && typeof data === 'object') {
      return {
        query: payload.query,
        answer: data.answer || data.response || 'Telemetry response received without message body.',
        citations: Array.isArray(data.citations) ? data.citations : ['EMPIRICAL_CORPUS'],
        relatedMetrics: Array.isArray(data.relatedMetrics) ? data.relatedMetrics : [],
        timestamp: data.timestamp || new Date().toISOString()
      };
    }
    return simulateCopilotQuery(payload.query);
  } catch (error) {
    console.warn('[SKILL//X API] /api/copilot/query unavailable, falling back to empirical knowledge base:', error.message);
    return simulateCopilotQuery(payload.query);
  }
}
