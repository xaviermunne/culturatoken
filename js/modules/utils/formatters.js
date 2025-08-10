// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\formatters.js

/**
 * Formateadores para datos financieros y de visualización
 */

// Configuración regional para formateo
const LOCALE = 'es-ES';
const CURRENCY_SETTINGS = {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
};

const COMPACT_FORMAT = new Intl.NumberFormat(LOCALE, {
  ...CURRENCY_SETTINGS,
  notation: 'compact',
  compactDisplay: 'short'
});

// Formateo de moneda con opciones flexibles
export const formatCurrency = (value, currency = 'USD', compact = false) => {
  try {
    if (isNaN(value)) return 'N/A';
    
    const formatter = compact 
      ? COMPACT_FORMAT 
      : new Intl.NumberFormat(LOCALE, { ...CURRENCY_SETTINGS, currency });
    
    return formatter.format(value);
  } catch (error) {
    console.error('Error formateando moneda:', error);
    return value.toString();
  }
};

// Formateo de porcentajes con decimales configurables
export const formatPercentage = (value, decimals = 1) => {
  if (isNaN(value)) return '0%';
  
  const formatted = parseFloat(value).toFixed(decimals);
  return `${formatted}%`;
};

// Formateo de direcciones de wallet
export const formatWalletAddress = (address, startChars = 6, endChars = 4) => {
  if (!address || typeof address !== 'string') return '';
  
  if (address.length <= startChars + endChars) {
    return address;
  }
  
  return `${address.substring(0, startChars)}...${address.substring(address.length - endChars)}`;
};

// Formateo de fechas relativas
export const formatRelativeTime = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const seconds = Math.floor((now - date) / 1000);
  
  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60
  };
  
  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `hace ${interval} ${unit}${interval === 1 ? '' : 's'}`;
    }
  }
  
  return 'hace unos segundos';
};

// Formateo de números grandes
export const formatLargeNumber = (num, decimals = 2) => {
  if (isNaN(num)) return '0';
  
  const absNum = Math.abs(num);
  const sign = num < 0 ? '-' : '';
  
  const formatRules = [
    { value: 1e12, suffix: 'T' },
    { value: 1e9, suffix: 'B' },
    { value: 1e6, suffix: 'M' },
    { value: 1e3, suffix: 'K' }
  ];
  
  for (const rule of formatRules) {
    if (absNum >= rule.value) {
      return `${sign}${(absNum / rule.value).toFixed(decimals)}${rule.suffix}`;
    }
  }
  
  return sign + absNum.toString();
};

// Formateo de datos para gráficos
export const formatChartData = (rawData, labels) => {
  if (!Array.isArray(rawData) return { labels: [], datasets: [] };
  
  return {
    labels: labels || rawData.map((_, index) => `Item ${index + 1}`),
    datasets: [{
      data: rawData,
      backgroundColor: generateGradientColors(rawData.length),
      borderWidth: 0
    }]
  };
};

// Generador de colores para gráficos
const generateGradientColors = (count) => {
  const baseColors = [
    '#4f46e5', // Indigo
    '#ec4899', // Pink
    '#f59e0b', // Amber
    '#10b981', // Emerald
    '#3b82f6'  // Blue
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const baseColor = baseColors[i % baseColors.length];
    return adjustColorBrightness(baseColor, (i % 3) * 10);
  });
};

// Ajuste de brillo de color (para gradientes)
const adjustColorBrightness = (hex, percent) => {
  const num = parseInt(hex.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amt));
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amt));
  
  return `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
};

// Formateo de tiempo de duración (mm:ss)
export const formatDuration = (seconds) => {
  if (isNaN(seconds)) return '00:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

// Validación y formateo de emails
export const formatEmail = (email) => {
  if (!email || typeof email !== 'string') return '';
  
  const [user, domain] = email.split('@');
  if (!user || !domain) return email;
  
  return `${user.substring(0, 2)}***@${domain}`;
};