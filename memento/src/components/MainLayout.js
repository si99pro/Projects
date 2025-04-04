/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
// src/components/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

// --- Define Constants Consistently ---
const APP_BAR_HEIGHT = 64;
const DESKTOP_DRAWER_WIDTH = 260; // Ensure this matches Navbar.js if used
const MOBILE_BOTTOM_NAV_HEIGHT = 56; // Ensure this matches Navbar.js
// ********************************************

function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md breakpoint often used for layout shifts
  const { user } = useAuth();

  // Calculate actual height needed for bottom spacing (for Mobile BottomNav)
  const bottomNavHeightActual = user && isMobile ? MOBILE_BOTTOM_NAV_HEIGHT : 0;

  // Determine if the drawer's space should be accounted for in the layout
  // You previously modified this to always be 0, keeping that change.
  const effectiveDrawerWidth = 0; // No margin/width adjustment based on drawer

  return (
    // Root Box: Handles the primary horizontal layout (Sidebar | Content+Footer Column)
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* Navbar: Renders Fixed AppBar, Conditional Drawers, Fixed Mobile BottomNav */}
      {/* The Navbar component itself handles its own positioning (fixed AppBar, drawers) */}
      <Navbar />

      {/* "Content Column" Box: Sits next to sidebar, holds Content + Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh', // Ensure column fills height

          // Positioning relative to the sidebar (effectively none due to effectiveDrawerWidth = 0)
          width: '100%', // Always occupy full width available
          ml: { md: `${effectiveDrawerWidth}px` }, // Margin left only on medium screens+, based on effective width

          // Background for the entire content area + footer space
          bgcolor: theme.palette.grey[100], // Or your desired background

          // Apply margin-top for Fixed AppBar (space above the whole column)
          mt: `${APP_BAR_HEIGHT}px`,

          // Apply padding-bottom for Fixed Mobile BottomNav (space below the whole column)
          // This padding is INSIDE the content column, pushing content up from bottom
          pb: `${bottomNavHeightActual}px`,

          // Adjust overall column height calculation
          boxSizing: 'border-box', // Include padding (pb) in height calculation
          minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`, // Start with viewport minus AppBar
          // Note: The 'pb' adds space *inside* this box, effectively reducing the
          // available height for children, achieving the desired effect without margin.
        }}
      >
        {/* Main Scrollable Content Area */}
        {/* This Box holds the page content from Outlet */}
        <Box
          component="main"
          sx={{
            flexGrow: 1, // Allows this area to grow, pushing the footer down
            overflowY: 'auto', // Enable vertical scroll ONLY for the content area
            overflowX: 'hidden',
            boxSizing: 'border-box',

            // Inner padding for the content itself
            // V V V --- THIS IS THE MODIFIED LINE --- V V V
            p: {
                xs: 0, // No padding on extra-small screens (mobile)
                sm: 3  // Padding theme.spacing(3) (e.g., 24px) on small screens and up
            },
            // ^ ^ ^ --- END OF MODIFIED LINE --- ^ ^ ^

            // No specific minHeight needed, flexGrow handles it within the parent's constraints
          }}
        >
          {/* ===================================================================== */}
          {/* Your Page Content (e.g., Dashboard, Profile) renders inside here!   */}
          {/* Remember: Components rendered here might *also* have their own      */}
          {/* Container/Box with padding/margin that you might need to adjust.    */}
          {/* ===================================================================== */}
          <Outlet />
        </Box>

        {/* Footer Area */}
        {/* Placed directly inside the "Content Column" Box, after the <main> Box */}
        {/* It sits above the padding-bottom applied to the "Content Column" */}
        {user && (
          <Footer /> // The Footer component itself
        )}

      </Box> {/* End "Content Column" Box */}

    </Box> // End Root Box
  );
}

export default MainLayout;