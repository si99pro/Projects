// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// --- Import Page Components ---
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Welcome from './pages/Welcome';
import NotFound from './pages/NotFound';
import Profile from './pages/Profile';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';

// --- Import Shared Components ---
import ProtectedRoute from './components/ProtectedRoute'; // Handles redirecting if not logged in
import Layout from './components/Layout';             // The component managing Header, SideNav, and Content Area
// No need to import Header here anymore if Layout handles it

// --- Import Global Styles (Optional) ---
import './App.css';

/**
 * Main application component responsible for routing and context setup.
 */
function App() {
  return (
    // AuthProvider makes authentication state available throughout the app
    <AuthProvider>
      {/* BrowserRouter enables client-side routing */}
      <Router>
        {/*
          NO global Header component here anymore.
          The Layout component will render the Header for relevant routes.
        */}

        {/* Routes define the different pages and their corresponding components */}
        <Routes>
          {/* === Public Routes (No Layout) === */}
          {/* These routes typically have their own simpler structure */}
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />


          {/* === Protected Routes (Wrapped in Layout) === */}
          {/* These routes require authentication and use the main app layout */}
          {/* ProtectedRoute checks auth, Layout provides structure (Header/SideNav/Content) */}

          {/* Root path '/' */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout> {/* Layout provides the main UI structure */}
                  <Home /> {/* Home is rendered as children inside Layout */}
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Explicit '/home' path */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Layout> {/* Layout provides the main UI structure */}
                  <Home /> {/* Home is rendered as children inside Layout */}
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Profile page */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Layout> {/* Layout provides the main UI structure */}
                  <Profile /> {/* Profile is rendered as children inside Layout */}
                </Layout>
              </ProtectedRoute>
            }
          />

          {/* Add other protected routes here using the same pattern */}
          {/* Example:
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
          */}


          {/* === Catch-all Route (Usually No Layout) === */}
          {/* This route matches any path not defined above */}
          <Route path="*" element={<NotFound />} />

        </Routes>

        {/* Optional: A Footer component could be placed here if it's global and outside Layout */}
        {/* <Footer /> */}
      </Router>
    </AuthProvider>
  );
}

export default App;