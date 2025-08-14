/**
 * Global event bus for inter-module communication
 * @module utils/eventBus
 * @example
 * // Emitting events:
 * eventBus.emit('userLoggedIn', { user });
 * 
 * // Listening to events:
 * const unsubscribe = eventBus.on('userLoggedIn', (data) => {});
 * unsubscribe(); // Remove listener
 */

const listeners = new Map();

const eventBus = {
  /**
   * Subscribe to event
   * @param {string} eventName - Event identifier
   * @param {Function} callback - Handler function
   * @returns {Function} Unsubscribe function
   */
  on(eventName, callback) {
    if (!listeners.has(eventName)) {
      listeners.set(eventName, new Set());
    }
    const eventListeners = listeners.get(eventName);
    eventListeners.add(callback);

    return () => eventListeners.delete(callback);
  },

  /**
   * Emit event to all subscribers
   * @param {string} eventName - Event identifier
   * @param {*} [data] - Event payload
   */
  emit(eventName, data) {
    if (listeners.has(eventName)) {
      listeners.get(eventName).forEach(callback => {
        try {
          callback(data);
        } catch (err) {
          console.error(`Error in ${eventName} handler:`, err);
        }
      });
    }
  },

  /**
   * Remove all listeners for event
   * @param {string} eventName 
   */
  off(eventName) {
    listeners.delete(eventName);
  },

  /**
   * Subscribe to event (one-time)
   * @param {string} eventName 
   * @param {Function} callback 
   */
  once(eventName, callback) {
    const onceWrapper = (data) => {
      callback(data);
      this.off(eventName, onceWrapper);
    };
    this.on(eventName, onceWrapper);
  }
};

// Debugging (dev only)
if (import.meta.env.DEV) {
  window.__eventBusDebug = {
    getListeners: () => listeners,
    clearAll: () => listeners.clear()
  };
}

export default eventBus;