import { beforeEach, describe, expect, it } from 'vitest';
import { Timestamp } from 'firebase-admin/firestore';
import { clearFirestore, testDb } from '../test-utils';
import { runDispatch } from './runDispatch';

const db = testDb();
const now = Timestamp.now();
const minutesFromNow = (minutes: number) => Timestamp.fromMillis(now.toMillis() + minutes * 60_000);

const message = (status: 'scheduled' | 'sent', scheduledAt: Timestamp | null) => ({
  tenantId: 'A',
  connectionId: 'cA',
  body: 'Olá',
  recipients: [{ contactId: 'k1', name: 'Maria', phone: '5511988887777' }],
  status,
  scheduledAt,
  sentAt: status === 'sent' ? now : null,
  createdAt: now,
  updatedAt: now,
});

beforeEach(async () => {
  await clearFirestore();
  const writes = [
    ...[-5, -4, -3, -2, -1].map((m, i) => db.doc(`messages/due${i}`).set(message('scheduled', minutesFromNow(m)))),
    db.doc('messages/future').set(message('scheduled', minutesFromNow(10))),
    db.doc('messages/old').set(message('sent', null)),
  ];
  await Promise.all(writes);
});

describe('runDispatch', () => {
  it('marks every due message as sent across pages', async () => {
    const result = await runDispatch(db, now, 2);

    expect(result).toEqual({ sent: 5, failed: 0 });
    const due = await db.collection('messages').where('status', '==', 'sent').get();
    expect(due.size).toBe(6);
    expect(due.docs.filter((d) => d.id.startsWith('due')).every((d) => d.get('sentAt') !== null)).toBe(true);
    expect((await db.doc('messages/future').get()).get('status')).toBe('scheduled');
  });

  it('is idempotent', async () => {
    await runDispatch(db, now, 2);
    expect(await runDispatch(db, now, 2)).toEqual({ sent: 0, failed: 0 });
  });
});
