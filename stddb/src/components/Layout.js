// src/components/Layout.js
import React, { useState, useCallback } from 'react';
import Header from './Header';
import LeftSidebar from './SideNav'; // Renamed import for clarity
import RightSidebar from './RightSidebar';
import Box from '@mui/material/Box'; // Using MUI Box for layout

import './Layout.css';

/**
 * Main application layout component.
 * Orchestrates the Header, Left Sidebar, Right Sidebar, and main content area.
 * Manages the state for the mobile navigation toggle.
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
  }, []); // Empty dependency array as setter handles previous state

  // Memoized callback to explicitly close the left sidebar (e.g., on nav item click)
  const closeLeftSidebar = useCallback(() => {
    setIsLeftSidebarOpen(prevIsOpen => (prevIsOpen ? false : prevIsOpen));
    // Alternative: setIsLeftSidebarOpen(false); // Simpler if always closing
  }, []); // Empty dependency array


  return (
    // Use Box for the root layout element
    <Box component="div" className="app-layout">
      <Header onToggleMobileNav={toggleLeftSidebar} />

      {/* Use Box for the main body container */}
      <Box component="div" className="main-body-container">

        {/* Left Sidebar (using the SideNav component) */}
        <LeftSidebar isOpen={isLeftSidebarOpen} onNavItemClicked={closeLeftSidebar} />

        {/* Main Content Area */}
        {/* Using 'main' semantic tag, wrapped in Box for consistency if needed */}
        <Box component="main" className="main-content-area">
          {children}
        </Box>

        {/* Right Sidebar */}
        <RightSidebar />

      </Box> {/* End main-body-container */}

      {/* Mobile Navigation Overlay */}
      {/* Conditionally rendered for performance and simplicity */}
      {isLeftSidebarOpen && (
        <Box
          component="div"
          className="mobile-nav-overlay"
          onClick={closeLeftSidebar} // Close sidebar when overlay is clicked
          aria-hidden="true" // Hide from accessibility tree as it's decorative/functional
        />
      )}
    </Box> // End app-layout
  );
};

export default Layout;