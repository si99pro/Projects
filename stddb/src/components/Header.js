// src/components/Header.js
import React, { useState, useCallback, forwardRef } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components & Icons
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Avatar from '@mui/material/Avatar';
import Badge from '@mui/material/Badge';
import Tooltip from '@mui/material/Tooltip';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';

// MUI Icons
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import MailOutlineIcon from '@mui/icons-material/MailOutline'; // <-- Added Message Icon

const Header = forwardRef(({ onToggleMobileNav }, ref) => {
  const theme = useTheme();
  const [anchorElUser, setAnchorElUser] = useState(null);
  const { contextUserData, logout } = useAuth();
  const basicInfo = contextUserData?.basicInfo;

  const notificationCount = 5; // Example notification count
  const messageCount = 2; // Example message count

  const handleOpenUserMenu = (event) => setAnchorElUser(event.currentTarget);
  const handleCloseUserMenu = () => setAnchorElUser(null);

  const handleLogout = async () => {
    handleCloseUserMenu();
    try {
      if (typeof logout === 'function') { await logout(); }
      else { console.warn("AuthContext does not provide a logout function."); }
    } catch (error) { console.error("Logout failed:", error); }
  };

  const getInitials = useCallback((name) => {
    if (!name || typeof name !== 'string') return '';
    const parts = name.trim().split(' ').filter(Boolean);
    if (parts.length === 0) return '';
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, []);

  const navItems = [
    { label: 'Dashboard', link: '/' },
    { label: 'Students', link: '/students' },
    { label: 'Courses', link: '/courses' },
  ];

  // --- Define a very subtle shadow value ---
  const subtleShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)';

  return (
    <AppBar
      ref={ref}
      component="header"
      position="fixed"
      sx={{
        boxShadow: subtleShadow, // Apply subtle shadow
        top: 0,
        left: 0,
        right: 0,
        bgcolor: 'var(--color-bg-header)',
        height: 'var(--header-height)',
        zIndex: theme.zIndex.drawer + 1,
      }}
      className="app-header"
    >
      {/* Toolbar setup */}
      <Toolbar
        disableGutters
        sx={{
          minHeight: 'var(--header-height) !important',
          height: 'var(--header-height)',
          px: 'var(--layout-padding-x)',
          maxWidth: 'var(--layout-max-width)',
          width: '100%',
          mx: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* === Left Section: Logo, Mobile Toggle, Desktop Nav === */}
        <Box sx={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Mobile Nav Toggle */}
          <Tooltip title="Toggle Navigation">
            <IconButton
              onClick={onToggleMobileNav}
              aria-label="Toggle navigation"
              edge="start"
              sx={{
                mr: 1,
                display: { xs: 'inline-flex', md: 'none' },
                color: 'var(--color-icon)',
                '&:hover': { bgcolor: 'var(--color-bg-hover)' }
              }}
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
          {/* Logo/Brand */}
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              fontWeight: 'bold',
              color: 'var(--color-text-primary)',
              textDecoration: 'none',
              mr: { xs: 1, md: 3 },
              '&:hover': { textDecoration: 'none' }
            }}
          >
            stdDB
          </Typography>
          {/* Desktop Navigation */}
          <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }} aria-label="Main navigation">
            {navItems.map((item) => (
              <Button
                key={item.label}
                component={NavLink}
                to={item.link}
                end={item.link === '/'}
                size="small"
                sx={{
                  color: 'var(--color-text-secondary)',
                  fontWeight: 500,
                  textTransform: 'none',
                  px: 1.5,
                  '&:hover': {
                    color: 'var(--color-text-primary)',
                    bgcolor: 'var(--color-bg-hover)'
                  },
                  '&.active': {
                    color: 'var(--color-text-primary)',
                    fontWeight: 600,
                    bgcolor: 'var(--color-bg-active)'
                  }
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Box>

        {/* === Right Section: Search, Icons, User Menu === */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.5, sm: 1.5 } }}>
          {/* Desktop Search Bar */}
          <Box sx={{
            position: 'relative',
            bgcolor: 'var(--color-bg-search)',
            borderRadius: 'var(--border-radius)',
            display: { xs: 'none', sm: 'flex' },
            alignItems: 'center',
            height: '36px'
          }}>
            <Box sx={{ pl: 1.5, height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SearchIcon sx={{ color: 'var(--color-icon)', fontSize: '1.2rem' }} />
            </Box>
            <InputBase
              placeholder="Search..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                color: 'var(--color-text-primary)',
                pl: 5, pr: 1.5,
                width: { sm: '200px', md: '280px' },
                height: '100%',
                fontSize: '0.9rem',
                '& ::placeholder': {
                  color: 'var(--color-text-placeholder)',
                  opacity: 1
                }
              }} />
          </Box>
          {/* Mobile Search Icon */}
          <Tooltip title="Search">
            <IconButton sx={{ display: { xs: 'inline-flex', sm: 'none' }, color: 'var(--color-icon)', '&:hover': { bgcolor: 'var(--color-bg-hover)' } }}>
              <SearchIcon />
            </IconButton>
          </Tooltip>

          {/* Notifications Icon */}
          <Tooltip title="Notifications">
            <IconButton sx={{ color: 'var(--color-icon)', '&:hover': { bgcolor: 'var(--color-bg-hover)' } }}>
              <Badge badgeContent={notificationCount} color="error" overlap="circular">
                <NotificationsNoneIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Messages Icon - ADDED */}
          <Tooltip title="Messages">
            <IconButton sx={{ color: 'var(--color-icon)', '&:hover': { bgcolor: 'var(--color-bg-hover)' } }}>
              <Badge badgeContent={messageCount} color="primary" overlap="circular"> {/* Use different color for messages */}
                <MailOutlineIcon />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* User Avatar & Menu */}
          <Tooltip title="Account settings">
            <IconButton
              onClick={handleOpenUserMenu}
              size="small"
              aria-label="Open account menu"
              aria-controls={Boolean(anchorElUser) ? 'account-menu' : undefined}
              aria-haspopup="true"
              sx={{ p: 0.5, '&:hover': { bgcolor: 'var(--color-bg-hover)' } }}
            >
              <Avatar
                sx={{
                  width: 32, height: 32,
                  bgcolor: theme.palette.primary.main,
                  fontSize: '0.875rem',
                  color: 'var(--color-text-inverted)'
                }}
                src={basicInfo?.profileImageUrl || undefined}
                alt={basicInfo?.fullName || 'User'}
              >
                {!basicInfo?.profileImageUrl && basicInfo?.fullName ? getInitials(basicInfo.fullName) : !basicInfo?.profileImageUrl ? <PersonIcon sx={{ fontSize: '1.2rem' }} /> : null}
              </Avatar>
            </IconButton>
          </Tooltip>
          {/* User Account Menu */}
          <Menu
            id="account-menu"
            anchorEl={anchorElUser}
            open={Boolean(anchorElUser)}
            onClose={handleCloseUserMenu}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            MenuListProps={{ 'aria-labelledby': 'account-menu-button' }}
            disableScrollLock // <-- FIX: Prevent scrollbar hiding
            slotProps={{
              paper: {
                elevation: 0, // Keep paper flat
                sx: {
                  mt: 1.5, minWidth: 220, overflow: 'visible',
                  bgcolor: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
                  border: `1px solid var(--color-border)`,
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))', // Keep dropdown shadow
                  '&::before': { // Arrow pointing to the anchor
                     content: '""', display: 'block', position: 'absolute',
                     top: 0, right: 14, width: 10, height: 10,
                     bgcolor: 'var(--color-bg-card)',
                     transform: 'translateY(-50%) rotate(45deg)', zIndex: 0,
                     borderTop: 'inherit', borderLeft: 'inherit'
                  },
                  '& .MuiMenuItem-root': { // Style menu items
                     fontSize: '0.9rem', padding: theme.spacing(1, 2),
                     '&:hover': { bgcolor: 'var(--color-bg-hover)' },
                     '& a': { textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', width: '100%' }
                  },
                  '& .MuiSvgIcon-root': { // Style icons within menu items
                    fontSize: '1.1rem', color: 'var(--color-icon)', mr: 1.5
                  }
                }
              }
            }}
          >
             {/* Menu Header */}
             <Box sx={{ px: 2, py: 1.5, borderBottom: `1px solid var(--color-border)` }}>
                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                  {basicInfo?.fullName || 'User Name'}
                </Typography>
                <Typography variant="body2" noWrap sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.3 }}>
                  {basicInfo?.email || 'user@example.com'}
                </Typography>
             </Box>
             {/* Menu Items */}
            <MenuItem onClick={handleCloseUserMenu} component={Link} to="/profile"><PersonIcon/>Profile</MenuItem>
            <MenuItem onClick={handleCloseUserMenu} component={Link} to="/settings"><SettingsIcon/>Settings</MenuItem>
            <Divider sx={{ my: 0.5, borderColor: 'var(--color-border)' }} />
            <MenuItem onClick={handleLogout}><LogoutIcon/>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
});

export default Header;