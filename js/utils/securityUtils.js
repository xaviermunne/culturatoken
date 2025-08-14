/**
 * Security utilities for frontend protection
 * @module utils/securityUtils
 * @requires crypto-js
 */

import CryptoJS from 'crypto-js';

const securityUtils = {
  /**
   * Generate CSRF token
   * @returns {string} CSRF token
   */
  generateCSRFToken() {
    const randomBytes = CryptoJS.lib.WordArray.random(32);
    return CryptoJS.enc.Base64.stringify(randomBytes);
  },

  /**
   * Validate CSRF token
   * @param {string} token 
   * @param {string} storedToken 
   * @returns {boolean} Validation result
   */
  validateCSRFToken(token, storedToken) {
    return token && token === storedToken;
  },

  /**
   * XSS sanitization for strings
   * @param {string} input 
   * @returns {string} Sanitized string
   */
  sanitizeString(input) {
    if (typeof input !== 'string') return '';
    
    return input
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  },

  /**
   * Deep sanitization for objects
   * @param {Object} obj 
   * @returns {Object} Sanitized object
   */
  deepSanitize(obj) {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(String(obj));
    }

    const sanitized = Array.isArray(obj) ? [] : {};
    
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = this.deepSanitize(obj[key]);
      }
    }

    return sanitized;
  },

  /**
   * Validate input against schema
   * @param {Object} input 
   * @param {Object} schema 
   * @returns {boolean} Validation result
   */
  validateSchema(input, schema) {
    try {
      if (typeof input !== 'object' || input === null) return false;
      
      for (const key in schema) {
        const rule = schema[key];
        const value = input[key];
        
        // Required check
        if (rule.required && (value === undefined || value === null)) {
          return false;
        }
        
        // Type check
        if (value !== undefined && value !== null) {
          if (rule.type === 'array' && !Array.isArray(value)) return false;
          if (rule.type !== 'array' && typeof value !== rule.type) return false;
          
          // Pattern check for strings
          if (rule.type === 'string' && rule.pattern && !rule.pattern.test(value)) {
            return false;
          }
          
          // Custom validator
          if (rule.validator && !rule.validator(value)) {
            return false;
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('Validation error:', error);
      return false;
    }
  },

  /**
   * Secure string comparison (time-constant)
   * @param {string} a 
   * @param {string} b 
   * @returns {boolean} Comparison result
   */
  secureCompare(a, b) {
    const aBuf = CryptoJS.enc.Utf8.parse(a);
    const bBuf = CryptoJS.enc.Utf8.parse(b);
    const aHex = CryptoJS.enc.Hex.stringify(aBuf);
    const bHex = CryptoJS.enc.Hex.stringify(bBuf);
    
    let mismatch = aHex.length ^ bHex.length;
    
    for (let i = 0; i < Math.max(aHex.length, bHex.length); i++) {
      mismatch |= aHex.charCodeAt(i) ^ bHex.charCodeAt(i);
    }
    
    return mismatch === 0;
  },

  /**
   * Generate secure random string
   * @param {number} length 
   * @returns {string} Random string
   */
  generateRandomString(length = 32) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    let result = '';
    
    const randomValues = new Uint8Array(length);
    crypto.getRandomValues(randomValues);
    
    randomValues.forEach(value => {
      result += chars[value % chars.length];
    });
    
    return result;
  }
};

// Schemas de ejemplo para validación
securityUtils.schemas = {
  userInput: {
    username: {
      type: 'string',
      required: true,
      pattern: /^[a-zA-Z0-9_]{3,20}$/
    },
    email: {
      type: 'string',
      required: true,
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    preferences: {
      type: 'object',
      required: false
    }
  },
  transaction: {
    amount: {
      type: 'number',
      required: true,
      validator: val => val > 0
    },
    recipient: {
      type: 'string',
      required: true,
      pattern: /^0x[a-fA-F0-9]{40}$/
    }
  }
};

export default securityUtils;