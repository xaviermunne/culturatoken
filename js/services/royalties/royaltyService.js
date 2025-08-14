// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\royalties\royaltyService.js

import { saveUserState } from '../../../utils/stateManager.js';
import { showToast } from '../../../utils/notifications.js';

// Distribución de royalties para un show específico
export const distributeRoyalties = async function(showId, amount) {
  try {
    this.loading = true;
    this.error = null;

    // Validación básica
    if (amount <= 0 || !showId) {
      throw new Error('INVALID_PARAMETERS');
    }

    const show = this.shows.find(s => s.id === showId);
    if (!show) {
      throw new Error('SHOW_NOT_FOUND');
    }

    // Obtener inversores del show
    const investors = this.user.investments
      .filter(inv => inv.showId === showId && inv.status === 'active');

    if (investors.length === 0) {
      throw new Error('NO_INVESTORS');
    }

    // Calcular distribución (98% inversores, 2% plataforma)
    const platformFee = amount * 0.02;
    const distributionAmount = amount - platformFee;
    const totalInvested = investors.reduce((sum, inv) => sum + inv.totalValue, 0);

    // Distribuir a inversores
    investors.forEach(investment => {
      const share = (investment.totalValue / totalInvested) * distributionAmount;
      this.user.royalties += share;
    });

    // Registrar distribución
    this.recordRoyaltyDistribution(showId, amount, investors.length);

    // Actualizar estado
    saveUserState(this.user);
    showToast(
      this, 
      `Distribuidos $${amount.toFixed(2)} en royalties ` +
      `($${platformFee.toFixed(2)} comisión plataforma)`,
      'SUCCESS'
    );

    return true;
  } catch (error) {
    console.error('Error distributing royalties:', error);
    this.error = getRoyaltyErrorMessage(error);
    return false;
  } finally {
    this.loading = false;
  }
};

// Reclamar royalties disponibles
export const claimRoyalties = async function(tokenType = 'USDC') {
  try {
    this.loading = true;
    this.error = null;

    if (this.user.royalties <= 0) {
      throw new Error('NO_ROYALTIES');
    }

    const amount = this.user.royalties;
    let message = '';

    if (tokenType === 'USDC') {
      this.user.balanceUSDC += amount;
      message = `Reclamados $${amount.toFixed(2)} en USDC`;
    } else {
      // CTK con 10% de bonus
      const ctkAmount = (amount / 2.5) * 1.1;
      this.user.balanceCTK += ctkAmount;
      message = `Reclamados ${ctkAmount.toFixed(2)} CTK (10% bonus)`;
    }

    // Resetear royalties
    this.user.royalties = 0;
    saveUserState(this.user);
    
    showToast(this, message, 'SUCCESS');
    this.showRoyaltiesModal = false;

    return true;
  } catch (error) {
    console.error('Error claiming royalties:', error);
    this.error = getRoyaltyErrorMessage(error);
    return false;
  } finally {
    this.loading = false;
  }
};

// Registro histórico de distribuciones
const recordRoyaltyDistribution = function(showId, amount, investorCount) {
  const show = this.shows.find(s => s.id === showId);
  if (!show) return;

  if (!show.royaltyDistributions) {
    show.royaltyDistributions = [];
  }

  show.royaltyDistributions.push({
    date: new Date().toISOString(),
    amount: amount,
    investors: investorCount,
    perInvestor: (amount * 0.98) / investorCount
  });
};

// Cálculo de royalties acumulados por show
export const calculateAccumulatedRoyalties = function() {
  return this.user.investments
    .filter(inv => inv.status === 'active')
    .map(investment => {
      const show = this.shows.find(s => s.id === investment.showId);
      const distributions = show?.royaltyDistributions || [];
      
      const total = distributions.reduce((sum, dist) => {
        const share = (investment.totalValue / (dist.amount * 0.98)) * dist.perInvestor;
        return sum + share;
      }, 0);
      
      return {
        showId: investment.showId,
        showName: investment.name,
        totalRoyalties: total,
        lastDistribution: distributions[0]?.date
      };
    });
};

// Manejador de errores específico
const getRoyaltyErrorMessage = (error) => {
  const errorMap = {
    'INVALID_PARAMETERS': 'Parámetros inválidos para distribución',
    'SHOW_NOT_FOUND': 'Show no encontrado',
    'NO_INVESTORS': 'No hay inversores activos para este show',
    'NO_ROYALTIES': 'No hay royalties disponibles para reclamar',
    'DEFAULT': 'Error en el proceso de royalties'
  };
  return errorMap[error.message] || errorMap.DEFAULT;
};