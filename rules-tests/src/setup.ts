import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { doc, setDoc, type DocumentData } from 'firebase/firestore';

export const setupEnv = (): Promise<RulesTestEnvironment> =>
  initializeTestEnvironment({
    projectId: 'demo-sendflow',
    firestore: {
      rules: readFileSync(resolve(__dirname, '../../firestore.rules'), 'utf8'),
    },
  });

export const asUser = (env: RulesTestEnvironment, uid: string) =>
  env.authenticatedContext(uid).firestore();

export const asAnon = (env: RulesTestEnvironment) => env.unauthenticatedContext().firestore();

export const seed = (env: RulesTestEnvironment, path: string, data: DocumentData) =>
  env.withSecurityRulesDisabled(async (ctx) => {
    await setDoc(doc(ctx.firestore(), path), data);
  });
