import { useMemo } from 'react';
import { useFirestoreQuery } from '../../shared/hooks/useFirestoreQuery';
import { contactsQuery } from './api';

export const useContacts = (tenantId: string, connectionId: string) =>
  useFirestoreQuery(useMemo(() => contactsQuery(tenantId, connectionId), [tenantId, connectionId]));
