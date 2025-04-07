// src/auth/AuthContext.js (or src/auth/Auth.js)
import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

// --- AuthContext definition ---
export const AuthContext = createContext(null);

// --- Optimized and Enhanced AuthProvider ---
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true); // Keep internal name

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setLoading(true);
            let fetchedProfile = null;
            try {
                if (firebaseUser) {
                    try {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const docSnap = await getDoc(userDocRef);
                        if (docSnap.exists()) {
                            fetchedProfile = docSnap.data();
                            setUserProfile(fetchedProfile);
                            // console.log("[AuthProvider] User profile fetched:", fetchedProfile);
                        } else {
                            console.warn(`[AuthProvider] Firestore document missing for user: ${firebaseUser.uid}. Setting profile to null.`);
                            setUserProfile(null);
                        }
                    } catch (firestoreError) {
                        console.error('[AuthProvider] Error fetching Firestore user data:', firestoreError);
                        setUserProfile(null);
                    }
                    setUser(firebaseUser);
                } else {
                    setUser(null);
                    setUserProfile(null);
                }
            } catch (error) {
                 console.error("[AuthProvider] Unexpected error in onAuthStateChanged handler:", error);
                 setUser(null);
                 setUserProfile(null);
            } finally {
                setLoading(false);
            }
        });
        return () => unsubscribe();
    }, []);

    const value = useMemo(() => {
        const isAdmin = Array.isArray(userProfile?.roles) && userProfile.roles.includes('admin');
        // console.log("[AuthProvider] Memoized value update. User:", user ? user.uid : 'null', "IsAdmin:", isAdmin, "Profile:", userProfile);

        return {
            user,
            authLoading: loading, // Consistent name for consumers
            userProfile,
            isAdmin,
            // Optionally keep derived state if needed elsewhere directly
            roles: userProfile?.roles || [],
            profileBg: userProfile?.basicInfo?.profilebg || '',
            userName: userProfile?.basicInfo?.fullName || '',
        };
    }, [user, loading, userProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Custom hook (useAuth) ---
// This hook now belongs with its context and provider
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === null) {
        // This error is more helpful if the hook is used outside the provider
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};