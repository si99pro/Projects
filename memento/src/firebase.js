// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyC1i7yW6N2gGNXhlD2HAO-2PeQyfVU37_g", // RESTRICT THIS API KEY!
    authDomain: "si99-access.firebaseapp.com",
    databaseURL: "https://si99-access-default-rtdb.firebaseio.com",
    projectId: "si99-access",
    storageBucket: "si99-access.firebasestorage.app",
    messagingSenderId: "633275206043",
    appId: "1:633275206043:web:595c284e6e0732a8bcb93e",
    measurementId: "G-FXRN61FTYY"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Function to update email verification status in Firestore
const updateEmailStatus = async (user) => {
  if (user && user.emailVerified) {
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        'basicInfo.emailStatus': true,
      });
      console.log('Email verification status updated in Firestore.');
    } catch (error) {
      console.error('Error updating email verification status:', error);
    }
  }
};

// Set up the auth state listener
onAuthStateChanged(auth, (user) => {
  updateEmailStatus(user);
});

export { auth, db }; // Export auth and db for use in other components