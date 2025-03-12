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

// Function to update an existing student in Firestore
export const updateStudent = async (id: string, updatedStudent: Partial<StudentProps>) => {
    try {
        const studentRef = doc(db, "students", id);
        await updateDoc(studentRef, updatedStudent);
        console.log("Student updated successfully");
    } catch (error) {
        console.error("Error updating student:", error);
    }
};
