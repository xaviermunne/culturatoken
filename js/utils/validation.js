// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\validation.js

/**
 * Validaciones para formularios y datos de la aplicación
 */

// Expresiones regulares para validaciones comunes
const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  WALLET_ADDRESS: /^(0x)?[a-fA-F0-9]{40}$/,
  SOLANA_ADDRESS: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  URL: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
  CTK_AMOUNT: /^\d+(\.\d{1,6})?$/,
  PERCENTAGE: /^100(\.0{1,2})?$|^\d{1,2}(\.\d{1,2})?$/
};

// Mensajes de error predefinidos
const ERROR_MESSAGES = {
  REQUIRED: 'Este campo es requerido',
  INVALID_EMAIL: 'Ingresa un email válido',
  PASSWORD_TOO_WEAK: 'La contraseña debe tener al menos 8 caracteres, una mayúscula, un número y un símbolo',
  PASSWORDS_DONT_MATCH: 'Las contraseñas no coinciden',
  INVALID_WALLET: 'Dirección de wallet inválida',
  INVALID_SOLANA_ADDRESS: 'Dirección Solana inválida',
  INVALID_URL: 'URL inválida',
  INVALID_AMOUNT: 'Cantidad inválida',
  INVALID_PERCENTAGE: 'Porcentaje inválido (0-100)',
  MIN_AMOUNT: (min) => `El valor mínimo es ${min}`,
  MAX_AMOUNT: (max) => `El valor máximo es ${max}`
};

/**
 * Validador principal
 */
export const validate = (value, rules = [], context = {}) => {
  for (const rule of rules) {
    const error = validateRule(value, rule, context);
    if (error) return error;
  }
  return null;
};

// Validación individual de reglas
const validateRule = (value, rule, context) => {
  if (rule === 'required' && !value?.toString().trim()) {
    return ERROR_MESSAGES.REQUIRED;
  }

  if (typeof rule === 'object') {
    if (rule.pattern && !PATTERNS[rule.pattern].test(value)) {
      return rule.message || ERROR_MESSAGES[`INVALID_${rule.pattern}`];
    }

    if (rule.min != null && parseFloat(value) < rule.min) {
      return rule.message || ERROR_MESSAGES.MIN_AMOUNT(rule.min);
    }

    if (rule.max != null && parseFloat(value) > rule.max) {
      return rule.message || ERROR_MESSAGES.MAX_AMOUNT(rule.max);
    }

    if (rule.equals && value !== context[rule.equals]) {
      return rule.message || ERROR_MESSAGES.PASSWORDS_DONT_MATCH;
    }
  }

  return null;
};

// Validadores específicos
export const validateEmail = (email) => {
  return PATTERNS.EMAIL.test(email) ? null : ERROR_MESSAGES.INVALID_EMAIL;
};

export const validatePassword = (password) => {
  if (!password) return ERROR_MESSAGES.REQUIRED;
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres';
  if (!PATTERNS.PASSWORD.test(password)) return ERROR_MESSAGES.PASSWORD_TOO_WEAK;
  return null;
};

export const validateWallet = (address, chain = 'ethereum') => {
  if (!address) return ERROR_MESSAGES.REQUIRED;
  
  if (chain === 'solana' && !PATTERNS.SOLANA_ADDRESS.test(address)) {
    return ERROR_MESSAGES.INVALID_SOLANA_ADDRESS;
  }
  
  if (chain !== 'solana' && !PATTERNS.WALLET_ADDRESS.test(address)) {
    return ERROR_MESSAGES.INVALID_WALLET;
  }
  
  return null;
};

export const validateInvestmentAmount = (amount, min = 100, max = 100000) => {
  if (!amount) return ERROR_MESSAGES.REQUIRED;
  if (isNaN(amount)) return ERROR_MESSAGES.INVALID_AMOUNT;
  if (amount < min) return ERROR_MESSAGES.MIN_AMOUNT(min);
  if (amount > max) return ERROR_MESSAGES.MAX_AMOUNT(max);
  return null;
};

// Validador de formularios completo
export const validateForm = (formData, schema) => {
  const errors = {};
  let isValid = true;

  for (const [field, rules] of Object.entries(schema)) {
    const error = validate(formData[field], rules, formData);
    if (error) {
      errors[field] = error;
      isValid = false;
    }
  }

  return { isValid, errors };
};

// Esquemas de validación predefinidos
export const SCHEMAS = {
  AUTH: {
    email: ['required', { pattern: 'EMAIL' }],
    password: ['required', { minLength: 8 }],
    confirmPassword: ['required', { equals: 'password' }],
    terms: ['required']
  },
  INVESTMENT: {
    amount: ['required', { pattern: 'CTK_AMOUNT' }, { min: 100 }, { max: 100000 }],
    showId: ['required'],
    paymentMethod: ['required']
  },
  PROFILE: {
    name: ['required', { maxLength: 50 }],
    bio: [{ maxLength: 500 }],
    website: [{ pattern: 'URL' }]
  }
};

// Integración con Alpine.js
export const createValidationMixin = (schema) => ({
  errors: {},
  
  validateField(field, value) {
    this.errors[field] = validate(value, schema[field], this.$data);
    return !this.errors[field];
  },
  
  validateForm() {
    const { isValid, errors } = validateForm(this.$data, schema);
    this.errors = errors;
    return isValid;
  },
  
  resetValidation() {
    this.errors = {};
  }
});