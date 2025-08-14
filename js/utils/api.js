/**
 * Enhanced API Client with caching, retry logic and interceptors
 * @module utils/api
 * @requires utils/cache
 * @requires utils/securityUtils
 * @requires utils/logger
 * @requires utils/storage
 */

import { cache } from './cache';
import securityUtils from './securityUtils';
import { logger } from './logger';
import storage from './storage';
import eventBus from './eventBus';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.culturatoken.com/v1';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache default
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second

class ApiClient {
  constructor() {
    this.authToken = null;
    this.csrfToken = securityUtils.generateCSRFToken();
    this.interceptors = {
      request: [],
      response: []
    };

    // Initialize from storage if available
    this._loadAuthToken();
    this._setupEventListeners();
  }

  // ==================== Core Methods ====================

  async request(config) {
    // Merge with default config
    const fullConfig = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-Token': this.csrfToken
      },
      ...config,
      headers: {
        ...config.headers
      }
    };

    // Add auth header if available
    if (this.authToken) {
      fullConfig.headers.Authorization = `Bearer ${this.authToken}`;
    }

    // Generate cache key
    const cacheKey = securityUtils.generateKey({
      url: fullConfig.url,
      body: fullConfig.body,
      method: fullConfig.method
    });

    // Check cache for GET requests
    if (fullConfig.method === 'GET' && fullConfig.cache !== false) {
      const cached = cache.get(cacheKey);
      if (cached) {
        logger.debug('Cache hit', { key: cacheKey });
        return cached;
      }
    }

    // Execute request interceptors
    const interceptedRequest = await this._executeRequestInterceptors(fullConfig);

    let attempt = 0;
    let response;

    while (attempt <= MAX_RETRIES) {
      try {
        response = await this._fetchWithTimeout(
          `${API_BASE_URL}${interceptedRequest.url}`,
          interceptedRequest
        );

        // Handle 401 Unauthorized
        if (response.status === 401) {
          throw new Error('Unauthorized');
        }

        // Handle 429 Rate Limit
        if (response.status === 429) {
          const retryAfter = response.headers.get('Retry-After') || RETRY_DELAY;
          await new Promise(resolve => setTimeout(resolve, retryAfter));
          continue;
        }

        const data = await this._parseResponse(response);

        // Execute response interceptors
        const interceptedResponse = await this._executeResponseInterceptors({
          ...response,
          data
        });

        // Cache successful GET responses
        if (fullConfig.method === 'GET' && response.ok && fullConfig.cache !== false) {
          cache.set(cacheKey, interceptedResponse.data, {
            ttl: fullConfig.cacheTTL || CACHE_TTL
          });
        }

        return interceptedResponse.data;
      } catch (error) {
        attempt++;
        logger.error(`API Request failed (attempt ${attempt})`, error);

        if (attempt > MAX_RETRIES) {
          eventBus.emit('apiRequestFailed', {
            config: fullConfig,
            error,
            attempt
          });
          throw error;
        }

        // Refresh token if 401 and we have a refresh token
        if (error.message === 'Unauthorized' && storage.get('refresh_token')) {
          try {
            await this._refreshToken();
            // Update auth header for retry
            interceptedRequest.headers.Authorization = `Bearer ${this.authToken}`;
          } catch (refreshError) {
            eventBus.emit('authTokenRefreshFailed', refreshError);
            throw refreshError;
          }
        }

        // Exponential backoff
        await new Promise(resolve => 
          setTimeout(resolve, RETRY_DELAY * Math.pow(2, attempt))
        );
      }
    }
  }

  // ==================== Helper Methods ====================

  async _fetchWithTimeout(url, config, timeout = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  async _parseResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      return response.json();
    } else if (contentType?.includes('text/')) {
      return response.text();
    } else {
      return response.blob();
    }
  }

  async _refreshToken() {
    const refreshToken = storage.get('refresh_token');
    if (!refreshToken) throw new Error('No refresh token available');

    const response = await this._fetchWithTimeout(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    });

    if (!response.ok) {
      throw new Error('Token refresh failed');
    }

    const { token } = await response.json();
    this.setAuthToken(token);
    return token;
  }

  _loadAuthToken() {
    this.authToken = storage.get('auth_token');
  }

  // ==================== Interceptors ====================

  addRequestInterceptor(interceptor) {
    this.interceptors.request.push(interceptor);
  }

  addResponseInterceptor(interceptor) {
    this.interceptors.response.push(interceptor);
  }

  async _executeRequestInterceptors(config) {
    let processedConfig = { ...config };

    for (const interceptor of this.interceptors.request) {
      processedConfig = await interceptor(processedConfig);
    }

    return processedConfig;
  }

  async _executeResponseInterceptors(response) {
    let processedResponse = { ...response };

    for (const interceptor of this.interceptors.response) {
      processedResponse = await interceptor(processedResponse);
    }

    return processedResponse;
  }

  // ==================== Event Handlers ====================

  _setupEventListeners() {
    eventBus.on('authTokenChanged', (token) => {
      this.setAuthToken(token);
    });

    eventBus.on('logout', () => {
      this.clearAuthToken();
    });
  }

  // ==================== Public Interface ====================

  setAuthToken(token) {
    this.authToken = token;
    storage.set('auth_token', token);
  }

  clearAuthToken() {
    this.authToken = null;
    storage.remove('auth_token');
  }

  get(url, config = {}) {
    return this.request({
      url,
      method: 'GET',
      ...config
    });
  }

  post(url, data, config = {}) {
    return this.request({
      url,
      method: 'POST',
      body: JSON.stringify(data),
      ...config
    });
  }

  put(url, data, config = {}) {
    return this.request({
      url,
      method: 'PUT',
      body: JSON.stringify(data),
      ...config
    });
  }

  patch(url, data, config = {}) {
    return this.request({
      url,
      method: 'PATCH',
      body: JSON.stringify(data),
      ...config
    });
  }

  delete(url, config = {}) {
    return this.request({
      url,
      method: 'DELETE',
      ...config
    });
  }
}

// Singleton instance
const api = new ApiClient();

// Default interceptors
api.addRequestInterceptor(async (config) => {
  // Sanitize all request bodies
  if (config.body) {
    try {
      const parsed = JSON.parse(config.body);
      const sanitized = securityUtils.deepSanitize(parsed);
      config.body = JSON.stringify(sanitized);
    } catch (e) {
      logger.warn('Failed to sanitize request body', e);
    }
  }
  return config;
});

api.addResponseInterceptor(async (response) => {
  // Log API errors
  if (!response.ok) {
    logger.error('API Error', {
      status: response.status,
      url: response.url,
      data: response.data
    });
  }
  return response;
});

export default api;