/**
 * Authentication Service - Gestión unificada de autenticación
 * @module services/auth/authService
 * @requires utils/storage
 * @requires utils/eventBus
 * @requires utils/api
 * @requires utils/logger
 */

import storage from '../../utils/storage';
import eventBus from '../../utils/eventBus';
import { api } from '../../utils/api';
import { logger } from '../../utils/logger';

// Constantes
const AUTH_STORAGE_KEY = 'ct_auth_data';
const TOKEN_REFRESH_INTERVAL = 15 * 60 * 1000; // 15 minutos

class AuthService {
  constructor() {
    this.currentUser = null;
    this.tokenRefreshTimer = null;
    this._init();
  }

  /**
   * Inicialización del servicio
   * @private
   */
  async _init() {
    await this._loadAuthData();
    this._setupEventListeners();
  }

  /**
   * Cargar datos de autenticación desde storage
   * @private
   */
  async _loadAuthData() {
    try {
      const authData = storage.get(AUTH_STORAGE_KEY);
      if (authData) {
        this.currentUser = authData.user;
        api.setAuthHeader(authData.token);
        this._scheduleTokenRefresh(authData.token);
        logger.log('Auth data loaded from storage');
      }
    } catch (error) {
      logger.error('Error loading auth data:', error);
      this._clearAuth();
    }
  }

  /**
   * Configurar listeners de eventos
   * @private
   */
  _setupEventListeners() {
    eventBus.on('logout', () => this.logout());
    eventBus.on('tokenExpired', () => this._handleTokenExpiration());
  }

  /**
   * Iniciar sesión con email/contraseña
   * @param {string} email
   * @param {string} password
   * @returns {Promise<Object>}
   */
  async loginWithEmail(email, password) {
    try {
      const response = await api.post('/auth/login', { email, password });
      await this._handleAuthSuccess(response);
      return response;
    } catch (error) {
      logger.error('Email login failed:', error);
      throw error;
    }
  }

  /**
   * Iniciar sesión con wallet (Metamask/Phantom)
   * @param {string} provider - 'metamask'|'phantom'
   * @returns {Promise<Object>}
   */
  async loginWithWallet(provider) {
    try {
      const { signature, walletAddress } = await this._getWalletSignature(provider);
      const response = await api.post('/auth/wallet', { 
        provider, 
        signature, 
        walletAddress 
      });
      await this._handleAuthSuccess(response);
      return response;
    } catch (error) {
      logger.error(`${provider} login failed:`, error);
      throw error;
    }
  }

  /**
   * Registrar nuevo usuario
   * @param {Object} userData
   * @returns {Promise<Object>}
   */
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      await this._handleAuthSuccess(response);
      return response;
    } catch (error) {
      logger.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Cerrar sesión
   */
  logout() {
    this._clearAuth();
    eventBus.emit('authStateChanged', { isAuthenticated: false });
    logger.log('User logged out');
  }

  /**
   * Verificar estado de autenticación
   * @returns {boolean}
   */
  isAuthenticated() {
    return !!this.currentUser && !!api.getAuthHeader();
  }

  /**
   * Obtener usuario actual
   * @returns {Object|null}
   */
  getUser() {
    return this.currentUser;
  }

  /**
   * Manejar éxito en autenticación
   * @private
   * @param {Object} response
   */
  async _handleAuthSuccess(response) {
    const { token, user } = response;
    
    this.currentUser = user;
    api.setAuthHeader(token);
    storage.set(AUTH_STORAGE_KEY, { token, user });
    
    this._scheduleTokenRefresh(token);
    eventBus.emit('authStateChanged', { isAuthenticated: true, user });
    
    logger.log('Auth successful', { userId: user.id });
  }

  /**
   * Obtener firma de wallet
   * @private
   * @param {string} provider
   * @returns {Promise<Object>}
   */
  async _getWalletSignature(provider) {
    // Implementación específica para cada wallet
    const walletMethods = {
      metamask: () => this._signWithMetamask(),
      phantom: () => this._signWithPhantom()
    };

    if (!walletMethods[provider]) {
      throw new Error(`Provider ${provider} no soportado`);
    }

    return walletMethods[provider]();
  }

  /**
   * Firmar con Metamask
   * @private
   * @returns {Promise<Object>}
   */
  async _signWithMetamask() {
    if (!window.ethereum) {
      throw new Error('Metamask no detectado');
    }

    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const walletAddress = accounts[0];
    
    const message = `Autenticación CulturaToken - ${Date.now()}`;
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, walletAddress]
    });

    return { signature, walletAddress, message };
  }

  /**
   * Firmar con Phantom
   * @private
   * @returns {Promise<Object>}
   */
  async _signWithPhantom() {
    if (!window.solana || !window.solana.isPhantom) {
      throw new Error('Phantom Wallet no detectada');
    }

    const response = await window.solana.connect();
    const walletAddress = response.publicKey.toString();
    
    const message = `Autenticación CulturaToken - ${Date.now()}`;
    const encoder = new TextEncoder();
    const encodedMessage = encoder.encode(message);
    const signedMessage = await window.solana.signMessage(encodedMessage);
    const signature = signedMessage.signature.toString('hex');

    return { signature, walletAddress, message };
  }

  /**
   * Programar refresco de token
   * @private
   * @param {string} token
   */
  _scheduleTokenRefresh(token) {
    this._clearTokenRefresh();
    
    this.tokenRefreshTimer = setInterval(async () => {
      try {
        const newToken = await this._refreshToken(token);
        api.setAuthHeader(newToken);
        storage.set(AUTH_STORAGE_KEY, { 
          token: newToken, 
          user: this.currentUser 
        });
      } catch (error) {
        logger.error('Token refresh failed:', error);
        this._handleTokenExpiration();
      }
    }, TOKEN_REFRESH_INTERVAL);
  }

  /**
   * Refrescar token
   * @private
   * @param {string} token
   * @returns {Promise<string>}
   */
  async _refreshToken(token) {
    try {
      const response = await api.post('/auth/refresh', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.token;
    } catch (error) {
      logger.error('Token refresh failed:', error);
      throw error;
    }
  }

  /**
   * Manejar expiración de token
   * @private
   */
  _handleTokenExpiration() {
    this._clearTokenRefresh();
    this._clearAuth();
    eventBus.emit('authStateChanged', { isAuthenticated: false });
    eventBus.emit('tokenExpired');
  }

  /**
   * Limpiar timer de refresco
   * @private
   */
  _clearTokenRefresh() {
    if (this.tokenRefreshTimer) {
      clearInterval(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }

  /**
   * Limpiar datos de autenticación
   * @private
   */
  _clearAuth() {
    this.currentUser = null;
    api.clearAuthHeader();
    storage.remove(AUTH_STORAGE_KEY);
    this._clearTokenRefresh();
  }
}

// Exportar instancia singleton
const authService = new AuthService();
export default authService;