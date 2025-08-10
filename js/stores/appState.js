// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\stores\appState.js

import { 
  loadUserState,
  saveUserState,
  clearUserState
} from '../modules/utils/stateManager.js';
import {
  connectMetamaskWallet,
  connectPhantomWallet,
  registerCustodialWallet
} from '../modules/services/auth/walletServices.js';
import {
  validateInvestment,
  processInvestment
} from '../modules/services/investment/investmentService.js';
import {
  getAIRecommendations
} from '../modules/services/ai/recommendationService.js';
import {
  distributeRoyalties,
  claimRoyalties
} from '../modules/services/royalties/royaltyService.js';
import {
  formatCurrency,
  formatPercentage,
  shortenAddress
} from '../modules/utils/formatters.js';
import {
  showToastNotification,
  getErrorMessage
} from '../modules/utils/notifications.js';

const DEFAULT_USER_STATE = {
  email: '',
  walletAddress: '',
  balanceUSDC: 1000.00,
  balanceCTK: 50.00,
  royalties: 125.50,
  position: 15,
  totalInvested: 1250.00,
  investments: [],
  preferences: {
    favoriteGenres: ['teatro', 'circo'],
    riskTolerance: 'medium',
    investmentGoal: 'diversification'
  }
};

export default function createAppState() {
  return {
    // Estado de la aplicación
    loggedIn: false,
    isRegistering: false,
    showLoginModal: false,
    showInvestmentModal: false,
    showUsdcModal: false,
    showRoyaltiesModal: false,
    phantomConnected: false,
    walletType: null,
    loading: false,
    error: null,
    
    // Datos del usuario
    user: {...DEFAULT_USER_STATE},
    
    // Datos de formularios
    auth: {
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    },
    
    investment: {
      name: '',
      price: 0,
      amount: 100,
      network: 'Polygon',
      showId: null,
      paymentMethod: 'usdc'
    },
    
    fiat: {
      amount: 100,
      currency: 'USD',
      paymentMethod: 'credit_card'
    },
    
    // Datos de la aplicación
    shows: [...], // Mantener el array original de shows,
    aiRecommendations: [],
    leaderboard: [...], // Mantener el array original,
    daoProposals: [...], // Mantener el array original,
    currentLeaderboardPage: 1,
    itemsPerPage: 5,

    // Métodos de inicialización
    init() {
      try {
        const savedUser = loadUserState();
        if (savedUser && this.validateUserData(savedUser)) {
          this.user = { ...DEFAULT_USER_STATE, ...savedUser };
          this.loggedIn = true;
          this.detectWalletType();
        }
        if (this.loggedIn) this.loadRecommendations();
      } catch (error) {
        console.error('Error initializing app state:', error);
        this.error = 'Error al cargar los datos del usuario';
      }
    },

    // Métodos de autenticación
    registerWithEmail: registerCustodialWallet,
    connectMetamask: connectMetamaskWallet,
    connectPhantom: connectPhantomWallet,
    
    // Métodos de inversión
    validateInvestment,
    confirmInvestment: processInvestment,
    
    // Métodos de AI
    getAIRecommendations: getAIRecommendations,
    
    // Métodos de royalties
    distributeRoyalties,
    claimRoyalties,
    
    // Utilidades
    formatCurrency,
    formatPercentage,
    shortenAddress,
    showToast: showToastNotification,
    getFriendlyErrorMessage: getErrorMessage,
    
    // Métodos específicos del state
    validateUserData(userData) {
      const requiredFields = ['email', 'walletAddress', 'balanceUSDC', 'balanceCTK'];
      return requiredFields.every(field => userData[field] !== undefined);
    },
    
    detectWalletType() {
      if (!this.user.walletAddress) {
        this.walletType = null;
        return;
      }
      
      if (this.user.walletAddress.startsWith('0x')) {
        this.walletType = this.user.walletAddress.includes('custodial') 
          ? 'custodial' 
          : 'metamask';
      } else if (this.user.walletAddress.startsWith('sol')) {
        this.walletType = 'phantom';
      } else {
        this.walletType = 'other';
      }
    },
    
    resetAuthForm() {
      this.auth = { 
        email: '', 
        password: '',
        confirmPassword: '',
        termsAccepted: false
      };
    },
    
    logout() {
      try {
        clearUserState();
        this.loggedIn = false;
        this.user = {...DEFAULT_USER_STATE};
        this.walletType = null;
        this.phantomConnected = false;
        showToastNotification.call(this, 'Sesión cerrada correctamente.');
      } catch (error) {
        console.error('Error during logout:', error);
        this.error = 'Error al cerrar sesión';
      }
    },
    
    // ... otros métodos específicos del state ...
  };
}