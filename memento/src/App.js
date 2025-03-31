// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './auth/Signup';
import Login from './auth/Login';
import Dashboard from './pages/Dashboard';
import PrivateRoute from './auth/PrivateRoute';
import MomentForm from './components/MomentForm'; // Corrected import
import Batch from './pages/Batch';
import Profile from './pages/Profile'; // Import Profile
import Stars from './pages/Stars'; // Import Stars

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/moment-form" element={<MomentForm />} /> {/* Corrected route */}
          <Route path="/batch" element={<Batch />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/stars" element={<Stars />} />
        </Route>

        {/* Add a default route (optional) */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;