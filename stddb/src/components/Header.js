// src/components/Header.js
import React, { useState, useCallback } from 'react'; // Added useState, useCallback for menu placeholders
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

// MUI Components & Icons
import Box from '@mui/material/Box'; // Use Box for semantic structure if preferred over divs
import AppBar from '@mui/material/AppBar'; // Use AppBar for semantic correctness and elevation control
import Toolbar from '@mui/material/Toolbar'; // Standard container for AppBar content
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import SettingsIcon from '@mui/icons-material/Settings';
import Badge from '@mui/material/Badge';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import PersonIcon from '@mui/icons-material/Person';
import Tooltip from '@mui/material/Tooltip'; // For icon hints
import Menu from '@mui/material/Menu';         // Placeholder for popover menus
import MenuItem from '@mui/material/MenuItem';   // Placeholder for popover menus

import './Header.css'; // Import the CSS

/**
 * Application Header component.
 * Displays branding, navigation toggle, actions, and user information.
 *
 * @param {object} props - Component props.
 * @param {Function} props.onToggleMobileNav - Callback function to toggle the mobile sidebar.
 */
const Header = ({ onToggleMobileNav }) => {
  // --- State for Menu Placeholders ---
  // Example for user menu, repeat similar pattern for notifications/messages if needed
  const [anchorElUser, setAnchorElUser] = useState(null);
  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);
  // Add similar state/handlers for message/notification menus

  // --- Get User Data from Auth Context ---
  const { contextUserData } = useAuth();
  const basicInfo = contextUserData?.basicInfo;

  // --- Demo Data (replace with real data) ---
  const messageCount = 3;
  const notificationCount = 5;

  // --- Helper Functions ---
  const getInitials = useCallback((name) => {
    if (!name) return '';
    return name
        .split(' ')
        .map(n => n[0])
        .filter(char => char)
        .join('')
        .toUpperCase();
  }, []); // Memoize helper function

  return (
    // Use MUI AppBar for semantic correctness and easier elevation/styling
    <AppBar
      component="header" // Render as <header> tag
      position="sticky"    // Consistent with previous CSS
      color="inherit"      // Use inherit to allow custom background via CSS/sx
      elevation={0}        // Remove default shadow, use border instead
      className="app-header" // Apply custom class
      sx={{ // Use sx for styles directly tied to MUI structure
        bgcolor: 'var(--header-bg, #ffffff)', // Apply background from variable
        borderBottom: '1px solid var(--header-border-color, #e0e0e0)', // Apply border
        height: 'var(--header-height, 60px)', // Apply height
        // Keep overscroll behavior if specifically needed for the header only
         overscrollBehaviorY: 'contain',
      }}
    >
      <Toolbar disableGutters sx={{ // disableGutters to use custom padding
         minHeight: 'var(--header-height, 60px)!important', // Ensure toolbar respects height
         px: 'var(--content-padding-x, 24px)' // Apply horizontal padding
         }}>

        {/* Left Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Hamburger Button */}
          <Tooltip title="Toggle Navigation">
            <IconButton
              className="mobile-nav-toggle" // Keep class if needed by external CSS/tests
              onClick={onToggleMobileNav}
              aria-label="Toggle navigation"
              sx={{
                mr: 1, // Keep margin for spacing
                display: { xs: 'inline-flex', md: 'none' }, // Standard responsive toggle
                color: 'var(--header-link-color, #5f6368)' // Use CSS variable
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>

          {/* Logo/Title */}
          <Link to="/" className="header-logo-link">
            <span className="header-title">stdDB</span>
          </Link>
        </Box>

        {/* Spacer to push right content */}
        <Box sx={{ flexGrow: 1 }} />

        {/* Right Section */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0, gap: 1 }}> {/* Use gap for spacing */}

          {/* Optional Action Button */}
          <Button variant="outlined" size="small" sx={{ display: { xs: 'none', sm: 'inline-flex' } }} className="header-action-button">
            Action
          </Button>

          {/* Optional Desktop Nav */}
          {/* Consider moving this to sidebar for cleaner header if many links */}
          <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 2.5 }} aria-label="Header navigation" className="header-nav-links">
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/docs">Docs</Link>
          </Box>

          {/* Messages Icon */}
          <Tooltip title={`${messageCount} new messages`}>
            <IconButton
              aria-label={`Show ${messageCount} new messages`}
              // onClick={handleOpenMessagesMenu} // Add handler
              sx={{ color: 'var(--header-link-color, #5f6368)' }}
              className="header-icon-button"
            >
              <Badge badgeContent={messageCount} color="error" overlap="circular">
                <MailOutlineIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Notifications Icon */}
          <Tooltip title={`${notificationCount} new notifications`}>
            <IconButton
              aria-label={`Show ${notificationCount} new notifications`}
              // onClick={handleOpenNotificationsMenu} // Add handler
              sx={{ color: 'var(--header-link-color, #5f6368)' }}
               className="header-icon-button"
            >
              <Badge badgeContent={notificationCount} color="error" overlap="circular">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Settings Icon */}
          <Tooltip title="Settings">
            <IconButton
              aria-label="Settings"
              // onClick={handleOpenSettingsMenu} // Add handler
              sx={{ color: 'var(--header-link-color, #5f6368)' }}
               className="header-icon-button"
            >
              <SettingsIcon />
            </IconButton>
          </Tooltip>

          {/* User Avatar & Menu Placeholder */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleOpenUserMenu} // Placeholder for opening menu
              sx={{ p: 0, ml: 0.5 }} // Remove padding, adjust margin slightly
              aria-label="Open account menu"
              aria-controls={Boolean(anchorElUser) ? 'account-menu' : undefined}
              aria-haspopup="true"
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: basicInfo?.profileBgColor || 'primary.main',
                  fontSize: '0.875rem'
                }}
                src={basicInfo?.profileImageUrl || undefined}
                alt={basicInfo?.fullName || 'User Profile'}
                className="header-avatar" // Add class for styling hover/focus
              >
                {!basicInfo?.profileImageUrl && basicInfo?.fullName
                  ? getInitials(basicInfo.fullName)
                  : !basicInfo?.profileImageUrl ? <PersonIcon sx={{ fontSize: '1.2rem' }}/> : null
                }
              </Avatar>
            </IconButton>
          </Tooltip>
          {/* Placeholder User Menu (Anchored to Avatar IconButton) */}
          <Menu
             id="account-menu"
             anchorEl={anchorElUser}
             open={Boolean(anchorElUser)}
             onClose={handleCloseUserMenu}
             onClick={handleCloseUserMenu} // Close menu on item click
             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
             sx={{ mt: 1 }} // Add margin top
             MenuListProps={{ 'aria-labelledby': 'account-menu-button' }} // Accessibility
          >
            <MenuItem component={Link} to="/profile">Profile</MenuItem>
            <MenuItem component={Link} to="/settings/account">My account</MenuItem>
            <MenuItem /* onClick={handleLogout} */ >Logout</MenuItem>
          </Menu>

        </Box> {/* End Right Section */}

      </Toolbar>
    </AppBar>
  );
};

export default Header;