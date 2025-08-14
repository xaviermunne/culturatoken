/**
 * UI Updater - Dynamic DOM management
 * @module modules/uiUpdater
 * @requires utils/formatters
 * @requires utils/eventBus
 * @requires services/transaction/transactionService
 * @requires services/auth/authService
 */

import formatters from '../../utils/formatters';
import eventBus from '../../utils/eventBus';
import transactionService from '../../services/transaction/transactionService';
import authService from '../../services/auth/authService';

const uiUpdater = {
  // Cache DOM elements
  elements: {
    authButtons: document.getElementById('auth-buttons-container'),
    userInfo: document.getElementById('user-info-container'),
    stats: {
      totalInvested: document.getElementById('total-invested'),
      communityCount: document.getElementById('community-count'),
      ctkDistributed: document.getElementById('ctk-distributed')
    },
    showsContainer: document.getElementById('shows-container'),
    loadingIndicator: document.getElementById('loading-indicator')
  },

  /**
   * Initialize UI updater
   */
  init() {
    this._setupEventListeners();
    this._checkAuthState();
    this._loadInitialData();
  },

  /**
   * Set up event listeners
   */
  _setupEventListeners() {
    eventBus.on('authStateChanged', (data) => this._updateAuthUI(data));
    eventBus.on('transactionCompleted', (tx) => this._updateTransactionUI(tx));
    eventBus.on('apiDataLoaded', (data) => this._updateAllUI(data));
    eventBus.on('loadingState', (state) => this._toggleLoading(state));
  },

  /**
   * Check initial auth state
   */
  _checkAuthState() {
    const isAuthenticated = authService.isAuthenticated();
    this._updateAuthUI({ isAuthenticated });
  },

  /**
   * Load initial data
   */
  async _loadInitialData() {
    try {
      this._toggleLoading(true);
      
      const [stats, shows] = await Promise.all([
        this._fetchStats(),
        this._fetchShows()
      ]);

      eventBus.emit('apiDataLoaded', { stats, shows });
    } catch (error) {
      console.error('Error loading initial data:', error);
      this._showError('Error loading data');
    } finally {
      this._toggleLoading(false);
    }
  },

  /**
   * Update authentication-related UI
   * @param {Object} data 
   */
  _updateAuthUI(data) {
    if (data.isAuthenticated) {
      this.elements.authButtons.style.display = 'none';
      this.elements.userInfo.style.display = 'block';
      // Update user info...
    } else {
      this.elements.authButtons.style.display = 'flex';
      this.elements.userInfo.style.display = 'none';
    }
  },

  /**
   * Update transaction-related UI
   * @param {Object} tx 
   */
  _updateTransactionUI(tx) {
    // Update specific transaction elements
    // ...
  },

  /**
   * Update all main UI sections
   * @param {Object} data 
   */
  _updateAllUI(data) {
    const { stats, shows } = data;
    
    // Update stats
    if (stats) {
      this.elements.stats.totalInvested.textContent = 
        formatters.formatCurrency(stats.totalInvested);
      this.elements.stats.communityCount.textContent = 
        stats.investorCount.toLocaleString();
      this.elements.stats.ctkDistributed.textContent = 
        formatters.formatTokens(stats.ctkDistributed);
    }

    // Update shows
    if (shows && shows.length) {
      this._renderShows(shows);
    }
  },

  /**
   * Render shows in the container
   * @param {Array} shows 
   */
  _renderShows(shows) {
    this.elements.showsContainer.innerHTML = '';

    shows.forEach(show => {
      const showElement = document.createElement('div');
      showElement.className = 'show-card';
      showElement.innerHTML = `
        <img src="${show.imageUrl || 'default-show.jpg'}" 
             alt="${show.title || 'Show'}"
             class="show-image">
        <div class="show-content">
          <h3 class="show-title">${show.title || 'Untitled Show'}</h3>
          <p class="show-description">${formatters.truncate(show.description || 'No description available')}</p>
          <div class="show-features">
            <span>📍 ${show.location || 'Location TBD'}</span>
            <span>📅 ${formatters.formatDate(show.date)}</span>
            <span>🎟 ${show.ticketsAvailable ?? 'N/A'} available</span>
          </div>
        </div>
      `;
      this.elements.showsContainer.appendChild(showElement);
    });
  },

  /**
   * Toggle loading state
   * @param {boolean} isLoading 
   */
  _toggleLoading(isLoading) {
    this.elements.loadingIndicator.style.display = isLoading ? 'block' : 'none';
  },

  /**
   * Show error message
   * @param {string} message 
   */
  _showError(message) {
    // Implement error display logic
    console.error('UI Error:', message);
  },

  /**
   * Fetch stats data
   */
  async _fetchStats() {
    // Implement stats fetching
    return { /*...*/ };
  },

  /**
   * Fetch shows data
   */
  async _fetchShows() {
    // Implement shows fetching
    return [ /*...*/ ];
  }
};

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => uiUpdater.init());

export default uiUpdater;