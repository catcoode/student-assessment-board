import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
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
export const deleteStudent = async (studentsId: string) => {
    try {
        const gradesRef = collection(db, "grades");

        const q = query(gradesRef, where("studentId", "==", studentsId));
        const querySnapshot = await getDocs(q);

        const deletePromises = querySnapshot.docs.map((docSnapshot) =>
            deleteDoc(doc(db, "grades", docSnapshot.id))
        );

        await Promise.all(deletePromises);

        console.log(`Deleted ${querySnapshot.size} associated grades.`);

        const studentRef = doc(db, "students", studentsId);
        await deleteDoc(studentRef);

        console.log("Student deleted successfully:", studentsId);
        return true;
    } catch (error) {
        console.error("Error deleting student:", error);
        return false;
    }
};