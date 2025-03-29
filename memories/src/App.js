// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles'; // Import ThemeProvider
import theme from './theme'; // Import your custom theme
import Signup from './components/Auth/Signup';
import Login from './components/Auth/Login';
import VerifyEmail from './components/Auth/VerifyEmail';
import Dashboard from './components/Dashboard';
import Profile from './components/Profile';
import HomePage from './pages/HomePage';
import { AuthProvider } from './contexts/AuthContext'; // Import AuthProvider

function App() {
    return (
        <Router>
            <AuthProvider>  {/* *** IMPORTANT: Wrap everything in AuthProvider *** */}
                <ThemeProvider theme={theme}> {/* Wrap Routes in ThemeProvider */}
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/signup" element={<Signup />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/verify-email" element={<VerifyEmail />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/profile" element={<Profile />} />
                        {/* Add other routes as needed */}
                    </Routes>
                </ThemeProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;