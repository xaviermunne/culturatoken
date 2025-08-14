/**
 * Unified authentication service
 * @module services/auth/authService
 * @requires ./tokenService
 * @requires ./walletServices
 * @requires ../utils/storage
 */

import { tokenService } from './tokenService';
import { walletServices } from './walletServices';
import storage from '../../utils/storage';
import { api } from '../../utils/api';
import { logger } from '../../utils/logger';

const AUTH_STORAGE_KEY = 'ct_auth_data';

const authService = {
  /**
   * Unified login method
   * @param {Object} params
   * @param {string} params.provider - 'metamask'|'phantom'|'custodial'
   * @param {Object} params.credentials - Provider-specific credentials
   * @returns {Promise<Object>} Auth data
   */
  async login({ provider, credentials }) {
    try {
      let authData;
      
      // Wallet-based auth
      if (provider === 'metamask' || provider === 'phantom') {
        const { signature, walletAddress } = await walletServices.connect(provider);
        authData = await api.post('/auth/wallet', {
          provider,
          signature,
          walletAddress,
          ...credentials
        });
      } 
      // Custodial auth (email/password)
      else if (provider === 'custodial') {
        authData = await api.post('/auth/custodial', credentials);
      }

      // Store auth data securely
      if (authData?.token) {
        tokenService.setToken(authData.token);
        storage.set(AUTH_STORAGE_KEY, {
          user: authData.user,
          provider,
          lastLogin: new Date().toISOString()
        });
        
        logger.log('Auth success', { provider, userId: authData.user.id });
        return authData;
      }

      throw new Error('Invalid auth response');
    } catch (error) {
      logger.error('Login failed', error);
      throw error;
    }
  },

  /**
   * Logout current session
   */
  logout() {
    tokenService.clearToken();
    storage.remove(AUTH_STORAGE_KEY);
    api.setAuthHeader(null);
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated() {
    return tokenService.hasValidToken();
  },

  /**
   * Get current auth data
   * @returns {Object|null}
   */
  getAuthData() {
    return storage.get(AUTH_STORAGE_KEY) || null;
  },

  /**
   * Initialize auth state on app load
   */
  async initialize() {
    const token = tokenService.getToken();
    if (token) {
      api.setAuthHeader(token);
      try {
        // Validate token and refresh if needed
        const isValid = await tokenService.verifyToken(token);
        if (!isValid) {
          await this.refreshToken();
        }
      } catch (error) {
        this.logout();
      }
    }
  },

  /**
   * Refresh expired token
   */
  async refreshToken() {
    try {
      const newToken = await api.post('/auth/refresh');
      tokenService.setToken(newToken);
      return newToken;
    } catch (error) {
      this.logout();
      throw error;
    }
  }
};

export default authService;