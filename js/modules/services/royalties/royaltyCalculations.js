// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\royalties\royaltyCalculations.js

// Calcular proyección de royalties futuros
export const calculateRoyaltyProjection = (investment, show, months = 12) => {
  if (!investment || !show) return 0;
  
  const monthlyROI = show.roi / 12;
  const estimatedRoyalties = (investment.totalValue * monthlyROI * months) / 100;
  
  // Ajustar por riesgo (mayor riesgo = mayor variabilidad)
  const riskFactor = {
    high: 0.7, // 70% de lo proyectado
    medium: 0.9,
    low: 1.1 // 110% por posibles bonos
  }[show.riskLevel];
  
  return estimatedRoyalties * riskFactor;
};

// Calcular historial de rendimiento
export const calculatePerformanceHistory = (investments, shows) => {
  return investments
    .filter(inv => inv.status === 'active')
    .map(investment => {
      const show = shows.find(s => s.id === investment.showId);
      if (!show) return null;
      
      const distributions = show.royaltyDistributions || [];
      const totalReceived = distributions.reduce((sum, dist) => {
        const investorShare = (investment.totalValue / dist.amount) * dist.perInvestor;
        return sum + investorShare;
      }, 0);
      
      const roi = (totalReceived / investment.totalValue) * 100;
      const projected = calculateRoyaltyProjection(investment, show);
      
      return {
        showId: investment.showId,
        showName: show.name,
        invested: investment.totalValue,
        received: totalReceived,
        projected: projected,
        roi: roi,
        status: roi >= show.roi ? 'exceeded' : roi >= (show.roi * 0.7) ? 'on_track' : 'underperforming'
      };
    })
    .filter(Boolean);
};