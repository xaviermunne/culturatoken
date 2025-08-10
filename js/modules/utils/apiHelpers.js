// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\apiHelpers.js

/**
 * Helpers para el cliente API
 */

// Formatear datos para formularios multipart (archivos)
export const formatFormData = (data) => {
  const formData = new FormData();
  
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(item => formData.append(`${key}[]`, item));
    } else if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (typeof value === 'object' && value !== null) {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, value);
    }
  });
  
  return formData;
};

// Timeout para solicitudes
export const withTimeout = (promise, ms = 10000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => 
      setTimeout(() => reject(new ApiError({
        status: 408,
        message: 'Request timeout',
        code: 'timeout_error'
      })), ms)
    )
  ]);
};

// Cancelación de solicitudes
export const createCancellableRequest = () => {
  const controller = new AbortController();
  
  return {
    signal: controller.signal,
    cancel: () => controller.abort()
  };
};

// Cache de solicitudes
const requestCache = new Map();

export const cachedRequest = async (key, requestFn, ttl = 60000) => {
  const cached = requestCache.get(key);
  
  if (cached && Date.now() - cached.timestamp < ttl) {
    return cached.data;
  }
  
  const data = await requestFn();
  requestCache.set(key, { data, timestamp: Date.now() });
  return data;
};

// Limpiar caché
export const clearApiCache = (key) => {
  if (key) {
    requestCache.delete(key);
  } else {
    requestCache.clear();
  }
};