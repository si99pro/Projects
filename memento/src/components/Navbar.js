/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Navbar.js - REDESIGNED

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, IconButton,
    Box, Tooltip, Stack, List, ListItem, ListItemText, ListItemButton, ListItemIcon,
    Divider, Badge, styled, Drawer, useTheme, useMediaQuery, alpha,
    Collapse, CircularProgress, Popover, InputBase, BottomNavigation, BottomNavigationAction
} from '@mui/material';

// --- Icons ---
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined'; // Use outlined versions for cleaner look
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import FolderOutlinedIcon from '@mui/icons-material/FolderOutlined';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import PeopleOutlineOutlinedIcon from '@mui/icons-material/PeopleOutlineOutlined';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import PublicOutlinedIcon from '@mui/icons-material/PublicOutlined'; // Changed from specific icon
import LockOutlinedIcon from '@mui/icons-material/LockOutlined'; // Changed from specific icon
import ReadMoreOutlinedIcon from '@mui/icons-material/ReadMoreOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import SearchIcon from '@mui/icons-material/Search';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import ClearIcon from '@mui/icons-material/Clear';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import SendTimeExtensionIcon from '@mui/icons-material/SendTimeExtension'; // Placeholder
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; // Simple indicator for profile link
import LaunchIcon from '@mui/icons-material/Launch'; // Logo Icon (Example)


import {
    collection, query, orderBy, onSnapshot, doc, writeBatch,
    serverTimestamp, getDoc, setDoc, limit, where, getDocs
} from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// --- Constants ---
const SIDEBAR_WIDTH_DESKTOP = 260;
const SIDEBAR_WIDTH_MOBILE = 280;
const APP_BAR_HEIGHT = 64;
const MOBILE_BOTTOM_NAV_HEIGHT = 56;
const POPOVER_WIDTH = 360; // Standard width for Notifications & Messages
const SEARCH_POPOVER_WIDTH = 320;
const NOTIFICATION_LIMIT = 7;
const MESSAGE_LIMIT = 5;
const SEARCH_RESULTS_LIMIT = 5;
const SEARCH_DEBOUNCE_MS = 350; // Slightly longer debounce

// --- Styled Components (Redesigned) ---

// ** Root Container **
const StyledRoot = styled(Box)({
    display: 'flex',
    minHeight: '100vh', // Ensure layout takes full height
    backgroundColor: (theme) => theme.palette.background.default, // Use default background for the page
});

// ** Top AppBar ** (Now full width)
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.background.paper, 0.95), // Slightly transparent paper bg
    backdropFilter: 'blur(6px)', // Frosted glass effect
    color: theme.palette.text.primary,
    boxShadow: 'none', // Remove default shadow
    borderBottom: `1px solid ${theme.palette.divider}`, // Clean border
    zIndex: theme.zIndex.drawer + 1, // Stay above sidebar
}));

// ** Sidebar Drawer **
const StyledDrawer = styled(Drawer)(({ theme }) => ({
    '& .MuiDrawer-paper': {
        boxSizing: 'border-box',
        backgroundColor: theme.palette.background.paper,
        borderRight: `1px solid ${theme.palette.divider}`,
        boxShadow: 'none',
        // Desktop styles (Permanent)
        [theme.breakpoints.up('md')]: {
            width: SIDEBAR_WIDTH_DESKTOP,
            flexShrink: 0,
        },
        // Mobile styles (Temporary)
        [theme.breakpoints.down('md')]: {
            width: SIDEBAR_WIDTH_MOBILE,
        },
    }
}));

// ** Logo Area in Sidebar **
const LogoBox = styled(Box)(({ theme }) => ({
    minHeight: APP_BAR_HEIGHT,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0, 2.5), // More horizontal padding
    cursor: 'pointer',
    borderBottom: `1px dashed ${theme.palette.divider}`, // Softer divider
}));

// ** Sidebar Navigation List **
const NavList = styled(List)(({ theme }) => ({
    padding: theme.spacing(1.5, 1), // Padding around the list items
}));

// ** Sidebar Navigation Item Button **
const NavItemButton = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'active',
})(({ theme, active }) => ({
    margin: theme.spacing(0.5, 0), // Vertical margin between items
    padding: theme.spacing(1, 1.5),
    borderRadius: theme.shape.borderRadius * 1.5,
    minHeight: 46,
    color: active ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    transition: 'background-color 0.2s ease, color 0.2s ease',

    '&:hover': {
        backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.04),
        color: active ? theme.palette.primary.dark : theme.palette.text.primary,
    },
}));

// ** Sidebar Navigation Item Icon **
const NavItemIcon = styled(ListItemIcon)(({ theme, active }) => ({
    minWidth: 'auto',
    marginRight: theme.spacing(2),
    color: 'inherit', // Inherits color from NavItemButton
    fontSize: '1.3rem', // Consistent icon size
}));

// ** Sidebar Navigation Item Text **
const NavItemText = styled(ListItemText)(({ theme, active }) => ({
    '& .MuiListItemText-primary': {
        fontSize: '0.9rem',
        fontWeight: active ? 600 : 400,
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    }
}));

// ** Sidebar User Footer **
const UserFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(2, 1.5), // Consistent padding
    borderTop: `1px dashed ${theme.palette.divider}`, // Softer divider
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper,
    zIndex: 1,
}));

// ** AppBar Search **
const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: theme.shape.borderRadius * 5, // More rounded search bar
    backgroundColor: theme.palette.background.default, // Use page background for contrast
    border: `1px solid ${theme.palette.divider}`,
    '&:hover': {
        borderColor: theme.palette.text.secondary,
    },
    marginRight: theme.spacing(1),
    marginLeft: 'auto', // Push search towards the right, before icons
    width: '100%',
    maxWidth: 320, // Limit max width
    height: 40,
    display: 'flex',
    alignItems: 'center',
    transition: theme.transitions.create(['border-color', 'max-width']),
    [theme.breakpoints.down('sm')]: {
        marginLeft: theme.spacing(1),
        maxWidth: '100%', // Allow full width on mobile
        flexGrow: 1, // Take available space
    },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({ /* Same as before */
    padding: theme.spacing(0, 1.5), height: '100%', position: 'absolute', pointerEvents: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: theme.palette.text.secondary,
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({ /* Same as before */
    color: 'inherit', width: '100%', height: '100%', '& .MuiInputBase-input': { padding: theme.spacing(1, 1, 1, 0), paddingLeft: `calc(1em + ${theme.spacing(3)})`, paddingRight: theme.spacing(4), transition: theme.transitions.create('width'), width: '100%', fontSize: '0.9rem', },
}));

// ** Common Popover Paper Style **
const StyledPopoverPaper = styled(Box)(({ theme }) => ({
    marginTop: theme.spacing(1),
    boxShadow: theme.shadows[6],
    borderRadius: theme.shape.borderRadius * 2, // Consistent rounded corners
    border: `1px solid ${theme.palette.divider}`,
    backgroundColor: theme.palette.background.paper,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden', // Let inner content scroll
    maxWidth: '95vw',
}));

// ** Popover Header **
const PopoverHeader = styled(Box)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}));

// ** Popover Footer (for View All) **
const PopoverFooter = styled(Box)(({ theme }) => ({
    textAlign: 'center',
    padding: theme.spacing(0.5, 0), // Less vertical padding
    borderTop: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
}));

// ** Consistent List Item for Notifications/Messages **
const PopoverListItem = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'unread',
})(({ theme, unread }) => ({
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 2),
    transition: 'background-color 0.2s ease',
    backgroundColor: unread ? alpha(theme.palette.primary.light, 0.08) : 'transparent',
    '&:hover': {
        backgroundColor: alpha(theme.palette.action.hover, 0.06),
    },
    '& .MuiListItemIcon-root': {
        minWidth: 'auto',
        marginRight: theme.spacing(1.5),
        marginTop: theme.spacing(0.5), // Align avatar better with text
    },
    '& .MuiListItemText-primary': {
        fontWeight: unread ? 600 : 500,
        fontSize: '0.9rem',
        marginBottom: theme.spacing(0.25),
        color: theme.palette.text.primary,
    },
    '& .MuiListItemText-secondary': {
        fontSize: '0.8rem',
        color: theme.palette.text.secondary,
        lineHeight: 1.4,
        display: '-webkit-box', // Multi-line clamp for snippet
        '-webkit-line-clamp': '2',
        '-webkit-box-orient': 'vertical',
        overflow: 'hidden',
    },
    '& .item-meta': { // Class for timestamp/extra info
        fontSize: '0.75rem',
        color: theme.palette.text.disabled,
        marginTop: theme.spacing(0.5),
        textAlign: 'right',
    }
}));

// ** Bottom Navigation **
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({
    height: MOBILE_BOTTOM_NAV_HEIGHT,
    backgroundColor: theme.palette.background.paper,
    borderTop: `1px solid ${theme.palette.divider}`,
}));

const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({ /* ... */
    minWidth:'auto',padding:theme.spacing(.75,1,1),color:theme.palette.text.secondary,"& .MuiBottomNavigationAction-label":{fontSize:".7rem",marginTop:"2px",transition:"font-weight .2s ease-in-out, color .2s ease-in-out","&.Mui-selected":{fontWeight:500}},"& .MuiSvgIcon-root":{fontSize:"1.4rem",transition:"color .2s ease-in-out"},"&.Mui-selected":{color:theme.palette.primary.main}
}));

// --- Navigation Data ---
// Main items for the top section of the sidebar
const mainNavItems = [
    { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
    { label: 'Department', path: '/dept/overview', icon: <BusinessOutlinedIcon />, base: '/dept' }, // base path for active check
    { label: 'Batch', path: `/batch?year=${new Date().getFullYear()}`, icon: <CalendarMonthOutlinedIcon />, base: '/batch' },
];

// Secondary items for the lower section of the sidebar
const secondaryNavItems = [
    { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> },
    { label: 'Support', path: '/support', icon: <SupportAgentOutlinedIcon /> },
];

// Admin item, shown conditionally
const adminNavItem = { label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettingsOutlinedIcon /> };

// Mobile bottom navigation items
const mobileBottomNavItems = [
    { label: 'Dashboard', value: '/dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> },
    { label: 'Department', value: '/dept', path: '/dept/overview', icon: <BusinessOutlinedIcon /> },
    { label: 'Messages', value: '/messages', path: '/messages', icon: <MailOutlineIcon /> }, // Add Messages here? Or Search?
    // { label: 'Search', value: 'search', icon: <SearchIcon /> }, // Could trigger search modal
    { label: 'Profile', value: '/profile', path: '/profile', icon: <AccountCircleOutlinedIcon /> },
];

// Sub-items (optional, used if needed for collapse, but avoiding for cleaner design)
// const deptSubItems = [ { label: 'Overview', path: '/dept/overview' }, /* ... */ ];
// const batchYears = [ /* generated dynamically */ ];


// --- Main Component ---
function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, userName, isAdmin, userProfile } = useAuth();
    const userId = user?.uid;
    const searchInputRef = useRef(null);

    // --- State ---
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [messagesAnchorEl, setMessagesAnchorEl] = useState(null);
    const [searchAnchorEl, setSearchAnchorEl] = useState(null);

    // Data States
    const [notifications, setNotifications] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [senderInfo, setSenderInfo] = useState({}); // Cache for notification senders
    const [markingRead, setMarkingRead] = useState(false);

    const [messages, setMessages] = useState([]); // Placeholder - Fetch real data
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(3); // Placeholder
    const [loadingMessages, setLoadingMessages] = useState(false); // Placeholder

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const searchTimeoutRef = useRef(null);

    // --- Derived State ---
    const currentPath = location.pathname;
    const isProfileMenuOpen = Boolean(profileAnchorEl);
    const isNotificationPopoverOpen = Boolean(notificationAnchorEl);
    const isMessagesPopoverOpen = Boolean(messagesAnchorEl);
    const isSearchPopoverOpen = Boolean(searchAnchorEl) && (searchLoading || searchError || (searchQuery.trim().length >= 2)); // Simplified: Open if loading, error, or query exists

    // --- Handlers ---
    const handleDrawerToggle = useCallback(() => setMobileDrawerOpen(prev => !prev), []);
    const handleProfileMenuOpen = useCallback((event) => setProfileAnchorEl(event.currentTarget), []);
    const handleProfileMenuClose = useCallback(() => setProfileAnchorEl(null), []);
    const handleNotificationPopoverOpen = useCallback((event) => setNotificationAnchorEl(event.currentTarget), []);
    const handleNotificationPopoverClose = useCallback(() => setNotificationAnchorEl(null), []);
    const handleMessagesPopoverOpen = useCallback((event) => setMessagesAnchorEl(event.currentTarget), []);
    const handleMessagesPopoverClose = useCallback(() => setMessagesAnchorEl(null), []);

    // Central Navigation Handler
    const handleNavigate = useCallback((path) => {
        if (path && typeof path === 'string') {
            navigate(path);
        } else { console.warn('Navbar: handleNavigate invalid path:', path); return; }
        // Close everything on navigation
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        handleMessagesPopoverClose();
        setSearchAnchorEl(null); // Close search popover
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
        // Optional: Clear search query on navigation?
        // setSearchQuery('');
        // setSearchResults([]);
    }, [navigate, mobileDrawerOpen, handleProfileMenuClose, handleNotificationPopoverClose, handleMessagesPopoverClose]); // Add popover close handlers

    // Search Handlers
    const handleSearchChange = useCallback((event) => setSearchQuery(event.target.value), []);
    const handleClearSearch = useCallback(() => { setSearchQuery(''); setSearchResults([]); setSearchError(null); setSearchLoading(false); searchInputRef.current?.focus(); }, []);
    const handleSearchFocus = useCallback((event) => setSearchAnchorEl(event.currentTarget.parentElement), []); // Anchor to Search div
    const handleSearchBlur = useCallback((event) => {
        setTimeout(() => { if (!event.relatedTarget?.closest('#search-results-popover')) setSearchAnchorEl(null); }, 150);
    }, []);
    const handleSearchResultClick = useCallback((resultUserId) => {
        setSearchAnchorEl(null);
        setSearchQuery('');
        setSearchResults([]);
        navigate(`/profile/${resultUserId}`);
    }, [navigate]);

    // Logout Handler
    const handleLogout = useCallback(async () => {
        handleProfileMenuClose(); handleNotificationPopoverClose(); handleMessagesPopoverClose(); setSearchAnchorEl(null);
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
        try { await auth.signOut(); handleNavigate('/login'); } // Redirect to login after logout
        catch (error) { console.error('Navbar: Logout Error:', error); }
    }, [mobileDrawerOpen, handleNavigate, handleProfileMenuClose, handleNotificationPopoverClose, handleMessagesPopoverClose]); // Use handleNavigate

    // Notification Actions (Simplified, keeping core logic)
    const markNotificationAsRead = useCallback(async (notificationId) => { if (!userId || !notificationId) return; const nRef = doc(db, 'users', userId, 'notifications', notificationId); try { await setDoc(nRef, { read: true, readTimestamp: serverTimestamp() }, { merge: true }); } catch (e) { console.error("Error marking notification read:", e); } }, [userId]);
    const handleNotificationItemClick = useCallback((notification) => { handleNotificationPopoverClose(); if (notification?.id) { if (!notification.read) { markNotificationAsRead(notification.id); } navigate(`/notifications#${notification.id}`); } else { navigate('/notifications'); } }, [handleNotificationPopoverClose, markNotificationAsRead, navigate]);
    const handleMarkAllNotificationsRead = useCallback(async () => { if (!userId || markingRead || totalUnreadCount === 0) return; setMarkingRead(true); const ref = collection(db, 'users', userId, 'notifications'); const q = query(ref, where('read', '==', false)); try { const snap = await getDocs(q); if (snap.empty) { setMarkingRead(false); return; } const batch = writeBatch(db); const now = serverTimestamp(); snap.docs.forEach((d) => batch.set(d.ref, { read: true, readTimestamp: now }, { merge: true })); await batch.commit(); } catch (e) { console.error("Error mark all notifications read:", e); } finally { setTimeout(() => setMarkingRead(false), 300); } }, [userId, markingRead, totalUnreadCount]);
    // Message Actions (Placeholders - implement similarly)
    const handleMessageItemClick = useCallback((messageId) => { handleMessagesPopoverClose(); navigate(`/messages/${messageId}`); }, [navigate, handleMessagesPopoverClose]);
    const handleMarkAllMessagesRead = useCallback(async () => { console.log("TODO: Implement mark all messages read"); }, []);
    const handleViewAllMessagesClick = useCallback(() => handleNavigate('/messages'), [handleNavigate]);

    // --- Effects ---

    // Fetch Notifications Effect (Using fixed logic from previous step)
    useEffect(() => {
        if (!userId) { setNotifications([]); setTotalUnreadCount(0); setLoadingNotifications(true); return; }
        setLoadingNotifications(true); let isMounted = true;
        const collRef = collection(db, 'users', userId, 'notifications');
        const q = query(collRef, orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT));
        const unsub = onSnapshot(q, (snap) => {
            if (!isMounted) return;
            setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
             if (loadingNotifications) setLoadingNotifications(false);
        }, (err) => { console.error("Notif listener error:", err); if(isMounted) setLoadingNotifications(false); });
        const countQ = query(collRef, where('read', '==', false));
        const unsubCount = onSnapshot(countQ, (snap) => { if (isMounted) setTotalUnreadCount(snap.size); }, (err) => console.error("Notif count error:", err));
        return () => { isMounted = false; unsub(); unsubCount(); };
    }, [userId]); // Keep loadingNotifications dependency removed to avoid potential loops

    // **TODO**: Add useEffect for fetching Messages here

    // Debounced Search Effect (Using fixed logic from previous step)
    useEffect(() => {
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
        const trimmedQuery = searchQuery.trim();
        if (trimmedQuery.length < 2) { setSearchResults([]); setSearchLoading(false); setSearchError(null); return; }
        setSearchLoading(true); setSearchError(null);
        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const usersRef = collection(db, 'users');
                const nameQ = query(usersRef, where('basicInfo.fullName', '>=', trimmedQuery), where('basicInfo.fullName', '<=', trimmedQuery + '\uf8ff'), limit(SEARCH_RESULTS_LIMIT));
                const idQ = query(usersRef, where('basicInfo.studentId', '==', trimmedQuery), limit(SEARCH_RESULTS_LIMIT));
                const [nameSnap, idSnap] = await Promise.all([getDocs(nameQ), getDocs(idQ)]);
                const resultsMap = new Map();
                nameSnap.docs.forEach(d => { if (d.id !== userId) resultsMap.set(d.id, { id: d.id, ...d.data() }); });
                idSnap.docs.forEach(d => { if (d.id !== userId) resultsMap.set(d.id, { id: d.id, ...d.data() }); });
                setSearchResults(Array.from(resultsMap.values()).slice(0, SEARCH_RESULTS_LIMIT));
                setSearchError(null);
            } catch (err) { console.error("Search error:", err); setSearchError("Failed to search."); setSearchResults([]); }
            finally { setSearchLoading(false); }
        }, SEARCH_DEBOUNCE_MS);
        return () => { if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current); };
    }, [searchQuery, userId]);


    // --- Active State Helper ---
    const isNavItemActive = useCallback((itemPath, itemBase) => {
        if (!itemPath) return false;
        const baseCheckPath = itemBase || itemPath.split('?')[0]; // Use base path or path before query params
        return currentPath === itemPath || (currentPath.startsWith(baseCheckPath) && baseCheckPath !== '/');
    }, [currentPath]);

    // --- Memoized Content ---

    // Drawer Content
    const drawerContent = useMemo(() => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <LogoBox onClick={() => handleNavigate('/dashboard')}>
                <LaunchIcon sx={{ color: 'primary.main', fontSize: '2rem' }} /> {/* Example Logo */}
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    MEmento
                </Typography>
            </LogoBox>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}>
                {/* Main Navigation */}
                <NavList>
                    {mainNavItems.map((item) => {
                        const active = isNavItemActive(item.path, item.base);
                        return (
                            <NavItemButton key={item.label} active={active} onClick={() => handleNavigate(item.path)}>
                                <NavItemIcon active={active}>{item.icon}</NavItemIcon>
                                <NavItemText primary={item.label} active={active} />
                            </NavItemButton>
                        );
                    })}
                </NavList>

                <Divider sx={{ my: 1.5, mx: 1, borderStyle: 'dashed' }} />

                {/* Secondary Navigation */}
                <NavList>
                    {secondaryNavItems.map((item) => {
                         const active = isNavItemActive(item.path, item.base);
                        return (
                             <NavItemButton key={item.label} active={active} onClick={() => handleNavigate(item.path)}>
                                <NavItemIcon active={active}>{item.icon}</NavItemIcon>
                                <NavItemText primary={item.label} active={active} />
                            </NavItemButton>
                        );
                    })}
                    {/* Conditional Admin Link */}
                    {isAdmin && (
                         <NavItemButton active={isNavItemActive(adminNavItem.path)} onClick={() => handleNavigate(adminNavItem.path)}>
                            <NavItemIcon active={isNavItemActive(adminNavItem.path)}>{adminNavItem.icon}</NavItemIcon>
                            <NavItemText primary={adminNavItem.label} active={isNavItemActive(adminNavItem.path)} />
                        </NavItemButton>
                    )}
                </NavList>
            </Box>

            {/* User Footer */}
            <UserFooter>
                <Avatar
                    sx={{ width: 40, height: 40 }}
                    alt={userName || ''}
                    src={userProfile?.basicInfo?.profileImageUrl || undefined}
                >
                     {!userProfile?.basicInfo?.profileImageUrl && userName ? userName.charAt(0).toUpperCase() : <AccountCircleOutlinedIcon />}
                </Avatar>
                <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
                    <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}>
                        {userName || 'User'}
                    </Typography>
                    <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                        {user?.email}
                    </Typography>
                </Box>
                <Tooltip title="Logout">
                     <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                         <LogoutOutlinedIcon fontSize="small"/>
                     </IconButton>
                </Tooltip>
            </UserFooter>
        </Box>
    ), [user, userName, userProfile, isAdmin, handleNavigate, handleLogout, isNavItemActive, currentPath]); // Include currentPath for active state


    // Notification Popover Content
    const notificationPopoverContent = useMemo(() => (
        <>
            <PopoverHeader>
                <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography>
                 {totalUnreadCount > 0 && (
                    <Button onClick={handleMarkAllNotificationsRead} color="primary" size="small" disabled={markingRead} startIcon={markingRead ? <CircularProgress size={14} color="inherit" /> : <MarkChatReadOutlinedIcon fontSize='small' />} sx={{ textTransform: 'none', fontWeight: 500, py: 0.25, px: 1, ml: 1 }} > Mark all read </Button>
                 )}
            </PopoverHeader>
            <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                 {loadingNotifications && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>}
                 {!loadingNotifications && notifications.length === 0 && (
                     <Box sx={{ p: 3, textAlign: 'center' }}>
                         <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                         <Typography variant="body2" color="text.secondary">No notifications yet.</Typography>
                     </Box>
                 )}
                 {!loadingNotifications && notifications.length > 0 && (
                    <List disablePadding>
                        {notifications.map((n) => (
                            <PopoverListItem key={n.id} unread={!n.read} onClick={() => handleNotificationItemClick(n)}>
                                {/* Add Avatar based on sender type/icon if desired */}
                                <ListItemText
                                    primary={n.title || 'Notification'}
                                    secondary={n.message || '...'}
                                    primaryTypographyProps={{ noWrap: true }}
                                    secondaryTypographyProps={{ // Apply class for multi-line clamp
                                         component: 'span',
                                         className: 'MuiListItemText-secondary', // Use existing class for styling consistency
                                    }}
                                />
                                 <Typography variant="caption" className="item-meta">
                                      {n.timestamp?.toDate() ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true }) : ''}
                                 </Typography>
                            </PopoverListItem>
                        ))}
                    </List>
                 )}
            </Box>
             {notifications.length >= NOTIFICATION_LIMIT && !loadingNotifications && (
                 <PopoverFooter>
                    <Button onClick={() => handleNavigate('/notifications')} size="small" fullWidth sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 500 }}>View All Notifications</Button>
                 </PopoverFooter>
             )}
        </>
    ), [loadingNotifications, notifications, totalUnreadCount, markingRead, handleNotificationItemClick, handleMarkAllNotificationsRead, handleNavigate]);


    // Message Popover Content (Placeholder data)
    const messagePopoverContent = useMemo(() => {
        const placeholderMessages = [ { id: 'm1', senderName: 'Alice', snippet: 'Hey, did you see the new assignment?', timestamp: new Date(Date.now() - 60000 * 5), read: false, senderImage: undefined }, { id: 'm2', senderName: 'Bob', snippet: 'Meeting at 3 PM confirmed.', timestamp: new Date(Date.now() - 60000 * 60 * 2), read: true, senderImage: undefined }, { id: 'm3', senderName: 'Charlie', snippet: 'Can you send me the notes? Lorem ipsum dolor sit amet consectetur adipisicing elit.', timestamp: new Date(Date.now() - 60000 * 60 * 24), read: false, senderImage: undefined }];
        const displayMessages = messages.length > 0 ? messages : placeholderMessages; // Use real data if fetched

        return (
            <>
                <PopoverHeader>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Messages</Typography>
                    {/* Optional: Mark all read button */}
                    {unreadMessagesCount > 0 && ( <Button onClick={handleMarkAllMessagesRead} color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 500 }}> Mark all read </Button> )}
                </PopoverHeader>
                <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                    {loadingMessages && <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box>}
                    {!loadingMessages && displayMessages.length === 0 && (
                        <Box sx={{ p: 3, textAlign: 'center' }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1 }} />
                            <Typography variant="body2" color="text.secondary">No messages yet.</Typography>
                        </Box>
                    )}
                    {!loadingMessages && displayMessages.length > 0 && (
                        <List disablePadding>
                            {displayMessages.map((m) => (
                                <PopoverListItem key={m.id} unread={!m.read} onClick={() => handleMessageItemClick(m.id)}>
                                     <ListItemIcon>
                                         <Avatar sx={{ width: 36, height: 36 }} alt={m.senderName} src={m.senderImage}>
                                              {m.senderName ? m.senderName.charAt(0) : <AccountCircleOutlinedIcon />}
                                         </Avatar>
                                     </ListItemIcon>
                                    <ListItemText
                                        primary={m.senderName || 'Unknown Sender'}
                                        secondary={m.snippet || '...'}
                                         primaryTypographyProps={{ noWrap: true }}
                                         secondaryTypographyProps={{ component: 'span', className: 'MuiListItemText-secondary' }} // Multi-line clamp
                                    />
                                     <Typography variant="caption" className="item-meta">
                                          {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true }) : ''}
                                     </Typography>
                                </PopoverListItem>
                            ))}
                        </List>
                    )}
                </Box>
                {displayMessages.length >= MESSAGE_LIMIT && !loadingMessages && (
                    <PopoverFooter>
                        <Button onClick={handleViewAllMessagesClick} size="small" fullWidth sx={{ textTransform: 'none', color: 'primary.main', fontWeight: 500 }}>View All Messages</Button>
                    </PopoverFooter>
                )}
            </>
    )}, [loadingMessages, messages, unreadMessagesCount, handleMessageItemClick, handleMarkAllMessagesRead, handleViewAllMessagesClick]); // Add real dependencies


    // Search Popover Content
    const searchPopoverContent = useMemo(() => (
        <Box sx={{ maxHeight: 300, overflowY: 'auto', p: searchResults.length > 0 ? 0.5 : 0 }}> {/* Padding only if results */}
            {searchLoading && ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}> <CircularProgress size={20} /> </Box> )}
            {searchError && ( <Typography color="error" sx={{ p: 2, fontSize: '0.85rem', textAlign: 'center' }}> {searchError} </Typography> )}
            {!searchLoading && !searchError && searchResults.length === 0 && searchQuery.trim().length >= 2 && ( <Typography sx={{ p: 2, color: 'text.secondary', fontSize: '0.85rem', textAlign: 'center' }}> No users found. </Typography> )}
            {!searchLoading && !searchError && searchResults.length > 0 && (
                <List dense disablePadding>
                    {searchResults.map((result) => (
                        <ListItemButton key={result.id} onClick={() => handleSearchResultClick(result.id)} sx={{ py: 0.75, px: 1.5, borderRadius: 1 }}>
                            <ListItemIcon sx={{ minWidth: 36, mr: 1.5 }}> <Avatar sx={{ width: 28, height: 28, fontSize: '0.8rem' }} alt={result.basicInfo?.fullName || '?'} src={result.basicInfo?.profileImageUrl || undefined} > {result.basicInfo?.fullName ? result.basicInfo.fullName.charAt(0).toUpperCase() : <AccountCircleOutlinedIcon fontSize="small"/>} </Avatar> </ListItemIcon>
                            <ListItemText primary={result.basicInfo?.fullName || 'Unknown'} secondary={result.basicInfo?.studentId || 'No ID'} primaryTypographyProps={{ fontSize: '0.9rem', noWrap: true }} secondaryTypographyProps={{ fontSize: '0.75rem', noWrap: true }} />
                        </ListItemButton>
                    ))}
                </List>
            )}
        </Box>
    ), [searchLoading, searchError, searchResults, searchQuery, handleSearchResultClick]);


    // --- Main Render ---
    return (
        <StyledRoot>
            {/* Top AppBar */}
            {user && (
                <StyledAppBar position="fixed">
                    <Toolbar sx={{ minHeight: APP_BAR_HEIGHT }}>
                        {/* Hamburger (Mobile) or Spacing (Desktop) */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 'auto', md: SIDEBAR_WIDTH_DESKTOP }, pl: { xs: 0, md: 2.5 } }}>
                            {isMobile ? (
                                <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                                    <MenuIcon />
                                </IconButton>
                            ) : null }
                            {/* Optionally show brand name on mobile AppBar if sidebar isn't visible */}
                             {isMobile && (
                                 <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700 }}>MEmento</Typography>
                             )}
                        </Box>

                        {/* Search Bar (Pushed to the right before icons) */}
                        <Search>
                            <SearchIconWrapper> <SearchIcon fontSize="small" /> </SearchIconWrapper>
                            <StyledInputBase placeholder="Search name or ID…" inputProps={{ 'aria-label': 'search' }} value={searchQuery} onChange={handleSearchChange} onFocus={handleSearchFocus} onBlur={handleSearchBlur} inputRef={searchInputRef} />
                            {searchQuery && ( <IconButton size="small" onClick={handleClearSearch} sx={{ position: 'absolute', right: theme.spacing(1), color: 'text.secondary' }} aria-label="clear search" > <ClearIcon fontSize="small" /> </IconButton> )}
                        </Search>
                        {/* Search Results Popover */}
                        <Popover
                            id="search-results-popover" open={isSearchPopoverOpen} anchorEl={searchAnchorEl} onClose={() => setSearchAnchorEl(null)}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }} transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            disableRestoreFocus disableScrollLock
                            PaperProps={{ component: StyledPopoverPaper, sx: { width: SEARCH_POPOVER_WIDTH } }} // Apply style to Paper
                        >
                            {searchPopoverContent}
                        </Popover>

                        {/* Right Icons */}
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ ml: 1 }}>
                            {/* Messages */}
                             <Tooltip title="Messages">
                                 <IconButton id="messages-button" color="inherit" onClick={handleMessagesPopoverOpen} aria-haspopup="true" aria-controls={isMessagesPopoverOpen ? 'messages-popover' : undefined} aria-expanded={isMessagesPopoverOpen ? 'true' : undefined}>
                                    <Badge badgeContent={unreadMessagesCount} color="error" max={99}> <MailOutlineIcon /> </Badge>
                                </IconButton>
                             </Tooltip>
                            {/* Notifications */}
                             <Tooltip title="Notifications">
                                 <IconButton id="notification-button" color="inherit" onClick={handleNotificationPopoverOpen} aria-haspopup="true" aria-controls={isNotificationPopoverOpen ? 'notification-popover' : undefined} aria-expanded={isNotificationPopoverOpen ? 'true' : undefined}>
                                    <Badge badgeContent={totalUnreadCount} color="error" max={99}> <NotificationsNoneOutlinedIcon /> </Badge>
                                </IconButton>
                             </Tooltip>
                             {/* Profile */}
                            <Tooltip title="Profile Settings">
                                <IconButton id="profile-button" size="small" onClick={handleProfileMenuOpen} sx={{ p: 0 }} aria-haspopup="true" aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined} aria-expanded={isProfileMenuOpen ? 'true' : undefined}>
                                    <Avatar sx={{ width: 36, height: 36 }} alt={userName || ''} src={userProfile?.basicInfo?.profileImageUrl || undefined}>
                                         {!userProfile?.basicInfo?.profileImageUrl && userName ? userName.charAt(0).toUpperCase() : <AccountCircleOutlinedIcon />}
                                    </Avatar>
                                </IconButton>
                            </Tooltip>
                        </Stack>

                        {/* Popovers / Menus anchored to Icons */}
                        {/* Message Popover */}
                         <Popover id="messages-popover" open={isMessagesPopoverOpen} anchorEl={messagesAnchorEl} onClose={handleMessagesPopoverClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableRestoreFocus disableScrollLock PaperProps={{ component: StyledPopoverPaper, sx: { width: POPOVER_WIDTH } }} >
                             {messagePopoverContent}
                         </Popover>
                         {/* Notification Popover */}
                         <Popover id="notification-popover" open={isNotificationPopoverOpen} anchorEl={notificationAnchorEl} onClose={handleNotificationPopoverClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} disableRestoreFocus disableScrollLock PaperProps={{ component: StyledPopoverPaper, sx: { width: POPOVER_WIDTH } }} >
                             {notificationPopoverContent}
                         </Popover>
                         {/* Profile Menu */}
                         <Menu id="profile-menu" anchorEl={profileAnchorEl} open={isProfileMenuOpen} onClose={handleProfileMenuClose} disableScrollLock anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} slotProps={{ paper: { elevation: 0, sx: { mt: 1.5, minWidth: 200, boxShadow: theme.shadows[4], borderRadius: theme.shape.borderRadius * 1.5, border: `1px solid ${theme.palette.divider}`, }, } }} >
                             {/* Simple Profile Menu Items */}
                             <MenuItem onClick={() => handleNavigate('/profile')} sx={{ fontSize: '0.9rem' }}> Profile </MenuItem>
                             <MenuItem onClick={() => handleNavigate('/settings')} sx={{ fontSize: '0.9rem' }}> Settings </MenuItem>
                             <Divider sx={{ my: 0.5 }} />
                             <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.9rem' }}> Sign Out </MenuItem>
                         </Menu>

                    </Toolbar>
                </StyledAppBar>
            )}

            {/* Sidebar Navigation */}
            {user && (
                <StyledDrawer
                    variant={isMobile ? "temporary" : "permanent"}
                    anchor="left"
                    open={isMobile ? mobileDrawerOpen : true}
                    onClose={isMobile ? handleDrawerToggle : undefined}
                    ModalProps={isMobile ? { keepMounted: true } : {}} // Keep mounted for mobile performance
                >
                    {drawerContent}
                </StyledDrawer>
            )}

            {/* Mobile Bottom Navigation */}
             {user && isMobile && (
                <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, zIndex: theme.zIndex.drawer }} elevation={0}>
                     <StyledBottomNavigation
                        value={mobileBottomNavItems.find(item => isNavItemActive(item.path, item.value))?.value || false} // Find active value based on path/base
                        onChange={(event, newValue) => {
                            const selectedItem = mobileBottomNavItems.find(item => item.value === newValue);
                            if (selectedItem?.path) { handleNavigate(selectedItem.path); }
                            // else if (newValue === 'search') { /* Open search modal? */ }
                        }}
                        showLabels
                    >
                        {mobileBottomNavItems.map((item) => (
                            <StyledBottomNavigationAction key={item.value} label={item.label} value={item.value} icon={item.icon} />
                        ))}
                    </StyledBottomNavigation>
                 </AppBar>
            )}

            {/* ====================================================================== */}
            {/* MAIN CONTENT AREA - Rendered by the Parent Layout Component          */}
            {/* The parent needs to apply padding-top: APP_BAR_HEIGHT                */}
            {/* and padding-left: SIDEBAR_WIDTH_DESKTOP (on md+)                     */}
            {/* and padding-bottom: MOBILE_BOTTOM_NAV_HEIGHT (on md down)            */}
            {/* Example in parent:                                                   */}
            {/* <Box component="main" sx={{                                          */}
            {/*   flexGrow: 1,                                                        */}
            {/*   pt: `${APP_BAR_HEIGHT}px`,                                          */}
            {/*   pb: { xs: `${MOBILE_BOTTOM_NAV_HEIGHT}px`, md: 0 },                 */}
            {/*   pl: { xs: 0, md: `${SIDEBAR_WIDTH_DESKTOP}px` },                    */}
            {/*   width: { md: `calc(100% - ${SIDEBAR_WIDTH_DESKTOP}px)` }            */}
            {/* }}> <Outlet /> </Box>                                                 */}
            {/* ====================================================================== */}

        </StyledRoot>
    );
}

export default Navbar;