// App.js

// --- React & Router ---
import React, { Suspense, lazy } from 'react'; // MUST be first or among first imports
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// --- MUI ---
import { ThemeProvider, CssBaseline, createTheme, Box, CircularProgress } from '@mui/material';

// --- Auth ---
import { AuthProvider, useAuth } from './auth/AuthContext';
import PrivateRoute from './auth/PrivateRoute';

// --- Layouts (Eager Imports) ---
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout';

// --- Pages & Components (Lazy Loaded) ---
// **** 1. ADD LAZY IMPORT FOR WELCOME ****
const Welcome = lazy(() => import('./auth/Welcome')); // Assuming Welcome.js is in ./auth/
const Signup = lazy(() => import('./auth/Signup'));
const Login = lazy(() => import('./auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
// const MomentForm = lazy(() => import('./components/MomentForm')); // <<< REMOVED IMPORT
const Batch = lazy(() => import('./pages/Batch'));
const Profile = lazy(() => import('./pages/Profile'));
const Alumni = lazy(() => import('./dept/Alumni'));
const Admin = lazy(() => import('./pages/Admin'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const Notifications = lazy(() => import('./pages/NotificationsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// --- Inline Loading Component ---
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

// --- Helper Component for Root Path Handling ---
function RootRedirector() {
    const { user, authLoading } = useAuth();
    const location = useLocation();

    // Only act if we are exactly at the root path "/"
    // If navigating elsewhere (e.g. directly to /login), let other routes handle it.
    if (location.pathname !== '/') {
        return null;
    }

    // Show loader while checking auth status ONLY at root
    if (authLoading) {
        return <CenteredLoader />;
    }

    // If logged in at root, go to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }
    // **** 2. MODIFIED: If NOT logged in at root, RENDER Welcome Component ****
    else {
        // Instead of navigating away, render the Welcome component directly at "/"
        return <Welcome />;
        // return <Navigate to="/login" replace />; // OLD BEHAVIOR
    }
}

// --- MUI Theme ---
const theme = createTheme({
    // Define your theme properties here
});

// --- Main App Component ---
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Suspense fallback={<CenteredLoader />}>
                        <Routes>
                            {/* Root path handler: Will render Welcome or redirect to Dashboard */}
                            <Route path="/" element={<RootRedirector />} />

                            {/* Public Auth Routes */}
                            {/* AuthLayout provides the visual wrapper */}
                            {/* Users can still navigate DIRECTLY to /login or /signup */}
                            <Route element={<AuthLayout />}>
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                                {/* If Welcome should also use AuthLayout, add it here */}
                                {/* <Route path="/welcome-explicit" element={<Welcome />} /> */}
                                {/* NOTE: The RootRedirector handles showing Welcome at "/", */}
                                {/* so a separate /welcome route might be redundant unless needed */}
                            </Route>

                            {/* Protected Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route element={<MainLayout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    {/* <Route path="/moment-form" element={<MomentForm />} /> */} {/* <<< REMOVED ROUTE */}
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