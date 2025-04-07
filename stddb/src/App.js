// App.js

// --- React & Router ---
import React, { Suspense, lazy } from 'react'; // MUST be first or among first imports
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// --- MUI ---
import { ThemeProvider, CssBaseline, createTheme, Box, CircularProgress } from '@mui/material';

// --- Auth ---
// Import the AuthProvider from its new dedicated file
import { AuthProvider, useAuth } from './auth/AuthContext'; // Correct: Import AuthProvider AND useAuth from AuthContext.js
// Import the PrivateRoute component from its new dedicated file
import PrivateRoute from './auth/PrivateRoute'; // Correct: Import PrivateRoute from PrivateRoute.js

// --- Layouts (Eager Imports) ---
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';

// --- Pages & Components (Lazy Loaded) ---
// (Keep all lazy imports as they were)
const Signup = lazy(() => import('./auth/Signup'));
const Login = lazy(() => import('./auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MomentForm = lazy(() => import('./components/MomentForm'));
const Batch = lazy(() => import('./pages/Batch'));
const Profile = lazy(() => import('./pages/Profile'));
const Alumni = lazy(() => import('./dept/Alumni'));
const Admin = lazy(() => import('./pages/Admin'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const Notifications = lazy(() => import('./pages/NotificationsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// --- Inline Loading Component (Keep as is) ---
const CenteredLoader = () => (
    <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
    >
        <CircularProgress />
    </Box>
);

// --- Helper Component for Root Redirect ---
// This component uses useAuth, so the import is handled above
function RootRedirector() {
    // useAuth is correctly imported from AuthContext.js via the App.js imports
    const { user, authLoading } = useAuth(); // Changed 'loading' to 'authLoading' to match context provider
    const location = useLocation();

    // Only act if we are exactly at the root path "/"
    if (location.pathname !== '/') {
        return null; // Let other routes handle it
    }

    // Show loader while checking auth status ONLY at root
    if (authLoading) { // Use authLoading from context
        return <CenteredLoader />;
    }

    // If logged in at root, go to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    // If not logged in at root, go to login
    else {
        return <Navigate to="/login" replace />;
    }
}

// --- MUI Theme (Keep as is or define your theme) ---
const theme = createTheme({
    // Define your theme properties here
});

// --- Main App Component ---
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {/* Ensures consistent baseline styling */}
            <Router>
                {/* Use the imported AuthProvider */}
                <AuthProvider>
                    {/* Suspense handles loading for ALL lazy-loaded components */}
                    <Suspense fallback={<CenteredLoader />}>
                        <Routes>
                            {/* Root path redirection */}
                            <Route path="/" element={<RootRedirector />} />

                            {/* Public Auth Routes */}
                            <Route element={<AuthLayout />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                            </Route>

                            {/* Protected Routes - Use the imported PrivateRoute */}
                            <Route element={<PrivateRoute />}> {/* Gatekeeper */}
                                <Route element={<MainLayout />}> {/* Common layout */}
                                    {/* (All protected routes remain the same) */}
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/moment-form" element={<MomentForm />} />
                                    <Route path="/batch" element={<Batch />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/dept/alumni" element={<Alumni />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/users/:userId" element={<ViewProfile />} />
                                </Route>
                            </Route>

                            {/* Top-Level Catch-all 404 Route */}
                            <Route path="*" element={<NotFoundPage />} />

                        </Routes>
                    </Suspense>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;