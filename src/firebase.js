import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  deleteUser,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  getDoc,
  setDoc,
  writeBatch,
  doc,
  onSnapshot,
  deleteDoc,
  updateDoc,
  where,
  query,
} from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChf1mQWFQvhFj8TmyNiXf29CBGzUticpY",
  authDomain: "lasto-swertres-system.firebaseapp.com",
  projectId: "lasto-swertres-system",
  storageBucket: "lasto-swertres-system.firebasestorage.app",
  messagingSenderId: "713494483028",
  appId: "1:713494483028:web:e2d1b6198b6925eb071dc1",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export {
  db,
  collection,
  addDoc,
  getDoc,
  getDocs,
  signOut,
  doc,
  deleteDoc,
  onSnapshot,
  setDoc,
  writeBatch,
  deleteUser,
  where,
  updateDoc,
  onAuthStateChanged,
  query,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  getAuth,
};
