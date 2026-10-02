import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import { assertFails, assertSucceeds, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { asAnon, asUser, seed, setupEnv } from './setup';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await setupEnv();
});
beforeEach(() => env.clearFirestore());
afterAll(() => env.cleanup());

const profile = () => ({ name: 'Alice', email: 'alice@test.com', createdAt: serverTimestamp() });

describe('clients', () => {
  it('owner creates and reads own profile', async () => {
    const db = asUser(env, 'A');
    await assertSucceeds(setDoc(doc(db, 'clients/A'), profile()));
    await assertSucceeds(getDoc(doc(db, 'clients/A')));
  });

  it('cannot create profile for another uid', async () => {
    await assertFails(setDoc(doc(asUser(env, 'A'), 'clients/B'), profile()));
  });

  it('cannot read another profile', async () => {
    await seed(env, 'clients/B', { name: 'Bob', email: 'b@test.com' });
    await assertFails(getDoc(doc(asUser(env, 'A'), 'clients/B')));
  });

  it('cannot delete own profile', async () => {
    await seed(env, 'clients/A', { name: 'Alice', email: 'a@test.com' });
    await assertFails(deleteDoc(doc(asUser(env, 'A'), 'clients/A')));
  });

  it('anonymous cannot read profiles', async () => {
    await seed(env, 'clients/A', { name: 'Alice', email: 'a@test.com' });
    await assertFails(getDoc(doc(asAnon(env), 'clients/A')));
  });
});
