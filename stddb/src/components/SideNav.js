// src/components/SideNav.js
import React, { useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components & Icons
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
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
const drawerWidth = 'var(--sidebar-left-width, 250px)'; // Use CSS variable

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
      {isMobile && (
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'var(--color-text-primary)' }}>stdDB</Typography>
        </Box>
      )}
      <Box sx={{ p: 2, textAlign: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Avatar component={NavLink} to="/profile" onClick={isMobile ? onClose : undefined} sx={{ width: 64, height: 64, margin: '0 auto 12px auto', bgcolor: theme.palette.primary.light, color: theme.palette.primary.contrastText, fontSize: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s ease-in-out', '&:hover': { transform: 'scale(1.05)' } }} src={basicInfo?.profileImageUrl || undefined} alt={basicInfo?.fullName || 'User Profile'}>
          {!basicInfo?.profileImageUrl && userInitials() ? userInitials() : <PersonIcon />}
        </Avatar>
        <Typography variant="subtitle1" component="div" noWrap sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{basicInfo?.fullName || 'Your Name'}</Typography>
        <Typography variant="body2" noWrap sx={{ color: 'var(--color-text-secondary)', mb: 1 }}>{basicInfo?.headline || basicInfo?.email || 'Your Role/Email'}</Typography>
      </Box>
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
      <Divider sx={{ mx: 2, my: 1 }} />
      <List sx={{ py: 1 }}>
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
      <Box sx={{ p: 2, mt: 'auto', borderTop: `1px solid ${theme.palette.divider}` }}>
          <Typography variant="body2" sx={{ mb: 1, color: 'var(--color-text-secondary)', textAlign:'center' }}>Grow your career</Typography>
          <Button variant="outlined" size="small" fullWidth startIcon={<Box sx={{ width: 16, height: 16, bgcolor: 'var(--color-premium-icon-bg, #f8c77e)', mr: 0.5, borderRadius: '2px' }} />} sx={{ borderColor: 'var(--color-premium-border, gold)', color: 'var(--color-premium-text, gold)', textTransform:'none', '&:hover': { bgcolor: 'var(--color-premium-hover-bg, rgba(255, 215, 0, 0.1))' } }}>Try Premium Free</Button>
      </Box>
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
        // Common styles
        width: drawerWidth,
        flexShrink: 0,

        // --- CONDITIONAL STYLES ---
        ...(isMobile
          ? // MOBILE (temporary) - Handled by Modal, zIndex is key
            {
              zIndex: theme.zIndex.drawer + 2, // Above overlay
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
                bgcolor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                ...scrollbarStyles, // Apply scrollbar styles to paper
              },
            }
          : // DESKTOP (permanent) - Apply fixed positioning
            {
              // Apply position fixed to the Drawer component itself
              position: 'fixed',          // <<< FIXED POSITION
              left: 0,
              top: 'var(--header-height)', // <<< START BELOW HEADER
              height: 'calc(100vh - var(--header-height))', // Fill remaining height
              zIndex: theme.zIndex.appBar - 1, // Sit below the AppBar

              // Style the inner paper container
              [`& .MuiDrawer-paper`]: {
                width: drawerWidth,
                boxSizing: 'border-box',
                // CRITICAL: Reset internal position for content flow
                position: 'relative',     // <<< ALLOWS NORMAL CONTENT SCROLL
                top: 0,                   // Reset any accidental top offset
                left: 0,                  // Reset any accidental left offset
                height: '100%',           // Fill the fixed container height
                borderRight: `1px solid ${theme.palette.divider}`,
                bgcolor: 'var(--color-bg-card)',
                color: 'var(--color-text-primary)',
                ...scrollbarStyles, // Apply scrollbar styles to paper
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