/* eslint-disable no-unused-vars */
// src/components/SideNav.js
import React, { useState, useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

// MUI Components & Icons
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import { useTheme, alpha } from '@mui/material/styles';

// --- Import Icons (Keep as is) ---
import DashboardIcon from '@mui/icons-material/DashboardOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import ListAltIcon from '@mui/icons-material/ListAltOutlined';
import CalendarTodayIcon from '@mui/icons-material/CalendarTodayOutlined';
import AssignmentIcon from '@mui/icons-material/AssignmentOutlined';
import FolderIcon from '@mui/icons-material/FolderOutlined';
import AssessmentIcon from '@mui/icons-material/AssessmentOutlined';
import GroupsIcon from '@mui/icons-material/GroupsOutlined';
import ForumIcon from '@mui/icons-material/ForumOutlined';
import ConnectWithoutContactIcon from '@mui/icons-material/ConnectWithoutContactOutlined';
import CampaignIcon from '@mui/icons-material/CampaignOutlined';
import EventIcon from '@mui/icons-material/EventOutlined';
import LocalLibraryIcon from '@mui/icons-material/LocalLibraryOutlined';
import AccountCircleIcon from '@mui/icons-material/AccountCircleOutlined';
import SettingsIcon from '@mui/icons-material/SettingsOutlined';
import SupportAgentIcon from '@mui/icons-material/SupportAgentOutlined';
import LogoutIcon from '@mui/icons-material/LogoutOutlined';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';

// --- Navigation Items Configuration (Keep as is) ---
const mainNavItems = [
    { id: 'dashboard', text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    {
        id: 'academic',
        text: 'Academic',
        icon: <SchoolIcon />,
        subItems: [
            { id: 'acad-overview', text: 'Overview', icon: <ListAltIcon />, path: '/academic/overview' },
            { id: 'acad-schedule', text: 'Class Schedule', icon: <CalendarTodayIcon />, path: '/academic/schedule' },
            { id: 'acad-assignments', text: 'Exams & Assignment', icon: <AssignmentIcon />, path: '/academic/assignments' },
            { id: 'acad-material', text: 'Study Material', icon: <FolderIcon />, path: '/academic/materials' },
            { id: 'acad-results', text: 'Results', icon: <AssessmentIcon />, path: '/academic/results' },
        ]
    },
    {
        id: 'community',
        text: 'Community',
        icon: <GroupsIcon />,
        subItems: [
            { id: 'comm-forums', text: 'Forums', icon: <ForumIcon />, path: '/community/forums' },
            { id: 'comm-alumni', text: 'Alumni Network', icon: <ConnectWithoutContactIcon />, path: '/community/alumni' },
        ]
    },
    { id: 'notices', text: 'Notices', icon: <CampaignIcon />, path: '/notices' },
    { id: 'calendar', text: 'Calendar', icon: <EventIcon />, path: '/calendar' },
    { id: 'library', text: 'Library', icon: <LocalLibraryIcon />, path: '/library' },
];

const bottomNavItems = [
    { id: 'profile', text: 'Profile', icon: <AccountCircleIcon />, path: '/profile' },
    { id: 'settings', text: 'Settings', icon: <SettingsIcon />, path: '/settings' },
    { id: 'support', text: 'Support', icon: <SupportAgentIcon />, path: '/support' },
    { id: 'logout', text: 'Logout', icon: <LogoutIcon />, path: '/logout' },
];


// --- Component ---
const SideNav = ({ isMobile, isCollapsed, onNavItemClick }) => {
    const location = useLocation();
    const theme = useTheme();
    const [openDropdowns, setOpenDropdowns] = useState({});

    // Style constants
    const itemBorderRadius = theme.shape.borderRadius * 2;
    const horizontalPadding = 1.5; // Base horizontal padding/margin value (theme.spacing unit)
    const iconWrapperSize = 32; // Reduced icon wrapper size slightly if needed
    const collapsedIconBorderRadius = theme.shape.borderRadius * 1.5;

    // Custom colors
    const colorNavItemHover = '#ebeef9';
    const colorNavItemActive = '#ebeef9';

    // Memoize active sub-item check for performance
    const isSubItemActive = useMemo(() => (subItems) => {
        return subItems?.some(sub => location.pathname.startsWith(sub.path));
    }, [location.pathname]);


    const handleItemClick = (isDropdownToggle = false) => {
        if (isMobile && !isDropdownToggle && typeof onNavItemClick === 'function') {
            onNavItemClick();
        }
    };

    const handleDropdownToggle = (id) => {
        setOpenDropdowns(prev => ({ ...prev, [id]: !prev[id] }));
        handleItemClick(true);
    };

    // --- Scrollbar Styling ---
    const scrollbarStyles = {
        // (Keep scrollbar styles as they are)
        '&::-webkit-scrollbar': { width: '6px', height: '6px' },
        '&::-webkit-scrollbar-track': { background: 'transparent', borderRadius: '3px' },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400],
            borderRadius: '3px',
            border: `1px solid ${theme.palette.mode === 'dark' ? theme.palette.grey[800] : theme.palette.grey[300]}`, // Optional subtle border
        },
        '&::-webkit-scrollbar-thumb:hover': {
            backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[500],
        },
        scrollbarWidth: 'thin',
        scrollbarColor: `${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400]} transparent`,
    };
    // --- End Scrollbar Styling ---


    const renderNavList = (items, isBottomList = false) => {
        return items.map((item) => {
            const isDropdown = !!item.subItems;
            const isOpen = openDropdowns[item.id] || false;

            let isActive;
            if (isDropdown) {
                isActive = isSubItemActive(item.subItems);
            } else {
                isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path + '/')) || (item.path === '/' && location.pathname === '/');
            }

            // Common styles for List Item Button
            const baseListItemButtonStyles = {
                borderRadius: itemBorderRadius,
                mx: horizontalPadding,
                // *** MODIFIED: Reduced vertical margin for smaller gap ***
                my: 0.2,
                // *** MODIFIED: Reduced vertical and horizontal padding for smaller button size ***
                py: 0.5, // Reduced vertical padding
                px: 1,   // Reduced horizontal padding
                justifyContent: 'flex-start',
                transition: theme.transitions.create(['background-color', 'opacity'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.short,
                }),
                backgroundColor: 'transparent',
                '&:hover': {
                    backgroundColor: isCollapsed ? 'transparent' : colorNavItemHover,
                },
            };

             // Common styles for List Item Icon
            const baseListItemIconStyles = {
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                // *** MODIFIED: Match iconWrapperSize constant ***
                width: iconWrapperSize,
                height: iconWrapperSize,
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
                transition: theme.transitions.create(['background-color', 'color', 'border-radius'], {
                    easing: theme.transitions.easing.sharp,
                    duration: theme.transitions.duration.short,
                }),
                borderRadius: 0,
                backgroundColor: 'transparent',
                mr: 0, // Keep margin right 0, spacing handled by text margin
            };

            // --- Render Logic ---
            if (isDropdown) {
                 return (
                    <React.Fragment key={item.id}>
                        <ListItemButton
                            onClick={() => handleDropdownToggle(item.id)}
                            title={isCollapsed ? item.text : ''}
                            sx={{
                                ...baseListItemButtonStyles,
                                ...(isActive && !isCollapsed && {
                                    backgroundColor: colorNavItemActive,
                                }),
                                '&:hover .MuiListItemIcon-root': {
                                    ...(isCollapsed && !isActive && {
                                        backgroundColor: alpha(theme.palette.action.active, 0.08),
                                        borderRadius: collapsedIconBorderRadius,
                                        color: theme.palette.primary.main,
                                    })
                                },
                                '&:hover': {
                                    backgroundColor: isCollapsed ? 'transparent' : colorNavItemHover,
                                },
                            }}
                        >
                            <ListItemIcon sx={{
                                ...baseListItemIconStyles,
                                ...(isActive && isCollapsed && {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: collapsedIconBorderRadius,
                                    color: theme.palette.primary.main,
                                }),
                            }}>
                                {item.icon}
                            </ListItemIcon>
                            <ListItemText
                                primary={item.text}
                                primaryTypographyProps={{
                                    variant: 'body2',
                                    fontWeight: isActive && !isCollapsed ? 'fontWeightMedium' : 'normal',
                                    color: isActive && !isCollapsed ? 'text.primary' : 'text.secondary',
                                }}
                                sx={{
                                    opacity: isCollapsed ? 0 : 1,
                                    transition: `opacity ${theme.transitions.duration.shorter}ms ease-in-out`,
                                    whiteSpace: 'nowrap',
                                    // *** MODIFIED: Adjust left margin if needed based on px change ***
                                    ml: 1.25, // Slightly reduced margin to compensate for reduced px
                                }}
                            />
                            {!isCollapsed && (isOpen ?
                                <ExpandLess sx={{ color: 'text.secondary', ml: 1 }} /> :
                                <ExpandMore sx={{ color: 'text.secondary', ml: 1 }} />
                            )}
                        </ListItemButton>
                        <Collapse in={isOpen && !isCollapsed} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{
                                ...( !isCollapsed && {
                                    // *** MODIFIED: Updated padding calculation based on changed px (1 instead of 1.2) ***
                                    pl: theme.spacing(horizontalPadding + 1 + (iconWrapperSize / 8) + 1.25), // theme.spacing(1) = 8px by default
                                    mx: 0,
                                    py: 0.2, // Reduced padding for sublist items consistency
                                } )
                            }}>
                                {/* Render sub-items recursively */}
                                {renderNavList(item.subItems, isBottomList)}
                            </List>
                        </Collapse>
                    </React.Fragment>
                );
            }

            // Render Regular Nav Item (NavLink)
            return (
                <ListItemButton
                    key={item.id}
                    component={NavLink}
                    to={item.path}
                    end={item.path === '/'}
                    onClick={() => handleItemClick(false)}
                    title={isCollapsed ? item.text : ''}
                    sx={{
                        ...baseListItemButtonStyles,
                        '&.active': {
                            backgroundColor: !isCollapsed ? colorNavItemActive : 'transparent',
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                                ...(isCollapsed && {
                                    backgroundColor: alpha(theme.palette.primary.main, 0.1),
                                    borderRadius: collapsedIconBorderRadius,
                                }),
                            },
                            '& .MuiListItemText-primary': {
                                color: !isCollapsed ? 'text.primary' : 'text.secondary',
                                fontWeight: 'fontWeightMedium',
                            },
                        },
                        '&:hover': {
                             backgroundColor: isCollapsed ? 'transparent' : colorNavItemHover,
                             '& .MuiListItemIcon-root': {
                                ...(isCollapsed && !isActive && {
                                    color: theme.palette.primary.main,
                                    backgroundColor: alpha(theme.palette.action.active, 0.08),
                                    borderRadius: collapsedIconBorderRadius,
                                })
                            },
                        },
                    }}
                >
                    <ListItemIcon sx={{ ...baseListItemIconStyles }}>
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{ variant: 'body2' }}
                        sx={{
                            opacity: isCollapsed ? 0 : 1,
                            transition: `opacity ${theme.transitions.duration.shorter}ms ease-in-out`,
                            whiteSpace: 'nowrap',
                            // *** MODIFIED: Adjust left margin if needed based on px change ***
                            ml: 1.25, // Slightly reduced margin to compensate for reduced px
                            color: 'text.secondary',
                        }}
                    />
                </ListItemButton>
            );
        });
    };


    return (
        <Box sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                overflow: 'hidden',
                bgcolor: '#F6F8FD'
             }}
        >
            {/* Scrollable area */}
            <Box sx={{
                flexGrow: 1,
                overflowY: 'auto',
                overflowX: 'hidden',
                // *** MODIFIED: Reduced top padding to raise the first icon ***
                pt: 0.5, // Adjust as needed, try 0.5 or even 0
                px: 0,
                ...scrollbarStyles,
             }}
            >
                <List component="nav" sx={{ p: 0 }}>
                    {renderNavList(mainNavItems)}
                </List>
            </Box>

            {/* Divider */}
            <Divider sx={{
                my: 1,
                mx: horizontalPadding,
                borderColor: 'divider',
                transition: `margin ${theme.transitions.duration.short}ms ${theme.transitions.easing.sharp}`
                }}
            />

            {/* Bottom fixed area */}
            <Box sx={{ flexShrink: 0 }}>
                {/* *** MODIFIED: Reduced bottom padding on list container *** */}
                <List component="nav" sx={{ p: 0, pb: 0.5 }}>
                    {renderNavList(bottomNavItems, true)}
                </List>
            </Box>
        </Box>
    );
};

export default SideNav;