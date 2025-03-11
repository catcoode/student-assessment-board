import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";
import { StudentProps } from "../components/Student";

export const addStudent = async (student: Omit<StudentProps, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "students"), student);
        console.log("Student added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding student:", error);
    }
};
