import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export type MessageStatus = 'scheduled' | 'sent';

export type Dispatchable = {
  status: MessageStatus;
  scheduledAt: Timestamp | null;
};

export const isDue = (message: Dispatchable, now: Timestamp): boolean =>
  message.status === 'scheduled' &&
  message.scheduledAt !== null &&
  message.scheduledAt.toMillis() <= now.toMillis();

export const sentPatch = () => ({
  status: 'sent' as const,
  sentAt: FieldValue.serverTimestamp(),
  updatedAt: FieldValue.serverTimestamp(),
});
