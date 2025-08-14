// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\analyticsHelpers.js

/**
 * Helpers para métricas de rendimiento
 */

export const trackPageLoadPerformance = () => {
  if (!window.performance) return;

  const [navigationEntry] = performance.getEntriesByType('navigation');
  if (!navigationEntry) return;

  const metrics = {
    dns_lookup: navigationEntry.domainLookupEnd - navigationEntry.domainLookupStart,
    tcp_connect: navigationEntry.connectEnd - navigationEntry.connectStart,
    ttfb: navigationEntry.responseStart - navigationEntry.requestStart,
    page_load: navigationEntry.loadEventEnd - navigationEntry.startTime,
    dom_ready: navigationEntry.domComplete - navigationEntry.domLoading
  };

  logEvent('performance_metrics', {
    ...metrics,
    resource_count: performance.getEntriesByType('resource').length
  });
};

/**
 * Trackear errores globales
 */
export const setupErrorTracking = () => {
  window.addEventListener('error', (event) => {
    logEvent('global_error', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error_stack: event.error?.stack
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    logEvent('unhandled_rejection', {
      reason: event.reason?.message || String(event.reason)
    });
  });
};

/**
 * Trackear cambios de ruta (SPA)
 */
export const trackRouteChanges = (router) => {
  if (!router) return;

  let lastRoute = null;

  router.afterEach((to, from) => {
    logEvent('route_change', {
      from: from.path,
      to: to.path,
      route_duration: lastRoute ? Date.now() - lastRoute.timestamp : 0
    });

    lastRoute = {
      path: to.path,
      timestamp: Date.now()
    };
  });
};