// src/auth/PrivateRoute.js
import React, { useEffect, useState, createContext, useContext, useMemo } from 'react'; // Added useMemo
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import Loader from '../components/Loader'; // Assuming Loader can take props like 'fullPage'
import { doc, getDoc } from 'firebase/firestore';

// --- AuthContext remains the same ---
export const AuthContext = createContext(null);

// --- Optimized AuthProvider ---
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // Initial auth check is loading
    const [profileBg, setProfileBg] = useState('');
    const [userName, setUserName] = useState('');
    const [roles, setRoles] = useState([]);

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            try {
                if (firebaseUser) {
                    // User is logged in (or state changed while logged in)
                    let userProfile = { profileBg: '', userName: '', roles: [] }; // Default profile state

                    try {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const docSnap = await getDoc(userDocRef);

                        if (docSnap.exists()) {
                            const userData = docSnap.data();
                            userProfile = {
                                profileBg: userData.basicInfo?.profilebg || '',
                                userName: userData.basicInfo?.fullName || '',
                                roles: userData.roles || [],
                            };
                        } else {
                            // User exists in Auth, but not in Firestore 'users' collection (or profile incomplete)
                            console.warn(`[AuthProvider] Firestore document may be missing or incomplete for user: ${firebaseUser.uid}`);
                            // Keep default empty profile state
                        }
                    } catch (firestoreError) {
                        // Error fetching Firestore data, keep default profile state
                        console.error('[AuthProvider] Error fetching Firestore user data:', firestoreError);
                    }

                    // Update state based on Auth user and fetched/default profile
                    setUser(firebaseUser);
                    setProfileBg(userProfile.profileBg);
                    setUserName(userProfile.userName);
                    setRoles(userProfile.roles);

                } else {
                    // User is logged out
                    setUser(null);
                    setProfileBg('');
                    setUserName('');
                    setRoles([]);
                }
            } catch (error) {
                 // Catch any unexpected errors in the handler itself
                 console.error("[AuthProvider] Unexpected error in onAuthStateChanged handler:", error);
                 // Reset state as if logged out for safety
                 setUser(null);
                 setProfileBg('');
                 setUserName('');
                 setRoles([]);
            } finally {
                // Regardless of the outcome, the initial auth check is complete
                setLoading(false);
            }
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs only once on mount

    // --- Optimization: Memoize the context value ---
    // This prevents consumers from re-rendering unless the actual value object changes identity,
    // which only happens if user, loading, or profile data actually changes.
    const value = useMemo(() => ({
        user,
        loading,
        profileBg,
        userName,
        roles
    }), [user, loading, profileBg, userName, roles]); // Dependencies for memoization

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Custom hook remains the same ---
export const useAuth = () => {
    return useContext(AuthContext);
};

// --- Optimized PrivateRoute Component ---
function PrivateRoute() {
    const { user, loading } = useAuth(); // Use the hook
    const location = useLocation();

    if (loading) {
        // Render a loader, potentially full page for the initial auth check
        // Make sure your Loader component accepts props like 'fullPage' if needed
        return <Loader fullPage />;
    }

    if (!user) {
        // User is not logged in after checking, redirect to login
        // Preserve the location they were trying to reach
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // User is authenticated, render the child route element
    return <Outlet />;
}

export default PrivateRoute; // Export PrivateRoute as default