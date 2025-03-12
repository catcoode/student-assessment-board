// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import {getFirestore} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyCjf-hMosWrsvsqTML4cnSMy0QG_zL1PNw",
    authDomain: "student-assessment-board-127c7.firebaseapp.com",
    projectId: "student-assessment-board-127c7",
    storageBucket: "student-assessment-board-127c7.firebasestorage.app",
    messagingSenderId: "23362337175",
    appId: "1:23362337175:web:dbb792b526aa5c71d32cd2",
    measurementId: "G-NT5D131K5N"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
let analytics;
if (typeof window !== "undefined") {
    analytics = getAnalytics(app);
}

const db = getFirestore(app); // This is the Firestore instance

export { db };