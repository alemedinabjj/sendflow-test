import { describe, expect, it } from 'vitest';
import { formatPhone, isValidPhone, normalizePhone } from './phone';

describe('normalizePhone', () => {
  it.each(['(11) 98888-7777', '+55 11 98888-7777', '11988887777', '55 11 988887777'])(
    'normalizes %s',
    (raw) => {
      expect(normalizePhone(raw)).toBe('5511988887777');
    },
  );

  it('normalizes landlines', () => {
    expect(normalizePhone('1133334444')).toBe('551133334444');
  });
});

describe('isValidPhone', () => {
  it('accepts mobile and landline numbers', () => {
    expect(isValidPhone('5511988887777')).toBe(true);
    expect(isValidPhone('551133334444')).toBe(true);
  });

  it('rejects short numbers', () => {
    expect(isValidPhone('55119888')).toBe(false);
  });
});

describe('formatPhone', () => {
  it('formats mobile numbers', () => {
    expect(formatPhone('5511988887777')).toBe('+55 (11) 98888-7777');
  });

  it('formats landlines', () => {
    expect(formatPhone('551133334444')).toBe('+55 (11) 3333-4444');
  });
});
