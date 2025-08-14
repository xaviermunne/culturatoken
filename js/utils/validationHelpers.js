// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\validationHelpers.js

/**
 * Helpers para validaciones avanzadas
 */

// Validación de fechas
export const validateDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return 'Ambas fechas son requeridas';
  if (new Date(startDate) >= new Date(endDate)) return 'La fecha final debe ser posterior a la inicial';
  return null;
};

// Validación de archivos
export const validateFile = (file, options = {}) => {
  if (!file) return 'Archivo requerido';
  
  const { 
    maxSize = 5 * 1024 * 1024, // 5MB
    allowedTypes = ['image/jpeg', 'image/png', 'application/pdf']
  } = options;

  if (file.size > maxSize) {
    return `El archivo excede el tamaño máximo de ${maxSize / (1024 * 1024)}MB`;
  }

  if (!allowedTypes.includes(file.type)) {
    return `Tipo de archivo no permitido. Use: ${allowedTypes.join(', ')}`;
  }

  return null;
};

// Validación de arrays
export const validateArray = (array, options = {}) => {
  const { 
    minLength = 1,
    maxLength = 10,
    itemValidator = null
  } = options;

  if (!Array.isArray(array)) return 'Debe ser un array';
  if (array.length < minLength) return `Mínimo ${minLength} elemento(s) requerido(s)`;
  if (array.length > maxLength) return `Máximo ${maxLength} elementos permitidos`;

  if (itemValidator) {
    for (const item of array) {
      const error = itemValidator(item);
      if (error) return error;
    }
  }

  return null;
};

// Validación condicional
export const validateIf = (condition, validator, value, context) => {
  return condition(context) ? validator(value, context) : null;
};