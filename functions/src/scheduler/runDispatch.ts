import type { Firestore, QueryDocumentSnapshot, Timestamp } from 'firebase-admin/firestore';
import { isDue, sentPatch, type Dispatchable } from './dispatch.core';

export type DispatchResult = { sent: number; failed: number };

const duePage = (db: Firestore, now: Timestamp, pageSize: number, cursor?: QueryDocumentSnapshot) => {
  const base = db
    .collection('messages')
    .where('status', '==', 'scheduled')
    .where('scheduledAt', '<=', now)
    .orderBy('scheduledAt')
    .limit(pageSize);
  return (cursor ? base.startAfter(cursor) : base).get();
};

export const runDispatch = async (
  db: Firestore,
  now: Timestamp,
  pageSize = 500,
): Promise<DispatchResult> => {
  const writer = db.bulkWriter();
  writer.onWriteError(() => false);

  const writes: Promise<boolean>[] = [];
  let cursor: QueryDocumentSnapshot | undefined;

  for (;;) {
    const page = await duePage(db, now, pageSize, cursor);
    if (page.empty) break;

    page.docs
      .filter((doc) => isDue(doc.data() as Dispatchable, now))
      .forEach((doc) => {
        // the precondition drops the write if the user edited the message after we read it
        const write = writer
          .update(doc.ref, sentPatch(), { lastUpdateTime: doc.updateTime })
          .then(() => true)
          .catch(() => false);
        writes.push(write);
      });

    cursor = page.docs[page.docs.length - 1];
  }

  await writer.close();
  const outcomes = await Promise.all(writes);
  const sent = outcomes.filter(Boolean).length;
  return { sent, failed: outcomes.length - sent };
};
