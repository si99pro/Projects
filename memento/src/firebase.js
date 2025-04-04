// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC_8DotsbDkaJyJPrcs5juFae8saZ61M3Y",
  authDomain: "univerbase.firebaseapp.com",
  databaseURL: "https://univerbase-default-rtdb.firebaseio.com/",
  projectId: "univerbase",
  storageBucket: "univerbase.firebasestorage.app",
  messagingSenderId: "357081716576",
  appId: "1:357081716576:web:ec3758fd748c14cf10f005",
  measurementId: "G-SEVR8H54QJ"
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