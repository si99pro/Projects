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
// DESKTOP_DRAWER_WIDTH is likely still needed in Navbar.js
const DESKTOP_DRAWER_WIDTH = 260;
const MOBILE_BOTTOM_NAV_HEIGHT = 56; // Ensure this matches Navbar.js
// ********************************************

function MainLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();

  // Calculate actual height needed for bottom spacing (for Mobile BottomNav)
  const bottomNavHeightActual = user && isMobile ? MOBILE_BOTTOM_NAV_HEIGHT : 0;

  return (
    // Root Box: Handles the primary horizontal layout (Sidebar | Content+Footer Column)
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* Navbar: Renders Fixed AppBar, Conditional Drawers, Fixed Mobile BottomNav */}
      <Navbar />

      {/* "Content Column" Box: Sits next to sidebar, holds Content + Footer */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          minHeight: '100vh', // Ensure column fills height

          // --- REMOVED a block here that set width and margin-left for desktop ---
          // width: { xs: '100%', md: `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)` }, // <<< REMOVED
          // ml: { md: `${DESKTOP_DRAWER_WIDTH}px` },                            // <<< REMOVED

          // Background for the entire content area + footer space
          bgcolor: theme.palette.grey[100],

          // Apply margin-top for Fixed AppBar (space above the whole column)
          mt: `${APP_BAR_HEIGHT}px`,

          // Apply padding-bottom for Fixed Mobile BottomNav (space below the whole column)
          // ***** MOVED pb HERE *****
          pb: `${bottomNavHeightActual}px`,

          // Adjust overall column height calculation
          // Need to subtract AppBar height AND potential BottomNav padding
          // boxSizing includes padding, so minHeight works like this
          boxSizing: 'border-box', // Include padding in height calculation
          minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`, // Start with viewport minus AppBar
          // Note: The 'pb' adds space *inside* this box, effectively reducing the
          // available height for children, achieving the desired effect.
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

            // NO mt needed here, parent has it
            // NO pb needed here, parent has it
            // pb: `${bottomNavHeightActual}px`, // <<< REMOVED FROM HERE

            // Inner padding for the content itself
            p: { xs: 2, sm: 3 },

            // No specific minHeight needed, flexGrow handles it within the parent's constraints
          }}
        >
          <Outlet /> {/* Page content renders inside here */}
        </Box>

        {/* Footer Area */}
        {/* Placed directly inside the "Content Column" Box, after the <main> Box */}
        {/* It is now above the padding-bottom applied to the "Content Column" */}
        {user && (
          <Footer /> // The Footer component itself
        )}

      </Box> {/* End "Content Column" Box */}

    </Box> // End Root Box
  );
}

export default MainLayout;