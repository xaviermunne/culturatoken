// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\storageHelpers.js

/**
 * Helpers para manejo avanzado de almacenamiento
 */

// TTL (Time To Live) para items expirables
export const createTTLStorage = (defaultTTL = 3600000) => ({
  async setItem(key, value, ttl = defaultTTL) {
    await secureStorage.setItem(key, {
      value,
      expiresAt: Date.now() + ttl
    });
  },
  
  async getItem(key) {
    const item = await secureStorage.getItem(key);
    if (!item) return null;
    
    if (item.expiresAt && Date.now() > item.expiresAt) {
      secureStorage.removeItem(key);
      return null;
    }
    
    return item.value;
  }
});

// Namespacing para evitar colisiones
export const createNamespacedStorage = (namespace) => ({
  async setItem(key, value) {
    return secureStorage.setItem(`${namespace}:${key}`, value);
  },
  
  async getItem(key) {
    return secureStorage.getItem(`${namespace}:${key}`);
  },
  
  removeItem(key) {
    return secureStorage.removeItem(`${namespace}:${key}`);
  }
});

// Serialización especial para BigInt y otros tipos
export const safeSerializer = {
  stringify(value) {
    return JSON.stringify(value, (_, val) => {
      if (typeof val === 'bigint') {
        return val.toString() + 'n';
      }
      return val;
    });
  },
  
  parse(value) {
    return JSON.parse(value, (_, val) => {
      if (typeof val === 'string' && /^\d+n$/.test(val)) {
        return BigInt(val.slice(0, -1));
      }
      return val;
    });
  }
};