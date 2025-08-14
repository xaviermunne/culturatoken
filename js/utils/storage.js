// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\storage.js

/**
 * Wrapper mejorado para almacenamiento local con encriptación opcional
 */

const CRYPTO_ENABLED = typeof window.crypto !== 'undefined' && typeof window.crypto.subtle !== 'undefined';
const STORAGE_TYPES = {
  LOCAL: 'local',
  SESSION: 'session'
};

// Claves de encriptación (deberían inyectarse desde la configuración de la app)
let encryptionKey = null;

/**
 * Generar clave de encriptación derivada de una passphrase
 * @param {string} passphrase 
 */
export const initEncryption = async (passphrase) => {
  if (!CRYPTO_ENABLED) return;
  
  try {
    const encoder = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      encoder.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );
    
    encryptionKey = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt: encoder.encode('CulturalTokenSalt'),
        iterations: 100000,
        hash: 'SHA-256'
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt', 'decrypt']
    );
  } catch (error) {
    console.error('Error inicializando encriptación:', error);
    encryptionKey = null;
  }
};

/**
 * Encriptar datos (AES-GCM)
 */
const encryptData = async (data) => {
  if (!CRYPTO_ENABLED || !encryptionKey) return data;
  
  try {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encoder = new TextEncoder();
    const encodedData = encoder.encode(JSON.stringify(data));
    
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      encodedData
    );
    
    return {
      _encrypted: true,
      iv: Array.from(iv).join(','),
      data: Array.from(new Uint8Array(encrypted)).join(',')
    };
  } catch (error) {
    console.error('Error encriptando datos:', error);
    return data;
  }
};

/**
 * Desencriptar datos
 */
const decryptData = async (encryptedData) => {
  if (!CRYPTO_ENABLED || !encryptionKey || !encryptedData?._encrypted) return encryptedData;
  
  try {
    const iv = new Uint8Array(encryptedData.iv.split(',').map(Number));
    const data = new Uint8Array(encryptedData.data.split(',').map(Number));
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      encryptionKey,
      data
    );
    
    return JSON.parse(new TextDecoder().decode(decrypted));
  } catch (error) {
    console.error('Error desencriptando datos:', error);
    return null;
  }
};

/**
 * Obtener el almacenamiento según tipo
 */
const getStorage = (type = STORAGE_TYPES.LOCAL) => {
  return type === STORAGE_TYPES.LOCAL ? localStorage : sessionStorage;
};

/**
 * Almacenamiento seguro con opción de encriptación
 */
export const secureStorage = {
  async setItem(key, value, type = STORAGE_TYPES.LOCAL) {
    try {
      const processedValue = typeof value === 'object' 
        ? await encryptData(value)
        : value;
      
      getStorage(type).setItem(key, JSON.stringify(processedValue));
      return true;
    } catch (error) {
      console.error(`Error guardando ${key} en storage:`, error);
      return false;
    }
  },
  
  async getItem(key, type = STORAGE_TYPES.LOCAL) {
    try {
      const item = getStorage(type).getItem(key);
      if (!item) return null;
      
      const parsed = JSON.parse(item);
      return await decryptData(parsed);
    } catch (error) {
      console.error(`Error leyendo ${key} de storage:`, error);
      return null;
    }
  },
  
  removeItem(key, type = STORAGE_TYPES.LOCAL) {
    getStorage(type).removeItem(key);
  },
  
  clear(type = STORAGE_TYPES.LOCAL) {
    getStorage(type).clear();
  },
  
  async getAllItems(type = STORAGE_TYPES.LOCAL) {
    const items = {};
    const storage = getStorage(type);
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      items[key] = await this.getItem(key, type);
    }
    
    return items;
  }
};

/**
 * Integración con Alpine.js
 */
export const createStorageMixin = () => ({
  $storage: secureStorage,
  
  async init() {
    // Sincronizar estado inicial desde storage
    const savedState = await this.$storage.getItem('app_state');
    if (savedState) {
      Object.assign(this.$data, savedState);
    }
    
    // Guardar estado al cambiar
    this.$watch('$data', async (newState) => {
      await this.$storage.setItem('app_state', newState);
    }, { deep: true });
  }
});

/**
 * Migración de datos (v1 a v2, etc.)
 */
export const runStorageMigrations = async () => {
  const legacyItems = localStorage.getItem('_ctk_legacy_data');
  if (!legacyItems) return;
  
  try {
    const parsed = JSON.parse(legacyItems);
    await secureStorage.setItem('user_data', parsed.user);
    await secureStorage.setItem('app_settings', parsed.settings);
    localStorage.removeItem('_ctk_legacy_data');
  } catch (error) {
    console.error('Error en migración de datos:', error);
  }
};