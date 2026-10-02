import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { readOnlyConverter } from '../../shared/firestoreConverter';
import type { Message, Recipient } from './schema';

const messages = collection(db, 'messages');

export const messagesQuery = (tenantId: string, connectionId: string) =>
  query(
    messages,
    where('tenantId', '==', tenantId),
    where('connectionId', '==', connectionId),
    orderBy('createdAt', 'desc'),
  ).withConverter(readOnlyConverter<Message>());

type NewMessage = { tenantId: string; connectionId: string; recipients: Recipient[]; body: string };

export const sendNow = async ({ tenantId, connectionId, recipients, body }: NewMessage): Promise<void> => {
  await addDoc(messages, {
    tenantId,
    connectionId,
    body,
    recipients,
    status: 'sent',
    scheduledAt: null,
    sentAt: serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const scheduleMessage = async (message: NewMessage, scheduledAt: Date): Promise<void> => {
  await addDoc(messages, {
    ...message,
    status: 'scheduled',
    scheduledAt: Timestamp.fromDate(scheduledAt),
    sentAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateScheduledMessage = (
  id: string,
  { body, recipients, scheduledAt }: { body: string; recipients: Recipient[]; scheduledAt: Date },
): Promise<void> =>
  updateDoc(doc(messages, id), {
    body,
    recipients,
    scheduledAt: Timestamp.fromDate(scheduledAt),
    updatedAt: serverTimestamp(),
  });

export const deleteMessage = (id: string): Promise<void> => deleteDoc(doc(messages, id));
