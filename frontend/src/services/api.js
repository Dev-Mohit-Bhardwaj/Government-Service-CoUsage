/**
 * Project KRATOS API Client
 * Interfaces with FastAPI backend at /api
 */

const API_BASE = '/api';

async function handleResponse(response) {
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.detail) {
        errorMessage = typeof parsed.detail === 'string' ? parsed.detail : JSON.stringify(parsed.detail);
      }
    } catch {
      if (errorText) errorMessage = errorText;
    }
    throw new Error(errorMessage);
  }
  return response.json();
}

export const api = {
  async getHealth() {
    const res = await fetch(`${API_BASE}/health`);
    return handleResponse(res);
  },

  async getOverview() {
    const res = await fetch(`${API_BASE}/overview`);
    return handleResponse(res);
  },

  async getValidation() {
    const res = await fetch(`${API_BASE}/validation`);
    return handleResponse(res);
  },

  async getServices() {
    const res = await fetch(`${API_BASE}/services`);
    return handleResponse(res);
  },

  async getPopularity(category = 'all') {
    const url = new URL(`${API_BASE}/popularity`, window.location.origin);
    if (category && category !== 'all') {
      url.searchParams.set('category', category);
    }
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async getEDA() {
    const res = await fetch(`${API_BASE}/eda`);
    return handleResponse(res);
  },

  async getItemsets(minSupport = 0.01, maxLen = null, algorithm = 'fpgrowth') {
    const url = new URL(`${API_BASE}/mining/itemsets`, window.location.origin);
    url.searchParams.set('min_support', minSupport);
    if (maxLen) url.searchParams.set('max_len', maxLen);
    url.searchParams.set('algorithm', algorithm);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async getRules({
    minSupport = 0.01,
    minConfidence = 0.30,
    minLift = 1.0,
    maxAntecedentLen = null,
    singleConsequentOnly = true,
    removeRedundant = false
  } = {}) {
    const url = new URL(`${API_BASE}/mining/rules`, window.location.origin);
    url.searchParams.set('min_support', minSupport);
    url.searchParams.set('min_confidence', minConfidence);
    url.searchParams.set('min_lift', minLift);
    if (maxAntecedentLen) url.searchParams.set('max_antecedent_len', maxAntecedentLen);
    url.searchParams.set('single_consequent_only', singleConsequentOnly);
    url.searchParams.set('remove_redundant', removeRedundant);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async compareAlgorithms(minSupport = 0.01, maxLen = null) {
    const url = new URL(`${API_BASE}/mining/compare`, window.location.origin);
    url.searchParams.set('min_support', minSupport);
    if (maxLen) url.searchParams.set('max_len', maxLen);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async getRecommendations({
    selectedServiceIds,
    maxRecommendations = 5,
    minConfidence = 0.20,
    minLift = 1.0,
    rankingMetric = 'confidence'
  }) {
    const res = await fetch(`${API_BASE}/recommend`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        selected_service_ids: selectedServiceIds,
        max_recommendations: maxRecommendations,
        min_confidence: minConfidence,
        min_lift: minLift,
        ranking_metric: rankingMetric
      })
    });
    return handleResponse(res);
  },

  async getNetwork(minSupport = 0.015, minConfidence = 0.35, minLift = 1.0) {
    const url = new URL(`${API_BASE}/network`, window.location.origin);
    url.searchParams.set('min_support', minSupport);
    url.searchParams.set('min_confidence', minConfidence);
    url.searchParams.set('min_lift', minLift);
    const res = await fetch(url.toString());
    return handleResponse(res);
  },

  async getIntegration({
    minConfidence = 0.30,
    minLift = 1.05,
    topN = 50,
    weights = {}
  } = {}) {
    const url = new URL(`${API_BASE}/integration`, window.location.origin);
    url.searchParams.set('min_confidence', minConfidence);
    url.searchParams.set('min_lift', minLift);
    url.searchParams.set('top_n', topN);
    if (weights.confidence !== undefined) url.searchParams.set('w_confidence', weights.confidence);
    if (weights.lift !== undefined) url.searchParams.set('w_lift', weights.lift);
    if (weights.support !== undefined) url.searchParams.set('w_support', weights.support);
    if (weights.cross_platform !== undefined) url.searchParams.set('w_platform', weights.cross_platform);
    if (weights.cross_category !== undefined) url.searchParams.set('w_category', weights.cross_category);
    const res = await fetch(url.toString());
    return handleResponse(res);
  }
};
