/* eslint-disable no-unused-vars */
// src/components/Layout.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
// import PullToRefresh from 'react-simple-pull-to-refresh'; // <-- DELETED

// Import Components
import Header from './Header';
import SideNav from './SideNav';
import RightSidebar from './RightSidebar';

// Import Layout-specific CSS
import './Layout.css';
// import './PullToRefresh.css'; // <-- DELETED

const Layout = () => {
  const location = useLocation();
  const headerRef = useRef(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => {
        const newState = !prev;
        document.body.classList.toggle('mobile-nav-active', newState);
        return newState;
    });
  }, []);

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


  // --- Pull-to-Refresh Handler --- // <-- DELETED Block Below
  // const handleRefresh = async () => { ... }; // <-- DELETED

  return (
    <div className="app-layout-wrapper">
      {isMobileNavOpen && <div className="mobile-nav-overlay" onClick={closeMobileNav}></div>}

      <Header ref={headerRef} onToggleMobileNav={handleToggleMobileNav} />

      <div className="main-grid-container">
        <aside className="left-sidebar-wrapper">
             <SideNav isOpen={isMobileNavOpen} closeNav={closeMobileNav} />
        </aside>

        {/* PullToRefresh wrapper removed */}
        {/* <PullToRefresh ... > */} {/* <-- DELETED */}
            <main className="main-content-area" id="main-content">
                <Outlet /> {/* Page content determines height */}
            </main>
        {/* </PullToRefresh> */} {/* <-- DELETED */}

        <aside className="right-sidebar-wrapper">
            <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;