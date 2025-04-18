// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Assuming you have this

// --- Import Page Components ---
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
// Example public pages (uncomment if needed)
// import Welcome from './pages/Welcome';
import VerifyEmail from './pages/VerifyEmail'; // <--- UNCOMMENTED THIS LINE
import ForgotPassword from './pages/ForgotPassword';
// Example protected pages (uncomment if needed)
// import Courses from './pages/Courses';
// import Schedule from './pages/Schedule';
// import Calendar from './pages/Calendar';
// import Announcements from './pages/Announcements';
// import Grades from './pages/Grades';
// import Registration from './pages/Registration';
// import Settings from './pages/Settings';

// --- Import Shared Components ---
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// --- Import Global Styles (Optional) ---
import './App.css';

/**
 * Main application component responsible for routing and context setup.
 */
function App() {
  return (
    // Provides authentication context to the entire application
    <AuthProvider>
      <Router>
        <Routes>
          {/* === Public Routes (No Layout/Protection) === */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} /> {/* <--- UNCOMMENTED THIS LINE */}
          {/* <Route path="/welcome" element={<Welcome />} /> */}


          {/* === Protected Routes (Using Layout) === */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
             {/* --- Nested Routes (Rendered inside Layout's <Outlet />) --- */}
             <Route index element={<Home />} />
             <Route path="profile" element={<Profile />} />
             {/* Add other nested protected routes here */}
             {/* <Route path="courses" element={<Courses />} /> */}
             {/* ... other protected routes ... */}

          </Route> {/* End of protected routes using Layout */}


          {/* === Catch-all 404 Route === */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;