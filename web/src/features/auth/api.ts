import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { doc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../../lib/firebase';
import type { LoginInput, SignupInput } from './schema';

export const signUp = async ({ name, email, password }: SignupInput): Promise<void> => {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await Promise.all([
    updateProfile(user, { displayName: name }),
    setDoc(doc(db, 'clients', user.uid), { name, email, createdAt: serverTimestamp() }),
  ]);
};

export const signIn = async ({ email, password }: LoginInput): Promise<void> => {
  await signInWithEmailAndPassword(auth, email, password);
};

export const signOut = (): Promise<void> => firebaseSignOut(auth);

export const errorCode = (error: unknown): string =>
  typeof error === 'object' && error !== null && 'code' in error ? String(error.code) : '';
