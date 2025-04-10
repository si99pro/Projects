/* eslint-disable no-unused-vars */
// src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react'; // Added useCallback, useMemo
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendEmailVerification,
  onAuthStateChanged,
  updateProfile // Added for potential future use (display name sync)
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

// --- Context Definition ---
const AuthContext = createContext(undefined); // Initialize with undefined for better checks

// --- Admin Configuration (IMPORTANT: Move to environment variables in production!) ---
const ADMIN_EMAIL = 'si99pro@gmail.com';

// --- Custom Hook for Consuming Context ---
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// --- Auth Provider Component ---
export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null); // Firebase Auth user object
  const [userData, setUserData] = useState(null);       // Firestore user document data (/users/{uid})
  const [isAdmin, setIsAdmin] = useState(false);         // Derived admin status
  const [loading, setLoading] = useState(true);          // Initial auth check loading state
  const auth = getAuth(app);
  const db = getFirestore(app);

  // --- Helper: Sync Firestore Email Verification Status ---
  // Ensures the 'emailVerified' field in Firestore matches the auth state.
  const syncFirestoreEmailVerification = useCallback(async (user) => {
    if (!user) {
        console.log("syncFirestoreEmailVerification: No user provided, skipping.");
        return;
    }
    const userDocRef = doc(db, 'users', user.uid);
    try {
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists()) {
        const firestoreData = userDocSnap.data();
        // Check if the basicInfo structure and emailVerified field exist
        const firestoreVerifiedStatus = firestoreData?.basicInfo?.emailVerified;
        // Sync only if status exists in Firestore and differs from Auth state
        if (firestoreVerifiedStatus !== undefined && firestoreVerifiedStatus !== user.emailVerified) {
          console.log(`Syncing basicInfo.emailVerified for ${user.uid}: ${firestoreVerifiedStatus} -> ${user.emailVerified}`);
          await updateDoc(userDocRef, { 'basicInfo.emailVerified': user.emailVerified });
        }
      } else {
        console.warn(`syncFirestoreEmailVerification: No Firestore document found for user ${user.uid}. Cannot sync status.`);
      }
    } catch (error) {
      console.error(`Error syncing email verification status for user ${user.uid}:`, error);
    }
  }, [db]); // Dependency: db instance


  // --- Signup Function ---
  const signup = useCallback(async (email, password, additionalUserData) => {
    // additionalUserData expects { fullName, studentId, session, profileBgColor }
    console.log(`Attempting signup for email: ${email}`);
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const userDocRef = doc(db, 'users', user.uid);

    const userRole = user.email.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user';
    console.log(`Assigning role '${userRole}' for user ${user.uid}`);

    const userDocData = {
      basicInfo: {
        uid: user.uid,
        email: user.email,
        emailVerified: user.emailVerified, // Initial status from auth
        createdAt: serverTimestamp(),
        fullName: additionalUserData.fullName || '',
        studentId: additionalUserData.studentId || '',
        session: additionalUserData.session || '',
        profileBgColor: additionalUserData.profileBgColor || '#607D8B', // Default color
        profileImageUrl: null,
         // Could add lastLoginTime: serverTimestamp() here too
      },
      role: userRole
    };

    // Consider updating Firebase Auth profile display name here too (optional but good practice)
    // await updateProfile(user, { displayName: additionalUserData.fullName });

    await setDoc(userDocRef, userDocData);
    console.log(`Firestore document created for user ${user.uid}.`);

    try {
        await sendEmailVerification(user);
        console.log(`Verification email sent to ${user.email}.`);
    } catch(verificationError) {
        console.error(`Failed to send verification email for ${user.uid}:`, verificationError);
        // Decide if signup should still be considered "successful" if email fails
        // Maybe add specific error handling/feedback here
    }

    return userCredential; // Return original credential
  }, [auth, db]); // Dependencies: auth and db instances


  // --- Login Function ---
  const login = useCallback(async (email, password) => {
    console.log(`Attempting login for email: ${email}`);
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Crucial check: Ensure email is verified *before* considering login successful
    if (!user.emailVerified) {
      console.warn(`Login blocked: Email not verified for user ${user.uid}`);
      // Sync status in Firestore just in case, before throwing error
      await syncFirestoreEmailVerification(user);
      // Throw specific error for Login component to handle redirection
      throw new Error("EMAIL_NOT_VERIFIED");
    }

    // Sync status on successful, verified login
    await syncFirestoreEmailVerification(user);
    console.log(`Login successful and verified for user ${user.uid}`);
    // Note: onAuthStateChanged will handle fetching/setting userData and isAdmin
    return userCredential;
  }, [auth, syncFirestoreEmailVerification]); // Dependencies


  // --- Logout Function ---
  const logout = useCallback(async () => {
    console.log("AuthContext: Logging out user...");
    try {
      await signOut(auth);
      // State resets will be triggered by onAuthStateChanged listener
    } catch (error) {
      console.error("Error during logout:", error);
      // Even if signout fails, reset local state as a fallback
      setCurrentUser(null);
      setUserData(null);
      setIsAdmin(false);
    }
  }, [auth]); // Dependency: auth instance


  // --- Resend Verification Email Function ---
  const resendVerificationEmail = useCallback(async () => {
    // Use state directly, relies on onAuthStateChanged to have set currentUser
    if (!currentUser) {
      console.error("Resend blocked: No user currently logged in (AuthContext).");
      throw new Error("No user session found."); // More specific error
    }
    if (currentUser.emailVerified) {
      console.warn(`Resend blocked: Email already verified for ${currentUser.email}`);
      // Consider returning gracefully instead of throwing an error?
      // return;
      throw new Error("Email is already verified.");
    }
    console.log(`Attempting to resend verification email to: ${currentUser.email}`);
    await sendEmailVerification(currentUser); // Let potential errors bubble up
    console.log(`Verification email resent successfully to ${currentUser.email}`);
  }, [currentUser]); // Dependency: currentUser state


  // --- Auth State Change Listener ---
  useEffect(() => {
    console.log("AuthContext: Setting up onAuthStateChanged listener.");
    setLoading(true); // Ensure loading is true when listener starts

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log(`Auth State Changed: User UID: ${user ? user.uid : null}`);
      setCurrentUser(user); // Update the Firebase Auth user object

      if (user) {
        // Attempt to sync email verification status on every auth change for logged-in user
        await syncFirestoreEmailVerification(user);

        // Fetch corresponding Firestore document data
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const fetchedUserData = docSnap.data();
            setUserData(fetchedUserData); // Set Firestore data

            const isAdminUser = fetchedUserData.role === 'admin';
            setIsAdmin(isAdminUser); // Set admin status based on role
            console.log(`AuthContext: User data set. UID: ${user.uid}, Role: ${fetchedUserData.role}, IsAdmin: ${isAdminUser}`);
          } else {
            // This case is problematic: Auth user exists, but no Firestore data.
            // Could happen if Firestore write failed during signup or manual deletion.
            console.error(`AuthContext: Firestore document MISSING for authenticated user ${user.uid}! Logging out.`);
            setUserData(null);
            setIsAdmin(false);
            await signOut(auth); // Force sign out
          }
        } catch (error) {
          console.error(`AuthContext: Error fetching Firestore data for user ${user.uid}:`, error);
          // If fetch fails, clear local data and potentially log out
          setUserData(null);
          setIsAdmin(false);
          // Optional: await signOut(auth); // Decide if fetch error should force logout
        }
      } else {
        // User is signed out
        setUserData(null);
        setIsAdmin(false);
        console.log("AuthContext: User is signed out. Cleared user data and admin status.");
      }

      setLoading(false); // Mark initial auth check as complete
    });

    // Cleanup function
    return () => {
      console.log("AuthContext: Unsubscribing from onAuthStateChanged listener.");
      unsubscribe();
    };
  }, [auth, db, syncFirestoreEmailVerification]); // Dependencies for the effect


  // --- Memoize Context Value ---
  // Ensures that context consumers only re-render when specific values they use actually change
  const value = useMemo(() => ({
    currentUser,
    userData,
    loading,
    isAdmin,
    signup,
    login,
    logout,
    resendVerificationEmail,
  }), [currentUser, userData, loading, isAdmin, signup, login, logout, resendVerificationEmail]); // Add all provided values


  // --- Render Provider ---
  // Render children only after the initial loading state is false
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}