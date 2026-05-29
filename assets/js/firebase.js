/* =========================
   FIREBASE CONFIG
   NORQHALIF PORTFOLIO
========================= */

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDEg4ec6PDqUVEof55BZtb9PwY0y5YhkHA",
    authDomain: "norqhalif.firebaseapp.com",
    projectId: "norqhalif",
    storageBucket: "norqhalif.firebasestorage.app",
    messagingSenderId: "451443459067",
    appId: "1:451443459067:web:719a29a2f99b67215e015e"
};

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);
const auth = getAuth(app);

export {
    db,
    auth,

    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    where,
    serverTimestamp,

    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
};