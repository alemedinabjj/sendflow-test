import { useContext } from 'react';
import { AuthContext, type AuthState } from './authContext';

export const useAuth = (): AuthState => useContext(AuthContext);

export const useTenantId = (): string => {
  const { user } = useAuth();
  if (!user) throw new Error('useTenantId must be used inside a protected route');
  return user.uid;
};
