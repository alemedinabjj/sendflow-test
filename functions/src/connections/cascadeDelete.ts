import type { BulkWriter, Firestore } from 'firebase-admin/firestore';

export type CascadeResult = { contacts: number; messages: number; failed: number };

const enqueueDeletes = async (
  db: Firestore,
  writer: BulkWriter,
  collection: 'contacts' | 'messages',
  connectionId: string,
  tenantId: string,
): Promise<Promise<boolean>[]> => {
  const snapshot = await db
    .collection(collection)
    .where('tenantId', '==', tenantId)
    .where('connectionId', '==', connectionId)
    .get();
  return snapshot.docs.map((doc) =>
    writer
      .delete(doc.ref)
      .then(() => true)
      .catch(() => false),
  );
};

const countSucceeded = async (writes: Promise<boolean>[]) => (await Promise.all(writes)).filter(Boolean).length;

export const cascadeDeleteConnection = async (
  db: Firestore,
  connectionId: string,
  tenantId: string,
): Promise<CascadeResult> => {
  const writer = db.bulkWriter();
  const [contactWrites, messageWrites] = await Promise.all([
    enqueueDeletes(db, writer, 'contacts', connectionId, tenantId),
    enqueueDeletes(db, writer, 'messages', connectionId, tenantId),
  ]);
  await writer.close();

  const contacts = await countSucceeded(contactWrites);
  const messages = await countSucceeded(messageWrites);
  return { contacts, messages, failed: contactWrites.length + messageWrites.length - contacts - messages };
};
