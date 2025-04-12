// src/components/Layout.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import PullToRefresh from 'react-simple-pull-to-refresh';

// Import Components
import Header from './Header';
import SideNav from './SideNav';
import RightSidebar from './RightSidebar';

// Import Layout-specific CSS
import './Layout.css';
// Import CSS for pull-to-refresh custom styling
import './PullToRefresh.css';

const Layout = () => {
  const location = useLocation();
  const headerRef = useRef(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => {
        const newState = !prev;
        // Add/remove body class based on the NEW state
        document.body.classList.toggle('mobile-nav-active', newState);
        return newState;
    });
  }, []); // No dependency needed if only toggling based on prev

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, []);

  // Effect to set the --header-height CSS variable
  useEffect(() => {
    const updateHeaderHeight = () => {
      const headerElement = headerRef.current;
      const defaultHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-height').trim(), 10) || 55;
      const headerHeight = headerElement?.offsetHeight || defaultHeight;
      document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    };

    let resizeObserver;
    const headerEl = headerRef.current;
    if (headerEl && typeof ResizeObserver !== 'undefined') {
        updateHeaderHeight();
        resizeObserver = new ResizeObserver(updateHeaderHeight);
        resizeObserver.observe(headerEl);
    } else {
       const timerId = setTimeout(updateHeaderHeight, 0);
       window.addEventListener('resize', updateHeaderHeight);
       return () => {
         clearTimeout(timerId);
         window.removeEventListener('resize', updateHeaderHeight);
       }
    }
    return () => {
      if (resizeObserver && headerEl) {
         resizeObserver.unobserve(headerEl);
      }
    };
  }, []);

  // Clean up body class on unmount
  useEffect(() => {
      return () => document.body.classList.remove('mobile-nav-active');
  }, []);


  // --- Pull-to-Refresh Handler ---
  const handleRefresh = async () => {
    console.log('Refresh triggered for:', location.pathname);
    await new Promise(resolve => setTimeout(resolve, 300)); // Short visual delay
    // --- !!! IMPLEMENT YOUR REFRESH LOGIC HERE !!! ---
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
    console.log('Refresh finished.');
  };

  return (
    <div className="app-layout-wrapper">
      {isMobileNavOpen && <div className="mobile-nav-overlay" onClick={closeMobileNav}></div>}

      <Header ref={headerRef} onToggleMobileNav={handleToggleMobileNav} />

      <div className="main-grid-container">
        <aside className="left-sidebar-wrapper">
             <SideNav isOpen={isMobileNavOpen} closeNav={closeMobileNav} />
        </aside>

        {/* PullToRefresh now wraps the main element */}
        {/* The Library should handle body scroll detection */}
        <PullToRefresh
            onRefresh={handleRefresh}
            pullingContent={<div className="ptr-pulling"><span className="ptr-icon">⬇️</span> Pull down</div>}
            refreshingContent={<div className="ptr-refreshing"><span className="ptr-spinner">🔄</span> Refreshing...</div>}
            resistance={2.5} // Adjust as needed for body scroll feel
        >
            {/* Main content area - NO fixed height or internal overflow */}
            <main className="main-content-area" id="main-content">
                <Outlet /> {/* Page content determines height */}
            </main>
        </PullToRefresh>

        <aside className="right-sidebar-wrapper">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;