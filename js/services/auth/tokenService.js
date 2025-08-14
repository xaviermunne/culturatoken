// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\auth\tokenService.js

/**
 * Servicio para manejo avanzado de tokens JWT
 */

import { secureStorage } from '../../utils/storage.js';
import { logger } from '../../utils/logger.js';
import { isTokenExpired, decodeToken } from './jwtUtils.js';

// Claves de almacenamiento
const TOKEN_KEYS = {
  ACCESS_TOKEN: 'ctk_access_token',
  REFRESH_TOKEN: 'ctk_refresh_token',
  TOKEN_EXPIRY: 'ctk_token_expiry'
};

// Tiempos de expiración (en segundos)
const TOKEN_EXPIRY_BUFFER = 300; // 5 minutos antes de expirar

export const tokenService = {
  // Almacenar tokens
  setTokens({ accessToken, refreshToken, expiresIn }) {
    try {
      const expiryTime = Date.now() + (expiresIn * 1000) - TOKEN_EXPIRY_BUFFER * 1000;
      
      secureStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
      secureStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
      secureStorage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, expiryTime.toString());
      
      logger.info('Tokens almacenados seguramente');
      return true;
    } catch (error) {
      logger.error('Error almacenando tokens:', error);
      return false;
    }
  },

  // Obtener access token
  getAccessToken() {
    return secureStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  },

  // Obtener refresh token
  getRefreshToken() {
    return secureStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  },

  // Verificar si el token está activo
  isTokenValid() {
    const token = this.getAccessToken();
    if (!token) return false;
    
    const expiryTime = parseInt(secureStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY) || '0');
    return !isTokenExpired(token) && Date.now() < expiryTime;
  },

  // Decodificar token para obtener información del usuario
  getUserFromToken() {
    const token = this.getAccessToken();
    if (!token) return null;
    
    try {
      const decoded = decodeToken(token);
      return {
        id: decoded.sub,
        email: decoded.email,
        roles: decoded.roles || [],
        wallet: decoded.wallet,
        expiresAt: decoded.exp * 1000
      };
    } catch (error) {
      logger.error('Error decodificando token:', error);
      return null;
    }
  },

  // Eliminar tokens (logout)
  clearTokens() {
    secureStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    secureStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    secureStorage.removeItem(TOKEN_KEYS.TOKEN_EXPIRY);
    logger.info('Tokens eliminados');
  },

  // Refrescar token automáticamente
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No hay refresh token disponible');
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        throw new Error('Error refrescando token');
      }

      const { accessToken, refreshToken: newRefreshToken, expiresIn } = await response.json();
      this.setTokens({ accessToken, refreshToken: newRefreshToken, expiresIn });
      
      return accessToken;
    } catch (error) {
      logger.error('Error refrescando token:', error);
      this.clearTokens();
      throw error;
    }
  },

  // Verificar y refrescar token si es necesario
  async verifyToken() {
    if (this.isTokenValid()) {
      return this.getAccessToken();
    }

    try {
      return await this.refreshToken();
    } catch (error) {
      logger.warn('No se pudo renovar el token:', error);
      return null;
    }
  }
};

// Interceptor para Alpine.js
export const createTokenMixin = () => ({
  $token: tokenService,
  
  init() {
    // Verificar token al iniciar componente
    this.$watch('$store.auth.token', (token) => {
      if (!token) {
        this.$router.push('/login');
      }
    });
  }
});