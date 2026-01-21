import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// PASTE CONFIG DARI FIREBASE CONSOLE DI SINI 👇
const firebaseConfig = {
    apiKey: "AIzaSyAWyA-hD5nNO4UhjBes9JqRaTn65hoJBzo",
    authDomain: "road-to-10m.firebaseapp.com",
    projectId: "road-to-10m",
    storageBucket: "road-to-10m.firebasestorage.app",
    messagingSenderId: "18652889483",
    appId: "1:18652889483:web:88f397ffa5229e4d2aaf8e",
    measurementId: "G-2PT2BSC1DK"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);