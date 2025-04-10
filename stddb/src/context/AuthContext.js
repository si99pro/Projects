/* eslint-disable react-hooks/exhaustive-deps */
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';
import { app } from '../firebase'; // Import initialized app

const AuthContext = createContext();

// --- Hardcoded Admin Email (Consider moving to config/env for better security later) ---
const ADMIN_EMAIL = 'si99pro@gmail.com';

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null); // Holds the full Firestore document { basicInfo: {...}, role: '...' }
  const [isAdmin, setIsAdmin] = useState(false); // <-- State for admin status
  const [loading, setLoading] = useState(true);
  const auth = getAuth(app);
  const db = getFirestore(app);

  // --- Helper function to sync Firestore emailVerified status ---
  // Checks basicInfo.emailVerified against auth user.emailVerified
  const syncFirestoreEmailVerification = async (user) => {
    // ... (function remains unchanged) ...
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const firestoreData = userDocSnap.data();
        const firestoreVerifiedStatus = firestoreData?.basicInfo?.emailVerified;
        if (firestoreVerifiedStatus !== undefined && firestoreVerifiedStatus !== user.emailVerified) {
            console.log(`Syncing basicInfo.emailVerified status for user ${user.uid} from ${firestoreVerifiedStatus} to ${user.emailVerified}`);
            await updateDoc(userDocRef, { 'basicInfo.emailVerified': user.emailVerified });
        }
      } else { console.warn(`syncFirestoreEmailVerification: No document found for user ${user.uid}.`); }
    } catch (error) { console.error("Error syncing email verification status:", error); }
  };


  // --- SIGNUP FUNCTION (UPDATED for conditional Admin Role) ---
  async function signup(email, password, additionalUserData) { // Receives { fullName, studentId, session, profileBgColor }
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);

    // ---> Determine the role based on the email <---
    // Convert email to lowercase for case-insensitive comparison
    const userRole = user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';
    console.log(`Assigning role: ${userRole} for email: ${user.email}`);

    // Prepare the data for Firestore
    const userDocData = {
      // basicInfo holds profile data
      basicInfo: {
        uid: user.uid,
        email: user.email, // Store email here if needed for profile display
        emailVerified: user.emailVerified, // Store initial verification status
        createdAt: serverTimestamp(),
        fullName: additionalUserData.fullName || '',
        studentId: additionalUserData.studentId || '',
        session: additionalUserData.session || '',
        profileBgColor: additionalUserData.profileBgColor || '#607D8B',
        profileImageUrl: null,
      },
      // ---> Assign the determined role <---
      role: userRole
    };

    // Save the prepared data
    await setDoc(userDocRef, userDocData);

    await sendEmailVerification(user);
    console.log(`User ${user.uid} created with data:`, userDocData);
    return userCredential; // Return the credential as before
  }
  // --- END SIGNUP UPDATE ---


  // --- LOGIN FUNCTION ---
  async function login(email, password) {
    // ... (function remains unchanged) ...
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    if (!userCredential.user.emailVerified) {
        console.log("Login attempt for unverified email:", userCredential.user.email);
        await syncFirestoreEmailVerification(userCredential.user);
        throw new Error("EMAIL_NOT_VERIFIED");
    }
    await syncFirestoreEmailVerification(userCredential.user);
    console.log("Login successful for verified email:", userCredential.user.email);
    return userCredential;
  }


  // --- LOGOUT FUNCTION ---
  function logout() {
    // ... (function remains unchanged) ...
    console.log("Logging out user.");
    setUserData(null);
    setIsAdmin(false);
    setCurrentUser(null);
    return signOut(auth);
  }


  // --- RESEND VERIFICATION EMAIL FUNCTION ---
  async function resendVerificationEmail() {
    // ... (function remains unchanged) ...
    if (!currentUser) {
      console.error("resendVerificationEmail: No user is currently signed in according to AuthContext.");
      throw new Error("No user is currently signed in.");
    }
    if (currentUser.emailVerified) {
      console.warn("resendVerificationEmail: Email is already verified for:", currentUser.email);
      throw new Error("Email is already verified.");
    }
    try {
      await sendEmailVerification(currentUser);
      console.log("Verification email resent successfully to:", currentUser.email);
    } catch (error) {
      console.error("Error resending verification email:", error);
      throw error;
    }
  }


  // --- Auth State Listener ---
  useEffect(() => {
    // ... (function remains unchanged - it already reads the top-level 'role') ...
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed. User:', user ? user.uid : 'null');
      setCurrentUser(user);

      if (user) {
        await syncFirestoreEmailVerification(user);

        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const fetchedUserData = docSnap.data();
            console.log("User data fetched:", fetchedUserData);
            setUserData(fetchedUserData);

            const isAdminUser = fetchedUserData.role === 'admin';
            setIsAdmin(isAdminUser);
            console.log(`User admin status set to: ${isAdminUser} (Role: ${fetchedUserData.role})`);

          } else {
            console.warn(`No Firestore document found for authenticated user ${user.uid}. Logging user out.`);
            setUserData(null);
            setIsAdmin(false);
            await logout();
          }
        } catch (error) {
          console.error("Error fetching user data during auth state change:", error);
          setUserData(null);
          setIsAdmin(false);
        }
      } else {
        setUserData(null);
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return () => {
      console.log("Unsubscribing from onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [auth, db]);


  // --- Context Value ---
  const value = {
    currentUser,
    userData,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    resendVerificationEmail,
  };

  // Render children only after the initial loading is false
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}