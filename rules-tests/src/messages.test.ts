import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { asUser, seed, setupEnv } from './setup';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await setupEnv();
});

beforeEach(async () => {
  await env.clearFirestore();
  const stamps = { createdAt: new Date(), updatedAt: new Date() };
  await seed(env, 'connections/cA', { tenantId: 'A', name: 'Vendas', ...stamps });
  await seed(env, 'connections/cB', { tenantId: 'B', name: 'Vendas', ...stamps });
});

afterAll(() => env.cleanup());

const inMinutes = (minutes: number) => new Date(Date.now() + minutes * 60_000);
const recipients = [{ contactId: 'k1', name: 'Maria', phone: '5511988887777' }];

const scheduled = (overrides: Record<string, unknown> = {}) => ({
  tenantId: 'A',
  connectionId: 'cA',
  body: 'Olá!',
  recipients,
  status: 'scheduled',
  scheduledAt: inMinutes(60),
  sentAt: null,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const sent = (overrides: Record<string, unknown> = {}) => ({
  ...scheduled(),
  status: 'sent',
  scheduledAt: null,
  sentAt: serverTimestamp(),
  ...overrides,
});

const seedMessage = (overrides: Record<string, unknown> = {}) =>
  seed(env, 'messages/m1', {
    ...scheduled(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

const write = (data: Record<string, unknown>) => setDoc(doc(asUser(env, 'A'), 'messages/m1'), data);

describe('messages create', () => {
  it('creates scheduled message in the future', async () => {
    await assertSucceeds(write(scheduled()));
  });

  it('rejects scheduled message in the past', async () => {
    await assertFails(write(scheduled({ scheduledAt: inMinutes(-1) })));
  });

  it('creates sent message stamped by server', async () => {
    await assertSucceeds(write(sent()));
  });

  it('rejects sent message with arbitrary sentAt', async () => {
    await assertFails(write(sent({ sentAt: inMinutes(-60) })));
  });

  it('rejects unknown status', async () => {
    await assertFails(write(scheduled({ status: 'failed' })));
  });

  it('rejects empty recipients', async () => {
    await assertFails(write(scheduled({ recipients: [] })));
  });

  it('rejects empty body', async () => {
    await assertFails(write(scheduled({ body: '' })));
  });

  it('accepts 1000 accented characters', async () => {
    await assertSucceeds(write(scheduled({ body: 'ã'.repeat(1000) })));
  });

  it('rejects body longer than 1000 chars', async () => {
    await assertFails(write(scheduled({ body: 'x'.repeat(1001) })));
  });

  it('rejects message in another tenant connection', async () => {
    await assertFails(write(scheduled({ connectionId: 'cB' })));
  });
});

describe('messages update', () => {
  const update = (data: Record<string, unknown>) =>
    updateDoc(doc(asUser(env, 'A'), 'messages/m1'), { updatedAt: serverTimestamp(), ...data });

  it('edits body, recipients and future scheduledAt', async () => {
    await seedMessage();
    await assertSucceeds(
      update({
        body: 'Novo texto',
        recipients: [...recipients, { contactId: 'k2', name: 'João', phone: '551133334444' }],
        scheduledAt: inMinutes(120),
      }),
    );
  });

  it('cannot change status', async () => {
    await seedMessage();
    await assertFails(update({ status: 'sent' }));
  });

  it('cannot set sentAt', async () => {
    await seedMessage();
    await assertFails(update({ sentAt: serverTimestamp() }));
  });

  it('cannot change connectionId', async () => {
    await seed(env, 'connections/cA2', { tenantId: 'A', name: 'x', createdAt: new Date(), updatedAt: new Date() });
    await seedMessage();
    await assertFails(update({ connectionId: 'cA2' }));
  });

  it('update with past scheduledAt denied', async () => {
    await seedMessage({ scheduledAt: inMinutes(-1) });
    await assertFails(update({ body: 'tarde demais' }));
  });

  it('cannot edit a sent message', async () => {
    await seedMessage({ status: 'sent', scheduledAt: null, sentAt: new Date() });
    await assertFails(update({ body: 'editado' }));
  });
});

describe('messages delete and isolation', () => {
  it('owner deletes sent message', async () => {
    await seedMessage({ status: 'sent', scheduledAt: null, sentAt: new Date() });
    await assertSucceeds(deleteDoc(doc(asUser(env, 'A'), 'messages/m1')));
  });

  it('other tenant cannot read', async () => {
    await seedMessage();
    await assertFails(getDoc(doc(asUser(env, 'B'), 'messages/m1')));
  });

  it('other tenant cannot delete', async () => {
    await seedMessage();
    await assertFails(deleteDoc(doc(asUser(env, 'B'), 'messages/m1')));
  });
});
