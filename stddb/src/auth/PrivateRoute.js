// src/auth/PrivateRoute.js
import React from 'react'; // Keep React import
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext'; // <-- Import useAuth from the dedicated context file

// This component acts as a gatekeeper for protected routes.
function PrivateRoute() {
    // Get authentication status and user data from the AuthContext
    const { user, authLoading } = useAuth();
    const location = useLocation(); // Get current location for potential redirect state

    // 1. Handle Loading State:
    // While the AuthProvider is still performing its initial check (authLoading is true),
    // render 'null'. This lets the parent <Suspense> boundary handle the loading UI.
    if (authLoading) {
        return null;
    }

    // 2. Handle Not Authenticated (After Loading):
    // If the check is complete (authLoading is false) and there's no logged-in user,
    // redirect to the '/login' page. Pass the original intended location ('from')
    // in the state so the login page can redirect back after success.
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // 3. Handle Authenticated (After Loading):
    // If the check is complete and a user exists, render the child routes
    // specified within this PrivateRoute in App.js (passed via <Outlet />).
    return <Outlet />;
}

// Export the component for use in App.js routing
export default PrivateRoute;