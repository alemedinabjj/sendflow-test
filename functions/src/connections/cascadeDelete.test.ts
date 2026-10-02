import { beforeEach, describe, expect, it } from 'vitest';
import { clearFirestore, testDb } from '../test-utils';
import { cascadeDeleteConnection } from './cascadeDelete';

const db = testDb();

beforeEach(async () => {
  await clearFirestore();
  await Promise.all([
    db.doc('contacts/k1').set({ tenantId: 'A', connectionId: 'c1' }),
    db.doc('contacts/k2').set({ tenantId: 'A', connectionId: 'c1' }),
    db.doc('contacts/k3').set({ tenantId: 'A', connectionId: 'c2' }),
    db.doc('contacts/kB').set({ tenantId: 'B', connectionId: 'c1' }),
    db.doc('messages/m1').set({ tenantId: 'A', connectionId: 'c1' }),
    db.doc('messages/m2').set({ tenantId: 'A', connectionId: 'c1' }),
  ]);
});

describe('cascadeDeleteConnection', () => {
  it('removes contacts and messages of the connection only', async () => {
    expect(await cascadeDeleteConnection(db, 'c1', 'A')).toEqual({ contacts: 2, messages: 2, failed: 0 });

    expect((await db.doc('contacts/k3').get()).exists).toBe(true);
    expect((await db.doc('contacts/kB').get()).exists).toBe(true);
    expect((await db.collection('messages').get()).size).toBe(0);
  });

  it('is idempotent', async () => {
    await cascadeDeleteConnection(db, 'c1', 'A');
    expect(await cascadeDeleteConnection(db, 'c1', 'A')).toEqual({ contacts: 0, messages: 0, failed: 0 });
  });
});
