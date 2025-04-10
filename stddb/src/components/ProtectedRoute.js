// src/components/ProtectedRoute.js
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation(); // Get current location

  if (!currentUser) {
    // User not logged in, redirect to login
    // Pass the current location so we can redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Optional: Check for email verification here as well,
  // though the primary check is now in the login function.
  // This acts as a fallback or if you allow unverified users to be logged in temporarily.
  // if (!currentUser.emailVerified) {
  //   // Maybe redirect to a specific "verify email" page or show a message
  //   // alert("Please verify your email to access this page.");
  //   return <Navigate to="/verify-email-notice" />; // Example redirect
  // }

  // User is logged in (and implicitly verified if login check is active), allow access
  return children;
};

export default ProtectedRoute;