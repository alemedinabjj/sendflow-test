import { describe, expect, it } from 'vitest';
import { firestoreErrorMessage } from './firestoreErrors';

describe('firestoreErrorMessage', () => {
  it('uses a generic text for permission errors', () => {
    expect(firestoreErrorMessage({ code: 'permission-denied' })).toBe('Operação não permitida.');
  });

  it('accepts a context-specific permission text', () => {
    expect(
      firestoreErrorMessage({ code: 'permission-denied' }, { permissionDenied: 'A mensagem já foi enviada.' }),
    ).toBe('A mensagem já foi enviada.');
  });

  it('falls back to a generic message', () => {
    expect(firestoreErrorMessage(new Error('boom'))).toBe('Algo deu errado. Tente novamente.');
  });
});
