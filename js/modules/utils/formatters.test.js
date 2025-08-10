// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\formatters.test.js

import {
  formatCurrency,
  formatPercentage,
  formatWalletAddress,
  formatRelativeTime,
  formatLargeNumber
} from './formatters';

describe('Formateadores de datos', () => {
  test('formatCurrency formatea correctamente', () => {
    expect(formatCurrency(1234.56)).toBe('1.234,56 €');
    expect(formatCurrency(1234.56, 'USD')).toBe('1.234,56 $');
    expect(formatCurrency(1234567.89, 'USD', true)).toMatch(/1,23M/);
  });

  test('formatPercentage formatea correctamente', () => {
    expect(formatPercentage(12.3456)).toBe('12,3%');
    expect(formatPercentage(12.3456, 2)).toBe('12,35%');
  });

  test('formatWalletAddress acorta direcciones', () => {
    const address = '0x742d35Cc6634C0532925a3b844Bc454e4438f44e';
    expect(formatWalletAddress(address)).toBe('0x742d...f44e');
    expect(formatWalletAddress(address, 4, 6)).toBe('0x74...44f44e');
  });

  test('formatRelativeTime muestra tiempo relativo', () => {
    const now = new Date();
    const oneHourAgo = new Date(now - 3600000);
    expect(formatRelativeTime(oneHourAgo.toISOString())).toBe('hace 1 hora');
  });

  test('formatLargeNumber formatea números grandes', () => {
    expect(formatLargeNumber(123456)).toBe('123,46K');
    expect(formatLargeNumber(123456789)).toBe('123,46M');
  });
});