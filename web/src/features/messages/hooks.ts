import { useMemo } from 'react';
import { useFirestoreQuery } from '../../shared/hooks/useFirestoreQuery';
import { messagesQuery } from './api';

export const useMessages = (tenantId: string, connectionId: string) =>
  useFirestoreQuery(useMemo(() => messagesQuery(tenantId, connectionId), [tenantId, connectionId]));
