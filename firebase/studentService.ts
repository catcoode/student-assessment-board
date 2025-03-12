import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { StudentProps } from "../components/Student";

const studentsCollection = collection(db, "students");


export const addStudent = async (student: Omit<StudentProps, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "students"), student);
        console.log("Student added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding student:", error);
    }
};
export const getStudents = async (): Promise<{ id: string; name: string }[]> => {
    const querySnapshot = await getDocs(collection(db, "students"));
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            name: `${data.firstName || ''} ${data.lastName || ''}`.trim(), // Combine firstName and lastName
        };
    });
};
