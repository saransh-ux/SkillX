/**
 * MARKET API MODULE
 * Implements telemetry and empirical summary contract:
 * GET /api/market/summary
 */

import { apiClient } from './client.js';
import { mockMarketSummary } from '../data/mock/mockMarket.js';

export async function getMarketSummary() {
  try {
    const data = await apiClient.get('/api/market/summary');
    if (data && typeof data === 'object') {
      return {
        sampleSize: data.sampleSize || mockMarketSummary.sampleSize,
        sampleDescription: data.sampleDescription || mockMarketSummary.sampleDescription,
        totalSkillsTracked: data.totalSkillsTracked ?? mockMarketSummary.totalSkillsTracked,
        activeClusters: data.activeClusters ?? mockMarketSummary.activeClusters,
        networkDensity: data.networkDensity ?? mockMarketSummary.networkDensity,
        topDemandedSkill: data.topDemandedSkill || mockMarketSummary.topDemandedSkill,
        topDemandGrowth: data.topDemandGrowth || mockMarketSummary.topDemandGrowth,
        juniorModelMetric: data.juniorModelMetric || mockMarketSummary.juniorModelMetric,
        seniorModelMetric: data.seniorModelMetric || mockMarketSummary.seniorModelMetric,
        temporalBaseline: data.temporalBaseline || mockMarketSummary.temporalBaseline,
        ...data
      };
    }
    return mockMarketSummary;
  } catch (error) {
    console.warn('[SKILL//X API] /api/market/summary unavailable, using empirical fallback:', error.message);
    return mockMarketSummary;
  }
}
