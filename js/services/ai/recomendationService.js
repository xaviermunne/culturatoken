// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\services\ai\recommendationService.js

import { showToast } from '../../utils/notifications.js';

// Ponderaciones para el algoritmo de recomendación
const SCORE_WEIGHTS = {
  GENRE_MATCH: 0.4,
  RISK_MATCH: 0.3,
  ROI_POTENTIAL: 0.2,
  FUNDING_URGENCY: 0.1
};

// Factores de riesgo por perfil
const RISK_FACTORS = {
  low: {
    high: 0,
    medium: 0.5,
    low: 1
  },
  medium: {
    high: 0.3,
    medium: 1,
    low: 0.8
  },
  high: {
    high: 1,
    medium: 0.7,
    low: 0.5
  }
};

// Umbrales para recomendaciones
const THRESHOLDS = {
  MIN_SCORE: 0.6,
  MAX_SHOWS: 5
};

export const getAIRecommendations = async function() {
  try {
    this.aiLoading = true;
    
    // Simular delay de carga (en producción sería una llamada API)
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (!this.loggedIn || !this.user.preferences) {
      return [];
    }

    const recommendations = this.shows
      .filter(show => show.funded < 100) // Solo shows no financiados completamente
      .map(show => ({
        ...show,
        score: calculateShowScore(show, this.user.preferences)
      }))
      .filter(item => item.score >= THRESHOLDS.MIN_SCORE)
      .sort((a, b) => b.score - a.score)
      .slice(0, THRESHOLDS.MAX_SHOWS);

    this.aiRecommendations = recommendations;
    
    // Notificación solo si hay resultados nuevos
    if (recommendations.length > 0 && this.aiRecommendations.length !== recommendations.length) {
      showToast(this, `Hemos encontrado ${recommendations.length} recomendaciones para ti`, 'INFO');
    }

    return recommendations;
  } catch (error) {
    console.error('Error en recomendaciones AI:', error);
    showToast(this, 'Error al cargar recomendaciones', 'ERROR');
    return [];
  } finally {
    this.aiLoading = false;
  }
};

// Cálculo de puntuación para cada show
const calculateShowScore = (show, preferences) => {
  let score = 0;
  
  // 1. Coincidencia de género (40%)
  score += SCORE_WEIGHTS.GENRE_MATCH * 
    (preferences.favoriteGenres.includes(show.genre) ? 1 : 0);
  
  // 2. Adecuación al riesgo (30%)
  score += SCORE_WEIGHTS.RISK_MATCH * 
    RISK_FACTORS[preferences.riskTolerance][show.riskLevel];
  
  // 3. Potencial de ROI (20%)
  score += SCORE_WEIGHTS.ROI_POTENTIAL * 
    normalizeROI(show.roi, preferences.investmentGoal);
  
  // 4. Urgencia de financiamiento (10%)
  score += SCORE_WEIGHTS.FUNDING_URGENCY * 
    (1 - (show.funded / 100)); // Más puntaje si está menos financiado

  return parseFloat(score.toFixed(2));
};

// Normalizar ROI según objetivo de inversión
const normalizeROI = (roi, goal) => {
  const MAX_ROI = 30; // ROI máximo esperado
  
  switch(goal) {
    case 'income':
      return Math.min(roi / 20, 1); // Más exigente con ROI alto
    case 'growth':
      return Math.min(roi / 15, 1);
    default: // diversification
      return Math.min(roi / MAX_ROI, 1);
  }
};

// Métodos adicionales para el sistema de recomendaciones
export const refreshRecommendations = async function() {
  this.aiRecommendations = [];
  await this.getAIRecommendations();
};

export const explainRecommendation = (show, preferences) => {
  const reasons = [];
  
  if (preferences.favoriteGenres.includes(show.genre)) {
    reasons.push(`Coincide con tu género favorito (${show.genre})`);
  }
  
  if (RISK_FACTORS[preferences.riskTolerance][show.riskLevel] > 0.7) {
    reasons.push(`Adecuado a tu perfil de riesgo (${preferences.riskTolerance})`);
  }
  
  if (show.roi > 12 && preferences.investmentGoal === 'income') {
    reasons.push(`Alto ROI (${show.roi}%) para generación de ingresos`);
  }
  
  if (show.funded < 50) {
    reasons.push(`Oportunidad temprana (${show.funded}% financiado)`);
  }
  
  return reasons.length > 0 
    ? reasons.join(', ')
    : 'Recomendado por nuestro algoritmo de preferencias';
};