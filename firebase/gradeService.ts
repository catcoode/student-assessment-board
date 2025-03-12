import { collection, addDoc, getDocs, query, where, doc, updateDoc } from "firebase/firestore";
import { db } from "./firebaseConfig"; // Assuming this imports your Firestore instance
import { GradeProps } from "../components/Grades"; // Import the GradeProps type

const gradesCollection = collection(db, "grades");

export const addGrade = async (grade: Omit<GradeProps, "id">) => {
    try {
        // Query for an existing grade with the same studentId and courseId
        const q = query(
            gradesCollection,
            where("courseId", "==", grade.courseId),
            where("studentId", "==", grade.studentId)
        );

        const querySnapshot = await getDocs(q);
        if (grade.grade<6 && grade.grade>0) {
            if (!querySnapshot.empty) {
                // Grade entry already exists, check the score
                const existingGradeDoc = querySnapshot.docs[0];
                const existingGradeData = existingGradeDoc.data() as GradeProps;

                if (grade.grade > existingGradeData.grade) {
                    // Update the existing grade only if the new score is higher
                    await updateDoc(doc(db, "grades", existingGradeDoc.id), {
                        grade: grade.grade,
                    });
                    console.log("Existing grade updated with a higher score:", grade.grade);
                } else {
                    console.log("New grade is not higher, no update performed.");
                }
            } else {
                // No existing grade found, add a new one
                const docRef = await addDoc(gradesCollection, grade);
                console.log("New grade added with ID:", docRef.id);
            }
        }
        else {
            alert("Grade is too high");
            console.log("Score is too high:", grade.grade);
        }
    } catch (error) {
        console.error("Error adding/updating grade:", error);
    }
};
