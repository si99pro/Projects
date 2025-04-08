// src/auth/AuthContext.js (or src/auth/Auth.js)
import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

// --- AuthContext definition ---
export const AuthContext = createContext(null);

// --- Optimized and Enhanced AuthProvider ---
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log("[AuthProvider] Setting up onAuthStateChanged listener.");
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            console.log("[AuthProvider] onAuthStateChanged triggered. User:", firebaseUser?.uid ?? 'null');
            setLoading(true);
            let fetchedProfile = null;
            let firestoreNeedsUpdate = false;
            let liveVerificationStatus = false; // Track the verified status from Auth after reload

            try {
                if (firebaseUser) {
                    // *** RELOAD USER STATE FIRST ***
                    try {
                        console.log(`[AuthProvider] Reloading user state for ${firebaseUser.uid}...`);
                        await firebaseUser.reload();
                        const freshFirebaseUser = auth.currentUser; // Get potentially updated user
                        if (freshFirebaseUser) {
                           liveVerificationStatus = freshFirebaseUser.emailVerified;
                           console.log(`[AuthProvider] User state reloaded. Live emailVerified: ${liveVerificationStatus}`); // <-- CHECK THIS LOG
                           firebaseUser = freshFirebaseUser; // Use the latest user object
                        } else {
                             console.warn(`[AuthProvider] User became null after reload for ${firebaseUser.uid}.`);
                             // Handle user becoming null unexpectedly
                             setUser(null); setUserProfile(null); setLoading(false); return;
                        }
                    } catch (reloadError) {
                        console.error(`[AuthProvider] Error reloading user state for ${firebaseUser.uid}:`, reloadError);
                        liveVerificationStatus = firebaseUser.emailVerified; // Fallback to potentially stale status
                    }

                    // Now, fetch Firestore data
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    console.log(`[AuthProvider] Fetching Firestore doc: users/${firebaseUser.uid}`);
                    try {
                        const docSnap = await getDoc(userDocRef);
                        if (docSnap.exists()) {
                            fetchedProfile = docSnap.data();
                            console.log(`[AuthProvider] Firestore doc found for ${firebaseUser.uid}.`);

                            // *** CHECK FOR emailVerified MISMATCH ***
                            // !!! CRITICAL: VERIFY THIS PATH -> 'basicInfo.emailVerified' !!!
                            const storedVerificationStatus = fetchedProfile.basicInfo?.emailVerified;
                            console.log(`[AuthProvider] Comparing Statuses: Live Auth = ${liveVerificationStatus}, Firestore = ${storedVerificationStatus}`); // <-- CHECK THIS LOG

                            if (liveVerificationStatus === true && storedVerificationStatus === false) {
                                console.log(`[AuthProvider] *** MISMATCH DETECTED *** for ${firebaseUser.uid}. Flagging for Firestore update.`); // <-- CHECK THIS LOG
                                firestoreNeedsUpdate = true;
                            } else {
                                console.log(`[AuthProvider] Statuses match or no update needed for ${firebaseUser.uid}.`);
                            }

                        } else {
                            console.warn(`[AuthProvider] Firestore document MISSING for user: ${firebaseUser.uid}.`); // <-- CHECK THIS LOG
                        }
                    } catch (firestoreError) {
                        console.error(`[AuthProvider] Error fetching Firestore user data for ${firebaseUser.uid}:`, firestoreError);
                    }

                    // Set state (this happens regardless of update success)
                    setUser(firebaseUser);
                    setUserProfile(fetchedProfile);

                    // *** PERFORM FIRESTORE UPDATE IF NEEDED ***
                    if (firestoreNeedsUpdate && fetchedProfile) {
                         console.log(`[AuthProvider] Attempting Firestore update for ${firebaseUser.uid}...`); // <-- CHECK THIS LOG
                         try {
                            // !!! CRITICAL: VERIFY THIS PATH -> 'basicInfo.emailVerified' !!!
                            await updateDoc(userDocRef, {
                                'basicInfo.emailVerified': true
                            });
                            console.log(`[AuthProvider] *** Firestore update SUCCESSFUL for ${firebaseUser.uid}. ***`); // <-- CHECK THIS LOG

                            // Update local state immediately
                            setUserProfile(prevProfile => prevProfile ? { ...prevProfile, basicInfo: { ...prevProfile.basicInfo, emailVerified: true } } : null);

                         } catch (updateError) {
                             // !!! CRITICAL: CHECK THIS ERROR IF UPDATE FAILS !!!
                             console.error(`[AuthProvider] **** Firestore update FAILED for ${firebaseUser.uid}: ****`, updateError);
                             // !!! CHECK FIRESTORE SECURITY RULES IF PERMISSION ERROR !!!
                         }
                    } else if (firestoreNeedsUpdate && !fetchedProfile) {
                        console.warn(`[AuthProvider] Firestore update needed for ${firebaseUser.uid}, but profile data was missing or failed to fetch.`);
                    }

                } else {
                    // User is signed out
                    console.log("[AuthProvider] User is signed out.");
                    setUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                 console.error("[AuthProvider] Unexpected error in outer onAuthStateChanged try block:", error);
                 setUser(null);
                 setUserProfile(null);
            } finally {
                console.log("[AuthProvider] Setting authLoading to false.");
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => {
            console.log("[AuthProvider] Cleaning up onAuthStateChanged listener.");
            unsubscribe();
        };
    }, []);

    // Memoize the context value
    const value = useMemo(() => {
        const isAdmin = Array.isArray(userProfile?.roles) && userProfile.roles.includes('admin');
        return {
            user,
            authLoading: loading,
            userProfile,
            isAdmin,
            isEmailVerified: user?.emailVerified ?? false, // Direct access to live status
            // Other derived values...
        };
    }, [user, loading, userProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Custom hook (useAuth) ---
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};