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
import type { Connection, ConnectionInput } from './schema';

const converter = readOnlyConverter<Connection>();
const connections = collection(db, 'connections');

export const connectionsQuery = (tenantId: string) =>
  query(connections, where('tenantId', '==', tenantId), orderBy('createdAt', 'desc')).withConverter(converter);

export const connectionRef = (id: string) => doc(connections, id).withConverter(converter);

export const createConnection = async (tenantId: string, { name }: ConnectionInput): Promise<string> => {
  const ref = await addDoc(connections, {
    tenantId,
    name,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
};

export const renameConnection = (id: string, { name }: ConnectionInput): Promise<void> =>
  updateDoc(doc(connections, id), { name, updatedAt: serverTimestamp() });

export const deleteConnection = (id: string): Promise<void> => deleteDoc(doc(connections, id));
