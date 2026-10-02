import { createRequire } from 'node:module';

process.env.FIRESTORE_EMULATOR_HOST ??= '127.0.0.1:8080';

const require = createRequire(import.meta.url);
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, Timestamp } = require('firebase-admin/firestore');
const { runDispatch } = require('../lib/scheduler/runDispatch.js');

initializeApp({ projectId: 'demo-sendflow' });
console.log(await runDispatch(getFirestore(), Timestamp.now()));
