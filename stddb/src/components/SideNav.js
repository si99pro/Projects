/* eslint-disable no-unused-vars */
// src/components/SideNav.js
import React, { useState, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Ensure correct path

// MUI Components
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse'; // For animated dropdown
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography'; // For potential use

// Icons - Using react-icons, but could swap for MUI icons
import {
  FaHome, FaUser, FaCog, FaQuestionCircle, FaSignOutAlt, FaTachometerAlt
} from 'react-icons/fa';
// Use MUI icons for expand/collapse for theme consistency
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

import './SideNav.css'; // We'll update the CSS

// Helper to apply styles to react-icons to mimic MUI Icon size/color
const iconStyle = { fontSize: '1.25rem', width: 24, height: 24, color: 'inherit' };

/**
 * Application Left Sidebar Navigation.
 * Handles primary navigation links, settings dropdown, and logout.
 * Adapts for mobile slide-in behavior via props from Layout.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.isOpen - Controls mobile visibility (adds 'open' class).
 * @param {Function} props.onNavItemClicked - Callback to close mobile nav on item click.
 */
const SideNav = ({ isOpen, onNavItemClicked }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const navClass = `side-nav ${isOpen ? 'open' : ''}`; // Class for mobile state

  // --- Handlers ---
  const handleToggleSettings = useCallback(() => {
    setIsSettingsOpen(prev => !prev);
  }, []);

  // Close mobile nav *and* navigate (if not logout)
  const handleLinkClick = useCallback(() => {
    if (onNavItemClicked) {
      onNavItemClicked();
    }
    // Navigation is handled by NavLink component prop
  }, [onNavItemClicked]);

  // Close mobile nav *and* logout
  const handleLogout = useCallback(async () => {
    if (onNavItemClicked) {
      onNavItemClicked();
    }
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out:", error);
      // TODO: Add user feedback (e.g., snackbar)
    }
  }, [logout, navigate, onNavItemClicked]);

  // --- NavLink Styling ---
  // Function to apply styles based on active state for NavLink
  // Used with the `style` prop of NavLink within ListItemButton's component prop
  const getNavLinkStyle = ({ isActive }) => ({
    width: '100%',
    textDecoration: 'none',
    color: 'inherit', // Inherit color from ListItemButton
    display: 'flex', // Ensure link fills button
    alignItems: 'center',
    // Optional: Add more specific active styles if needed beyond MUI's selected state
    // fontWeight: isActive ? 'bold' : 'normal',
  });


  return (
    // Use Box with 'nav' component prop for semantics
    <Box component="nav" className={navClass} aria-label="Main Navigation">
      {/* Wrapper for content allows padding and flex layout */}
      <Box className="nav-content-wrapper">

        {/* Main Navigation List */}
        <List component="ul" className="main-nav-list" disablePadding>
          {/* Home */}
          <ListItemButton component={NavLink} to="/" end style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
            <ListItemIcon><FaHome style={iconStyle} /></ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>

          {/* Profile */}
          <ListItemButton component={NavLink} to="/profile" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
            <ListItemIcon><FaUser style={iconStyle} /></ListItemIcon>
            <ListItemText primary="Profile" />
          </ListItemButton>

          {/* Dashboard */}
          <ListItemButton component={NavLink} to="/dashboard" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
            <ListItemIcon><FaTachometerAlt style={iconStyle} /></ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          {/* Settings Dropdown */}
          <ListItemButton onClick={handleToggleSettings} sx={{ mb: 0.5 }}>
            <ListItemIcon><FaCog style={iconStyle} /></ListItemIcon>
            <ListItemText primary="Settings" />
            {isSettingsOpen ? <ExpandLess /> : <ExpandMore />}
          </ListItemButton>
          <Collapse in={isSettingsOpen} timeout="auto" unmountOnExit>
            <List component="div" disablePadding sx={{ pl: 4 }}> {/* Indent nested items */}
              <ListItemButton component={NavLink} to="/settings/account" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
                <ListItemText primary="Account" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/settings/preferences" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
                <ListItemText primary="Preferences" />
              </ListItemButton>
              <ListItemButton component={NavLink} to="/settings/notifications" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
                <ListItemText primary="Notifications" />
              </ListItemButton>
            </List>
          </Collapse>

          {/* Help & Support */}
          <ListItemButton component={NavLink} to="/help" style={getNavLinkStyle} onClick={handleLinkClick} sx={{ mb: 0.5 }}>
            <ListItemIcon><FaQuestionCircle style={iconStyle} /></ListItemIcon>
            <ListItemText primary="Help & Support" />
          </ListItemButton>
        </List>

        {/* Spacer takes up remaining space */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Logout Section */}
        <Box className="logout-section">
           <Divider sx={{ mb: 1 }} />
           <ListItemButton onClick={handleLogout} className="logout-button">
             <ListItemIcon><FaSignOutAlt style={iconStyle} /></ListItemIcon>
             <ListItemText primary="Logout" />
           </ListItemButton>
        </Box>
      </Box>
    </Box>
  );
};

export default SideNav;