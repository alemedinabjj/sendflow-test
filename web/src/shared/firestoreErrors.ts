type Overrides = { permissionDenied?: string };

const messages: Record<string, string> = {
  'permission-denied': 'Operação não permitida.',
  unavailable: 'Sem conexão com o servidor. Suas alterações serão sincronizadas ao reconectar.',
};

export const firestoreErrorMessage = (error: unknown, overrides: Overrides = {}): string => {
  const code = typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
  if (code === 'permission-denied' && overrides.permissionDenied) return overrides.permissionDenied;
  return messages[code] ?? 'Algo deu errado. Tente novamente.';
};
