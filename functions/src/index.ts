import * as admin from 'firebase-admin';
import { autoClockOutWorker } from './autoClockOutWorker';

if (!admin.apps.length) admin.initializeApp();

export { autoClockOutWorker };
