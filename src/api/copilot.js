/**
 * COPILOT API MODULE
 * Strictly aligned with FastAPI backend endpoint:
 * - POST /api/copilot
 *
 * Request schema:
 * {
 *   "question": "...",
 *   "context": {
 *     "role": "...",
 *     "location": "..."
 *   }
 * }
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, falls back to local knowledge base.
 * When VITE_DEMO_MODE=false, throws real backend errors.
 */

import { apiClient, IS_DEMO_MODE } from './client.js';
import { simulateCopilotQuery, SUGGESTED_COPILOT_PROMPTS } from '../data/mock/mockCopilot.js';

export { SUGGESTED_COPILOT_PROMPTS };

/**
 * POST /api/copilot
 * Evaluates a user question against the empirical hackathon datasets.
 */
export async function queryCopilot(query, context = {}) {
  const questionText = typeof query === 'string' ? query.trim() : (query?.question || query?.query || '').trim();
  if (!questionText) {
    throw new Error('Question string is required for Copilot telemetry.');
  }

  // Format context strictly as CopilotContext { role, location }
  let contextPayload = null;
  if (context && typeof context === 'object' && Object.keys(context).length > 0) {
    contextPayload = {
      role: context.role || context.target_role || context.targetRole || null,
      location: context.location || null
    };
  }

  const payload = {
    question: questionText,
    context: contextPayload
  };

  try {
    const data = await apiClient.post('/api/copilot', payload);
    return {
      query: questionText,
      answer: data.answer || 'Telemetry response received without message body.',
      methodology: data.methodology || 'Empirical analysis',
      evidence: data.evidence || [],
      caveats: data.caveats || [],
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    if (IS_DEMO_MODE) {
      console.warn('[SKILL//X DEMO MODE] /api/copilot fallback to mock knowledge base:', error.message);
      return simulateCopilotQuery(questionText);
    }
    throw error;
  }
}

/**
 * Backward-compatible alias matching services/api.js
 */
export const askCopilot = queryCopilot;
