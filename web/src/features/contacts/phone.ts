const COUNTRY_CODE = '55';

export const normalizePhone = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11 ? `${COUNTRY_CODE}${digits}` : digits;
};

export const isValidPhone = (digits: string): boolean => /^55\d{10,11}$/.test(digits);

export const formatPhone = (digits: string): string => {
  const match = digits.match(/^55(\d{2})(\d{4,5})(\d{4})$/);
  return match ? `+55 (${match[1]}) ${match[2]}-${match[3]}` : digits;
};
