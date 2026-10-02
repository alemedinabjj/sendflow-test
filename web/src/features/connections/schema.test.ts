import { describe, expect, it } from 'vitest';
import { connectionSchema } from './schema';

describe('connectionSchema', () => {
  it('trims the name', () => {
    expect(connectionSchema.parse({ name: '  Vendas  ' })).toEqual({ name: 'Vendas' });
  });

  it('rejects blank names', () => {
    expect(connectionSchema.safeParse({ name: '   ' }).success).toBe(false);
  });

  it('rejects names longer than 60 chars', () => {
    expect(connectionSchema.safeParse({ name: 'x'.repeat(61) }).success).toBe(false);
  });
});
