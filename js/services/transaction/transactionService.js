/**
 * Blockchain transaction service
 * @module services/transaction/transactionService
 * @requires utils/api
 * @requires utils/logger
 * @requires utils/storage
 * @requires utils/eventBus
 */

import { api } from '../../utils/api';
import { logger } from '../../utils/logger';
import storage from '../../utils/storage';
import eventBus from '../../utils/eventBus';

const TX_STORAGE_KEY = 'ct_transaction_history';
const PENDING_TX_KEY = 'ct_pending_transactions';

const transactionService = {
  /**
   * Submit new transaction
   * @param {Object} txData - Transaction data
   * @param {string} txData.type - Transaction type
   * @param {Object} txData.details - Transaction details
   * @returns {Promise<Object>} Transaction receipt
   */
  async submitTransaction(txData) {
    try {
      // Add metadata
      const txWithMeta = {
        ...txData,
        timestamp: new Date().toISOString(),
        status: 'pending'
      };

      // Store in pending transactions
      const pendingTxs = storage.get(PENDING_TX_KEY) || [];
      pendingTxs.push(txWithMeta);
      storage.set(PENDING_TX_KEY, pendingTxs);

      // Emit event
      eventBus.emit('transactionPending', txWithMeta);

      // Submit to backend
      const response = await api.post('/transactions', txData);

      // Update status
      await this.updateTransactionStatus({
        txId: response.txId,
        status: 'completed',
        receipt: response.receipt
      });

      return response;
    } catch (error) {
      logger.error('Transaction failed', error);
      
      // Update status if txId exists
      if (error.txId) {
        await this.updateTransactionStatus({
          txId: error.txId,
          status: 'failed',
          error: error.message
        });
      }

      throw error;
    }
  },

  /**
   * Update transaction status
   * @param {Object} params
   * @param {string} params.txId - Transaction ID
   * @param {string} params.status - New status
   * @param {Object} [params.receipt] - Transaction receipt
   * @param {Object} [params.error] - Error details
   */
  async updateTransactionStatus({ txId, status, receipt, error }) {
    const history = storage.get(TX_STORAGE_KEY) || [];
    const pendingTxs = storage.get(PENDING_TX_KEY) || [];

    // Find in pending transactions
    const txIndex = pendingTxs.findIndex(tx => tx.txId === txId);
    if (txIndex !== -1) {
      const updatedTx = {
        ...pendingTxs[txIndex],
        status,
        receipt,
        error,
        completedAt: status !== 'pending' ? new Date().toISOString() : null
      };

      // Move to history if completed/failed
      if (status !== 'pending') {
        history.unshift(updatedTx); // Add to beginning
        pendingTxs.splice(txIndex, 1); // Remove from pending
        
        // Emit completion event
        eventBus.emit(`transaction${status.charAt(0).toUpperCase() + status.slice(1)}`, updatedTx);
      }

      // Update storage
      storage.set(TX_STORAGE_KEY, history);
      storage.set(PENDING_TX_KEY, pendingTxs);
    }
  },

  /**
   * Get transaction history
   * @param {Object} [filters]
   * @returns {Array} Transaction history
   */
  getTransactionHistory(filters = {}) {
    let history = storage.get(TX_STORAGE_KEY) || [];
    
    // Apply filters
    if (filters.type) {
      history = history.filter(tx => tx.type === filters.type);
    }
    if (filters.status) {
      history = history.filter(tx => tx.status === filters.status);
    }
    if (filters.limit) {
      history = history.slice(0, filters.limit);
    }

    return history;
  },

  /**
   * Get pending transactions
   * @returns {Array} Pending transactions
   */
  getPendingTransactions() {
    return storage.get(PENDING_TX_KEY) || [];
  },

  /**
   * Initialize transaction service
   */
  async initialize() {
    // Check pending transactions on startup
    const pendingTxs = this.getPendingTransactions();
    if (pendingTxs.length > 0) {
      pendingTxs.forEach(async (tx) => {
        try {
          const { status } = await api.get(`/transactions/${tx.txId}/status`);
          await this.updateTransactionStatus({
            txId: tx.txId,
            status
          });
        } catch (error) {
          logger.error('Failed to check tx status', error);
        }
      });
    }
  }
};

// Initialize on import
transactionService.initialize();

export default transactionService;