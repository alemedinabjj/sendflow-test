import { describe, expect, it } from 'vitest';
import { contactSchema } from './schema';

describe('contactSchema', () => {
  it('normalizes the phone on parse', () => {
    expect(contactSchema.parse({ name: ' Maria ', phone: '(11) 98888-7777' })).toEqual({
      name: 'Maria',
      phone: '5511988887777',
    });
  });

  it('rejects invalid phones', () => {
    expect(contactSchema.safeParse({ name: 'Maria', phone: '1234' }).success).toBe(false);
  });
});
