const messages: Record<string, string> = {
  'permission-denied': 'Operação não permitida. A mensagem pode já ter sido enviada.',
  unavailable: 'Sem conexão com o servidor. Suas alterações serão sincronizadas ao reconectar.',
};

export const firestoreErrorMessage = (error: unknown): string => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  return messages[code] ?? 'Algo deu errado. Tente novamente.';
};
