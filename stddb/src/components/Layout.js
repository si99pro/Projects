// src/components/Layout.js
import React, { useState, useCallback } from 'react'; // Import useCallback
import Header from './Header';
import SideNav from './SideNav';
import './Layout.css';

const Layout = ({ children }) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Memoize toggleMobileNav using useCallback.
  // It doesn't depend on any external state in this simple form,
  // but using useCallback is consistent.
  const toggleMobileNav = useCallback(() => {
    // Functional update form is slightly safer for state toggles
    setIsMobileNavOpen(prevIsOpen => !prevIsOpen);
  }, []); // No dependencies, function reference will never change

  // Memoize closeMobileNav using useCallback.
  // This function *does* depend on isMobileNavOpen to decide if it needs to act.
  // However, the function reference itself only needs to change if setIsMobileNavOpen changes (which it never does).
  // We'll include isMobileNavOpen as a dependency to be technically correct if the logic *inside* depended on its value,
  // but for setting state, it's often okay to leave the dependency array empty if using the functional update form.
  // Let's use the functional update form here too for safety and keep the dependency array empty.
  const closeMobileNav = useCallback(() => {
    // Functional update form ensures we use the latest state
    setIsMobileNavOpen(prevIsOpen => {
      // Only update state if it was previously true
      if (prevIsOpen) {
        return false;
      }
      // Otherwise, return the current state (no change)
      return prevIsOpen;
    });
  }, []); // No dependencies needed when using functional update form correctly

  /*
  // Alternative closeMobileNav with dependency (less common for simple setters):
  const closeMobileNav = useCallback(() => {
    if (isMobileNavOpen) {
      setIsMobileNavOpen(false);
    }
  }, [isMobileNavOpen]); // Dependency: function changes if isMobileNavOpen changes
  */


  return (
    <div className="app-layout">
      {/* Pass the memoized toggle function */}
      <Header onToggleMobileNav={toggleMobileNav} />

      <div className="main-container">
        {/* Pass the memoized close function */}
        <SideNav isOpen={isMobileNavOpen} onNavItemClicked={closeMobileNav} />

        <main className="content-area">
          {children}
        </main>
      </div>

      {/* Overlay click uses the same memoized close function */}
      {isMobileNavOpen && <div className="mobile-nav-overlay" onClick={closeMobileNav}></div>}
    </div>
  );
};

export default Layout;