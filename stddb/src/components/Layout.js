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
    setMobileNavOpen(prev => {
      const nextState = !prev;
      document.body.classList.toggle('mobile-nav-active', nextState);
      return nextState;
    });
  }, []);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, []);

  // --- Header Height Calculation & Layout Adjustment ---
  useEffect(() => {
    const updateLayoutOffsets = () => {
      const rootStyle = getComputedStyle(document.documentElement);
      const headerElement = headerRef.current;
      const defaultHeight = parseFloat(rootStyle.getPropertyValue('--header-height')) || 60; // Fallback
      const headerHeight = headerElement?.offsetHeight || defaultHeight;
      const spacingLg = parseFloat(rootStyle.getPropertyValue('--spacing-lg') || '24'); // Fallback

      // --- Update the --header-height CSS variable ---
      const currentHeaderVar = parseFloat(rootStyle.getPropertyValue('--header-height'));
      if (Math.abs(headerHeight - currentHeaderVar) > 1) { // Update only if changed
          document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
      }
      // --- Variable Updated ---


      const gridContainer = document.querySelector('.main-grid-container');
      if (gridContainer) {
        const isMobileView = window.innerWidth < 900; // Check breakpoint

        if (!isMobileView) {
          // --- Adjust Padding Top for Grid Container ---
          // This pushes the grid content below the fixed header
          gridContainer.style.paddingTop = `${headerHeight + spacingLg}px`;

          // --- REMOVE Height Calculation/Setting for Left Sidebar & Main Content ---
          // Let their height be determined by content or CSS (like max-height for sticky)
          // const leftSidebar = document.querySelector('.side-nav-wrapper'); // No longer needed here
          // const mainContentArea = document.querySelector('.main-content-area'); // No longer needed here
          // const calculatedHeight = `calc(100vh - ${headerHeight}px - ${spacingLg}px)`; // No longer needed here
          // if (leftSidebar) leftSidebar.style.height = calculatedHeight; // REMOVED
          // if (mainContentArea) mainContentArea.style.height = calculatedHeight; // REMOVED
          // --- Heights NO LONGER SET by JS ---

        } else {
          // On mobile, reset styles potentially set by JS for desktop view
          gridContainer.style.paddingTop = ''; // Let mobile CSS handle padding

          // Reset heights if they were set dynamically (redundant now, but safe)
           const leftSidebar = document.querySelector('.side-nav-wrapper');
           const mainContentArea = document.querySelector('.main-content-area');
           if (leftSidebar) leftSidebar.style.height = '';
           if (mainContentArea) mainContentArea.style.height = '';
        }
      }
    };

    let resizeObserver;
    const headerEl = headerRef.current;

    if (headerEl && typeof ResizeObserver !== 'undefined') {
      updateLayoutOffsets();
      resizeObserver = new ResizeObserver(updateLayoutOffsets);
      resizeObserver.observe(headerEl);
      window.addEventListener('resize', updateLayoutOffsets); // Handle viewport changes
    } else {
      // Fallback
      const timerId = setTimeout(updateLayoutOffsets, 50);
      window.addEventListener('resize', updateLayoutOffsets);
      return () => {
        clearTimeout(timerId);
        window.removeEventListener('resize', updateLayoutOffsets);
      }
    }

    // Cleanup
    return () => {
      if (resizeObserver && headerEl) {
        resizeObserver.unobserve(headerEl);
      }
      window.removeEventListener('resize', updateLayoutOffsets);
    };
  }, []); // Runs on mount

  // --- Cleanup for mobile nav body class ---
  useEffect(() => {
    return () => document.body.classList.remove('mobile-nav-active');
  }, []);


  return (
    <div className="app-layout-wrapper">
      <Header ref={headerRef} onToggleMobileNav={handleToggleMobileNav} />
      <div className="main-grid-container">
        <aside className="side-nav-wrapper">
          <SideNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
        </aside>
        <main className="main-content-area" id="main-content">
          <div className="main-content-wrapper">
            <Outlet />
          </div>
        </main>
        {/* Right sidebar uses position: sticky defined in CSS */}
        <aside className="right-sidebar-wrapper">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;