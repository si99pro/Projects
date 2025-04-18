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
import Drawer from '@mui/material/Drawer';
import Toolbar from '@mui/material/Toolbar';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';

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
const SideNav = ({ isMobile, isCollapsed, isOpen, onClose }) => {

    const renderNavList = (
        // Added className for easier CSS targeting if needed
        <Box className="side-nav-scroll-container" sx={{ overflowY: 'auto', height: '100%', pt: 1 }}>
             {isMobile && <Toolbar />}
            <List component="nav" sx={{ p: 0 }}>
                {mainNavItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        component={NavLink}
                        to={item.path}
                        end={item.path === '/'}
                    >
                        {/* Icon styling adjusted via CSS based on collapsed state */}
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        {/* Text is always rendered, CSS handles opacity/hiding */}
                        <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                                variant: 'body2',
                                // Apply transition here as well, though CSS is primary
                                sx: { transition: 'opacity var(--transition-speed) var(--transition-timing)' }
                            }}
                        />
                    </ListItemButton>
                ))}

                <Divider sx={{
                    my: 1,
                    mx: isCollapsed ? 1 : 2, // Adjust margin based on collapse
                    borderColor: 'var(--color-border-strong)',
                    transition: 'margin var(--transition-speed) var(--transition-timing)' // Smooth margin change
                    }}
                />

                {secondaryNavItems.map((item) => (
                    <ListItemButton
                        key={item.text}
                        component={NavLink}
                        to={item.path}
                        end
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        {/* Text is always rendered, CSS handles opacity/hiding */}
                        <ListItemText
                            primary={item.text}
                             primaryTypographyProps={{
                                variant: 'body2',
                                sx: { transition: 'opacity var(--transition-speed) var(--transition-timing)' }
                            }}
                        />
                    </ListItemButton>
                ))}
            </List>
        </Box>
    );

    if (isMobile) {
        return (
            <Drawer
                variant="temporary"
                open={isOpen}
                onClose={onClose}
                ModalProps={{ keepMounted: true }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    zIndex: 'var(--z-drawer)', // Ensure drawer is above other elements if needed
                    '& .MuiDrawer-paper': {
                        boxSizing: 'border-box',
                        width: 'var(--sidebar-width-expanded)',
                        bgcolor: 'var(--color-offset)',
                        borderRight: 'none',
                    },
                }}
            >
                {renderNavList}
            </Drawer>
        );
    } else {
        // Desktop/Tablet: Content is rendered directly inside the wrapper from Layout.js
        return renderNavList;
    }
};

export default SideNav;