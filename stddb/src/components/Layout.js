// src/components/Layout.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SideNav from './SideNav';
import RightSidebar from './RightSidebar';
import './Layout.css'; // Ensure this CSS file is imported

const Layout = () => {
  const headerRef = useRef(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  // --- Mobile Nav Handlers ---
  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => !prev);
    document.body.classList.toggle('mobile-nav-active', !isMobileNavOpen);
  }, [isMobileNavOpen]);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, []);

  // --- Header Height Calculation ---
  useEffect(() => {
    const updateLayoutOffsets = () => {
       const headerElement = headerRef.current;
       // Use the CSS variable defined in :root as the default/fallback
       const defaultHeight = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--header-height')) || 60;
       const headerHeight = headerElement?.offsetHeight || defaultHeight;

       // Update the CSS variable value dynamically
       document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);

       // Apply padding top to the grid container to offset fixed header
       const gridContainer = document.querySelector('.main-grid-container');
       if (gridContainer) {
           gridContainer.style.paddingTop = `${headerHeight + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-lg') || '24px')}px`; // Add grid padding
           // Adjust grid container height directly if needed (alternative to padding)
           // gridContainer.style.height = `calc(100vh - ${headerHeight}px)`;
       }

       // Adjust sticky top for right sidebar if needed (CSS might be sufficient)
        // const rightSidebar = document.querySelector('.right-sidebar-wrapper');
        // if (rightSidebar) {
        //   rightSidebar.style.top = `${headerHeight + parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--spacing-lg') || '24px')}px`;
        // }
    };

    let resizeObserver;
    const headerEl = headerRef.current;
    if (headerEl && typeof ResizeObserver !== 'undefined') {
        updateLayoutOffsets(); // Initial calculation
        resizeObserver = new ResizeObserver(updateLayoutOffsets);
        resizeObserver.observe(headerEl);
    } else {
       // Fallback for older browsers
       const timerId = setTimeout(updateLayoutOffsets, 0);
       window.addEventListener('resize', updateLayoutOffsets);
       return () => {
         clearTimeout(timerId);
         window.removeEventListener('resize', updateLayoutOffsets);
         const gridContainer = document.querySelector('.main-grid-container');
         if (gridContainer) gridContainer.style.paddingTop = '0px'; // Reset on cleanup
       }
    }

    // Cleanup function
    return () => {
      if (resizeObserver && headerEl) {
         resizeObserver.unobserve(headerEl);
      }
      // Reset padding on unmount
      const gridContainer = document.querySelector('.main-grid-container');
      if (gridContainer) gridContainer.style.paddingTop = '0px'; // Reset on cleanup
    };
  }, []); // Runs once on mount

  // --- Cleanup for mobile nav class ---
  useEffect(() => {
      return () => document.body.classList.remove('mobile-nav-active');
  }, []);


  return (
    <div className="app-layout-wrapper">
      <Header ref={headerRef} onToggleMobileNav={handleToggleMobileNav} />

      {/* This is the core grid container */}
      <div className="main-grid-container">
        {/* Left Sidebar */}
        <aside className="side-nav-wrapper">
          <SideNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
        </aside>

        {/* Main Content Area (Grid Cell) */}
        <main className="main-content-area" id="main-content">
          {/* --- ADDED WRAPPER --- */}
          {/* This wrapper will be styled to control max-width */}
          <div className="main-content-wrapper">
            <Outlet /> {/* Outlet is now inside the wrapper */}
          </div>
          {/* --- END WRAPPER --- */}
        </main>

        {/* Right Sidebar */}
        <aside className="right-sidebar-wrapper">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;