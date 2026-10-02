import { afterAll, beforeAll, it } from 'vitest';
import { assertFails, type RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { doc, getDoc } from 'firebase/firestore';
import { asUser, setupEnv } from './setup';

let env: RulesTestEnvironment;

beforeAll(async () => {
  env = await setupEnv();
});

afterAll(() => env.cleanup());

it('denies access to unknown paths', async () => {
  await assertFails(getDoc(doc(asUser(env, 'A'), 'unknown/x')));
});
