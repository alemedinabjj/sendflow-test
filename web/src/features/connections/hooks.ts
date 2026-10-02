import { useMemo } from 'react';
import { useFirestoreDoc } from '../../shared/hooks/useFirestoreDoc';
import { useFirestoreQuery } from '../../shared/hooks/useFirestoreQuery';
import { connectionRef, connectionsQuery } from './api';

export const useConnections = (tenantId: string) =>
  useFirestoreQuery(useMemo(() => connectionsQuery(tenantId), [tenantId]));

export const useConnection = (id: string) => useFirestoreDoc(useMemo(() => connectionRef(id), [id]));
