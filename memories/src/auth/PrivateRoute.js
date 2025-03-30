// src/auth/PrivateRoute.js
import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../firebase'; // Updated import path

function PrivateRoute() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe(); // Cleanup the subscription
  }, []);

  if (loading) {
    // You can render a loading spinner here
    return <div></div>;
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
}

export default PrivateRoute;