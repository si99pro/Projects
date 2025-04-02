// App.js

// --- React & Router ---
import React, { Suspense, lazy } from 'react'; // MUST be first or among first imports
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// --- MUI ---
import { ThemeProvider, CssBaseline, createTheme, Box, CircularProgress } from '@mui/material'; // Added Box, CircularProgress

// --- Auth (Eager Imports) ---
import PrivateRoute, { AuthProvider, useAuth } from './auth/PrivateRoute'; // Keep AuthProvider wrapping everything

// --- Layouts (Eager Imports) ---
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout'; // Keep if you have specific styling for auth pages, otherwise use React.Fragment

// --- Pages & Components (Lazy Loaded) ---
// Define lazy components AFTER all standard 'import' statements
const Signup = lazy(() => import('./auth/Signup'));
const Login = lazy(() => import('./auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MomentForm = lazy(() => import('./components/MomentForm')); // Ensure correct path/type (page/component)
const Batch = lazy(() => import('./pages/Batch'));
const Profile = lazy(() => import('./pages/Profile'));
const Alumni = lazy(() => import('./dept/Alumni')); // Ensure correct path
const Admin = lazy(() => import('./pages/Admin'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const Notifications = lazy(() => import('./pages/NotificationsPage')); // Ensure correct path/type (page/component)
const NotFoundPage = lazy(() => import('./pages/NotFoundPage')); // Your dedicated 404 page

// --- Inline Loading Component ---
// Replaces the need for Loader.js for simple loading states
const CenteredLoader = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh" // Takes full viewport height
    >
        <CircularProgress />
    </Box>
);

// --- Helper Component for Root Redirect ---
// Handles initial redirection based on auth state when accessing "/"
function RootRedirector() {
    const { user, loading } = useAuth();
    const location = useLocation();

    // Only act if we are exactly at the root path "/"
    if (location.pathname !== '/') {
        return null; // Let other routes handle it
    }

    if (loading) {
        // Show loader while checking auth status ONLY at root
        return <CenteredLoader />;
    }

    if (user) {
        // If logged in at root, go to dashboard
        return <Navigate to="/dashboard" replace />;
    } else {
        // If not logged in at root, go to login
        return <Navigate to="/login" replace />;
    }
}

// --- MUI Theme (Example) ---
const theme = createTheme({
    // Define your theme properties here
    // palette: { ... },
    // typography: { ... },
});

// --- Main App Component ---
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Ensures consistent baseline styling */}
            <Router>
                <AuthProvider> {/* Provides auth context to the entire app */}
                    {/* Suspense handles loading for ALL lazy-loaded components */}
                    <Suspense fallback={<CenteredLoader />}>
                        <Routes>
                            {/* Handle root path redirection first */}
                            <Route path="/" element={<RootRedirector />} />

                            {/* Public Auth Routes */}
                            {/* Use AuthLayout if it provides specific styling/structure for login/signup */}
                            {/* Otherwise, React.Fragment is sufficient: <Route element={<React.Fragment />}> */}
                            <Route element={<AuthLayout />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                {/* Add other public routes like password reset here if needed */}
                            </Route>

                            {/* Protected Routes - Require Authentication */}
                            <Route element={<PrivateRoute />}> {/* Gatekeeper for auth */}
                                <Route element={<MainLayout />}> {/* Common layout for authenticated users */}
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/moment-form" element={<MomentForm />} />
                                    <Route path="/batch" element={<Batch />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/dept/alumni" element={<Alumni />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/users/:userId" element={<ViewProfile />} />
                                    {/* Add other protected routes inside MainLayout */}

                                    {/* NOTE: A "*" route here would catch only unmatched *protected* routes */}
                                    {/* <Route path="*" element={<NotFoundPage />} /> */}
                                    {/* It's generally better to have a single top-level catch-all */}
                                </Route>
                            </Route>

                            {/* Top-Level Catch-all 404 Route */}
                            {/* This will catch any route not matched above (public or protected) */}
                            <Route path="*" element={<NotFoundPage />} />

                        </Routes>
                    </Suspense>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;