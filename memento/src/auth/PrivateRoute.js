// src/auth/PrivateRoute.js
import React, { useEffect, useState, createContext, useContext, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import Loader from '../components/Loader'; // Assuming Loader component exists
import { doc, getDoc } from 'firebase/firestore';

// --- AuthContext definition ---
export const AuthContext = createContext(null);

// --- Optimized and Enhanced AuthProvider ---
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null); // Firebase auth user object
    const [userProfile, setUserProfile] = useState(null); // Full Firestore profile data
    const [loading, setLoading] = useState(true); // Internal loading state name

    // Derived state (roles, profileBg, userName) - kept for potential backward compatibility
    // or if other components use them directly. Could be removed if only userProfile is needed.
    const [roles, setRoles] = useState([]);
    const [profileBg, setProfileBg] = useState('');
    const [userName, setUserName] = useState('');

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (firebaseUser) => {
            setLoading(true); // Ensure loading is true at the start of the check
            let fetchedProfile = null; // Temporary variable for profile data
            let currentRoles = []; // Temporary variable for roles

            try {
                if (firebaseUser) {
                    // User is signed in, attempt to fetch profile
                    try {
                        const userDocRef = doc(db, 'users', firebaseUser.uid);
                        const docSnap = await getDoc(userDocRef);
                        if (docSnap.exists()) {
                            fetchedProfile = docSnap.data(); // Get the entire data object
                             setUserProfile(fetchedProfile); // Store the full profile object
                             console.log("[AuthProvider] User profile fetched:", fetchedProfile); // Debug log

                             // --- Update derived state based on the fetched profile ---
                             currentRoles = Array.isArray(fetchedProfile.roles) ? fetchedProfile.roles : [];
                             setRoles(currentRoles);
                             setProfileBg(fetchedProfile.basicInfo?.profilebg || '');
                             setUserName(fetchedProfile.basicInfo?.fullName || '');

                        } else {
                            console.warn(`[AuthProvider] Firestore document missing for user: ${firebaseUser.uid}. Setting profile to null.`);
                             setUserProfile(null); // Explicitly set profile to null
                             // Reset derived state if profile doesn't exist
                             setRoles([]);
                             setProfileBg('');
                             setUserName('');
                             currentRoles = [];
                        }
                    } catch (firestoreError) {
                        console.error('[AuthProvider] Error fetching Firestore user data:', firestoreError);
                         setUserProfile(null); // Set profile to null on fetch error
                         // Reset derived state on error
                         setRoles([]);
                         setProfileBg('');
                         setUserName('');
                         currentRoles = [];
                    }
                     setUser(firebaseUser); // Set the Firebase auth user object

                } else {
                    // User logged out
                    setUser(null);
                    setUserProfile(null); // Clear the full profile
                    setRoles([]); // Clear roles
                    setProfileBg(''); // Clear derived state
                    setUserName(''); // Clear derived state
                    currentRoles = [];
                }
            } catch (error) {
                 console.error("[AuthProvider] Unexpected error in onAuthStateChanged handler:", error);
                 // Reset everything on unexpected error
                 setUser(null);
                 setUserProfile(null);
                 setRoles([]);
                 setProfileBg('');
                 setUserName('');
                 currentRoles = [];
            } finally {
                setLoading(false); // Final step: set loading to false
            }
        });
        return () => unsubscribe();
    }, []); // Empty dependency array ensures this runs once on mount

    // Memoize the context value
    const value = useMemo(() => {
        // Calculate isAdmin based on the current roles state derived from userProfile
        const isAdmin = Array.isArray(userProfile?.roles) && userProfile.roles.includes('admin');
        // console.log("[AuthProvider] Memoized value update. User:", user ? user.uid : 'null', "IsAdmin:", isAdmin, "Profile:", userProfile); // Enhanced Debug log

        return {
            user,           // Firebase auth user object
            authLoading: loading, // Renamed for compatibility with NotificationForm
            userProfile,    // The full Firestore user data object
            isAdmin,        // Boolean derived from userProfile.roles

            // Optionally keep these if other components rely on them directly
            roles: userProfile?.roles || [],
            profileBg: userProfile?.basicInfo?.profilebg || '',
            userName: userProfile?.basicInfo?.fullName || '',
        };
        // Dependencies now include userProfile instead of the individual fields
    }, [user, loading, userProfile]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

// --- Custom hook (useAuth - remains the same) ---
export const useAuth = () => {
    return useContext(AuthContext);
};

// --- PrivateRoute Component (remains the same, uses 'authLoading' from context) ---
function PrivateRoute() {
    // Use 'authLoading' as provided by the context value
    const { user, authLoading } = useAuth();
    const location = useLocation();

    if (authLoading) {
        return <Loader fullPage />; // Assuming Loader component exists
    }

    if (!user) {
        // Redirect them to the /login page, but save the current location they were
        // trying to go to. This allows us to send them back after they log in.
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return <Outlet />; // Render the child route components
}

export default PrivateRoute; // Export PrivateRoute as default