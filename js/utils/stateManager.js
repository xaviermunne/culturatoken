// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\stateManager.js

const STATE_KEY = 'culturatoken_user';

export const loadUserState = () => {
  try {
    const serializedState = localStorage.getItem(STATE_KEY);
    if (serializedState === null) {
      return null;
    }
    
    const parsedState = JSON.parse(serializedState);
    
    // Validación básica del estado cargado
    if (typeof parsedState !== 'object' || parsedState === null) {
      console.warn('Estado cargado no es un objeto válido');
      return null;
    }
    
    return parsedState;
  } catch (error) {
    console.error('Error al cargar el estado:', error);
    return null;
  }
};

export const saveUserState = (state) => {
  try {
    if (!state || typeof state !== 'object') {
      throw new Error('Estado inválido para guardar');
    }
    
    // Solo guardamos los datos necesarios
    const stateToSave = {
      email: state.email,
      walletAddress: state.walletAddress,
      balanceUSDC: state.balanceUSDC,
      balanceCTK: state.balanceCTK,
      royalties: state.royalties,
      totalInvested: state.totalInvested,
      investments: state.investments,
      preferences: state.preferences
    };
    
    const serializedState = JSON.stringify(stateToSave);
    localStorage.setItem(STATE_KEY, serializedState);
  } catch (error) {
    console.error('Error al guardar el estado:', error);
    throw error; // Re-lanzamos para manejar en el componente
  }
};

export const clearUserState = () => {
  try {
    localStorage.removeItem(STATE_KEY);
  } catch (error) {
    console.error('Error al limpiar el estado:', error);
    throw error;
  }
};

// Versión segura para SSR (si es necesario)
export const safeLoadUserState = () => {
  if (typeof window === 'undefined') {
    return null;
  }
  return loadUserState();
};