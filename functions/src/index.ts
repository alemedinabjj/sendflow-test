import { initializeApp } from 'firebase-admin/app';

initializeApp();

export { dispatchScheduledMessages } from './scheduler/dispatchScheduledMessages';
