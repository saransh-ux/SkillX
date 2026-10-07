/**
 * SKILL//X API CLIENT
 * Centralized fetch wrapper for communicating with the FastAPI + ML backend.
 * Reads base URL from VITE_API_BASE_URL (defaults to empty string for relative or unconfigured).
 */

const RAW_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
// Strip trailing slash if present
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, data = null, isNetworkError = false) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
  }
}

/**
 * Reusable HTTP request handler with timeout and error handling.
 */
export async function request(endpoint, options = {}) {
  const {
    timeout = 4000,
    headers = {},
    body,
    ...customConfig
  } = options;

  // Clean leading slash on endpoint if baseUrl exists
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const url = API_BASE_URL ? `${API_BASE_URL}${path}` : path;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  const config = {
    ...customConfig,
    headers: {
      'Accept': 'application/json',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
      ...headers
    },
    signal: controller.signal
  };

  if (body) {
    config.body = typeof body === 'string' ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);
    clearTimeout(timer);

    const contentType = response.headers.get('content-type') || '';
    let responseData = null;

    if (contentType.includes('application/json')) {
      responseData = await response.json();
    } else {
      responseData = await response.text();
    }

    if (!response.ok) {
      const errorMessage =
        (responseData && typeof responseData === 'object' && (responseData.detail || responseData.message)) ||
        `HTTP Error ${response.status}: ${response.statusText}`;
      throw new ApiError(errorMessage, response.status, responseData);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timer);

    if (error instanceof ApiError) {
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out while waiting for backend telemetry.', 408, null, true);
    }

    // Network disconnection, CORS failure, connection refused
    throw new ApiError(
      error.message || 'Network connection failed to reach workforce API.',
      0,
      null,
      true
    );
  }
}

export const apiClient = {
  get: (endpoint, options = {}) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => request(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => request(endpoint, { ...options, method: 'DELETE' })
};

export default apiClient;
