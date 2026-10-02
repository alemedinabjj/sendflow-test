import { useEffect, useState } from 'react';
import { onSnapshot, type DocumentReference, type FirestoreError } from 'firebase/firestore';

export type DocState<T> = { data: T | null; loading: boolean; error: FirestoreError | null };

type Result<T> = { source: DocumentReference<T>; data: T | null; error: FirestoreError | null };

export const useFirestoreDoc = <T>(ref: DocumentReference<T> | null): DocState<T> => {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!ref) return;
    return onSnapshot(
      ref,
      (snapshot) => setResult({ source: ref, data: snapshot.data() ?? null, error: null }),
      (error) => setResult({ source: ref, data: null, error }),
    );
  }, [ref]);

  const current = result?.source === ref ? result : null;
  return {
    data: current?.data ?? null,
    loading: ref !== null && current === null,
    error: current?.error ?? null,
  };
};
