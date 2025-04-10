// src/components/Layout.js
import React, { useState, useCallback } from 'react';
import Header from './Header';
import LeftSidebar from './SideNav'; // Assuming SideNav is the Left Sidebar component
import RightSidebar from './RightSidebar';
import Box from '@mui/material/Box';

import './Layout.css';

/**
 * Main application layout component.
 * Orchestrates the Header, Left Sidebar, Right Sidebar, and main content area.
 * Manages the state for the mobile navigation toggle for the Left Sidebar.
 *
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.children - The main content to be rendered within the layout.
 */
const Layout = ({ children }) => {
  // State for the LEFT sidebar's mobile visibility
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);

  // Memoized callback to toggle the left sidebar
  const toggleLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(prevIsOpen => !prevIsOpen);
  }, []);

  // Memoized callback to explicitly close the left sidebar (e.g., on nav item click)
  const closeLeftSidebar = useCallback(() => {
    // Ensure state is set to false only if it was true
    setIsLeftSidebarOpen(prevIsOpen => (prevIsOpen ? false : prevIsOpen));
  }, []);


  return (
    <Box component="div" className="app-layout">
      {/* Pass toggle function for the *left* sidebar */}
      <Header onToggleMobileNav={toggleLeftSidebar} />

      {/* Main body container using flexbox (styles in Layout.css) */}
      <Box component="div" className="main-body-container">

        {/* Left Sidebar */}
        {/* Receives state to control its mobile visibility and close callback */}
        <LeftSidebar isOpen={isLeftSidebarOpen} onNavItemClicked={closeLeftSidebar} />

        {/* Main Content Area */}
        <Box component="main" className="main-content-area">
          {children}
        </Box>

        {/* Right Sidebar */}
        {/* Pass isLeftSidebarOpen so RightSidebar can hide its FAB state on mobile if needed */}
        <RightSidebar isOtherSidebarOpen={isLeftSidebarOpen} />

      </Box> {/* End main-body-container */}

      {/* Mobile Navigation Overlay for LEFT sidebar */}
      {/* Conditionally rendered when left sidebar is open */}
      {isLeftSidebarOpen && (
        <Box
          component="div"
          className="mobile-nav-overlay left-overlay" // Added specific class if needed
          onClick={closeLeftSidebar}
          aria-hidden="true"
        />
      )}
    </Box> // End app-layout
  );
};

export default Layout;