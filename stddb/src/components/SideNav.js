// src/components/SideNav.js
import React, { useState, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components & Icons
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse'; // <-- Import Collapse
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
import ExpandLess from '@mui/icons-material/ExpandLess'; // <-- Icon for dropdown open
import ExpandMore from '@mui/icons-material/ExpandMore'; // <-- Icon for dropdown closed
import FolderOpenIcon from '@mui/icons-material/FolderOpenOutlined'; // <-- Example Icon for parent item

// --- Constants ---
const sidebarContentWidth = 'var(--sidebar-left-width, 250px)';
const permanentDrawerCalculatedWidth = `calc(${sidebarContentWidth} + var(--layout-gap, 20px))`;

// --- Helper Function ---
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '';
};

// --- Navigation Items (Restructured for Dropdown) ---
// Define keys for collapsible items
const MENU_KEYS = {
    MANAGEMENT: 'management',
    // Add other keys here if you create more dropdowns
};

const navItems = [
  { label: 'Dashboard', link: '/', icon: <DashboardIcon /> },
  {
    label: 'Management',
    key: MENU_KEYS.MANAGEMENT, // Unique key for state management
    icon: <FolderOpenIcon />,  // Icon for the parent item
    subItems: [
      { label: 'Students', link: '/students', icon: <SchoolIcon /> },
      { label: 'Courses', link: '/courses', icon: <BookIcon /> },
      { label: 'Groups', link: '/groups', icon: <GroupIcon /> },
    ]
  },
  { label: 'Saved Items', link: '/saved', icon: <BookmarkIcon /> },
];

// User-specific items (Profile link removed as Avatar links there)
const userNavItems = [
  { label: 'Settings', link: '/settings', icon: <SettingsIcon /> },
];


// --- Component ---
const SideNav = ({ isOpen, onClose }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { contextUserData, logout } = useAuth();
  const basicInfo = contextUserData?.basicInfo;

  // State to manage open/closed status of dropdown menus
  const [openMenus, setOpenMenus] = useState({}); // Stores { menuKey: boolean }

  const handleLogout = async () => {
    onClose(); // Close drawer on mobile first
    try {
      if (typeof logout === 'function') { await logout(); }
      else { console.warn("AuthContext does not provide a logout function."); }
    } catch (error) { console.error("Logout failed:", error); }
  };

  // Toggle function for dropdown menus
  const handleMenuClick = (key) => {
    setOpenMenus(prevOpenMenus => ({
      ...prevOpenMenus,
      [key]: !prevOpenMenus[key]
    }));
  };

  const userInitials = useCallback(() => getInitials(basicInfo?.fullName), [basicInfo?.fullName]);

  // --- Reusable scrollbar styles ---
  const scrollbarStyles = {
     '--_scrollbar-thumb-color': 'rgba(0, 0, 0, 0.2)',
     '--_scrollbar-thumb-hover-color': 'rgba(0, 0, 0, 0.4)',
     '@media (prefers-color-scheme: dark)': {
       '--_scrollbar-thumb-color': 'rgba(255, 255, 255, 0.2)',
       '--_scrollbar-thumb-hover-color': 'rgba(255, 255, 255, 0.4)',
     },
     overflowY: 'auto',
     scrollbarWidth: 'thin',
     scrollbarColor: 'var(--_scrollbar-thumb-color) transparent',
     '&::-webkit-scrollbar': { width: '6px', height: '6px' },
     '&::-webkit-scrollbar-track': { background: 'transparent' },
     '&::-webkit-scrollbar-thumb': {
         backgroundColor: 'var(--_scrollbar-thumb-color)',
         borderRadius: '3px',
         '&:hover': { backgroundColor: 'var(--_scrollbar-thumb-hover-color)'}
     },
  };

   // --- Reusable ListItemButton Styles ---
   // Define common styles to avoid repetition
   const listItemButtonStyles = {
        py: 0.75,
        px: 2.5,
        mb: 0.5,
        borderRadius: 'var(--border-radius-sm)',
        mx: 1.5,
        color: 'var(--color-text-secondary)',
        '& .MuiListItemIcon-root': {
            minWidth: 'auto',
            marginRight: 1.5,
            color: 'var(--color-icon)'
        },
        '& .MuiListItemText-primary': {
            fontSize: '0.9rem',
            fontWeight: 500
        },
        '&:hover': {
            backgroundColor: 'var(--color-bg-hover)',
            color: 'var(--color-text-primary)',
            '& .MuiListItemIcon-root': { color: theme.palette.primary.main }
        },
        '&.active': { // Styles for active NavLink
            backgroundColor: 'var(--color-bg-active)',
            color: 'var(--color-text-primary)',
            fontWeight: 600,
            '& .MuiListItemIcon-root': { color: theme.palette.primary.main },
            '& .MuiListItemText-primary': { fontWeight: 600 }
        },
   };

   // Styles for nested items
   const nestedListItemButtonStyles = {
        ...listItemButtonStyles, // Inherit base styles
        pl: 4, // Indentation for nested items
        py: 0.6, // Slightly less padding vertically if desired
        '& .MuiListItemText-primary': {
            fontSize: '0.85rem', // Slightly smaller font for sub-items
        },
        // Adjust active/hover if needed for nested items
   };

  // --- Drawer Content ---
  const DrawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>

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
        {navItems.map((item) => (
          <React.Fragment key={item.label}>
            {item.subItems ? (
              // --- Render Collapsible Item ---
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => handleMenuClick(item.key)} sx={listItemButtonStyles}>
                    <ListItemIcon>{item.icon}</ListItemIcon>
                    <ListItemText primary={item.label} />
                    {/* Show Expand/Collapse Icon */}
                    {openMenus[item.key] ? <ExpandLess /> : <ExpandMore />}
                  </ListItemButton>
                </ListItem>
                <Collapse in={openMenus[item.key]} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.subItems.map((subItem) => (
                      <ListItem key={subItem.label} disablePadding>
                        <ListItemButton
                          component={NavLink}
                          to={subItem.link}
                          onClick={isMobile ? onClose : undefined}
                          sx={nestedListItemButtonStyles} // Apply nested styles
                          end // Use end prop for exact matching if needed
                        >
                          <ListItemIcon sx={{ pl: 1.5 }}> {/* Optional: extra padding for icon */}
                            {subItem.icon}
                          </ListItemIcon>
                          <ListItemText primary={subItem.label} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Collapse>
              </>
            ) : (
              // --- Render Regular Item ---
              <ListItem key={item.label} disablePadding>
                <ListItemButton
                  component={NavLink}
                  to={item.link}
                  end={item.link === '/'} // Exact match for Dashboard ('/')
                  onClick={isMobile ? onClose : undefined}
                  sx={listItemButtonStyles}
                >
                  <ListItemIcon>{item.icon}</ListItemIcon>
                  <ListItemText primary={item.label} />
                </ListItemButton>
              </ListItem>
            )}
          </React.Fragment>
        ))}
      </List>

      {/* --- Divider --- */}
      <Divider sx={{ mx: 2, my: 1 }} />

      {/* --- User Actions / Settings List (Bottom) --- */}
      <List sx={{ py: 1, pb: 2 }}>
        {userNavItems.map((item) => (
           <ListItem key={item.label} disablePadding>
            <ListItemButton
              component={NavLink}
              to={item.link}
              onClick={isMobile ? onClose : undefined}
              sx={listItemButtonStyles} // Use common styles
            >
                <ListItemIcon>{item.icon}</ListItemIcon>
                <ListItemText primary={item.label} />
            </ListItemButton>
           </ListItem>
        ))}
        {/* Logout Button */}
        <ListItem disablePadding>
           <ListItemButton
              onClick={handleLogout}
              // Apply base styles and specific hover for logout
              sx={{
                ...listItemButtonStyles,
                '&:hover': {
                    backgroundColor: 'var(--color-bg-hover)',
                    color: theme.palette.error.main, // Use error color on hover
                    '& .MuiListItemIcon-root': { color: theme.palette.error.main }
                 }
              }}
            >
                <ListItemIcon><LogoutIcon /></ListItemIcon>
                <ListItemText primary="Sign Out" />
           </ListItemButton>
        </ListItem>
      </List>

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
        width: isMobile ? sidebarContentWidth : permanentDrawerCalculatedWidth,
        flexShrink: 0,
        ...(isMobile
          ? { // MOBILE (temporary)
              zIndex: theme.zIndex.drawer + 2,
              [`& .MuiDrawer-paper`]: {
                width: sidebarContentWidth,
                boxSizing: 'border-box',
                bgcolor: 'var(--color-bg-sidenav)',
                color: 'var(--color-text-primary)',
                ...scrollbarStyles,
              },
            }
          : { // DESKTOP (permanent)
              position: 'fixed',
              left: 0,
              top: 'var(--header-height)',
              height: 'calc(100vh - var(--header-height))',
              zIndex: theme.zIndex.appBar - 1,
              [`& .MuiDrawer-paper`]: {
                width: permanentDrawerCalculatedWidth,
                boxSizing: 'border-box',
                position: 'relative',
                top: 0, left: 0,
                height: '100%',
                borderRight: 'none',
                bgcolor: 'var(--color-bg-header)', // Using header background as before
                color: 'var(--color-text-primary)',
                ...scrollbarStyles,
                // Apply scrollbar styles directly to the paper for permanent drawer
              },
            }),
      }}
      aria-label="Main navigation sidebar"
    >
      {/* Apply scrollbar styles to the content wrapper for temporary drawer */}
      {isMobile ? (
         <Box sx={{height: '100%', ...scrollbarStyles}}>
             {DrawerContent}
         </Box>
       ) : (
         DrawerContent // Scrollbar styles applied to Drawer Paper for permanent
       )
      }
    </Drawer>
  );
};

export default SideNav;