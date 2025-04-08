// src/auth/PrivateRoute.js
// VERSION THAT ASSUMES Login.js BLOCKS UNVERIFIED USERS

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext'; // Assuming AuthContext provides user object
// import Loader from '../components/Loader'; // Keep if you use Option 2 below for loading

function PrivateRoute() {
    // Use 'user' from AuthContext. If Login.js works as intended,
    // 'user' will only be non-null here if they are ALSO verified.
    const { user, authLoading } = useAuth();
    const location = useLocation();

    // 1. Handle Loading State:
    if (authLoading) {
        // Option 1: Return null (relies on parent/global loader like Suspense)
        return null;
        // Option 2: Render a loader directly
        // return <Loader />;
    }

    // 2. Handle Not Authenticated (After Loading):
    // This covers users who failed login OR were signed out by Login.js
    // because they weren't verified.
    if (!user) {
        console.log("PrivateRoute (Simplified): No authenticated user found, redirecting to login.");
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Handle Authenticated (implicitly verified due to Login.js changes):
    // *** Email verification check REMOVED from here ***
    console.log("PrivateRoute (Simplified): Authenticated user found, allowing access.");
    return <Outlet />; // User is present (and implicitly verified), render the child route.
}

export default PrivateRoute;