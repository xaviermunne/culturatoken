// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\logger.js

/**
 * Sistema de logging centralizado para la aplicación
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  CRITICAL: 4
};

const LOG_LEVEL_NAMES = {
  0: 'DEBUG',
  1: 'INFO',
  2: 'WARN',
  3: 'ERROR',
  4: 'CRITICAL'
};

// Configuración inicial
let config = {
  logLevel: process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG,
  maxMessageLength: 1000,
  logToConsole: true,
  logToServer: process.env.NODE_ENV === 'production',
  serverEndpoint: '/api/logs',
  appName: 'CulturalToken',
  version: '1.0.0'
};

// Buffer para logs
let logBuffer = [];
const MAX_BUFFER_SIZE = 50;
const FLUSH_INTERVAL = 30000; // 30 segundos

/**
 * Configurar el logger
 * @param {object} newConfig - Nueva configuración
 */
export const configureLogger = (newConfig) => {
  config = { ...config, ...newConfig };
  
  // Iniciar flusher periódico si está habilitado
  if (config.logToServer) {
    setInterval(flushLogs, FLUSH_INTERVAL);
    window.addEventListener('beforeunload', flushLogs);
  }
};

/**
 * Logger principal
 * @param {number} level - Nivel de log
 * @param {string} message - Mensaje a loggear
 * @param {object} [data] - Datos adicionales
 */
const log = (level, message, data = {}) => {
  if (level < config.logLevel) return;

  const timestamp = new Date().toISOString();
  const logEntry = {
    level,
    levelName: LOG_LEVEL_NAMES[level],
    message: message.length > config.maxMessageLength 
      ? message.substring(0, config.maxMessageLength) + '...' 
      : message,
    data: sanitizeLogData(data),
    timestamp,
    app: config.appName,
    version: config.version,
    url: window.location.pathname,
    userAgent: navigator.userAgent
  };

  // Loggear a consola
  if (config.logToConsole) {
    const consoleMethod = 
      level >= LOG_LEVELS.ERROR ? 'error' :
      level >= LOG_LEVELS.WARN ? 'warn' :
      level >= LOG_LEVELS.INFO ? 'info' : 'debug';
    
    console[consoleMethod](`[${logEntry.levelName}] ${logEntry.message}`, logEntry.data);
  }

  // Bufferizar logs para el servidor
  if (config.logToServer) {
    logBuffer.push(logEntry);
    if (logBuffer.length >= MAX_BUFFER_SIZE) {
      flushLogs();
    }
  }
};

/**
 * Enviar logs al servidor
 */
const flushLogs = async () => {
  if (logBuffer.length === 0) return;

  const logsToSend = [...logBuffer];
  logBuffer = [];

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(logsToSend)], { type: 'application/json' });
      navigator.sendBeacon(config.serverEndpoint, blob);
    } else {
      await fetch(config.serverEndpoint, {
        method: 'POST',
        body: JSON.stringify(logsToSend),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      });
    }
  } catch (error) {
    console.error('Error enviando logs:', error);
    // Rebufferizar logs fallidos (sin duplicados)
    logBuffer = [...logsToSend, ...logBuffer].slice(0, MAX_BUFFER_SIZE * 2);
  }
};

/**
 * Sanitizar datos de log para evitar información sensible
 */
const sanitizeLogData = (data) => {
  if (!data || typeof data !== 'object') return data;

  const sensitiveKeys = ['password', 'token', 'secret', 'privateKey', 'creditCard'];
  const sanitized = { ...data };

  for (const key in sanitized) {
    if (sensitiveKeys.some(sk => key.toLowerCase().includes(sk))) {
      sanitized[key] = '***REDACTED***';
    }

    if (typeof sanitized[key] === 'object') {
      sanitized[key] = sanitizeLogData(sanitized[key]);
    }
  }

  return sanitized;
};

// Métodos públicos
export const logger = {
  debug: (message, data) => log(LOG_LEVELS.DEBUG, message, data),
  info: (message, data) => log(LOG_LEVELS.INFO, message, data),
  warn: (message, data) => log(LOG_LEVELS.WARN, message, data),
  error: (message, data) => log(LOG_LEVELS.ERROR, message, data),
  critical: (message, data) => log(LOG_LEVELS.CRITICAL, message, data),
  
  // Para errores capturados
  captureError: (error, context = {}) => {
    const message = error.message || 'Unknown error';
    const stack = error.stack || '';
    
    log(LOG_LEVELS.ERROR, message, { 
      ...context, 
      stack,
      errorName: error.name 
    });
    
    if (config.logToServer) {
      flushLogs(); // Enviar inmediatamente errores críticos
    }
  }
};

// Integración con Alpine.js
export const createLoggerMixin = () => ({
  $log: logger,
  
  onError(error, context = {}) {
    this.$log.captureError(error, {
      ...context,
      component: this.$el.id || 'anonymous',
      state: this.$data
    });
    
    // Mostrar feedback al usuario si es error crítico
    if (error.isCritical) {
      this.showError('Ocurrió un error crítico. Por favor recarga la página.');
    }
  }
});

// Inicialización automática en producción
if (process.env.NODE_ENV === 'production') {
  configureLogger({
    logLevel: LOG_LEVELS.INFO,
    logToConsole: false
  });
}