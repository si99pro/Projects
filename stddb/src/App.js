// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext'; // Assuming you have this

// --- Import Page Components ---
import Home from './pages/Home';
import Login from './pages/Login'; // Example public page
import Signup from './pages/Signup'; // Example public page
import Profile from './pages/Profile'; // Example protected page
// Import other pages as needed
import NotFound from './pages/NotFound';
// Example public pages (uncomment if needed)
// import Welcome from './pages/Welcome';
// import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword'; // <--- CHANGE: Uncommented this line
// Example protected pages (uncomment if needed)
// import Courses from './pages/Courses';
// import Schedule from './pages/Schedule';
// import Calendar from './pages/Calendar';
// import Announcements from './pages/Announcements';
// import Grades from './pages/Grades';
// import Registration from './pages/Registration';
// import Settings from './pages/Settings';

// --- Import Shared Components ---
import ProtectedRoute from './components/ProtectedRoute'; // Assumes you have this for auth checks
import Layout from './components/Layout';             // The main layout wrapper

// --- Import Global Styles (Optional) ---
import './App.css'; // Your main app-level CSS if any (distinct from index.css)
// index.css should contain the global styles like body, variables, theme

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
          {/* These routes typically don't have the main Header/Sidebars */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          {/* Add other public routes like /welcome, /verify-email, /forgot-password here if needed */}
          {/* <Route path="/welcome" element={<Welcome />} /> */}
          {/* <Route path="/verify-email" element={<VerifyEmail />} /> */}
          <Route path="/forgot-password" element={<ForgotPassword />} /> {/* <--- CHANGE: Uncommented this line */}


          {/* === Protected Routes (Using Layout) === */}
          {/* Parent route wraps Layout with ProtectedRoute */}
          <Route
            path="/" // Base path for protected section
            element={
              <ProtectedRoute> {/* Ensures user is logged in */}
                <Layout />     {/* Renders Header/Sidebars and Outlet */}
              </ProtectedRoute>
            }
          >
             {/* --- Nested Routes (Rendered inside Layout's <Outlet />) --- */}

             {/* Default route for '/' when logged in */}
             <Route index element={<Home />} />

             {/* Profile route */}
             <Route path="profile" element={<Profile />} />

             {/* Add other nested routes that use the Layout here */}
             {/* <Route path="courses" element={<Courses />} /> */}
             {/* <Route path="schedule" element={<Schedule />} /> */}
             {/* <Route path="calendar" element={<Calendar />} /> */}
             {/* <Route path="announcements" element={<Announcements />} /> */}
             {/* <Route path="grades" element={<Grades />} /> */}
             {/* <Route path="registration" element={<Registration />} /> */}
             {/* <Route path="settings" element={<Settings />} /> */}
             {/* <Route path="mynetwork" element={<Network />} /> // Example from earlier */}
             {/* <Route path="jobs" element={<Jobs />} /> // Example from earlier */}
             {/* <Route path="messaging" element={<Messaging />} /> // Example from earlier */}
             {/* <Route path="notifications" element={<Notifications />} /> // Example from earlier */}
             {/* <Route path="people/recommendations" element={<Recommendations />} /> // Example from earlier */}
             {/* <Route path="/games/:gameId" element={<GamePage />} /> // Example from earlier */}

          </Route> {/* End of protected routes using Layout */}


          {/* === Catch-all 404 Route === */}
          {/* This matches any path not defined above */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;