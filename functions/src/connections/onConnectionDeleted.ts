import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { cascadeDeleteConnection } from './cascadeDelete';

export const onConnectionDeleted = onDocumentDeleted(
  { document: 'connections/{connectionId}', region: 'us-central1' },
  async (event) => {
    const tenantId = event.data?.get('tenantId');
    if (typeof tenantId !== 'string') return;

    const result = await cascadeDeleteConnection(getFirestore(), event.params.connectionId, tenantId);
    logger.info('connection cascade finished', { connectionId: event.params.connectionId, ...result });
  },
);
