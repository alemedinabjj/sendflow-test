import {
  Timestamp,
  type DocumentData,
  type FirestoreDataConverter,
  type QueryDocumentSnapshot,
  type SnapshotOptions,
} from 'firebase/firestore';

type WithId = { id: string };

const toDates = (data: DocumentData): DocumentData =>
  Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value instanceof Timestamp ? value.toDate() : value]),
  );

export const readOnlyConverter = <T extends WithId>(): FirestoreDataConverter<T> => ({
  toFirestore: (model) => model as DocumentData,
  fromFirestore: (snapshot: QueryDocumentSnapshot, options?: SnapshotOptions) =>
    ({
      id: snapshot.id,
      // pending serverTimestamp() writes come back as null unless we ask for a local estimate
      ...toDates(snapshot.data({ ...options, serverTimestamps: 'estimate' })),
    }) as T,
});
