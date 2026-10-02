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
  await seed(env, 'connections/cA2', { tenantId: 'A', name: 'Suporte', ...stamps });
  await seed(env, 'connections/cB', { tenantId: 'B', name: 'Vendas', ...stamps });
});

afterAll(() => env.cleanup());

const contact = (overrides: Record<string, unknown> = {}) => ({
  tenantId: 'A',
  connectionId: 'cA',
  name: 'Maria',
  phone: '5511988887777',
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
  ...overrides,
});

const seedContact = () =>
  seed(env, 'contacts/k1', {
    ...contact(),
    createdAt: new Date(),
    updatedAt: new Date(),
  });

describe('contacts create', () => {
  it('owner creates contact in own connection', async () => {
    await assertSucceeds(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact()));
  });

  it('cannot create contact in another tenant connection', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact({ connectionId: 'cB' })));
  });

  it('cannot create contact in nonexistent connection', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact({ connectionId: 'nope' })));
  });

  it('cannot create contact with another tenantId', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact({ tenantId: 'B' })));
  });

  it('rejects phone without country code', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact({ phone: '11988887777' })));
  });

  it('rejects name longer than 80 chars', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'contacts/k1'), contact({ name: 'x'.repeat(81) })));
  });
});

describe('contacts isolation and update', () => {
  it('other tenant cannot read', async () => {
    await seedContact();
    await assertFails(getDoc(doc(asUser(env, 'B'), 'contacts/k1')));
  });

  it('owner cannot move contact to another connection', async () => {
    await seedContact();
    await assertFails(
      updateDoc(doc(asUser(env, 'A'), 'contacts/k1'), {
        connectionId: 'cA2',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('owner edits name and phone', async () => {
    await seedContact();
    await assertSucceeds(
      updateDoc(doc(asUser(env, 'A'), 'contacts/k1'), {
        name: 'Maria Silva',
        phone: '551133334444',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('other tenant cannot delete', async () => {
    await seedContact();
    await assertFails(deleteDoc(doc(asUser(env, 'B'), 'contacts/k1')));
  });

  it('owner deletes', async () => {
    await seedContact();
    await assertSucceeds(deleteDoc(doc(asUser(env, 'A'), 'contacts/k1')));
  });
});
