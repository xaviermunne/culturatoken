// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\investment\investmentService.js

import { saveUserState } from '../../../utils/stateManager.js';
import { showToast } from '../../../utils/notifications.js';
import { calculateROI, calculateTokenAmount } from './investmentCalculations.js';

// Validación de datos de inversión
export const validateInvestment = (investment, user, show) => {
  const errors = [];
  
  // Validación básica
  if (investment.amount < 100) {
    errors.push('La inversión mínima es de 100 USDT/USDC.');
  }

  // Validación de fondos según método de pago
  if (investment.paymentMethod === 'usdc' && user.balanceUSDC < investment.amount) {
    errors.push('Saldo insuficiente de USDT/USDC.');
  } 
  
  if (investment.paymentMethod === 'ctk') {
    const requiredCTK = investment.amount / 2.5; // Tasa de conversión
    if (user.balanceCTK < requiredCTK) {
      errors.push('Saldo insuficiente de CTK.');
    }
  }

  // Validación de disponibilidad
  if (show.funded >= 100) {
    errors.push('Este proyecto ya alcanzó su meta de financiación.');
  }

  return errors.length > 0 ? errors : null;
};

// Procesar una nueva inversión
export const processInvestment = async function() {
  try {
    this.loading = true;
    this.error = null;

    const show = this.shows.find(s => s.id === this.investment.showId);
    if (!show) throw new Error('SHOW_NOT_FOUND');

    // Validar antes de procesar
    const validationErrors = validateInvestment(this.investment, this.user, show);
    if (validationErrors) {
      this.error = validationErrors.join(' ');
      return;
    }

    // Simular delay de transacción
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Calcular valores
    const tokensBought = calculateTokenAmount(this.investment.amount, show.pricePerToken);
    const ctkReward = this.investment.amount / 5; // 1 CTK por cada $5

    // Actualizar balances
    if (this.investment.paymentMethod === 'usdc') {
      this.user.balanceUSDC -= this.investment.amount;
    } else {
      this.user.balanceCTK -= this.investment.amount / 2.5;
    }
    
    this.user.balanceCTK += ctkReward;
    this.user.totalInvested += this.investment.amount;

    // Registrar inversión
    this.user.investments.push({
      id: Date.now(),
      showId: show.id,
      name: show.name,
      tokens: tokensBought,
      totalValue: this.investment.amount,
      date: new Date().toISOString(),
      roi: show.roi,
      status: 'active'
    });

    // Actualizar estado del show
    const previousFunded = show.funded;
    show.funded = Math.min(100, show.funded + (this.investment.amount / (show.tokens * show.pricePerToken)) * 100);

    // Notificaciones
    if (previousFunded < 100 && show.funded >= 100) {
      showToast(this, `¡${show.name} alcanzó su meta de financiación!`);
    }

    // Calcular ROI estimado
    const roiEstimation = calculateROI(
      this.investment.amount, 
      show.roi, 
      parseInt(show.duration)
    );

    showToast(this, 
      `Inversión exitosa! Obtuviste ${tokensBought} tokens.
      ROI estimado: ${roiEstimation.total.toFixed(2)}% (~${this.formatCurrency(roiEstimation.monthly)}/mes)`
    );

    // Persistir y limpiar
    saveUserState(this.user);
    this.showInvestmentModal = false;

  } catch (error) {
    console.error('Error procesando inversión:', error);
    this.error = getInvestmentErrorMessage(error);
  } finally {
    this.loading = false;
  }
};

// Archivo de cálculos relacionados (investmentCalculations.js)
export const calculateTokenAmount = (amount, pricePerToken) => {
  return parseFloat((amount / pricePerToken).toFixed(4)); // 4 decimales para tokens
};

export const calculateROI = (amount, annualROI, months) => {
  const monthlyROI = annualROI / 12;
  const totalROI = (amount * annualROI * months) / 1200; // 1200 = 12*100
  return {
    monthly: monthlyROI,
    total: totalROI,
    totalReturn: amount + totalROI
  };
};

// Manejador de errores específico
const getInvestmentErrorMessage = (error) => {
  const errorMap = {
    'SHOW_NOT_FOUND': 'El proyecto no fue encontrado',
    'default': 'Error al procesar la inversión. Intenta nuevamente.'
  };
  return errorMap[error.message] || errorMap.default;
};