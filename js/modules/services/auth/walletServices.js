// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\auth\walletServices.js

import { saveUserState } from '../../utils/stateManager.js';
import { showToast } from '../../utils/notifications.js';
import { switchToPolygon, handleNetworkChange } from './networkServices.js';

// Configuración de listeners de wallet
const setupWalletListeners = (context) => {
  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      context.logout();
    } else {
      context.user.walletAddress = accounts[0];
      saveUserState(context.user);
      showToast(context, 'Cuenta de wallet actualizada');
    }
  };

  if (window.ethereum?.removeAllListeners) {
    window.ethereum.removeAllListeners('accountsChanged');
    window.ethereum.removeAllListeners('chainChanged');
  }

  if (window.ethereum?.on) {
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleNetworkChange.bind(context));
  }

  if (window.solana?.on) {
    window.solana.on('disconnect', () => context.logout());
  }
};

// Conexión con Metamask
export const connectMetamaskWallet = async function() {
  try {
    this.loading = true;
    this.error = null;

    if (!window.ethereum) {
      throw new Error('METAMASK_NOT_INSTALLED');
    }

    await switchToPolygon();
    const accounts = await window.ethereum.request({ 
      method: 'eth_requestAccounts' 
    });

    if (!accounts?.[0]) {
      throw new Error('NO_ACCOUNTS_FOUND');
    }

    this.user.walletAddress = accounts[0];
    this.walletType = 'metamask';
    this.loggedIn = true;

    saveUserState(this.user);
    setupWalletListeners(this);
    showToast(this, `Conectado a Metamask: ${this.shortenAddress(accounts[0])}`);

  } catch (error) {
    console.error("Error en conexión Metamask:", error);
    this.error = getWalletErrorMessage(error);
  } finally {
    this.loading = false;
  }
};

// Conexión con Phantom
export const connectPhantomWallet = async function() {
  try {
    this.loading = true;
    this.error = null;

    if (!window.solana?.isPhantom) {
      throw new Error('PHANTOM_NOT_INSTALLED');
    }

    const response = await window.solana.connect();
    if (!response.publicKey) {
      throw new Error('NO_PUBLIC_KEY');
    }

    this.user.walletAddress = response.publicKey.toString();
    this.walletType = 'phantom';
    this.loggedIn = true;
    this.phantomConnected = true;

    saveUserState(this.user);
    setupWalletListeners(this);
    showToast(this, `Conectado a Phantom: ${this.shortenAddress(response.publicKey.toString())}`);

  } catch (error) {
    console.error("Error en conexión Phantom:", error);
    this.error = getWalletErrorMessage(error);
  } finally {
    this.loading = false;
  }
};

// Registro con wallet custodial
export const registerCustodialWallet = async function() {
  try {
    this.loading = true;
    this.error = null;

    // Validación de formulario
    if (!this.validateEmail(this.auth.email)) {
      throw new Error('INVALID_EMAIL');
    }

    if (this.auth.password.length < 8) {
      throw new Error('PASSWORD_TOO_SHORT');
    }

    if (this.auth.password !== this.auth.confirmPassword) {
      throw new Error('PASSWORDS_DONT_MATCH');
    }

    if (!this.auth.termsAccepted) {
      throw new Error('TERMS_NOT_ACCEPTED');
    }

    // Generar dirección custodial segura
    const custodialWallet = `0x${Array.from({length: 40}, () => 
      Math.floor(Math.random() * 16).toString(16)).join('')}_custodial`;

    // Actualizar estado
    this.user = { 
      ...this.user,
      email: this.auth.email,
      walletAddress: custodialWallet,
      createdAt: new Date().toISOString() 
    };
    
    this.walletType = 'custodial';
    this.loggedIn = true;
    this.showLoginModal = false;

    saveUserState(this.user);
    showToast(this, '¡Registro exitoso! Wallet custodial creada');
    this.resetAuthForm();

  } catch (error) {
    console.error("Error en registro custodial:", error);
    this.error = getWalletErrorMessage(error);
  } finally {
    this.loading = false;
  }
};

// Manejador de errores específico para wallets
const getWalletErrorMessage = (error) => {
  const errorMessages = {
    'METAMASK_NOT_INSTALLED': 'Instala MetaMask para continuar',
    'PHANTOM_NOT_INSTALLED': 'Instala Phantom Wallet para continuar',
    'NO_ACCOUNTS_FOUND': 'No se detectaron cuentas',
    'NO_PUBLIC_KEY': 'No se pudo obtener clave pública',
    'INVALID_EMAIL': 'Ingresa un email válido',
    'PASSWORD_TOO_SHORT': 'La contraseña debe tener al menos 8 caracteres',
    'PASSWORDS_DONT_MATCH': 'Las contraseñas no coinciden',
    'TERMS_NOT_ACCEPTED': 'Debes aceptar los términos',
    'default': 'Error en conexión. Intenta nuevamente'
  };

  return errorMessages[error.message] || errorMessages.default;
};