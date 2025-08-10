// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\api.js

/**
 * Cliente API para conexión con backend
 */

const BASE_URL = process.env.API_BASE_URL || 'https://api.culturatoken.com/v1';
const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Cache para tokens y sesiones
let authToken = null;
let refreshTokenRequest = null;

/**
 * Cliente HTTP base con manejo de errores
 */
const httpClient = async (endpoint, config = {}) => {
  const { headers = {}, payload, method = 'GET', ...customConfig } = config;
  
  const requestConfig = {
    method,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
      ...(authToken && { 'Authorization': `Bearer ${authToken}` })
    },
    ...customConfig,
    ...(payload && { body: JSON.stringify(payload) })
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, requestConfig);
    
    // Manejo de respuestas no exitosas
    if (!response.ok) {
      if (response.status === 401) {
        return handleUnauthorized(endpoint, config);
      }
      throw await parseError(response);
    }

    return await parseResponse(response);
  } catch (error) {
    logApiError(error, endpoint, config);
    throw error;
  }
};

// Helpers para el cliente API
const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type');
  if (contentType?.includes('application/json')) {
    return response.json();
  }
  return response.text();
};

const parseError = async (response) => {
  try {
    const errorData = await response.json();
    return new ApiError({
      status: response.status,
      message: errorData.message || 'Error en la solicitud',
      code: errorData.code || 'api_error',
      details: errorData.details
    });
  } catch {
    return new ApiError({
      status: response.status,
      message: response.statusText || 'Error en la solicitud',
      code: `http_${response.status}`
    });
  }
};

const logApiError = (error, endpoint, config) => {
  if (process.env.NODE_ENV !== 'production') {
    console.error(`API Error - ${endpoint}:`, error);
  }
  
  // Enviar a servicio de monitoreo (Sentry, etc.)
  if (window.trackError) {
    window.trackError({
      type: 'api_error',
      endpoint,
      method: config.method || 'GET',
      status: error.status,
      message: error.message
    });
  }
};

// Manejo de tokens JWT
export const setAuthToken = (token) => {
  authToken = token;
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
};

export const getAuthToken = () => {
  return authToken || localStorage.getItem('auth_token');
};

const handleUnauthorized = async (endpoint, originalConfig) => {
  // Evitar múltiples solicitudes de refresh
  if (!refreshTokenRequest) {
    refreshTokenRequest = refreshAuthToken();
  }
  
  try {
    const newToken = await refreshTokenRequest;
    setAuthToken(newToken);
    
    // Reintentar la solicitud original
    return httpClient(endpoint, {
      ...originalConfig,
      headers: {
        ...originalConfig.headers,
        'Authorization': `Bearer ${newToken}`
      }
    });
  } catch (error) {
    // Forzar logout si el refresh falla
    if (typeof window.onUnauthorized === 'function') {
      window.onUnauthorized();
    }
    throw error;
  } finally {
    refreshTokenRequest = null;
  }
};

const refreshAuthToken = async () => {
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) throw new Error('No refresh token available');

  const response = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: DEFAULT_HEADERS,
    body: JSON.stringify({ refresh_token: refreshToken })
  });

  if (!response.ok) {
    throw await parseError(response);
  }

  const { token, refresh_token } = await response.json();
  localStorage.setItem('refresh_token', refresh_token);
  return token;
};

// Clase de error personalizada
class ApiError extends Error {
  constructor({ status, message, code, details }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

// Métodos HTTP principales
export const api = {
  get: (endpoint, config = {}) => httpClient(endpoint, { ...config, method: 'GET' }),
  post: (endpoint, payload, config = {}) => httpClient(endpoint, { ...config, method: 'POST', payload }),
  put: (endpoint, payload, config = {}) => httpClient(endpoint, { ...config, method: 'PUT', payload }),
  patch: (endpoint, payload, config = {}) => httpClient(endpoint, { ...config, method: 'PATCH', payload }),
  delete: (endpoint, config = {}) => httpClient(endpoint, { ...config, method: 'DELETE' }),
  
  // Métodos específicos para CulturalToken
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    logout: () => api.post('/auth/logout')
  },
  
  investments: {
    list: () => api.get('/investments'),
    create: (investmentData) => api.post('/investments', investmentData),
    get: (id) => api.get(`/investments/${id}`)
  },
  
  royalties: {
    distributions: () => api.get('/royalties/distributions'),
    claim: (data) => api.post('/royalties/claim', data)
  }
};

// Interceptor para Alpine.js
export const createApiMixin = () => ({
  $api: api,
  
  async $fetch(endpoint, config) {
    try {
      this.$store.appState.loading = true;
      const response = await httpClient(endpoint, config);
      return response;
    } catch (error) {
      this.$store.appState.error = error.message;
      throw error;
    } finally {
      this.$store.appState.loading = false;
    }
  }
});