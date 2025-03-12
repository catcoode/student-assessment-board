import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";  // Assuming this imports your Firestore instance
import { GradeProps } from "../components/Grades"; // Import the CourseProps type

const coursesCollection = collection(db, "grades");
// 📌 Add a new course
export const addGrade = async (grade: Omit<GradeProps, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "grades"), grade);
        console.log("Grade added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding grade:", error);
    }
};