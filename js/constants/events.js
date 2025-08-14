/**
 * Global event constants
 * @module constants/events
 */

export const AUTH_EVENTS = {
  STATE_CHANGED: 'authStateChanged',
  LOGIN_SUCCESS: 'authLoginSuccess',
  LOGOUT: 'authLogout',
  TOKEN_REFRESHED: 'authTokenRefreshed',
  TOKEN_EXPIRED: 'authTokenExpired'
};

export const TRANSACTION_EVENTS = {
  PENDING: 'transactionPending',
  COMPLETED: 'transactionCompleted',
  FAILED: 'transactionFailed',
  STATUS_UPDATED: 'transactionStatusUpdated'
};

export const NOTIFICATION_EVENTS = {
  SHOW: 'notificationShow',
  CLICKED: 'notificationClicked',
  READ: 'notificationRead',
  CLEARED: 'notificationsCleared'
};

export const API_EVENTS = {
  REQUEST_FAILED: 'apiRequestFailed',
  UNAUTHORIZED: 'apiUnauthorized',
  RATE_LIMITED: 'apiRateLimited'
};

export const APP_EVENTS = {
  INITIALIZED: 'appInitialized',
  LOADING: 'appLoadingState',
  ERROR: 'appCriticalError'
};

// Export all events as single object
export default {
  ...AUTH_EVENTS,
  ...TRANSACTION_EVENTS,
  ...NOTIFICATION_EVENTS,
  ...API_EVENTS,
  ...APP_EVENTS
};