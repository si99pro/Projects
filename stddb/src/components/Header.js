// src/components/Header.js
import React from 'react';
import './Header.css'; // Make sure CSS is imported

// Accept the toggle function as a prop
const Header = ({ onToggleMobileNav }) => {
  return (
    <header>
      {/* Hamburger Button - only visible on mobile via CSS */}
      <button className="mobile-nav-toggle" onClick={onToggleMobileNav} aria-label="Toggle navigation">
        ☰ {/* Or use an icon library */}
      </button>

      {/* Rest of your header content (Logo, Title, User Menu etc.) */}
      <div className="logo">stdDB</div>
      {/* ... other elements ... */}
    </header>
  );
};

export default Header;