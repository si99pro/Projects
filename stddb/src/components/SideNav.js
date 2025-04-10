/* eslint-disable jsx-a11y/anchor-is-valid */
// src/components/SideNav.js
import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import {
  FaHome, FaUser, FaCog, FaQuestionCircle, FaChevronDown, FaChevronRight, FaSignOutAlt, FaTachometerAlt
} from 'react-icons/fa';

import './SideNav.css';

// Receive isOpen AND the new onNavItemClicked prop
const SideNav = ({ isOpen, onNavItemClicked }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navClass = `side-nav ${isOpen ? 'open' : ''}`;

  const handleToggleSettings = (e) => {
    e.preventDefault();
    setIsSettingsOpen(!isSettingsOpen);
    // We DON'T call onNavItemClicked here, as this only toggles the dropdown
  };

  const handleLogout = async () => {
    // Call the closing function *before* doing the async stuff
    if (onNavItemClicked) {
      onNavItemClicked();
    }
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // --- Helper function to handle link clicks ---
  const handleLinkClick = () => {
    // Call the passed-in function to close the nav (if provided)
    if (onNavItemClicked) {
        onNavItemClicked();
    }
    // Let NavLink handle the navigation itself
  };


  return (
    <nav className={navClass} aria-label="Main Navigation">
      <div className="nav-content">
        <ul className="nav-list main-nav">
          {/* --- Add onClick={handleLinkClick} to all NavLinks --- */}
          <li>
            <NavLink to="/" end onClick={handleLinkClick}>
              <FaHome className="nav-icon" />
              <span>Home</span>
            </NavLink>
          </li>
          <li>
            <NavLink to="/profile" onClick={handleLinkClick}>
              <FaUser className="nav-icon" />
              <span>Profile</span>
            </NavLink>
          </li>
          <li>
             <NavLink to="/dashboard" onClick={handleLinkClick}>
               <FaTachometerAlt className="nav-icon" />
               <span>Dashboard</span>
             </NavLink>
           </li>
          <li className="nav-item-dropdown">
            {/* Settings toggle does NOT close the nav */}
            <a href="#" onClick={handleToggleSettings} className="dropdown-toggle" aria-expanded={isSettingsOpen}>
              <FaCog className="nav-icon" />
              <span>Settings</span>
              {isSettingsOpen ? <FaChevronDown className="chevron-icon open" /> : <FaChevronRight className="chevron-icon" />}
            </a>
            {isSettingsOpen && (
              <ul className="dropdown-menu">
                 {/* --- Add onClick={handleLinkClick} to dropdown NavLinks --- */}
                <li><NavLink to="/settings/account" onClick={handleLinkClick}>Account</NavLink></li>
                <li><NavLink to="/settings/preferences" onClick={handleLinkClick}>Preferences</NavLink></li>
                <li><NavLink to="/settings/notifications" onClick={handleLinkClick}>Notifications</NavLink></li>
              </ul>
            )}
          </li>
          <li>
            <NavLink to="/help" onClick={handleLinkClick}>
              <FaQuestionCircle className="nav-icon" />
              <span>Help & Support</span>
            </NavLink>
          </li>
        </ul>

        <div className="nav-list logout-section">
           {/* Logout button uses its own handler which includes the close logic */}
          <button onClick={handleLogout} className="logout-button">
            <FaSignOutAlt className="nav-icon" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default SideNav;