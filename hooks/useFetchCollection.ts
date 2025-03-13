import { useState, useEffect, useCallback } from "react"; // import hooks
import { collection, getDocs } from "firebase/firestore"; // getDocs for fetching entire collection
import { db } from "@/firebase/firebaseConfig";

function useFetchCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // function to fetch collection from database
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, collectionName));
      const fetchedData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as T[];

      setData(fetchedData);
      setError(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, [collectionName]);

  // Function to manually trigger a refresh
  const refetch = useCallback(() => {
    setRefreshTrigger(prev => prev + 1);
    return fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchData();
  }, [fetchData, refreshTrigger]);

  return { data, loading, error, refetch };
}

export default useFetchCollection;