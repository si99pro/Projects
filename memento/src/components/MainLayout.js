/* eslint-disable no-unused-vars */
// src/components/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar'; // Assuming Navbar.js contains the redesigned component
import { Box, useTheme, useMediaQuery } from '@mui/material';
import { useAuth } from '../auth/AuthContext';

// --- Define Constants Consistently (Match these with Navbar.js) ---
const APP_BAR_HEIGHT = 64;
const SIDEBAR_WIDTH_DESKTOP = 260; // *** USE THE VALUE FROM YOUR REDESIGNED NAVBAR ***
const MOBILE_BOTTOM_NAV_HEIGHT = 56; // *** USE THE VALUE FROM YOUR REDESIGNED NAVBAR ***
// ******************************************************************

function MainLayout() {
  const theme = useTheme();
  // Use 'md' breakpoint to differentiate between mobile/tablet and desktop layouts
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const { user } = useAuth();

  // Determine the actual height needed for bottom spacing (for Mobile BottomNav)
  const bottomNavHeightActual = user && !isDesktop ? MOBILE_BOTTOM_NAV_HEIGHT : 0;

  // Determine the space occupied by the sidebar (only on desktop)
  const sidebarWidthActual = user && isDesktop ? SIDEBAR_WIDTH_DESKTOP : 0;

  return (
    // Root Box: Manages the overall layout including the Navbar elements
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>

      {/* Navbar: Renders the Fixed AppBar, conditionally the Drawers/Sidebar, and Fixed Mobile BottomNav */}
      {/* The Navbar component handles its own internal positioning based on screen size */}
      <Navbar />

      {/* Main Content Area Wrapper */}
      {/* This Box sits visually to the right of the sidebar (on desktop) and below the AppBar */}
      <Box
        component="main" // Use 'main' semantic tag for the primary content area
        sx={{
          flexGrow: 1, // Take up remaining horizontal space
          display: 'flex', // Use flexbox internally to position Outlet and Footer
          flexDirection: 'column', // Stack Outlet and Footer vertically
          minHeight: '100vh', // Ensure it tries to fill viewport height

          // Crucial: Add paddingTop to account for the fixed AppBar height
          pt: `${APP_BAR_HEIGHT}px`,

          // Crucial: Add paddingBottom to account for the fixed BottomNav height (mobile only)
          pb: `${bottomNavHeightActual}px`,

          // Crucial: Define width, considering the sidebar on desktop
          width: `calc(100% - ${sidebarWidthActual}px)`, // Full width minus sidebar on desktop

          // Apply margin-left ONLY on desktop to push content right of the fixed sidebar
          ml: `${sidebarWidthActual}px`,

          // Background for the main content area
          bgcolor: theme.palette.background.default, // Use the theme's default background

          boxSizing: 'border-box', // Ensure padding is included in height/width calculations
        }}
      >
        {/* Scrollable Content Area (Houses the Outlet) */}
        <Box
          sx={{
            flexGrow: 1, // Allows this area to expand vertically, pushing footer down
            overflowY: 'auto', // Enable vertical scrolling ONLY for this content part
            overflowX: 'hidden', // Prevent horizontal scrolling for the content box
            boxSizing: 'border-box',

            // Apply consistent inner padding for the page content itself
            // Adjust these values based on your design preference
            p: {
                xs: theme.spacing(2), // Padding on extra-small screens (e.g., 16px)
                sm: theme.spacing(3), // Padding on small screens and up (e.g., 24px)
            },
            // Note: The padding here is INSIDE the scrollable area.
            // Page components rendered by Outlet might add their own padding too.
          }}
        >
          {/* ===================================================================== */}
          {/* Your Page Content (e.g., Dashboard, Profile) renders inside here!   */}
          {/* ===================================================================== */}
          <Outlet />
        </Box>

        {/* Footer Area */}
        {/* Rendered at the bottom of the main content area, above the BottomNav space */}
        {/* Ensure the Footer component itself doesn't have excessive top margin */}
        {user && (
          <Box component="footer" sx={{ flexShrink: 0 /* Prevent footer from shrinking */ }}>
            <Footer />
          </Box>
        )}
      </Box> {/* End Main Content Area Wrapper */}

    </Box> // End Root Box
  );
}

export default MainLayout;