/**
 * SKILL//X API CLIENT
 * Centralized fetch wrapper for communicating with the FastAPI + ML backend.
 * Reads base URL from VITE_API_BASE_URL (defaults to empty string for relative or unconfigured).
 *
 * Honors VITE_DEMO_MODE:
 * When VITE_DEMO_MODE=true, fallback to mock data is allowed.
 * When VITE_DEMO_MODE=false (default), real backend errors (404, 422, 500, network) are thrown explicitly.
 */

const getEnv = (key, fallback = '') => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key] !== undefined) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) {
    return process.env[key];
  }
  return fallback;
};

const RAW_BASE_URL = getEnv('VITE_API_BASE_URL', '');
// Strip trailing slash if present
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export const IS_DEMO_MODE = String(getEnv('VITE_DEMO_MODE', 'false')).toLowerCase() === 'true';

export class ApiError extends Error {
  constructor(message, status = 500, data = null, isNetworkError = false, endpoint = '') {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    this.isNetworkError = isNetworkError;
    this.endpoint = endpoint;
  }
}

/**
 * Reusable HTTP request handler with timeout and error handling.
 */
export async function request(endpoint, options = {}) {
  const {
    timeout = 8000,
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
      let errorMessage = `HTTP Error ${response.status}: ${response.statusText}`;
      if (responseData && typeof responseData === 'object') {
        if (typeof responseData.detail === 'string') {
          errorMessage = responseData.detail;
        } else if (Array.isArray(responseData.detail)) {
          errorMessage = responseData.detail.map(d => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', ');
        } else if (responseData.message) {
          errorMessage = responseData.message;
        }
      }
      throw new ApiError(errorMessage, response.status, responseData, false, path);
    }

    return responseData;
  } catch (error) {
    clearTimeout(timer);

    if (error instanceof ApiError) {
      if (!error.endpoint) error.endpoint = path;
      throw error;
    }

    if (error.name === 'AbortError') {
      throw new ApiError('Request timed out while waiting for backend telemetry.', 408, null, true, path);
    }

    // Network disconnection, CORS failure, connection refused
    throw new ApiError(
      error.message || 'Network connection failed to reach workforce API.',
      0,
      null,
      true,
      path
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
