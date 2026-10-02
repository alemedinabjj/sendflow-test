import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { readOnlyConverter } from '../../shared/firestoreConverter';
import type { Contact, ContactInput } from './schema';

const contacts = collection(db, 'contacts');

export const contactsQuery = (tenantId: string, connectionId: string) =>
  query(
    contacts,
    where('tenantId', '==', tenantId),
    where('connectionId', '==', connectionId),
    orderBy('name'),
  ).withConverter(readOnlyConverter<Contact>());

export const createContact = async (
  tenantId: string,
  connectionId: string,
  { name, phone }: ContactInput,
): Promise<void> => {
  await addDoc(contacts, {
    tenantId,
    connectionId,
    name,
    phone,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const updateContact = (id: string, { name, phone }: ContactInput): Promise<void> =>
  updateDoc(doc(contacts, id), { name, phone, updatedAt: serverTimestamp() });

export const deleteContact = (id: string): Promise<void> => deleteDoc(doc(contacts, id));
