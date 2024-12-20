/* ====== IMPORTS ====== */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getDatabase } from "firebase/database";  // Add this for Realtime Database

/* ====== CONFIG ====== */
const firebaseConfig = {
    apiKey: "AIzaSyBtrgrVsEcyhmIcc5eZWW7qYZSSfpwnXOE",
    authDomain: "login-auth-4736e.firebaseapp.com",
    projectId: "culturelens-4872c",
    storageBucket: "login-auth-4736e.appspot.com",
    messagingSenderId: "10562914305",
    appId: "1:10562914305:web:2cff37be4fa9ccf0a29800"
};

/* ====== INITIALIZATION & EXPORTS ====== */
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const realtimeDb = getDatabase(app); 

export default app;
