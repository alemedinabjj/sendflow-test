import { describe, expect, it } from 'vitest';
import { authErrorMessage, signupSchema } from './schema';

const valid = { name: 'Alice', email: 'alice@test.com', password: '123456' };

describe('signupSchema', () => {
  it('accepts valid input', () => {
    expect(signupSchema.safeParse(valid).success).toBe(true);
  });

  it('rejects invalid email', () => {
    expect(signupSchema.safeParse({ ...valid, email: 'alice' }).success).toBe(false);
  });

  it('rejects password shorter than 6', () => {
    expect(signupSchema.safeParse({ ...valid, password: '12345' }).success).toBe(false);
  });

  it('rejects blank name', () => {
    expect(signupSchema.safeParse({ ...valid, name: '   ' }).success).toBe(false);
  });
});

describe('authErrorMessage', () => {
  it('maps invalid credentials', () => {
    expect(authErrorMessage('auth/invalid-credential')).toBe('E-mail ou senha inválidos.');
  });

  it.each(['auth/wrong-password', 'auth/user-not-found'])('maps %s to invalid credentials', (code) => {
    expect(authErrorMessage(code)).toBe('E-mail ou senha inválidos.');
  });

  it('maps email already in use', () => {
    expect(authErrorMessage('auth/email-already-in-use')).toBe('Este e-mail já está cadastrado.');
  });

  it('falls back for unknown codes', () => {
    expect(authErrorMessage('auth/whatever')).toBe('Não foi possível concluir. Tente novamente.');
  });
});
