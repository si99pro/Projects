// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute'; // Implement this
import Login from './components/Auth/Login';
import Signup from './components/Auth/Signup';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import BatchList from './components/Batches/BatchList';
import BatchForm from './components/Batches/BatchForm';
import HomePage from './pages/HomePage';
import NotFound from './pages/NotFound';
import ForgotPassword from './components/Auth/ForgotPassword';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            }
          />
          <Route
            path="/batches"
            element={
              <PrivateRoute>
                <BatchList />
              </PrivateRoute>
            }
          />
          <Route
            path="/batches/new"
            element={
              <PrivateRoute>
                <BatchForm />
              </PrivateRoute>
            }
          />
          <Route
            path="/batches/:id"
            element={
              <PrivateRoute>
                <BatchForm />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;