/**
 * Unified notification service
 * @module services/notification/notificationService
 * @requires utils/eventBus
 * @requires utils/storage
 * @requires utils/logger
 */

import eventBus from '../../utils/eventBus';
import storage from '../../utils/storage';
import { logger } from '../../utils/logger';

const NOTIFICATION_STORAGE_KEY = 'ct_notifications';
const PUSH_PERMISSION_KEY = 'ct_push_permission';

const notificationService = {
  // Configuración
  config: {
    maxStoredNotifications: 100,
    defaultTTL: 7 * 24 * 60 * 60 * 1000 // 1 semana en ms
  },

  /**
   * Initialize notification service
   */
  init() {
    this._cleanExpiredNotifications();
    this._setupEventListeners();
    
    // Request push permission on first interaction
    document.addEventListener('click', () => {
      this._requestPushPermission().catch(err => {
        logger.warn('Push permission request failed:', err);
      });
    }, { once: true });
  },

  /**
   * Add new notification
   * @param {Object} notification 
   * @param {string} notification.title - Título corto
   * @param {string} notification.message - Contenido detallado
   * @param {string} [notification.type] - Tipo: info|warning|error|success
   * @param {number} [notification.ttl] - Tiempo de vida en ms
   * @param {boolean} [notification.persistent] - Si se debe guardar en historial
   */
  add(notification) {
    const fullNotification = {
      ...notification,
      id: Date.now().toString(36) + Math.random().toString(36).substring(2),
      timestamp: new Date().toISOString(),
      read: false,
      ttl: notification.persistent ? undefined : (notification.ttl || this.config.defaultTTL)
    };

    // Guardar en almacenamiento si es persistente
    if (notification.persistent) {
      const notifications = storage.get(NOTIFICATION_STORAGE_KEY) || [];
      notifications.unshift(fullNotification);
      
      // Mantener solo las más recientes
      if (notifications.length > this.config.maxStoredNotifications) {
        notifications.length = this.config.maxStoredNotifications;
      }
      
      storage.set(NOTIFICATION_STORAGE_KEY, notifications);
    }

    // Mostrar notificación
    this._showNotification(fullNotification);
  },

  /**
   * Get stored notifications
   * @returns {Array} Notificaciones almacenadas
   */
  getAll() {
    return storage.get(NOTIFICATION_STORAGE_KEY) || [];
  },

  /**
   * Mark notification as read
   * @param {string} notificationId 
   */
  markAsRead(notificationId) {
    const notifications = this.getAll();
    const index = notifications.findIndex(n => n.id === notificationId);
    
    if (index !== -1) {
      notifications[index].read = true;
      storage.set(NOTIFICATION_STORAGE_KEY, notifications);
      eventBus.emit('notificationRead', notificationId);
    }
  },

  /**
   * Clear all notifications
   */
  clearAll() {
    storage.set(NOTIFICATION_STORAGE_KEY, []);
    eventBus.emit('notificationsCleared');
  },

  // Métodos internos
  _showNotification(notification) {
    // Mostrar UI notification
    eventBus.emit('showNotification', notification);
    
    // Mostrar push notification si está permitido
    if (Notification.permission === 'granted') {
      this._showPushNotification(notification);
    }
  },

  _showPushNotification(notification) {
    const options = {
      body: notification.message,
      icon: '/icons/notification-icon.png',
      badge: '/icons/badge.png',
      data: { notificationId: notification.id }
    };
    
    const pushNotif = new Notification(notification.title, options);
    
    pushNotif.onclick = (event) => {
      event.preventDefault();
      eventBus.emit('notificationClicked', notification.id);
      window.focus();
    };
  },

  async _requestPushPermission() {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      storage.set(PUSH_PERMISSION_KEY, permission);
      return permission;
    }
    return Notification.permission;
  },

  _cleanExpiredNotifications() {
    const notifications = this.getAll();
    const now = Date.now();
    
    const validNotifications = notifications.filter(n => {
      return !n.ttl || (now - new Date(n.timestamp).getTime()) < n.ttl;
    });
    
    if (validNotifications.length !== notifications.length) {
      storage.set(NOTIFICATION_STORAGE_KEY, validNotifications);
    }
  },

  _setupEventListeners() {
    // Escuchar eventos del sistema para mostrar notificaciones
    eventBus.on('transactionCompleted', (tx) => {
      this.add({
        title: 'Transacción completada',
        message: `Tu transacción ${tx.type} fue confirmada`,
        type: 'success',
        persistent: true
      });
    });
    
    // Más listeners según necesidades...
  }
};

// Auto-inicialización
notificationService.init();

export default notificationService;