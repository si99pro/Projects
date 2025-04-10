// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
    getFirestore,
    // Import Firestore functions needed by RightSidebar and potentially AuthContext
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc,
    Timestamp, // Import Timestamp type
    setDoc,    // Needed by AuthContext (signup)
    getDoc     // Needed by AuthContext (onAuthStateChanged)
} from 'firebase/firestore';

// Read Firebase configuration from environment variables
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_FIREBASE_APP_ID,
    // measurementId is optional, include if you use Analytics
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
};

// --- Environment Variable Check (Optional but Recommended) ---
// Check if essential config values are present, log warning if not
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
    console.warn(
        "Firebase configuration environment variables (REACT_APP_FIREBASE_API_KEY, REACT_APP_FIREBASE_PROJECT_ID) might be missing. Check your .env file and ensure it's loaded correctly."
    );
}
// --- End Check ---

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);         // Firebase Authentication
const db = getFirestore(app);      // Cloud Firestore Database

// --- Define Specific Collection References ---
// Define the reference for the public chat collection
const publicChatCollectionRef = collection(db, 'publicChat');

// --- Export Services and Functions ---
export {
    // Core instances
    app,
    auth,
    db,

    // Firestore Functions (re-export them)
    collection,
    addDoc,
    query,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    deleteDoc,
    updateDoc,
    Timestamp, // Export the type
    setDoc,    // Export for AuthContext
    getDoc,    // Export for AuthContext

    // Specific Collection References (export with the names components expect)
    publicChatCollectionRef as publicChatCollection
};