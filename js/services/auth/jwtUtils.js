// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\auth\jwtUtils.js

/**
 * Utilidades para manejo de JWT
 */

export const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

export const isTokenExpired = (token) => {
  const decoded = decodeToken(token);
  if (!decoded?.exp) return true;
  
  return decoded.exp * 1000 < Date.now();
};

export const validateTokenStructure = (token) => {
  return typeof token === 'string' && 
         token.split('.').length === 3 &&
         token.length > 100;
};

export const getTokenRemainingTime = (token) => {
  if (!token) return 0;
  
  const decoded = decodeToken(token);
  if (!decoded?.exp) return 0;
  
  return Math.max(0, decoded.exp * 1000 - Date.now());
};