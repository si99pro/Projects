/* eslint-disable no-unused-vars */
// src/components/SideNav.js
import React from 'react';
import { NavLink } from 'react-router-dom';

// MUI Components & Icons
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
// Removed Drawer import - Layout handles it now
// Removed Toolbar import - Padding handled by Drawer style
import Divider from '@mui/material/Divider';
// Removed Typography import if not used elsewhere

// --- Import Your Icons ---
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import ChatIcon from '@mui/icons-material/ChatBubbleOutline';
import StreamIcon from '@mui/icons-material/GraphicEq';
import VideoIcon from '@mui/icons-material/VideocamOutlined';
import AppsIcon from '@mui/icons-material/AppsOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import HelpIcon from '@mui/icons-material/HelpOutlineOutlined';

// --- Navigation Items Configuration ---
const mainNavItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Chat', icon: <ChatIcon />, path: '/chat' },
    { text: 'Stream', icon: <StreamIcon />, path: '/stream' },
    { text: 'Video Gen', icon: <VideoIcon />, path: '/video-gen' },
    { text: 'Starter Apps', icon: <AppsIcon />, path: '/apps' },
];

const secondaryNavItems = [
    { text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { text: 'Help', icon: <HelpIcon />, path: '/help' },
];

// --- Component ---
// Removed isOpen, onClose props. Added onNavItemClick.
const SideNav = ({ isMobile, isCollapsed, onNavItemClick }) => {

    // Function to handle item click - closes drawer only on mobile
    const handleItemClick = () => {
        if (isMobile && typeof onNavItemClick === 'function') {
            onNavItemClick();
        }
        // Navigation happens via the NavLink component automatically
    };

    // This component now *only* renders the content list.
    // Layout.js places this inside a Drawer (mobile) or <aside> (desktop).
    return (
        // Use the className for CSS targeting. CSS handles visual differences.
        <Box className="side-nav-scroll-container" sx={{ overflowY: 'auto', height: '100%', pt: 1 }}>
             {/* Removed conditional Toolbar - Drawer styling in Layout.js handles top padding */}
            <List component="nav" sx={{ p: 0 }}>
                {mainNavItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        component={NavLink}
                        to={item.path}
                        end={item.path === '/'} // Use end prop for exact match on root path
                        onClick={handleItemClick} // Add click handler
                        // The className 'active' will be added automatically by NavLink
                        // Your existing CSS targets .active correctly
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ variant: 'body2' }}
                            // CSS handles the visual hiding/showing based on parent state
                        />
                    </ListItemButton>
                ))}

                <Divider sx={{
                    my: 1,
                     // Adjust margin based on collapse state (implicitly works for mobile too, as isCollapsed=false)
                    mx: isCollapsed ? 1 : 'var(--sidebar-horizontal-padding)', // Use variable
                    borderColor: 'var(--color-border-strong)',
                    transition: 'margin var(--transition-speed) var(--transition-timing)'
                    }}
                />

                {secondaryNavItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        component={NavLink}
                        to={item.path}
                        end // Use end for potentially exact matches if needed
                        onClick={handleItemClick} // Add click handler
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{ variant: 'body2' }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );
};

export default SideNav;