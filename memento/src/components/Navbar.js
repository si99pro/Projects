/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Navbar.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, IconButton,
    Box, Tooltip, Stack, List, ListItem, ListItemText, ListItemButton, ListItemIcon,
    Divider, Badge, styled, Drawer, useTheme, useMediaQuery, alpha,
    Collapse, CircularProgress, Popover, SvgIcon, BottomNavigation, BottomNavigationAction
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu'; // Re-added MenuIcon for hamburger
import SchoolIcon from '@mui/icons-material/School';
import FolderIcon from '@mui/icons-material/Folder';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ReadMoreIcon from '@mui/icons-material/ReadMore';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import {
    collection, query, orderBy, onSnapshot, doc, writeBatch,
    serverTimestamp, getDoc, setDoc, limit, where, getDocs
} from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// --- Constants ---
const DESKTOP_DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = 280; // Mobile drawer can be slightly wider if needed
const MOBILE_BOTTOM_NAV_HEIGHT = 56;
const NOTIFICATION_POPOVER_WIDTH = 380;
const NOTIFICATION_LIMIT = 7;
const BATCH_START_YEAR = 2016;

// --- Firestore Data Structure Note --- remains the same ---

// --- Styles ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    boxShadow: `inset 0px -1px 0px ${theme.palette.divider}`,
    zIndex: theme.zIndex.drawer + 1, // Keep above desktop drawer
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // Desktop: Positioned next to the drawer
    [theme.breakpoints.up('md')]: {
        // width: `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)`, // DISABLED
        // marginLeft: `${DESKTOP_DRAWER_WIDTH}px`,         // DISABLED
    },
    // Mobile: Full width
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 0,
    },
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minHeight: 64,
}));

// --- Desktop/Mobile Sidebar Styles ---
const SidebarHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 2), // Adjusted padding
    minHeight: 64, // Match AppBar height
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    // Sticky footer for long sidebars
    position: 'sticky',
    bottom: 0,
    backgroundColor: theme.palette.background.paper, // Ensure background matches
    zIndex: 1, // Keep above scrolling content
}));

// IMPROVED styles for sidebar list items
const sidebarListItemStyles = (theme, isActive, isSubItem = false) => ({
    margin: theme.spacing(0.5, 1.5), // Consistent margin
    padding: theme.spacing(1, 1.5), // Slightly reduced padding for density
    paddingLeft: isSubItem ? theme.spacing(5.5) : theme.spacing(1.5), // Indentation for sub-items
    borderRadius: theme.shape.borderRadius * 1.5, // Slightly more rounded
    minHeight: 44, // Good touch target size
    color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
    backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.08) : 'transparent',
    position: 'relative', // For potential active indicator
    '&:hover': {
        backgroundColor: alpha(theme.palette.text.primary, 0.04),
        color: theme.palette.text.primary, // Darken text on hover
    },
    '& .MuiListItemIcon-root': {
        minWidth: 'auto',
        marginRight: theme.spacing(1.5),
        color: isActive ? theme.palette.primary.main : theme.palette.action.active,
        fontSize: '1.25rem', // Standardized icon size
    },
    '& .MuiListItemText-primary': {
        fontWeight: isActive ? 600 : 400, // Bolder active text
        fontSize: '0.9rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
     // Style for batch year items (making them look less like primary nav)
     '&.batch-year-item': {
        padding: theme.spacing(0.5, 1.5),
        paddingLeft: theme.spacing(5.5), // Keep indentation
        minHeight: 36,
        color: isActive ? theme.palette.primary.dark : theme.palette.text.secondary,
        backgroundColor: isActive ? alpha(theme.palette.primary.main, 0.1) : 'transparent',
        '& .MuiListItemText-primary': {
            fontSize: '0.85rem',
            fontWeight: isActive ? 500 : 400,
        },
        '&:hover': {
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            color: theme.palette.text.primary,
        },
     }
});

// --- Notification Popover Styles ---
const NotificationItem = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'read',
})(({ theme, read }) => ({
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 2),
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.08),
    borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
    '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) },
    '& .MuiListItemText-root': { marginTop: 0, marginBottom: 0, minWidth: 0, overflow: 'hidden' },
    '& .MuiListItemText-secondary': {
        display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: theme.palette.text.secondary,
        '& .notification-message': {
            lineHeight: 1.4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            marginBottom: theme.spacing(0.5), color: theme.palette.text.primary,
        },
        '& .notification-meta': {
            fontSize: '0.75rem', color: theme.palette.text.disabled, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: 'flex', alignItems: 'center', gap: theme.spacing(0.75),
        }
    },
}));

const getCategoryChipColor = (category, theme) => {
    const catLower = category?.toLowerCase() || 'general';
    switch (catLower) {
        case 'important': return { bgcolor: theme.palette.error.light, color: theme.palette.error.dark };
        case 'academic': return { bgcolor: theme.palette.info.light, color: theme.palette.info.dark };
        case 'event': return { bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark };
        case 'discussion': return { bgcolor: theme.palette.success.light, color: theme.palette.success.dark };
        case 'general': return { bgcolor: theme.palette.grey[300], color: theme.palette.text.secondary };
        case 'other': return { bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.dark };
        default: return { bgcolor: theme.palette.grey[200], color: theme.palette.text.secondary };
    }
};

const ProfileMenuHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    pointerEvents: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));
// --- End Styles ---

// --- Navigation Data ---
const deptNavItems = [
    { label: 'Overview', path: '/dept/overview', icon: <BusinessIcon /> },
    { label: 'Teachers', path: '/dept/teachers', icon: <PeopleIcon /> },
    { label: 'Students', path: '/dept/students', icon: <SchoolIcon /> },
    { label: 'Alumni', path: '/dept/alumni', icon: <PeopleIcon /> },
    { label: 'Materials', path: '/dept/materials', icon: <FolderIcon /> },
];

// Define items for the Mobile Bottom Navigation
const mobileBottomNavItems = [
    { label: 'Dashboard', value: '/dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Department', value: '/dept', path: '/dept/overview', icon: <BusinessIcon /> }, // Example: Link to dept overview
    { label: 'Profile', value: '/profile', path: '/profile', icon: <AccountCircle /> },
    // { label: 'More', value: 'more', icon: <MoreHorizIcon /> }, // Can be used to trigger the temporary drawer as well, or a different menu
];


function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, profileBg, userName, isAdmin, userProfile } = useAuth();
    const userId = user?.uid;

    // --- States ---
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false); // State for mobile temporary drawer

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [senderInfo, setSenderInfo] = useState({});
    const [markingRead, setMarkingRead] = useState(false);

    // Drawer Submenu States
    // Keep track of submenu state independently for potentially different behaviors if needed
    const [deptSubmenuOpen, setDeptSubmenuOpen] = useState(location.pathname.startsWith('/dept'));
    const [batchSubmenuOpen, setBatchSubmenuOpen] = useState(location.pathname.startsWith('/batch'));

    // --- Derived states ---
    const isProfileMenuOpen = Boolean(profileAnchorEl);
    const isNotificationPopoverOpen = Boolean(notificationAnchorEl);
    const currentPath = location.pathname;

    // --- Firebase Hooks & Fetching ---
    const fetchSenderInfo = useCallback(async (senderId) => {
         if (!senderId || senderInfo[senderId]) return;
         setSenderInfo(prev => ({ ...prev, [senderId]: { loading: true } }));
         try {
             const userRef = doc(db, 'users', senderId);
             const userSnap = await getDoc(userRef);
             if (userSnap.exists()) {
                 const userData = userSnap.data();
                 const basicInfo = userData.basicInfo || {};
                 setSenderInfo(prev => ({
                     ...prev,
                     [senderId]: {
                         fullName: basicInfo.fullName || "Unknown User",
                         studentId: basicInfo.studentId || null,
                         loading: false
                     }
                 }));
             } else {
                  setSenderInfo(prev => ({ ...prev, [senderId]: { fullName: "Unknown Sender", studentId: null, loading: false } }));
             }
         } catch (error) {
             console.error(`Error fetching sender user info for ID: ${senderId}`, error);
             setSenderInfo(prev => ({ ...prev, [senderId]: { fullName: "Error Fetching User", studentId: null, loading: false } }));
         }
     }, [senderInfo]); // Dependency only on senderInfo state

    useEffect(() => {
         if (!userId) {
             setNotifications([]);
             setTotalUnreadCount(0);
             setSenderInfo({});
             setLoadingNotifications(true); // Reset loading state when user logs out
             return undefined;
         }

         setLoadingNotifications(true);
         let isStillMounted = true;

         const userNotificationsRef = collection(db, 'users', userId, 'notifications');

         // Listener 1: Fetch LIMITED notifications for display
         const displayQuery = query(userNotificationsRef, orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT));
         const unsubscribeDisplay = onSnapshot(displayQuery, (snapshot) => {
             if (!isStillMounted) return;

             const fetchedNotifications = snapshot.docs.map(doc => ({
                 id: doc.id,
                 ...doc.data()
             }));

             // Optional: Ensure state fields exist (consider if still needed or handled by backend rules)
            //  const checkAndEnsureState = async (notification) => { /* ... */ };
            //  fetchedNotifications.forEach(checkAndEnsureState);

             setNotifications(fetchedNotifications);

             // Only set loading to false after the first successful fetch
             if (loadingNotifications) {
                 setLoadingNotifications(false);
             }

             // Fetch sender info if needed for *these* notifications
             const uniqueSenderIdsToFetch = [...new Set(
                 fetchedNotifications
                     .filter(n => n.senderId && !n.senderName && (!senderInfo[n.senderId] || (!senderInfo[n.senderId].fullName && !senderInfo[n.senderId].loading)))
                     .map(n => n.senderId)
             )];
             if (uniqueSenderIdsToFetch.length > 0) {
                 uniqueSenderIdsToFetch.forEach(fetchSenderInfo);
             }

         }, (error) => {
             console.error("Navbar: Error fetching display notifications:", error);
             if (isStillMounted) {
                 setLoadingNotifications(false); // Set loading false even on error
             }
         });

         // Listener 2: Fetch TOTAL UNREAD COUNT
         const unreadQuery = query(userNotificationsRef, where('read', '==', false));
         const unsubscribeCount = onSnapshot(unreadQuery, (snapshot) => {
             if (isStillMounted) {
                 setTotalUnreadCount(snapshot.size);
             }
         }, (error) => {
             console.error("Navbar: Error fetching total unread notification count:", error);
         });

         return () => {
             isStillMounted = false;
             unsubscribeDisplay();
             unsubscribeCount();
         };

     }, [userId, fetchSenderInfo]); // Dependencies: userId and the fetch function itself

    const batchYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = BATCH_START_YEAR; year <= currentYear; year++) {
            years.push(year);
        }
        return years.reverse();
     }, []);

    // --- Handlers ---
    const handleProfileMenuOpen = useCallback((event) => setProfileAnchorEl(event.currentTarget), []);
    const handleProfileMenuClose = useCallback(() => setProfileAnchorEl(null), []);
    const handleNotificationPopoverOpen = useCallback((event) => setNotificationAnchorEl(event.currentTarget), []);
    const handleNotificationPopoverClose = useCallback(() => setNotificationAnchorEl(null), []);
    const handleDrawerToggle = useCallback(() => setMobileOpen(prev => !prev), []); // Handler for mobile drawer toggle

    const handleDeptSubmenuToggle = useCallback(() => setDeptSubmenuOpen(prev => !prev), []);
    const handleBatchSubmenuToggle = useCallback(() => setBatchSubmenuOpen(prev => !prev), []);

    // UPDATED handleNavigate to close mobile drawer
    const handleNavigate = useCallback((path) => {
        if (path && typeof path === 'string') {
            navigate(path);
        } else {
            console.warn('handleNavigate called with invalid path:', path)
        }
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        setMobileOpen(false); // Close mobile drawer on navigation
    }, [navigate, handleProfileMenuClose, handleNotificationPopoverClose, setMobileOpen]); // Added setMobileOpen dependency

    // Specific navigation handlers point to handleNavigate, closing the mobile drawer implicitly
    const handleGoToDashboard = useCallback(() => handleNavigate('/dashboard'), [handleNavigate]);
    const handleBatchYearClick = useCallback((year) => handleNavigate(`/batch?year=${year}`), [handleNavigate]);
    const handleDeptItemClick = useCallback((path) => handleNavigate(path), [handleNavigate]);
    const handleProfileClick = useCallback(() => handleNavigate('/profile'), [handleNavigate]);
    const handleSettingsClick = useCallback(() => handleNavigate('/settings'), [handleNavigate]);
    const handleAdminPanelClick = useCallback(() => handleNavigate('/admin'), [handleNavigate]);
    const handleViewAllNotificationsClick = useCallback(() => handleNavigate('/notifications'), [handleNavigate]);
    const handleSupportClick = useCallback(() => handleNavigate('/support'), [handleNavigate]);

    // UPDATED handleLogout to close mobile drawer
    const handleLogout = useCallback(async () => {
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        setMobileOpen(false); // Close mobile drawer on logout
        try {
            await auth.signOut();
            // Optional: Redirect to login after logout
            // navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    }, [handleProfileMenuClose, handleNotificationPopoverClose, setMobileOpen]); // Added setMobileOpen dependency

    // --- Notification Actions ---
    const markNotificationAsRead = useCallback(async (notificationId) => {
        if (!userId || !notificationId) return;
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        try {
            await setDoc(notificationRef, {
                read: true,
                readTimestamp: serverTimestamp()
            }, { merge: true });
            // No need to update state locally, listener will handle it
        } catch (error) {
            console.error("Navbar: Error marking notification as read:", error);
        }
    }, [userId]);

    const handleNotificationItemClick = useCallback((notification) => {
        handleNotificationPopoverClose();
        if (notification && notification.id) {
            if (!notification.read) {
                // Mark as read optimistically or wait for listener? Mark optimistically for faster UI feedback.
                 markNotificationAsRead(notification.id);
                 // Update local state immediately for better UX if desired, though listener should catch up
                 setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, read: true} : n));
                 setTotalUnreadCount(prev => Math.max(0, prev -1));
            }
            // Navigate to the specific notification anchor within the notifications page
            navigate(`/notifications#${notification.id}`); // Assumes /notifications page handles anchors
        } else {
            console.warn('handleNotificationItemClick called with invalid notification:', notification);
            navigate('/notifications'); // Fallback
        }
    }, [handleNotificationPopoverClose, markNotificationAsRead, navigate, userId]); // Added userId as markNotificationAsRead depends on it

    const handleMarkAllAsRead = useCallback(async () => {
        if (!userId || markingRead || totalUnreadCount === 0) {
            return;
        }
        setMarkingRead(true);
        const userNotificationsRef = collection(db, 'users', userId, 'notifications');
        const unreadQuery = query(userNotificationsRef, where('read', '==', false));
        try {
            const unreadSnapshot = await getDocs(unreadQuery);
            if (unreadSnapshot.empty) {
                setMarkingRead(false);
                return;
            }
            const batch = writeBatch(db);
            const now = serverTimestamp();
            unreadSnapshot.docs.forEach((docSnapshot) => {
                batch.set(docSnapshot.ref, { read: true, readTimestamp: now }, { merge: true });
            });
            await batch.commit();
            // Optimistically update UI while listener catches up
            setNotifications(prev => prev.map(n => n.read ? n : {...n, read: true}));
            setTotalUnreadCount(0);
        } catch (error) {
            console.error("Navbar: Error in mark all as read batch operation:", error);
        } finally {
            // Set markingRead false slightly delayed to allow UI updates
             setTimeout(() => setMarkingRead(false), 300);
        }
    }, [userId, markingRead, totalUnreadCount]);


    // --- Helper functions for sidebar active state ---
    const isNavItemActive = useCallback((path) => path && currentPath === path, [currentPath]);
    const isBatchActive = useCallback((year) => currentPath === `/batch?year=${year}`, [currentPath]);

    // --- Memoized Drawer Content (Used by both Desktop Permanent and Mobile Temporary Drawers) ---
    const drawerContent = useMemo(() => {
        // Functions are defined outside and passed via dependencies
        return (
            <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
                {/* 1. Top Logo Section */}
                <SidebarHeader>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: 1, overflow: 'hidden' }} onClick={handleGoToDashboard}>
                         <Avatar sx={{ bgcolor: 'primary.light', color: 'primary.main', width: 36, height: 36, fontSize: '1.1rem', fontWeight: 'bold' }}>M</Avatar>
                         <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, color: 'text.primary' }}>
                             MEmento
                         </Typography>
                    </Box>
                </SidebarHeader>

                {/* 2. Main Navigation (Scrollable) */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pt: 1, '&::-webkit-scrollbar': { width: '5px' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.grey[300], borderRadius: '3px' } }}>
                    <List component="nav" sx={{ px: 1 }} >
                        {/* Dashboard */}
                        <ListItemButton onClick={handleGoToDashboard} sx={sidebarListItemStyles(theme, isNavItemActive('/dashboard'))}>
                            <ListItemIcon><DashboardIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>

                        {/* Department (Collapsible) */}
                        <ListItemButton onClick={handleDeptSubmenuToggle} sx={sidebarListItemStyles(theme, currentPath.startsWith('/dept') && !isNavItemActive('/dept/overview') && !isNavItemActive('/dept/teachers') /* etc. */)}> {/* More specific active check for parent */}
                            <ListItemIcon><BusinessIcon /></ListItemIcon>
                            <ListItemText primary="Department" />
                            {deptSubmenuOpen ? <ExpandLess sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} /> : <ExpandMore sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} />}
                        </ListItemButton>
                        <Collapse in={deptSubmenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ py: 0.5 }}>
                                {deptNavItems.map((item) => (
                                    <ListItemButton key={item.label} onClick={() => handleDeptItemClick(item.path)} sx={sidebarListItemStyles(theme, isNavItemActive(item.path), true)}>
                                        {/* Optional: Add icon back for subitems if desired */}
                                        {/* <ListItemIcon sx={{ fontSize: '1rem', mr: 1 }}>{item.icon}</ListItemIcon> */}
                                        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem' }}/>
                                    </ListItemButton>
                                ))}
                            </List>
                        </Collapse>

                         {/* Batch (Collapsible) */}
                         <ListItemButton onClick={handleBatchSubmenuToggle} sx={sidebarListItemStyles(theme, currentPath.startsWith('/batch') && !batchYears.some(year => isBatchActive(year)))}> {/* More specific active check */}
                             <ListItemIcon><CalendarMonthIcon /></ListItemIcon>
                             <ListItemText primary="Batch" />
                             {batchSubmenuOpen ? <ExpandLess sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} /> : <ExpandMore sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} />}
                         </ListItemButton>
                         <Collapse in={batchSubmenuOpen} timeout="auto" unmountOnExit>
                             <List component="div" disablePadding sx={{ py: 0.5 }}>
                                 {batchYears.map((year) => (
                                     <ListItemButton
                                         key={year}
                                         onClick={() => handleBatchYearClick(year)}
                                         sx={sidebarListItemStyles(theme, isBatchActive(year), true)}
                                         className="batch-year-item"
                                     >
                                         <ListItemText primary={year} primaryTypographyProps={{ fontSize: '0.875rem' }}/>
                                     </ListItemButton>
                                 ))}
                             </List>
                         </Collapse>

                        {/* Optional Divider */}
                        <Divider sx={{ my: 1.5, mx: 1.5 }} light />

                         {/* Static Bottom Links */}
                         <ListItemButton onClick={handleSettingsClick} sx={sidebarListItemStyles(theme, isNavItemActive('/settings'))}>
                             <ListItemIcon><SettingsIcon /></ListItemIcon>
                             <ListItemText primary="Settings" />
                         </ListItemButton>
                         <ListItemButton onClick={handleSupportClick} sx={sidebarListItemStyles(theme, isNavItemActive('/support'))}>
                             <ListItemIcon><SupportAgentIcon /></ListItemIcon>
                             <ListItemText primary="Support" />
                         </ListItemButton>
                         {isAdmin && (
                            <ListItemButton onClick={handleAdminPanelClick} sx={sidebarListItemStyles(theme, isNavItemActive('/admin'))}>
                                <ListItemIcon><AdminPanelSettingsIcon /></ListItemIcon>
                                <ListItemText primary="Admin Panel" />
                            </ListItemButton>
                        )}
                    </List>
                </Box> {/* End Scrollable Area */}

                {/* 3. User Info & Logout Section (Sticky Footer) */}
                <SidebarFooter>
                    <Tooltip title="Edit Profile" placement="top">
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', cursor: 'pointer', flexGrow: 1 }}
                            onClick={handleProfileClick} // Use specific handler
                        >
                            <Avatar sx={{ width: 40, height: 40 }} alt={userName || ''}>
                                {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}>
                                    {userName || 'User Name'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}>
                                    {user?.email || ''}
                                </Typography>
                            </Box>
                        </Box>
                    </Tooltip>
                    <Tooltip title="Logout">
                         <IconButton onClick={handleLogout} size="medium" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                             <LogoutIcon />
                         </IconButton>
                    </Tooltip>
                </SidebarFooter>
            </Box>
        )
    }, [
        user, userName, isAdmin, theme, currentPath,
        handleGoToDashboard, handleProfileClick, handleSettingsClick, handleAdminPanelClick, handleLogout, handleSupportClick,
        handleDeptSubmenuToggle, handleBatchSubmenuToggle, handleDeptItemClick, handleBatchYearClick, // handleNavigate not needed here as specific handlers are used
        deptSubmenuOpen, batchSubmenuOpen, deptNavItems, batchYears,
        isNavItemActive, isBatchActive
    ]); // Ensure all dependencies are correct

    // --- Notification Popover Content (Memoized) ---
    const notificationPopoverContent = useMemo(() => {
        const showViewAllButton = !loadingNotifications && notifications.length === NOTIFICATION_LIMIT;

        return (
            <>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }} >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Notifications</Typography>
                    {notifications.length > 0 && totalUnreadCount > 0 && ( // Show only if there are unread notifications
                        <Button
                            onClick={handleMarkAllAsRead}
                            color="primary"
                            size="small"
                            disabled={markingRead} // Disable only while processing
                            startIcon={markingRead ? <CircularProgress size={14} color="inherit" /> : <MarkChatReadIcon fontSize='small' />}
                            sx={{ textTransform: 'none', fontWeight: 500, py: 0.25, px: 1, ml: 1 }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                {/* Scrollable Content Area */}
                 <Box sx={{
                    flexGrow: 1, overflowY: 'auto',
                    maxHeight: { xs: '60vh', sm: 'calc(100vh - 150px)' }, // Limit height
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent', borderRadius: '3px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.action.selected, borderRadius: '3px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: theme.palette.action.active },
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.action.selected} transparent`,
                }} >
                    {/* Loading Indicator */}
                    {loadingNotifications && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: 100 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {/* Notifications List */}
                    {!loadingNotifications && notifications.length > 0 && (
                        <List disablePadding sx={{ py: 0.5 }}>
                            {notifications.map((notification, index) => {
                                const isRead = !!notification.read;
                                let senderDisplayName = "System";
                                if (notification.senderName) {
                                    senderDisplayName = notification.senderName;
                                    if (notification.senderStudentId) senderDisplayName += ` (${notification.senderStudentId})`;
                                } else if (notification.senderId) {
                                    const fetchedSender = senderInfo[notification.senderId];
                                    if (fetchedSender?.loading) senderDisplayName = 'Loading...';
                                    else if (fetchedSender?.fullName) {
                                        senderDisplayName = fetchedSender.fullName;
                                        if (fetchedSender.studentId) senderDisplayName += ` (${fetchedSender.studentId})`;
                                    } else senderDisplayName = 'Unknown Sender';
                                }
                                const timeAgo = notification.timestamp?.toDate()
                                    ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })
                                    : 'just now';

                                const AudienceIcon = notification.audienceType === 'public'
                                    ? PublicIcon
                                    : notification.audienceType === 'private'
                                    ? LockIcon
                                    : null;
                                const audienceTooltip = notification.audienceType === 'public'
                                    ? "Public Notification"
                                    : notification.audienceType === 'private'
                                    ? "Private Notification"
                                    : "";

                                const { color: categoryColor } = getCategoryChipColor(notification.category, theme);

                                return (
                                    <React.Fragment key={notification.id}>
                                        <NotificationItem
                                            read={isRead}
                                            onClick={() => handleNotificationItemClick(notification)}
                                        >
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%', overflow: 'hidden' }}>
                                                        {notification.category && (
                                                            <Typography component="span" variant="body2" sx={{ color: categoryColor, fontWeight: 600, mr: 0.75, textTransform: 'capitalize', whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                                {notification.category}:
                                                            </Typography>
                                                        )}
                                                        <Typography component="span" sx={{ fontWeight: isRead ? 400 : 600, fontSize: '0.9rem', lineHeight: 1.35, color: 'text.primary', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexGrow: 1, minWidth: 0 }}>
                                                            {notification.title || 'Notification'}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" className="notification-message">
                                                            {notification.message || "..."}
                                                        </Typography>
                                                        <Typography component="div" variant="caption" className="notification-meta">
                                                            {AudienceIcon && (
                                                                <Tooltip title={audienceTooltip} placement="top" arrow>
                                                                    <span> <AudienceIcon fontSize="inherit" sx={{ verticalAlign: 'middle', fontSize: '0.9rem', mr: 0.5 }} /> </span>
                                                                </Tooltip>
                                                            )}
                                                            <Box component="span" sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {senderDisplayName}
                                                            </Box>
                                                            <Box component="span" sx={{ mx: 0.25 }}>•</Box>
                                                            <Box component="span" sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}>
                                                                {timeAgo}
                                                            </Box>
                                                        </Typography>
                                                    </>
                                                }
                                                secondaryTypographyProps={{ component: 'div' }}
                                            />
                                        </NotificationItem>
                                        {index < notifications.length - 1 && (
                                            <Divider component="li" variant="inset" sx={{ ml: theme.spacing(2), mr: theme.spacing(1) }}/>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}

                     {/* "No Notifications" Message */}
                    {!loadingNotifications && notifications.length === 0 && (
                        <Typography sx={{ p: 4, textAlign: 'center', color: 'text.secondary', fontStyle: 'italic' }} variant="body2">
                            No new notifications.
                        </Typography>
                    )}
                 </Box> {/* End Scrollable Content Area */}

                 {/* View All Button (fixed at bottom of popover) */}
                 {showViewAllButton && (
                    <Box sx={{ textAlign: 'center', py: 1, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
                        <Button
                            onClick={handleViewAllNotificationsClick}
                            size="small"
                            startIcon={<ReadMoreIcon fontSize='small'/>}
                            sx={{ textTransform: 'none', fontWeight: 500 }}
                        >
                            View All Notifications
                        </Button>
                    </Box>
                )}
            </>
        )
    }, [
        loadingNotifications, notifications, senderInfo, totalUnreadCount, markingRead,
        handleNotificationItemClick, handleMarkAllAsRead, handleViewAllNotificationsClick,
        theme
    ]);


    // --- Determine active value for Bottom Navigation ---
     const getMobileNavValue = useCallback(() => {
        const exactMatch = mobileBottomNavItems.find(item => item.value === currentPath);
        if (exactMatch) return exactMatch.value;
        // Handle cases like /dept/* matching the /dept item
        if (currentPath.startsWith('/dept')) {
            const deptItem = mobileBottomNavItems.find(item => item.value === '/dept');
            if (deptItem) return deptItem.value;
        }
        if (currentPath.startsWith('/batch')) {
             // No specific batch item in bottom nav, return false or maybe highlight dashboard?
             return '/dashboard'; // Example: fallback to dashboard
        }
        return false; // No match
     }, [currentPath]); // Depends only on currentPath
     const mobileNavValue = getMobileNavValue();

    // --- Main Render ---
    return (
        <Box sx={{ display: 'flex' }}>

            {/* AppBar: Always visible */}
            <StyledAppBar position="fixed">
                <StyledToolbar>
                    {/* Left Side: Hamburger (Mobile Only) & Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
                         {/* Hamburger Icon - Mobile Only */}
                         {user && isMobile && (
                            <IconButton
                                color="inherit" // Inherit color from AppBar (which is default/text color now)
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 1.5 }} // Add margin to the right
                            >
                                <MenuIcon />
                            </IconButton>
                         )}

                         {/* Title - Show on Mobile */}
                         {isMobile && (
                            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600, flexGrow: 1 }}>
                                MEmento
                            </Typography>
                         )}
                         {/* Desktop: This area remains empty as title/logo is in the sidebar */}
                    </Box>

                    {/* Right Side: Icons (Notifications, Profile Menu) */}
                    {user && (
                        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
                             {/* Notifications Icon & Popover */}
                             <Tooltip title="Notifications">
                                 <IconButton
                                     id="notification-button"
                                     color="default" // Use default color as AppBar bg is paper now
                                     onClick={handleNotificationPopoverOpen}
                                     aria-haspopup="true" aria-controls="notification-popover" aria-expanded={isNotificationPopoverOpen ? 'true' : undefined}
                                 >
                                    <Badge badgeContent={totalUnreadCount} color="error" max={99}> {/* Increased max */}
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                             </Tooltip>
                             <Popover
                                 id="notification-popover"
                                 open={isNotificationPopoverOpen}
                                 anchorEl={notificationAnchorEl}
                                 onClose={handleNotificationPopoverClose}
                                 anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                 transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                 transitionDuration={250}
                                 disableRestoreFocus={true}
                                 disableScrollLock={true} // Allows interaction with background
                                 slotProps={{
                                    paper: {
                                        elevation: 0,
                                        sx: {
                                            mt: 1.5,
                                            boxShadow: theme.shadows[6],
                                            borderRadius: '12px',
                                            border: `1px solid ${theme.palette.divider}`,
                                            width: NOTIFICATION_POPOVER_WIDTH,
                                            maxWidth: '95vw',
                                            bgcolor: 'background.paper',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            overflow: 'hidden', // Parent controls overflow
                                        }
                                    }
                                }}
                             >
                                 {notificationPopoverContent}
                             </Popover>

                             {/* Profile Icon & Menu */}
                             <Tooltip title={userName || "Profile Settings"}>
                                 <IconButton
                                     id="profile-button" size="small" onClick={handleProfileMenuOpen}
                                     color="default" // Use default color
                                     aria-haspopup="true" aria-controls="profile-menu" aria-expanded={isProfileMenuOpen ? 'true' : undefined} sx={{ p: 0 }}
                                 >
                                    <Avatar sx={{ bgcolor: theme.palette.grey[200], color: theme.palette.text.secondary, width: 32, height: 32, fontSize: '0.9rem' }} alt={userName || ''} >
                                        {userName ? userName.charAt(0).toUpperCase() : <AccountCircle sx={{ fontSize: '1.7rem'}}/>}
                                    </Avatar>
                                 </IconButton>
                             </Tooltip>
                             <Menu
                                id="profile-menu"
                                anchorEl={profileAnchorEl}
                                open={isProfileMenuOpen}
                                onClose={handleProfileMenuClose}
                                disableScrollLock={true}
                                PaperProps={{ sx: { mt: 1.5, minWidth: 200, boxShadow: theme.shadows[4], borderRadius: theme.shape.borderRadius }, elevation: 0, variant: 'outlined' }}
                             >
                                 {userName && (
                                    <ProfileMenuHeader>
                                         <Typography variant="subtitle2" fontWeight="medium" noWrap>{userName}</Typography>
                                         <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
                                    </ProfileMenuHeader>
                                )}
                                <MenuItem onClick={handleProfileClick}> <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon> Edit Profile </MenuItem>
                                <MenuItem onClick={handleSettingsClick}> <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings </MenuItem>
                                <MenuItem onClick={handleSupportClick}> <ListItemIcon><SupportAgentIcon fontSize="small" /></ListItemIcon> Support </MenuItem>
                                {isAdmin && ( <MenuItem onClick={handleAdminPanelClick}> <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon> Admin Panel </MenuItem> )}
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}> <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Sign Out </MenuItem>
                             </Menu>
                        </Stack>
                    )}
                     {/* Login Button */}
                     {!user && (
                        <Button
                            color="primary"
                            onClick={() => navigate('/login')}
                            variant="contained" // Consistent prominent login button
                            size="small"
                            sx={{ ml: 1 }} // Add some margin if needed
                        >
                            Login
                        </Button>
                    )}
                </StyledToolbar>
            </StyledAppBar>

             {/* Navigation Drawers */}
             {user && (
                <Box
                    component="nav"
                    // Width is set by the individual drawers now
                    sx={{ width: { md: DESKTOP_DRAWER_WIDTH }, flexShrink: { md: 0 } }}
                    aria-label="main navigation"
                >
                    {/* Temporary Drawer (Mobile) */}
                    <Drawer
                        variant="temporary"
                        anchor="left"
                        open={mobileOpen}
                        onClose={handleDrawerToggle}
                        ModalProps={{ keepMounted: true }} // Better open performance on mobile.
                        sx={{
                            display: { xs: 'block', md: 'none' }, // Show only on mobile
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: MOBILE_DRAWER_WIDTH, // Use mobile width
                                bgcolor: 'background.paper',
                                // borderRight: `1px solid ${theme.palette.divider}` // Optional: add border if desired
                            },
                        }}
                    >
                        {drawerContent} {/* <<< REUSE the drawer content */}
                    </Drawer>

                    {/* Permanent Drawer (Desktop) */}
                    <Drawer
                        variant="permanent"
                        anchor="left"
                        open // Permanent is always open
                        sx={{
                            display: { xs: 'none', md: 'block' }, // Show only on desktop
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DESKTOP_DRAWER_WIDTH, // Use desktop width
                                borderRight: `1px solid ${theme.palette.divider}`,
                                bgcolor: 'background.paper',
                            },
                        }}
                    >
                        {drawerContent} {/* <<< REUSE the drawer content */}
                    </Drawer>
                </Box>
             )}

            {/* Mobile Bottom Navigation */}
            {user && isMobile && ( // Render only for logged-in users on mobile screens
                <BottomNavigation
                    sx={{
                        width: '100%',
                        height: MOBILE_BOTTOM_NAV_HEIGHT,
                        position: 'fixed',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        zIndex: theme.zIndex.appBar, // Ensure it's above content, below AppBar modals/popovers
                        borderTop: `1px solid ${theme.palette.divider}`,
                        bgcolor: 'background.paper',
                    }}
                    value={mobileNavValue}
                    onChange={(event, newValue) => {
                        const selectedItem = mobileBottomNavItems.find(item => item.value === newValue);
                        if (selectedItem && selectedItem.path) {
                            handleNavigate(selectedItem.path); // Use the main navigate handler
                        } else if (newValue === 'more') {
                            // Optionally, the 'More' button could also open the temporary drawer
                            handleDrawerToggle();
                            console.log("More clicked - opening drawer");
                        }
                    }}
                    showLabels // Keep labels visible
                >
                    {mobileBottomNavItems.map((item) => (
                        <BottomNavigationAction
                            key={item.value}
                            label={item.label}
                            value={item.value}
                            icon={item.icon}
                            sx={{
                                // Optional: Style tweaks for active state
                                '&.Mui-selected': {
                                    color: theme.palette.primary.main,
                                },
                                minWidth: 'auto', // Allow items to shrink
                                padding: '6px 8px 8px 8px', // Adjust padding if needed
                                '& .MuiBottomNavigationAction-label': {
                                     fontSize: '0.7rem', // Slightly smaller label if needed
                                }
                            }}
                        />
                    ))}
                </BottomNavigation>
            )}

             {/* =================================================================== */}
             {/* IMPORTANT: Main Content Area defined in Parent Layout Component     */}
             {/* (Layout guidance comment remains the same as previous version)     */}
             {/* =================================================================== */}
             {/*
                // In your Layout/App component:
                import { useTheme, useMediaQuery, Box } from '@mui/material';
                import { Outlet } from 'react-router-dom'; // If using react-router
                import Navbar from './components/Navbar'; // Import your Navbar
                import { useAuth } from './auth/AuthContext'; // Import your auth context

                // Define constants consistently or import them
                const DESKTOP_DRAWER_WIDTH = 260;
                const MOBILE_BOTTOM_NAV_HEIGHT = 56;
                const APP_BAR_HEIGHT = 64;

                function Layout() {
                    const theme = useTheme();
                    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
                    const { user } = useAuth(); // Get user state

                    const bottomNavHeightActual = user && isMobile ? MOBILE_BOTTOM_NAV_HEIGHT : 0;
                    const appBarMarginLeftActual = user && !isMobile ? DESKTOP_DRAWER_WIDTH : 0; // Check if user exists AND is not mobile
                    const appBarWidthActual = user && !isMobile ? `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)` : '100%'; // Check if user exists AND is not mobile


                    return (
                        <Box sx={{ display: 'flex', minHeight: '100vh' }}> {/* Ensure Box takes full height */}
             {/*            <Navbar /> {/* Render the Navbar component */}

             {/*            <Box
                                component="main"
                                sx={{
                                    flexGrow: 1,
                                    p: { xs: 2, sm: 3 }, // Content padding
                                    bgcolor: theme.palette.grey[100], // Background for content area
                                    // Adjust margin based on drawer state for desktop
                                    // ml: { md: `${DESKTOP_DRAWER_WIDTH}px` }, // ORIGINAL - Use appBarMarginLeftActual instead if AppBar style is disabled
                                    ml: { md: user ? `${DESKTOP_DRAWER_WIDTH}px` : 0 }, // Apply margin only if user logged in and on desktop
                                    // width: { xs: '100%', md: `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)` }, // ORIGINAL - Use appBarWidthActual instead if AppBar style is disabled
                                    width: { xs: '100%', md: user ? `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)` : '100%' }, // Correct width calculation only if user logged in and on desktop
                                    mt: `${APP_BAR_HEIGHT}px`, // Margin for AppBar
                                    pb: `${bottomNavHeightActual}px`, // Padding for mobile BottomNav
                                    // Calculate minHeight to push footer down even with short content
                                    minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - ${bottomNavHeightActual}px)`,
                                    boxSizing: 'border-box',
                                    display: 'flex', // Use flexbox for potential footer sticking
                                    flexDirection: 'column', // Stack content vertically
                                    // overflowY: 'auto' // Let content scroll if needed, but Box itself shouldn't scroll primary content
                                }}
                            >
                                {/* Your main page content renders here */}
             {/*                    <Outlet />
                            </Box>
                       </Box>
                    );
                }
             */}
             {/* =================================================================== */}

        </Box> /* End Root Box */
    );
}

export default Navbar;