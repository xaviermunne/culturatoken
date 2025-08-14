/**
 * Main Application Entry Point
 * @module app
 * @requires modules/uiUpdater
 * @requires services/auth/authService
 * @requires services/transaction/transactionService
 * @requires services/notification/notificationService
 * @requires utils/eventBus
 * @requires utils/logger
 */

import uiUpdater from './modules/uiUpdater';
import authService from './services/auth/authService';
import transactionService from './services/transaction/transactionService';
import notificationService from './services/notification/notificationService';
import eventBus from './utils/eventBus';
import { logger } from './utils/logger';

class CulturaTokenApp {
  constructor() {
    this._isInitialized = false;
    this._registerCoreListeners();
  }

  /**
   * Initialize application
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this._isInitialized) return;

    try {
      logger.log('Initializing application...');
      eventBus.emit('appLoading', { loading: true });

      // Ordered initialization chain
      await authService.initialize();
      await transactionService.initialize();
      notificationService.init();
      uiUpdater.init();

      logger.log('Application initialized successfully');
      this._isInitialized = true;
      eventBus.emit('appReady');

    } catch (error) {
      logger.error('Initialization failed:', error);
      eventBus.emit('appError', error);
      throw error;
    } finally {
      eventBus.emit('appLoading', { loading: false });
    }
  }

  /**
   * Register core event listeners
   */
  _registerCoreListeners() {
    // Authentication events
    eventBus.on('authStateChanged', (data) => {
      if (!data.isAuthenticated) {
        transactionService.clearPendingTransactions();
      }
    });

    // Transaction events
    eventBus.on('transactionCompleted', (tx) => {
      notificationService.add({
        title: 'Transaction Completed',
        message: `${tx.type} transaction was confirmed`,
        type: 'success',
        persistent: true
      });
    });

    // Error handling
    eventBus.on('apiError', (error) => {
      notificationService.add({
        title: 'API Error',
        message: error.message,
        type: 'error'
      });
    });

    eventBus.on('appError', (error) => {
      notificationService.add({
        title: 'Application Error',
        message: 'A critical error occurred',
        type: 'error',
        persistent: true
      });
    });
  }

  /**
   * Get initialization status
   * @returns {boolean}
   */
  get isInitialized() {
    return this._isInitialized;
  }
}

// Create singleton instance
const appInstance = new CulturaTokenApp();

// Automatic initialization when DOM is ready
if (document.readyState === 'complete') {
  appInstance.initialize().catch(error => {
    console.error('Failed to initialize:', error);
  });
} else {
  document.addEventListener('DOMContentLoaded', () => {
    appInstance.initialize().catch(error => {
      console.error('Failed to initialize:', error);
    });
  });
}

export default appInstance;