import { describe, expect, it } from 'vitest';
import { firestoreErrorMessage } from './firestoreErrors';

describe('firestoreErrorMessage', () => {
  it('explains permission errors', () => {
    expect(firestoreErrorMessage({ code: 'permission-denied' })).toBe(
      'Operação não permitida. A mensagem pode já ter sido enviada.',
    );
  });

  it('falls back to a generic message', () => {
    expect(firestoreErrorMessage(new Error('boom'))).toBe('Algo deu errado. Tente novamente.');
  });
});
