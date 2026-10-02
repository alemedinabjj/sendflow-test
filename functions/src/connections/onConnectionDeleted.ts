import { getFirestore } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onDocumentDeleted } from 'firebase-functions/v2/firestore';
import { cascadeDeleteConnection } from './cascadeDelete';

export const onConnectionDeleted = onDocumentDeleted(
  { document: 'connections/{connectionId}', region: 'us-central1', retry: true },
  async (event) => {
    const tenantId = event.data?.get('tenantId');
    if (typeof tenantId !== 'string') return;

    const { connectionId } = event.params;
    const result = await cascadeDeleteConnection(getFirestore(), connectionId, tenantId);
    logger.info('connection cascade finished', { connectionId, ...result });
    if (result.failed > 0) throw new Error(`cascade left ${result.failed} documents for ${connectionId}`);
  },
);
