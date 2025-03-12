import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";  // Assuming this imports your Firestore instance
import { CourseProps } from "../components/Course"; // Import the CourseProps type

const coursesCollection = collection(db, "courses");
// 📌 Add a new course
export const addCourse = async (course: Omit<CourseProps, "id">) => {
    try {
        const docRef = await addDoc(collection(db, "courses"), course);
        console.log("Course added with ID:", docRef.id);
    } catch (error) {
        console.error("Error adding course:", error);
    }
};

// Get all courses

export const getCourses = async (): Promise<{ id: string; title: string }[]> => {
    const querySnapshot = await getDocs(collection(db, "courses"));
    return querySnapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().name || "", // Ensure 'name' exists
    }));
}
// Update Course
export const updateCourse = async (courseId: string, updatedCourse: Partial<CourseProps>) => {
    try {
        const courseRef = doc(db, "courses", courseId);
        await updateDoc(courseRef, updatedCourse);
        console.log("Course updated successfully:", courseId);
        return true;
    } catch (error) {
        console.error("Error updating course:", error);
        return false;
    }
};
