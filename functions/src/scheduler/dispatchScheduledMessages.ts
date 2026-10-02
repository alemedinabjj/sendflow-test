import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { logger } from 'firebase-functions';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { runDispatch } from './runDispatch';

export const dispatchScheduledMessages = onSchedule(
  {
    schedule: 'every 1 minutes',
    region: 'southamerica-east1',
    timeZone: 'America/Sao_Paulo',
  },
  async () => {
    const result = await runDispatch(getFirestore(), Timestamp.now());
    logger.info('dispatch finished', result);
  },
);
