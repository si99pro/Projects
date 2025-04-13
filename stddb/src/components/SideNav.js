// src/components/SideNav.js
import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components & Icons
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button'; // Keep Button if used elsewhere, otherwise remove
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// Tooltip import removed as it's not used
// IconButton import removed as it's not used
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// Icons
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import BookIcon from '@mui/icons-material/MenuBookOutlined';
import PersonIcon from '@mui/icons-material/PersonOutline';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import BookmarkIcon from '@mui/icons-material/BookmarkBorderOutlined';
import GroupIcon from '@mui/icons-material/GroupOutlined';
import LogoutIcon from '@mui/icons-material/Logout';

// --- Constants ---
// Base width variable (for content & mobile)
const sidebarContentWidth = 'var(--sidebar-left-width, 250px)';
// Calculated width including the gap for the permanent drawer
const permanentDrawerCalculatedWidth = `calc(${sidebarContentWidth} + var(--layout-gap, 20px))`; // Add fallback for gap

// --- Helper Function ---
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '';
};

// --- Navigation Items ---
const mainNavItems = [
  { label: 'Dashboard', link: '/', icon: <DashboardIcon /> },
  { label: 'Students', link: '/students', icon: <SchoolIcon /> },
  { label: 'Courses', link: '/courses', icon: <BookIcon /> },
  { label: 'Groups', link: '/groups', icon: <GroupIcon /> },
  { label: 'Saved Items', link: '/saved', icon: <BookmarkIcon /> },
];
const userNavItems = [
  { label: 'Profile', link: '/profile', icon: <PersonIcon /> },
  { label: 'Settings', link: '/settings', icon: <SettingsIcon /> },
];

// --- Component ---
const SideNav = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { contextUserData, logout } = useAuth();
  const basicInfo = contextUserData?.basicInfo;

  const handleLogout = async () => {
    onClose();
    try {
      if (typeof logout === 'function') { await logout(); }
      else { console.warn("AuthContext does not provide a logout function."); }
    } catch (error) { console.error("Logout failed:", error); }
  };

  const userInitials = useCallback(() => getInitials(basicInfo?.fullName), [basicInfo?.fullName]);

  // --- Define reusable scrollbar styles ---
  const scrollbarStyles = {
     // Define fallback variables for scrollbars
     '--_scrollbar-thumb-color': 'rgba(0, 0, 0, 0.2)',
     '--_scrollbar-thumb-hover-color': 'rgba(0, 0, 0, 0.4)',
     '@media (prefers-color-scheme: dark)': {
       '--_scrollbar-thumb-color': 'rgba(255, 255, 255, 0.2)',
       '--_scrollbar-thumb-hover-color': 'rgba(255, 255, 255, 0.4)',
     },
     // Apply styles
     overflowY: 'auto',
     scrollbarWidth: 'thin', // Firefox
     scrollbarColor: 'var(--_scrollbar-thumb-color) transparent', // Firefox
     '&::-webkit-scrollbar': { width: '6px', height: '6px' },
     '&::-webkit-scrollbar-track': { background: 'transparent' },
     '&::-webkit-scrollbar-thumb': {
         backgroundColor: 'var(--_scrollbar-thumb-color)',
         borderRadius: '3px',
         '&:hover': { backgroundColor: 'var(--_scrollbar-thumb-hover-color)'}
     },
  };

  // --- Drawer Content ---
  const DrawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

      {/* REMOVED: Mobile Top Title */}

      {/* --- User Profile Section (Top) --- */}
      <Box sx={{ pt: isMobile ? 2 : 0, p: 2, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Avatar component={NavLink} to="/profile" onClick={isMobile ? onClose : undefined} sx={{ width: 64, height: 64, margin: '0 auto 12px auto', bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText, fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }} src={basicInfo?.profileImageUrl || undefined} alt={basicInfo?.fullName || 'User Profile'}>
          {!basicInfo?.profileImageUrl && userInitials() ? userInitials() : <PersonIcon />}
        </Avatar>
        <Typography variant="subtitle1" component="div" noWrap sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{basicInfo?.fullName || 'Your Name'}</Typography>
        <Typography variant="body2" noWrap sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>{basicInfo?.headline || basicInfo?.email || 'Your Role/Email'}</Typography>
      </Box>

      {/* --- Main Navigation List --- */}
      <List sx={{ flexGrow: 1, py: 1 }}>
        {mainNavItems.map((item) => (
          <ListItem key={item.label} disablePadding>
            <ListItemButton component={NavLink} to={item.link} end={item.link === '/'} onClick={isMobile ? onClose : undefined} sx={{ py: 0.75, px: 2.5, mb: 0.5, borderRadius: 'var(--border-radius-sm)', mx: 1.5, color: 'var(--color-text-secondary)', '& .MuiListItemIcon-root': { minWidth: 'auto', marginRight: 1.5, color: 'var(--color-icon)' }, '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 }, '&:hover': { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', '& .MuiListItemIcon-root': { color: theme.palette.primary.main } }, '&.active': { backgroundColor: 'var(--color-bg-active)', color: 'var(--color-text-primary)', fontWeight: 600, '& .MuiListItemIcon-root': { color: theme.palette.primary.main }, '& .MuiListItemText-primary': { fontWeight: 600 } }, }}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      {/* --- Divider --- */}
      <Divider sx={{ mx: 2, my: 1 }} />

      {/* --- User Actions / Settings List --- */}
      <List sx={{ py: 1, pb: 2 }}>
        {userNavItems.map((item) => (
           <ListItem key={item.label} disablePadding>
            <ListItemButton component={NavLink} to={item.link} onClick={isMobile ? onClose : undefined} sx={{ py: 0.75, px: 2.5, mb: 0.5, borderRadius: 'var(--border-radius-sm)', mx: 1.5, color: 'var(--color-text-secondary)', '& .MuiListItemIcon-root': { minWidth: 'auto', marginRight: 1.5, color: 'var(--color-icon)' }, '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 }, '&:hover': { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', '& .MuiListItemIcon-root': { color: theme.palette.primary.main } }, '&.active': { backgroundColor: 'var(--color-bg-active)', color: 'var(--color-text-primary)', fontWeight: 600, '& .MuiListItemIcon-root': { color: theme.palette.primary.main }, '& .MuiListItemText-primary': { fontWeight: 600 } } }}>
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
            </ListItemButton>
           </ListItem>
        ))}
        <ListItem disablePadding>
           <ListItemButton onClick={handleLogout} sx={{ py: 0.75, px: 2.5, mb: 0.5, borderRadius: 'var(--border-radius-sm)', mx: 1.5, color: 'var(--color-text-secondary)', '& .MuiListItemIcon-root': { minWidth: 'auto', marginRight: 1.5, color: 'var(--color-icon)' }, '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: 500 }, '&:hover': { backgroundColor: 'var(--color-bg-hover)', color: 'var(--color-text-primary)', '& .MuiListItemIcon-root': { color: theme.palette.error.main } } }}>
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sign Out" />
           </ListItemButton>
        </ListItem>
      </List>

      {/* REMOVED: "Grow your career" section */}

    </Box>
  );

  // --- Render the Drawer ---
  return (
    <Drawer
      variant={isMobile ? 'temporary' : 'permanent'}
      open={isMobile ? isOpen : true}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{
        // --- Use CALCULATED WIDTH for permanent variant ---
        width: isMobile ? sidebarContentWidth : permanentDrawerCalculatedWidth, // Dynamic width
        flexShrink: 0,

        // --- CONDITIONAL STYLES ---
        ...(isMobile
          ? // MOBILE (temporary)
            {
              zIndex: theme.zIndex.drawer + 2,
              [`& .MuiDrawer-paper`]: {
                width: sidebarContentWidth, // Use base width
                boxSizing: 'border-box',
                // Use standard sidenav background for mobile (or card bg if preferred)
                bgcolor: 'var(--color-bg-sidenav)', // #ffffff in light theme
                color: 'var(--color-text-primary)',
                ...scrollbarStyles,
              },
            }
          : // DESKTOP (permanent) - Apply fixed positioning and CALCULATED width
            {
              position: 'fixed',
              left: 0,
              top: 'var(--header-height)',
              height: 'calc(100vh - var(--header-height))',
              zIndex: theme.zIndex.appBar - 1,

              // Style the inner paper container
              [`& .MuiDrawer-paper`]: {
                width: permanentDrawerCalculatedWidth,
                boxSizing: 'border-box',
                position: 'relative', // Keep relative for content flow
                top: 0, left: 0, // Reset relative offsets
                height: '100%', // Fill fixed container
                borderRight: 'none', // Keep border removed
                // --- MODIFIED: Use header background color for desktop sidenav ---
                bgcolor: 'var(--color-bg-header)', // #F9FAFB in light theme
                // -----------------------------------------------------------------
                color: 'var(--color-text-primary)',
                ...scrollbarStyles,
              },
            }),
        // --- END CONDITIONAL STYLES ---
      }}
      aria-label="Main navigation sidebar"
    >
      {DrawerContent}
    </Drawer>
  );
};

export default SideNav;