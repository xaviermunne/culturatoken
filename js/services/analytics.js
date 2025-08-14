// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\analytics.js

/**
 * Servicio de analítica y seguimiento de eventos
 */

const ANALYTICS_ENABLED = process.env.NODE_ENV === 'production';
const API_ENDPOINT = 'https://analytics.culturatoken.com/v1/track';

// Eventos core de la aplicación
const CORE_EVENTS = {
  WALLET_CONNECT: 'wallet_connect',
  INVESTMENT_MADE: 'investment_made',
  ROYALTIES_CLAIMED: 'royalties_claimed',
  UI_INTERACTION: 'ui_interaction'
};

// Configuración inicial
let analyticsConfig = {
  userId: null,
  sessionId: generateSessionId(),
  appVersion: '1.0.0',
  trackingConsent: false
};

/**
 * Inicializar servicio de analítica
 * @param {string} userId - ID de usuario
 * @param {boolean} consent - Consentimiento de tracking
 */
export const initAnalytics = (userId, consent = false) => {
  analyticsConfig = {
    ...analyticsConfig,
    userId,
    trackingConsent: consent
  };

  if (ANALYTICS_ENABLED && consent) {
    logEvent('session_start', {
      device_type: getDeviceType(),
      screen_resolution: `${window.screen.width}x${window.screen.height}`,
      referrer: document.referrer || 'direct'
    });
  }
};

/**
 * Registrar evento de analítica
 * @param {string} eventType - Tipo de evento (de CORE_EVENTS o custom)
 * @param {object} eventData - Datos adicionales del evento
 */
export const logEvent = async (eventType, eventData = {}) => {
  if (!ANALYTICS_ENABLED || !analyticsConfig.trackingConsent) return;

  try {
    const payload = {
      event_id: generateEventId(),
      event_type: eventType,
      timestamp: new Date().toISOString(),
      user_id: analyticsConfig.userId,
      session_id: analyticsConfig.sessionId,
      app_version: analyticsConfig.appVersion,
      page_url: window.location.href,
      ...sanitizeEventData(eventData)
    };

    // Enviar a servidor de analítica
    if (navigator.sendBeacon) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(API_ENDPOINT, blob);
    } else {
      await fetch(API_ENDPOINT, {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        keepalive: true
      });
    }
  } catch (error) {
    console.error('Error logging event:', error);
  }
};

// Helpers internos
const generateSessionId = () => {
  return 'ses_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const generateEventId = () => {
  return 'evt_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
};

const getDeviceType = () => {
  const userAgent = navigator.userAgent;
  if (/Mobile|Android|iPhone|iPad|iPod/i.test(userAgent)) return 'mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'tablet';
  return 'desktop';
};

const sanitizeEventData = (data) => {
  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    // Eliminar datos sensibles
    if (key.toLowerCase().includes('password') || key.toLowerCase().includes('privatekey')) continue;
    
    // Limitar profundidad de objetos
    if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeEventData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
};

// Trackers específicos
export const trackWalletConnection = (walletType) => {
  logEvent(CORE_EVENTS.WALLET_CONNECT, {
    wallet_type: walletType,
    connection_method: 'web3'
  });
};

export const trackInvestment = (amount, showId, method) => {
  logEvent(CORE_EVENTS.INVESTMENT_MADE, {
    investment_amount: amount,
    show_id: showId,
    payment_method: method,
    currency: 'USDC'
  });
};

export const trackUIInteraction = (elementId, action) => {
  logEvent(CORE_EVENTS.UI_INTERACTION, {
    element_id: elementId,
    action_type: action,
    page_section: getPageSection(elementId)
  });
};

const getPageSection = (elementId) => {
  if (!elementId) return 'unknown';
  if (elementId.includes('header')) return 'header';
  if (elementId.includes('footer')) return 'footer';
  if (elementId.includes('hero')) return 'hero';
  if (elementId.includes('investment')) return 'investments';
  return 'main_content';
};

// Integración con Alpine.js
export const createAnalyticsMixin = () => ({
  trackEvent(eventType, eventData) {
    logEvent(eventType, {
      ...eventData,
      alpine_component: this.$el.id || 'unnamed_component'
    });
  }
});

// Modo desarrollo
if (process.env.NODE_ENV !== 'production') {
  window.debugAnalytics = {
    logEvent,
    getConfig: () => analyticsConfig,
    CORE_EVENTS
  };
}