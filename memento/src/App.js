// App.js

// --- React & Router ---
import React, { Suspense, lazy } from 'react'; // MUST be first or among first imports
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';

// --- MUI ---
import { ThemeProvider, CssBaseline, createTheme } from '@mui/material'; // Assuming MUI setup

// --- Auth (Eager Imports) ---
import PrivateRoute, { AuthProvider, useAuth } from './auth/PrivateRoute'; // Keep AuthProvider wrapping everything

// --- Layouts (Eager Imports) ---
import MainLayout from './components/MainLayout';
import AuthLayout from './components/AuthLayout'; // Keep if you have specific styling for auth pages
import Loader from './components/Loader'; // A fallback loader component

// --- Pages & Components (Lazy Loaded) ---
// Define lazy components AFTER all standard 'import' statements
const Signup = lazy(() => import('./auth/Signup'));
const Login = lazy(() => import('./auth/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const MomentForm = lazy(() => import('./components/MomentForm')); // Might be a page or component? Ensure correct path
const Batch = lazy(() => import('./pages/Batch'));
const Profile = lazy(() => import('./pages/Profile'));
const Alumni = lazy(() => import('./dept/Alumni')); // Ensure correct path
const Admin = lazy(() => import('./pages/Admin'));
const ViewProfile = lazy(() => import('./pages/ViewProfile'));
const Notifications = lazy(() => import('./components/Notifications')); // Might be a page? Ensure correct path
const NotFoundPage = lazy(() => import('./pages/NotFoundPage')); // Create a dedicated 404 page


// --- Helper Component for Root Redirect ---
function RootRedirector() {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <Loader fullPage />;
    }
    if (user && location.pathname === '/') {
        return <Navigate to="/dashboard" replace />;
    }
    if (!user && location.pathname === '/') {
         return <Navigate to="/login" replace />;
    }
    return null; // Path is not '/', let other routes handle it
}

// --- MUI Theme (Example) ---
const theme = createTheme({ /* your theme options */ });

// --- Main App Component ---
function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Router>
                <AuthProvider>
                    <Suspense fallback={<Loader fullPage />}>
                        <Routes>
                             <Route path="/" element={<RootRedirector />} />

                            {/* Public Auth Routes */}
                            <Route element={<AuthLayout />}> {/* Or <React.Fragment /> */}
                                <Route path="/login" element={<Login />} />
                                <Route path="/signup" element={<Signup />} />
                            </Route>

                            {/* Protected Routes */}
                            <Route element={<PrivateRoute />}>
                                <Route element={<MainLayout />}>
                                    <Route path="/dashboard" element={<Dashboard />} />
                                    <Route path="/moment-form" element={<MomentForm />} />
                                    <Route path="/batch" element={<Batch />} />
                                    <Route path="/profile" element={<Profile />} />
                                    <Route path="/dept/alumni" element={<Alumni />} />
                                    <Route path="/notifications" element={<Notifications />} />
                                    <Route path="/admin" element={<Admin />} />
                                    <Route path="/users/:userId" element={<ViewProfile />} />
                                    {/* Add other protected routes */}

                                    {/* Catch-all 404 within MainLayout */}
                                    <Route path="*" element={<NotFoundPage />} />
                                </Route>
                            </Route>

                        </Routes>
                    </Suspense>
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;