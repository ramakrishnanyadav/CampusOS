import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";

// Web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBFWNdy6MFsdQ0ZVQMkWjeoPPMhzQku5Bo",
  authDomain: "campusos-7c3a3.firebaseapp.com",
  projectId: "campusos-7c3a3",
  storageBucket: "campusos-7c3a3.firebasestorage.app",
  messagingSenderId: "761450290896",
  appId: "1:761450290896:web:2db2ff9ff13fac650a08d5",
  measurementId: "G-0ZVF83LCXV",
};

import { getFirestore } from "firebase/firestore";

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

export {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
};
export type { FirebaseUser };
