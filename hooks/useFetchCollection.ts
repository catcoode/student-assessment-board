import { useState, useEffect } from "react"; // import hooks
import { collection, getDocs } from "firebase/firestore"; // getDocs for fetching entire collection
import { db } from "../firebase/firebaseConfig";
import firebase from "firebase/compat";
import DocumentData = firebase.firestore.DocumentData; // database

// Define the data structure expected from Firestore
interface FirestoreDocument {
  id: string;
  [key: string]: any; // Allows additional fields
}

// Hook to fetch an entire collection returns it as list, error or loading (status)
// takes in name of the collection you want to fetch

// function useFetchCollection<T = DocumentData>(collectionName: string){
//   const [data, setData] = useState<T[]>([]); // create a list updated by setData
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<Error | null>(null);
//
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const snapshot = await getDocs(collection(db, collectionName)); //get collection from database db with name collectionName
//         setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as T)));
//  // map data to the list "data"
//       } catch (err) {
//         setError(err as Error); // returns error if error
//       } finally {
//         setLoading(false); // no longer loading
//       }
//     };
//
//     fetchData();
//   }, [collectionName]);
//
//   return { data, loading, error };
// };

function useFetchCollection<T extends { id: string }>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const snapshot = await getDocs(collection(db, collectionName));
        const fetchedData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]; // ✅ Explicitly cast to the correct type

        setData(fetchedData);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionName]);

  return { data, loading, error };
}

// export default useFetchCollection;

export default useFetchCollection;
