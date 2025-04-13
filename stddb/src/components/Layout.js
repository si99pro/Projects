// src/components/Layout.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import SideNav from './SideNav';
import RightSidebar from './RightSidebar';
import './Layout.css';

const Layout = () => {
  const headerRef = useRef(null);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);

  const handleToggleMobileNav = useCallback(() => {
    setMobileNavOpen(prev => !prev);
    document.body.classList.toggle('mobile-nav-active', !isMobileNavOpen);
  }, [isMobileNavOpen]);

  const closeMobileNav = useCallback(() => {
    setMobileNavOpen(false);
    document.body.classList.remove('mobile-nav-active');
  }, []);

  useEffect(() => {
    const updateHeaderHeight = () => {
       const headerElement = headerRef.current;
       const defaultHeight = 60;
       const headerHeight = headerElement?.offsetHeight || defaultHeight;
       document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
       // Keep body padding for initial offset of the grid container
       document.body.style.paddingTop = `${headerHeight}px`;
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
         document.body.style.paddingTop = '0px';
       }
    }

    return () => {
      if (resizeObserver && headerEl) {
         resizeObserver.unobserve(headerEl);
      }
       document.body.style.paddingTop = '0px';
    };
  }, []);

  useEffect(() => {
      return () => document.body.classList.remove('mobile-nav-active');
  }, []);


  return (
    <div className="app-layout-wrapper">
      <Header ref={headerRef} onToggleMobileNav={handleToggleMobileNav} />

      <div className="main-grid-container">
        {/* --- ADDED WRAPPER for SideNav --- */}
        <aside className="side-nav-wrapper">
          <SideNav isOpen={isMobileNavOpen} onClose={closeMobileNav} />
        </aside>
        {/* --- END WRAPPER --- */}

        <main className="main-content-area" id="main-content">
          <Outlet />
        </main>

        {/* Keep RightSidebar wrapper as is */}
        <aside className="right-sidebar-wrapper">
          <RightSidebar />
        </aside>
      </div>
    </div>
  );
};

export default Layout;