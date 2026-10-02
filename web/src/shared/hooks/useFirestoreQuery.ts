import { useEffect, useState } from 'react';
import { onSnapshot, type FirestoreError, type Query } from 'firebase/firestore';

export type QueryState<T> = { data: T[]; loading: boolean; error: FirestoreError | null };

type Result<T> = { source: Query<T>; data: T[]; error: FirestoreError | null };

export const useFirestoreQuery = <T>(query: Query<T> | null): QueryState<T> => {
  const [result, setResult] = useState<Result<T> | null>(null);

  useEffect(() => {
    if (!query) return;
    return onSnapshot(
      query,
      (snapshot) => setResult({ source: query, data: snapshot.docs.map((doc) => doc.data()), error: null }),
      (error) => setResult({ source: query, data: [], error }),
    );
  }, [query]);

  const current = result?.source === query ? result : null;
  return {
    data: current?.data ?? [],
    loading: query !== null && current === null,
    error: current?.error ?? null,
  };
};
