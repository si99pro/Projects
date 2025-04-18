/* eslint-disable no-unused-vars */
// src/components/Header.js
import React, { useState, forwardRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import MenuIcon from '@mui/icons-material/Menu';
import MenuOpenIcon from '@mui/icons-material/MenuOpen';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutlineOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

const getInitials = (name = '') => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
};

const Header = forwardRef(({ onToggleSidebar, isSidebarCollapsed, isMobile }, ref) => {
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { contextUserData, logout } = useAuth() || {};
  const basicInfo = contextUserData?.basicInfo;

  const notificationCount = 3;
  const messageCount = 1;

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
      handleCloseUserMenu();
      try {
          if (typeof logout === 'function') { await logout(); }
          else { console.warn("AuthContext does not provide a logout function."); }
      } catch (error) { console.error("Logout failed:", error); }
  };

  let ToggleButtonIcon;
  let toggleButtonTooltip;

  if (isMobile) {
    ToggleButtonIcon = MenuIcon;
    toggleButtonTooltip = "Open Menu";
  } else {
    ToggleButtonIcon = isSidebarCollapsed ? MenuIcon : MenuOpenIcon;
    toggleButtonTooltip = isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar";
  }

  const handleToggleClick = (event) => {
      event.stopPropagation();
      onToggleSidebar();
  };

  return (
    <AppBar
      ref={ref}
      component="header"
      position="fixed"
      elevation={0}
      className="app-header"
      sx={{
        bgcolor: 'var(--color-offset)',
        border: 'none',
        boxShadow: 'none',
        color: 'var(--color-text-primary)',
      }}
    >
      <Toolbar
        disableGutters
        sx={{
          minHeight: 'var(--header-height) !important',
          height: 'var(--header-height)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 'var(--content-padding)',
        }}
      >
        {/* --- Left Side --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Tooltip title={toggleButtonTooltip}>
             <IconButton
               onClick={handleToggleClick}
               aria-label={toggleButtonTooltip}
               edge="start"
               sx={{
                 color: 'var(--color-icon)',
                 '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.04)' }
               }}
             >
               <ToggleButtonIcon />
             </IconButton>
          </Tooltip>

          {/* YourApp Title - Always visible */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontWeight: 'bold',
              color: 'inherit',
              textDecoration: 'none',
              // REMOVED the display property to make it always visible
              // display: { xs: 'none', sm: 'block' }
            }}
          >
            stdDB
          </Typography>
        </Box>

        {/* --- Center (Optional Global Nav) --- */}
         <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' }, justifyContent: 'center', gap: 1 }}>
            {/* Add global navigation links here if needed */}
         </Box>

        {/* --- Right Side (Icons & User Menu) --- */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          {/* Message Icon */}
          <Tooltip title="Messages">
            <IconButton sx={{ color: 'var(--color-icon)' }}>
                <Badge badgeContent={messageCount} color="primary">
                    <MailOutlineIcon />
                </Badge>
            </IconButton>
          </Tooltip>
          {/* Notification Icon */}
          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'var(--color-icon)' }}>
                <Badge badgeContent={notificationCount} color="error">
                    <NotificationsNoneIcon />
                </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar & Menu */}
          <Tooltip title="Account settings">
            <IconButton onClick={handleOpenUserMenu} size="small" sx={{ p: 0.25 }}>
              <Avatar
                sx={{
                  width: 32, height: 32,
                  bgcolor: 'var(--color-primary)',
                  color: 'var(--color-surface)',
                  fontSize: '0.875rem'
                }}
                src={basicInfo?.profileImageUrl || undefined}
                alt={basicInfo?.fullName || 'User'}
              >
                {!basicInfo?.profileImageUrl && basicInfo?.fullName ? getInitials(basicInfo.fullName) : !basicInfo?.profileImageUrl ? <PersonIcon sx={{ fontSize: '1.2rem' }} /> : null}
              </Avatar>
            </IconButton>
          </Tooltip>
           <Menu
             id="account-menu"
             anchorEl={anchorElUser}
             open={Boolean(anchorElUser)}
             onClose={handleCloseUserMenu}
             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
             transformOrigin={{ vertical: 'top', horizontal: 'right' }}
             MenuListProps={{ 'aria-labelledby': 'account-menu-button' }}
             disableScrollLock
             slotProps={{ paper: { /* Keep your existing styles */ } }}
            >
              {/* Keep your existing MenuItems */}
               <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid var(--color-border)` }}>
                  <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600 }}>
                    {basicInfo?.fullName || 'User Name'}
                  </Typography>
                  <Typography variant="body2" noWrap sx={{ color: 'var(--color-text-secondary)' }}>
                    {basicInfo?.email || 'user@example.com'}
                  </Typography>
               </Box>
              <MenuItem onClick={handleCloseUserMenu} component={Link} to="/profile">
                <PersonIcon/>Profile
              </MenuItem>
              <MenuItem onClick={handleCloseUserMenu} component={Link} to="/settings">
                <SettingsIcon/>Settings
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ '&:hover': { color: 'var(--color-error)', '& .MuiSvgIcon-root': { color: 'var(--color-error)'} } }}>
                <LogoutIcon/>Sign Out
              </MenuItem>
            </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Header;