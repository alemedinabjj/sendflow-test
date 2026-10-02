import type { BulkWriter, Firestore } from 'firebase-admin/firestore';

export type CascadeResult = { contacts: number; messages: number };

const deleteChildren = async (
  db: Firestore,
  writer: BulkWriter,
  collection: 'contacts' | 'messages',
  connectionId: string,
  tenantId: string,
): Promise<number> => {
  const snapshot = await db
    .collection(collection)
    .where('tenantId', '==', tenantId)
    .where('connectionId', '==', connectionId)
    .get();
  snapshot.docs.forEach((doc) => writer.delete(doc.ref));
  return snapshot.size;
};

export const cascadeDeleteConnection = async (
  db: Firestore,
  connectionId: string,
  tenantId: string,
): Promise<CascadeResult> => {
  const writer = db.bulkWriter();
  const [contacts, messages] = await Promise.all([
    deleteChildren(db, writer, 'contacts', connectionId, tenantId),
    deleteChildren(db, writer, 'messages', connectionId, tenantId),
  ]);
  await writer.close();
  return { contacts, messages };
};
