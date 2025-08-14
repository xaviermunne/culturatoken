// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\errorTracking.js

/**
 * Integración con servicios de tracking de errores (Sentry, etc.)
 */

export const initErrorTracking = (dsn, options = {}) => {
  if (!dsn) return;
  
  // Configuración básica para Sentry (ejemplo)
  if (window.Sentry) {
    window.Sentry.init({
      dsn,
      release: options.version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      beforeSend(event) {
        return filterSensitiveData(event);
      }
    });
    
    // Integrar con logger
    logger.captureError = (error, context = {}) => {
      window.Sentry.withScope(scope => {
        for (const [key, value] of Object.entries(context)) {
          scope.setExtra(key, value);
        }
        window.Sentry.captureException(error);
      });
      
      logger.error(error.message, context);
    };
  }
};

const filterSensitiveData = (event) => {
  const sensitiveKeys = ['password', 'token', 'secret'];
  
  // Filtrar breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(bc => {
      if (bc.data) {
        bc.data = sanitizeData(bc.data, sensitiveKeys);
      }
      return bc;
    });
  }
  
  // Filtrar excepciones
  if (event.exception?.values?.[0]?.stacktrace?.frames) {
    event.exception.values[0].stacktrace.frames.forEach(frame => {
      if (frame.vars) {
        frame.vars = sanitizeData(frame.vars, sensitiveKeys);
      }
    });
  }
  
  return event;
};

const sanitizeData = (data, sensitiveKeys) => {
  const sanitized = { ...data };
  for (const key in sanitized) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '***REDACTED***';
    }
  }
  return sanitized;
};