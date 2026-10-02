import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { asAnon, asUser, seed, setupEnv } from './setup';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await setupEnv();
});
beforeEach(() => env.clearFirestore());
afterAll(() => env.cleanup());

const connection = (tenantId: string, name = 'Vendas') => ({
  tenantId,
  name,
  createdAt: serverTimestamp(),
  updatedAt: serverTimestamp(),
});

const seedA = () =>
  seed(env, 'connections/cA', { tenantId: 'A', name: 'Vendas', createdAt: new Date(), updatedAt: new Date() });

describe('connections create', () => {
  it('owner creates with own tenantId', async () => {
    await assertSucceeds(setDoc(doc(asUser(env, 'A'), 'connections/c1'), connection('A')));
  });

  it('cannot create for another tenant', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'connections/c1'), connection('B')));
  });

  it('rejects empty name', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'connections/c1'), connection('A', '')));
  });

  it('rejects name longer than 60 chars', async () => {
    await assertFails(
      setDoc(doc(asUser(env, 'A'), 'connections/c1'), connection('A', 'x'.repeat(61))),
    );
  });

  it('rejects extra fields', async () => {
    await assertFails(
      setDoc(doc(asUser(env, 'A'), 'connections/c1'), { ...connection('A'), admin: true }),
    );
  });

  it('rejects client-provided createdAt', async () => {
    await assertFails(
      setDoc(doc(asUser(env, 'A'), 'connections/c1'), {
        ...connection('A'),
        createdAt: new Date(2000, 0, 1),
      }),
    );
  });
});

describe('connections isolation', () => {
  it('other tenant cannot read', async () => {
    await seedA();
    await assertFails(getDoc(doc(asUser(env, 'B'), 'connections/cA')));
  });

  it('other tenant cannot update', async () => {
    await seedA();
    await assertFails(
      updateDoc(doc(asUser(env, 'B'), 'connections/cA'), { name: 'x', updatedAt: serverTimestamp() }),
    );
  });

  it('other tenant cannot delete', async () => {
    await seedA();
    await assertFails(deleteDoc(doc(asUser(env, 'B'), 'connections/cA')));
  });

  it('anonymous cannot read', async () => {
    await seedA();
    await assertFails(getDoc(doc(asAnon(env), 'connections/cA')));
  });

  it('query filtered by own tenantId succeeds', async () => {
    await seedA();
    const db = asUser(env, 'A');
    await assertSucceeds(getDocs(query(collection(db, 'connections'), where('tenantId', '==', 'A'))));
  });

  it('unfiltered query is rejected', async () => {
    await seedA();
    await assertFails(getDocs(collection(asUser(env, 'A'), 'connections')));
  });
});

describe('connections update/delete', () => {
  it('owner renames', async () => {
    await seedA();
    await assertSucceeds(
      updateDoc(doc(asUser(env, 'A'), 'connections/cA'), {
        name: 'Suporte',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('owner cannot change tenantId', async () => {
    await seedA();
    await assertFails(
      updateDoc(doc(asUser(env, 'A'), 'connections/cA'), {
        tenantId: 'B',
        updatedAt: serverTimestamp(),
      }),
    );
  });

  it('owner deletes', async () => {
    await seedA();
    await assertSucceeds(deleteDoc(doc(asUser(env, 'A'), 'connections/cA')));
  });
});
