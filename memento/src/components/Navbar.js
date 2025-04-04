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
// --- Icons (Grouped for Readability) ---
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import EditIcon from '@mui/icons-material/Edit';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
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
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Example: For empty state

import {
    collection, query, orderBy, onSnapshot, doc, writeBatch,
    serverTimestamp, getDoc, setDoc, limit, where, getDocs
} from 'firebase/firestore';
import { useAuth } from '../auth/AuthContext';
import { formatDistanceToNow } from 'date-fns';

// --- Constants ---
const DESKTOP_DRAWER_WIDTH = 260;
const MOBILE_DRAWER_WIDTH = 280;
const MOBILE_BOTTOM_NAV_HEIGHT = 56;
const NOTIFICATION_POPOVER_WIDTH = 380;
const NOTIFICATION_LIMIT = 7;
const BATCH_START_YEAR = 2016;
const APP_BAR_HEIGHT = 64; // Keep consistent with Layout

// --- Styles ---

// **AppBar**
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper, // Clean paper background
    color: theme.palette.text.primary,
    boxShadow: `inset 0px -1px 0px ${alpha(theme.palette.divider, 0.6)}`, // Subtle bottom border
    zIndex: theme.zIndex.drawer + 1, // Keep above permanent desktop drawer
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    // Desktop: Positioned next to the drawer
    [theme.breakpoints.up('md')]: {
        width: `calc(100% - ${DESKTOP_DRAWER_WIDTH}px)`,
        marginLeft: `${DESKTOP_DRAWER_WIDTH}px`,
    },
    // Mobile: Full width
    [theme.breakpoints.down('md')]: {
        width: '100%',
        marginLeft: 0,
    },
}));

// **Toolbar** - Ensure consistent height and padding
const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minHeight: APP_BAR_HEIGHT,
}));

// **Sidebar/Drawer Components**
const SidebarHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(0, 2), // Consistent padding
    minHeight: APP_BAR_HEIGHT, // Match AppBar height
    display: 'flex',
    alignItems: 'center',
    borderBottom: `1px solid ${theme.palette.divider}`, // Clear separator
}));

const SidebarFooter = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2), // Consistent padding
    borderTop: `1px solid ${theme.palette.divider}`, // Clear separator
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    position: 'sticky', // Keep footer visible
    bottom: 0,
    backgroundColor: theme.palette.background.paper, // Ensure background matches drawer
    zIndex: 1, // Keep above scrolling content
}));

// **IMPROVED Sidebar List Item Styles Function**
const sidebarListItemStyles = (theme, isActive, isSubItem = false, isBatchYear = false) => {
    const baseStyles = {
        margin: theme.spacing(0.5, 1.5), // Consistent vertical/horizontal margin
        padding: theme.spacing(1, 1.5), // Consistent padding
        borderRadius: theme.shape.borderRadius * 1.5, // Slightly rounded corners
        minHeight: 44, // Good touch target size
        color: theme.palette.text.secondary, // Default secondary color
        position: 'relative', // For potential future active indicators (like a left border)
        transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out', // Smooth transitions
        '&:hover': {
            backgroundColor: alpha(theme.palette.action.hover, 0.04), // Standard hover
            color: theme.palette.text.primary, // Darken text on hover
        },
        '& .MuiListItemIcon-root': {
            minWidth: 'auto',
            marginRight: theme.spacing(1.5), // Consistent icon spacing
            color: theme.palette.action.active, // Default icon color
            fontSize: '1.3rem', // Slightly larger, consistent icon size
            transition: 'color 0.2s ease-in-out',
        },
        '& .MuiListItemText-primary': {
            fontWeight: 400, // Default weight
            fontSize: '0.9rem', // Standard text size
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            transition: 'font-weight 0.2s ease-in-out',
        },
    };

    // Indentation for sub-items
    if (isSubItem) {
        baseStyles.paddingLeft = theme.spacing(5.5); // Standard indentation
        baseStyles['& .MuiListItemText-primary'].fontSize = '0.875rem'; // Slightly smaller sub-item text
        baseStyles.minHeight = 40; // Slightly smaller sub-item height
    }

    // Specific styling for Batch Year items (less emphasis)
    if (isBatchYear) {
        baseStyles.minHeight = 36;
        baseStyles.padding = theme.spacing(0.5, 1.5);
        baseStyles.paddingLeft = theme.spacing(5.5); // Keep indentation
        baseStyles.color = isActive ? theme.palette.primary.dark : theme.palette.text.secondary; // Different active color
        baseStyles.backgroundColor = isActive ? alpha(theme.palette.primary.main, 0.05) : 'transparent'; // Subtle active bg
        baseStyles['& .MuiListItemText-primary'].fontSize = '0.85rem';
        baseStyles['& .MuiListItemText-primary'].fontWeight = isActive ? 500 : 400;
        baseStyles['&:hover'] = { // Specific hover for batch items if needed
            backgroundColor: alpha(theme.palette.text.primary, 0.04),
            color: theme.palette.text.primary,
        };
        // Override general active styles for batch items
        if (isActive) {
            baseStyles['& .MuiListItemIcon-root'].color = theme.palette.primary.dark; // Match text color
        }
         // No icon for batch years, so icon styling is less relevant here
    } else if (isActive) {
        // Active state styles for REGULAR items
        baseStyles.color = theme.palette.primary.main;
        baseStyles.backgroundColor = alpha(theme.palette.primary.main, 0.08); // Standard active bg
        baseStyles['& .MuiListItemIcon-root'].color = theme.palette.primary.main; // Active icon color
        baseStyles['& .MuiListItemText-primary'].fontWeight = 600; // Bold active text
    }

    return baseStyles;
};


// **IMPROVED Notification Popover Styles**
const NotificationItem = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'read',
})(({ theme, read }) => ({
    alignItems: 'flex-start', // Align items to the top for multi-line text
    padding: theme.spacing(1.5, 2), // Consistent padding
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.1), // Clearer unread bg
    borderLeft: read ? '4px solid transparent' : `4px solid ${theme.palette.primary.main}`, // Prominent unread indicator
    transition: 'background-color 0.2s ease, border-color 0.2s ease',
    '&:hover': {
        backgroundColor: alpha(theme.palette.action.hover, 0.06), // Slightly stronger hover
    },
    '& .MuiListItemText-root': {
        marginTop: 0,
        marginBottom: 0,
        minWidth: 0,
        overflow: 'hidden',
    },
    '& .notification-primary': { // Custom class for primary content wrapper
        display: 'flex',
        alignItems: 'baseline',
        width: '100%',
        overflow: 'hidden',
        marginBottom: theme.spacing(0.5), // Space between title line and secondary
    },
    '& .notification-category': { // Custom class for category
        fontWeight: 600,
        mr: 0.75,
        textTransform: 'capitalize',
        whiteSpace: 'nowrap',
        flexShrink: 0,
        fontSize: '0.875rem', // Slightly smaller category
    },
    '& .notification-title': { // Custom class for title
        fontWeight: read ? 400 : 600, // Bold unread title
        fontSize: '0.9rem',
        lineHeight: 1.35,
        color: 'text.primary',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        flexGrow: 1,
        minWidth: 0,
    },
    '& .MuiListItemText-secondary': { // Container for message and meta
        display: 'flex',
        flexDirection: 'column',
        fontSize: '0.8rem',
        color: theme.palette.text.secondary,
        lineHeight: 1.4,
    },
    '& .notification-message': { // Custom class for message
        whiteSpace: 'normal', // Allow wrapping for message
        overflow: 'hidden',
        // textOverflow: 'ellipsis', // Might hide too much if wrapping
        display: '-webkit-box',
        '-webkit-line-clamp': '2', // Limit message to 2 lines
        '-webkit-box-orient': 'vertical',
        marginBottom: theme.spacing(0.75), // More space before meta
        color: theme.palette.text.primary, // Slightly darker message
    },
    '& .notification-meta': { // Custom class for meta info row
        fontSize: '0.75rem',
        color: theme.palette.text.disabled, // Use disabled color for meta
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(0.75),
    },
}));

// Consistent category color logic
const getCategoryChipColor = (category, theme) => {
    // ... (keep existing logic)
    const catLower = category?.toLowerCase() || 'general';
    switch (catLower) {
        case 'important': return { bgcolor: alpha(theme.palette.error.main, 0.1), color: theme.palette.error.dark };
        case 'academic': return { bgcolor: alpha(theme.palette.info.main, 0.1), color: theme.palette.info.dark };
        case 'event': return { bgcolor: alpha(theme.palette.warning.main, 0.1), color: theme.palette.warning.dark };
        case 'discussion': return { bgcolor: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.dark };
        case 'general': return { bgcolor: theme.palette.grey[200], color: theme.palette.text.secondary };
        case 'other': return { bgcolor: alpha(theme.palette.secondary.main, 0.1), color: theme.palette.secondary.dark };
        default: return { bgcolor: theme.palette.grey[100], color: theme.palette.text.disabled };
    }
};

// **Profile Menu Header**
const ProfileMenuHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2), // Consistent padding
    pointerEvents: 'none', // Not interactive
    borderBottom: `1px solid ${theme.palette.divider}`,
    marginBottom: theme.spacing(0.5), // Space before menu items
}));

// **Styled Bottom Navigation Action** (for finer control)
const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({
    minWidth: 'auto', // Allow items to shrink naturally
    padding: theme.spacing(0.75, 1, 1), // Consistent padding (top, sides, bottom)
    '& .MuiBottomNavigationAction-label': {
        fontSize: '0.7rem', // Standard small label size
        marginTop: '2px', // Ensure consistent spacing between icon and label
        '&.Mui-selected': { // Make selected label slightly bolder
            fontWeight: 500,
        }
    },
    // Active state styling
    '&.Mui-selected': {
        color: theme.palette.primary.main,
        // Optional: Add subtle background on active?
        // backgroundColor: alpha(theme.palette.primary.main, 0.05),
        // borderRadius: theme.shape.borderRadius,
    },
}));


// --- End Styles ---


// --- Navigation Data ---
const deptNavItems = [
    // ... (keep existing items)
    { label: 'Overview', path: '/dept/overview', icon: <BusinessIcon /> },
    { label: 'Teachers', path: '/dept/teachers', icon: <PeopleIcon /> },
    { label: 'Students', path: '/dept/students', icon: <SchoolIcon /> },
    { label: 'Alumni', path: '/dept/alumni', icon: <PeopleIcon /> },
    { label: 'Materials', path: '/dept/materials', icon: <FolderIcon /> },
];

const mobileBottomNavItems = [
     // ... (keep existing items)
    { label: 'Dashboard', value: '/dashboard', path: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Department', value: '/dept', path: '/dept/overview', icon: <BusinessIcon /> },
    { label: 'Profile', value: '/profile', path: '/profile', icon: <AccountCircle /> },
    // Consider if 'More' is truly needed if Temporary Drawer handles everything else
    // { label: 'More', value: 'more', icon: <MoreHorizIcon /> },
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
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [senderInfo, setSenderInfo] = useState({});
    const [markingRead, setMarkingRead] = useState(false);

    // Drawer Submenu States - Initial state based on current path
    const [deptSubmenuOpen, setDeptSubmenuOpen] = useState(location.pathname.startsWith('/dept'));
    const [batchSubmenuOpen, setBatchSubmenuOpen] = useState(location.pathname.startsWith('/batch'));

     // Update submenu state if path changes *after* initial load
     useEffect(() => {
        setDeptSubmenuOpen(location.pathname.startsWith('/dept'));
        setBatchSubmenuOpen(location.pathname.startsWith('/batch'));
    }, [location.pathname]);


    // --- Derived states ---
    const isProfileMenuOpen = Boolean(profileAnchorEl);
    const isNotificationPopoverOpen = Boolean(notificationAnchorEl);
    const currentPath = location.pathname;

    // --- Firebase Hooks & Fetching ---
    const fetchSenderInfo = useCallback(async (senderId) => {
        // ... (keep existing fetch logic)
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
         // ... (keep existing notification fetching logic)
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

             setNotifications(fetchedNotifications);

             if (loadingNotifications) { // Only set loading false on first successful fetch
                 setLoadingNotifications(false);
             }

             // Fetch sender info if needed
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
                 setLoadingNotifications(false);
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
     }, [userId, fetchSenderInfo]);

    const batchYears = useMemo(() => {
        // ... (keep existing batch year generation)
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
    const handleDrawerToggle = useCallback(() => setMobileOpen(prev => !prev), []);

    const handleDeptSubmenuToggle = useCallback(() => setDeptSubmenuOpen(prev => !prev), []);
    const handleBatchSubmenuToggle = useCallback(() => setBatchSubmenuOpen(prev => !prev), []);

    // Centralized Navigation Handler (closes menus/drawers)
    const handleNavigate = useCallback((path) => {
        if (path && typeof path === 'string') {
            navigate(path);
        } else {
            console.warn('handleNavigate called with invalid path:', path);
            return; // Don't close menus if navigation didn't happen
        }
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        if (mobileOpen) { // Only close mobile drawer if it's open
            setMobileOpen(false);
        }
    }, [navigate, handleProfileMenuClose, handleNotificationPopoverClose, mobileOpen, setMobileOpen]);

    // Specific navigation handlers use the central handler
    const handleGoToDashboard = useCallback(() => handleNavigate('/dashboard'), [handleNavigate]);
    const handleBatchYearClick = useCallback((year) => handleNavigate(`/batch?year=${year}`), [handleNavigate]);
    const handleDeptItemClick = useCallback((path) => handleNavigate(path), [handleNavigate]);
    const handleProfileClick = useCallback(() => handleNavigate('/profile'), [handleNavigate]);
    const handleSettingsClick = useCallback(() => handleNavigate('/settings'), [handleNavigate]);
    const handleAdminPanelClick = useCallback(() => handleNavigate('/admin'), [handleNavigate]);
    const handleViewAllNotificationsClick = useCallback(() => handleNavigate('/notifications'), [handleNavigate]);
    const handleSupportClick = useCallback(() => handleNavigate('/support'), [handleNavigate]);

    const handleLogout = useCallback(async () => {
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        if (mobileOpen) { // Only close mobile drawer if it's open
             setMobileOpen(false);
        }
        try {
            await auth.signOut();
            // Optional: Explicitly navigate to login after sign out
            // navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
            // Maybe show a snackbar error to the user
        }
    }, [handleProfileMenuClose, handleNotificationPopoverClose, mobileOpen, setMobileOpen]); // Updated dependencies

    // --- Notification Actions ---
    const markNotificationAsRead = useCallback(async (notificationId) => {
        // ... (keep existing logic)
         if (!userId || !notificationId) return;
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        try {
            await setDoc(notificationRef, {
                read: true,
                readTimestamp: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Navbar: Error marking notification as read:", error);
        }
    }, [userId]);

    const handleNotificationItemClick = useCallback((notification) => {
        // ... (keep existing logic, maybe slight tweak for optimistic update)
         handleNotificationPopoverClose();
        if (notification && notification.id) {
            if (!notification.read) {
                 // Mark as read optimistically for faster UI feedback. Listener will confirm.
                 setNotifications(prev => prev.map(n => n.id === notification.id ? {...n, read: true} : n));
                 setTotalUnreadCount(prev => Math.max(0, prev -1)); // Decrement count optimistically
                 markNotificationAsRead(notification.id); // Still call the backend update
            }
            navigate(`/notifications#${notification.id}`);
        } else {
            console.warn('handleNotificationItemClick called with invalid notification:', notification);
            navigate('/notifications');
        }
    }, [handleNotificationPopoverClose, markNotificationAsRead, navigate, userId]);

    const handleMarkAllAsRead = useCallback(async () => {
        // ... (keep existing logic, maybe refine UI update)
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
            // Optimistic UI update (listener will eventually sync, but this is faster)
            setNotifications(prev => prev.map(n => n.read ? n : {...n, read: true}));
            setTotalUnreadCount(0);
        } catch (error) {
            console.error("Navbar: Error in mark all as read batch operation:", error);
            // Consider showing a user-facing error message
        } finally {
             // Ensure markingRead is set to false even if listener is slow
             setTimeout(() => setMarkingRead(false), 300);
        }
    }, [userId, markingRead, totalUnreadCount]);

    // --- Helper functions for sidebar active state ---
    const isNavItemActive = useCallback((path) => path && currentPath === path, [currentPath]);
    const isBatchActive = useCallback((year) => currentPath === `/batch?year=${year}`, [currentPath]);
     // Helper to check if *any* sub-item of a section is active (for parent item styling)
    const isSubmenuActive = useCallback((basePath) => currentPath.startsWith(basePath), [currentPath]);

    // --- **Memoized Drawer Content** (Used by both Desktop Permanent and Mobile Temporary Drawers) ---
    const drawerContent = useMemo(() => {
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
                <Box sx={{ flexGrow: 1, overflowY: 'auto', pt: 1, '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.action.hover, borderRadius: '3px' }, scrollbarWidth: 'thin', scrollbarColor: `${theme.palette.action.hover} transparent` }}>
                    <List component="nav" sx={{ px: 1 }} >
                        {/* Dashboard */}
                        <ListItemButton onClick={handleGoToDashboard} sx={sidebarListItemStyles(theme, isNavItemActive('/dashboard'))}>
                            <ListItemIcon><DashboardIcon /></ListItemIcon>
                            <ListItemText primary="Dashboard" />
                        </ListItemButton>

                        {/* Department (Collapsible) - Active state considers children */}
                        <ListItemButton onClick={handleDeptSubmenuToggle} sx={sidebarListItemStyles(theme, isSubmenuActive('/dept'))}>
                            <ListItemIcon><BusinessIcon /></ListItemIcon>
                            <ListItemText primary="Department" />
                            {deptSubmenuOpen ? <ExpandLess sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} /> : <ExpandMore sx={{fontSize: '1.3rem', color: 'text.secondary', ml: 1}} />}
                        </ListItemButton>
                        <Collapse in={deptSubmenuOpen} timeout="auto" unmountOnExit>
                            <List component="div" disablePadding sx={{ py: 0.5 }}>
                                {deptNavItems.map((item) => (
                                    <ListItemButton key={item.label} onClick={() => handleDeptItemClick(item.path)} sx={sidebarListItemStyles(theme, isNavItemActive(item.path), true)}>
                                        {/* No icon for subitems for cleaner look */}
                                        <ListItemText primary={item.label} />
                                    </ListItemButton>
                                ))}
                            </List>
                        </Collapse>

                         {/* Batch (Collapsible) - Active state considers children */}
                         <ListItemButton onClick={handleBatchSubmenuToggle} sx={sidebarListItemStyles(theme, isSubmenuActive('/batch'))}>
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
                                         sx={sidebarListItemStyles(theme, isBatchActive(year), true, true)} // Pass isBatchYear=true
                                     >
                                         <ListItemText primary={year} />
                                     </ListItemButton>
                                 ))}
                             </List>
                         </Collapse>

                        {/* Divider */}
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
                    {/* Make entire user section clickable */}
                    <Tooltip title="View Profile" placement="top">
                        <Box
                            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, overflow: 'hidden', cursor: 'pointer', flexGrow: 1, borderRadius: theme.shape.borderRadius, p: 0.5, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.04)} }}
                            onClick={handleProfileClick}
                        >
                            <Avatar sx={{ width: 40, height: 40 }} alt={userName || ''}>
                                {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                            </Avatar>
                            <Box sx={{ overflow: 'hidden' }}>
                                <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, lineHeight: 1.3, color: 'text.primary' }}>
                                    {userName || 'User Name'}
                                </Typography>
                                <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block', lineHeight: 1.2 }}>
                                    {user?.email || '...'}
                                </Typography>
                            </Box>
                        </Box>
                    </Tooltip>
                    {/* Logout Button */}
                    <Tooltip title="Logout">
                         <IconButton onClick={handleLogout} size="medium" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}>
                             <LogoutIcon />
                         </IconButton>
                    </Tooltip>
                </SidebarFooter>
            </Box>
        )
    }, [
        user, userName, isAdmin, theme, currentPath, // Core dependencies
        handleGoToDashboard, handleProfileClick, handleSettingsClick, handleAdminPanelClick, handleLogout, handleSupportClick, // Action handlers
        handleDeptSubmenuToggle, handleBatchSubmenuToggle, handleDeptItemClick, handleBatchYearClick, // Navigation handlers
        deptSubmenuOpen, batchSubmenuOpen, deptNavItems, batchYears, // State & Data for menus
        isNavItemActive, isBatchActive, isSubmenuActive // Active state helpers
    ]);

    // --- **Memoized Notification Popover Content** ---
    const notificationPopoverContent = useMemo(() => {
        const showViewAllButton = !loadingNotifications && notifications.length === NOTIFICATION_LIMIT;

        return (
            <>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }} >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Notifications</Typography>
                    {notifications.length > 0 && totalUnreadCount > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            color="primary"
                            size="small"
                            disabled={markingRead}
                            startIcon={markingRead ? <CircularProgress size={14} color="inherit" /> : <MarkChatReadIcon fontSize='small' />}
                            sx={{ textTransform: 'none', fontWeight: 500, py: 0.25, px: 1, ml: 1 }}
                        >
                            Mark all read
                        </Button>
                    )}
                </Box>

                {/* Scrollable Content Area - Improved Scrollbar Styling */}
                 <Box sx={{
                    flexGrow: 1, overflowY: 'auto',
                    maxHeight: { xs: '60vh', sm: 'calc(100vh - 200px)' }, // Adjusted max height
                    '&::-webkit-scrollbar': { width: '6px' },
                    '&::-webkit-scrollbar-track': { backgroundColor: 'transparent', borderRadius: '3px' },
                    '&::-webkit-scrollbar-thumb': { backgroundColor: theme.palette.action.hover, borderRadius: '3px' },
                    '&::-webkit-scrollbar-thumb:hover': { backgroundColor: theme.palette.action.selected },
                    scrollbarWidth: 'thin',
                    scrollbarColor: `${theme.palette.action.hover} transparent`,
                }} >
                    {/* Loading Indicator */}
                    {loadingNotifications && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: 150 }}>
                            <CircularProgress size={24} />
                        </Box>
                    )}

                    {/* Notifications List */}
                    {!loadingNotifications && notifications.length > 0 && (
                        <List disablePadding sx={{ py: 0.5 }}>
                            {notifications.map((notification, index) => {
                                const isRead = !!notification.read;
                                // Sender display logic (keep existing)
                                let senderDisplayName = "System";
                                // ... (rest of sender name logic) ...
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
                                                disableTypography // Allow custom layout below
                                                primary={
                                                    <Box className="notification-primary">
                                                        {notification.category && (
                                                            <Typography component="span" variant="body2" className="notification-category" sx={{ color: categoryColor }}>
                                                                {notification.category}:
                                                            </Typography>
                                                        )}
                                                        <Typography component="span" className="notification-title">
                                                            {notification.title || 'Notification'}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        <Typography component="span" variant="body2" className="notification-message">
                                                            {notification.message || "No message content."}
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
                                                            <Box component="span" sx={{ mx: 0.5 }}>•</Box>
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
                                            <Divider component="li" variant="inset" sx={{ ml: `calc(${theme.spacing(2)} + 4px)`, mr: theme.spacing(1) }}/> // Align divider with text
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    )}

                     {/* Improved "No Notifications" Message */}
                    {!loadingNotifications && notifications.length === 0 && (
                        <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: 150, textAlign: 'center' }}>
                             <InfoOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1.5 }} />
                            <Typography sx={{ color: 'text.secondary', fontStyle: 'italic' }} variant="body2">
                                You're all caught up!
                            </Typography>
                            <Typography sx={{ color: 'text.disabled', fontSize: '0.8rem', mt: 0.5 }} variant="caption">
                                No new notifications right now.
                            </Typography>
                        </Box>
                    )}
                 </Box> {/* End Scrollable Content Area */}

                 {/* Footer / View All Button */}
                 {showViewAllButton && (
                    <Box sx={{ textAlign: 'center', py: 1, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
                        <Button
                            onClick={handleViewAllNotificationsClick}
                            size="small"
                            fullWidth // Make button fill width for better click target
                            startIcon={<ReadMoreIcon fontSize='small'/>}
                            sx={{ textTransform: 'none', fontWeight: 500, color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.04) }}}
                        >
                            View All Notifications
                        </Button>
                    </Box>
                )}
            </>
        )
    }, [
        loadingNotifications, notifications, senderInfo, totalUnreadCount, markingRead, // Data and state
        handleNotificationItemClick, handleMarkAllAsRead, handleViewAllNotificationsClick, // Handlers
        theme // Theme for styling
    ]);

    // --- Determine active value for Bottom Navigation ---
     const getMobileNavValue = useCallback(() => {
        // Prioritize exact match
        const exactMatch = mobileBottomNavItems.find(item => item.path && currentPath === item.path);
        if (exactMatch) return exactMatch.value;

        // Handle nested paths - find the base path item
        const nestedMatch = mobileBottomNavItems.find(item => item.value !== '/' && item.path && currentPath.startsWith(item.path));
         if (nestedMatch) return nestedMatch.value;

         // Fallback (e.g., if on a path not represented, maybe highlight dashboard or nothing)
        // If dashboard is the default/fallback:
        // if (currentPath.startsWith('/')) return '/dashboard';

        return false; // No match or specific fallback
     }, [currentPath]); // Depends only on currentPath
     const mobileNavValue = getMobileNavValue();

    // --- Main Render ---
    return (
        <Box sx={{ display: 'flex' }}> {/* Root element */}

            {/* AppBar */}
            <StyledAppBar position="fixed">
                <StyledToolbar>
                    {/* Left Side: Hamburger (Mobile Only) & Title */}
                    <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0, flexGrow: { xs: 1, md: 0 } }}> {/* Allow title to grow on mobile */}
                         {/* Hamburger Icon - Mobile Only */}
                         {user && isMobile && (
                            <IconButton
                                color="inherit"
                                aria-label="open drawer"
                                edge="start"
                                onClick={handleDrawerToggle}
                                sx={{ mr: 1.5 }} // Consistent margin
                            >
                                <MenuIcon />
                            </IconButton>
                         )}

                         {/* Title - Show only on Mobile (Logo is in sidebar on desktop) */}
                         {isMobile && (
                            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
                                MEmento
                            </Typography>
                         )}
                    </Box>

                    {/* Right Side: Icons (Notifications, Profile Menu) / Login Button */}
                    {user ? ( // User is logged in
                        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center">
                             {/* Notifications Icon & Popover */}
                             <Tooltip title="Notifications">
                                 <IconButton
                                     id="notification-button"
                                     color="inherit" // Inherits text color from AppBar
                                     onClick={handleNotificationPopoverOpen}
                                     aria-haspopup="true" aria-controls={isNotificationPopoverOpen ? 'notification-popover' : undefined} aria-expanded={isNotificationPopoverOpen ? 'true' : undefined}
                                 >
                                    <Badge badgeContent={totalUnreadCount} color="error" max={99}>
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
                                 transitionDuration={200} // Faster transition
                                 disableRestoreFocus // Prevents focus issues on close
                                 disableScrollLock // Allows background interaction
                                 slotProps={{
                                    paper: {
                                        elevation: 0, // Use border/shadow instead of elevation level
                                        sx: {
                                            mt: 1.5,
                                            boxShadow: theme.shadows[6], // Defined shadow
                                            borderRadius: '12px', // Consistent rounded corners
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
                                     color="inherit"
                                     aria-haspopup="true" aria-controls={isProfileMenuOpen ? 'profile-menu' : undefined} aria-expanded={isProfileMenuOpen ? 'true' : undefined} sx={{ p: 0 }}
                                 >
                                    {/* Use fetched profile picture if available, fallback to Avatar */}
                                    <Avatar
                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main, width: 34, height: 34, fontSize: '0.9rem', fontWeight: 500 }}
                                        alt={userName || ''}
                                        src={userProfile?.basicInfo?.profileImageUrl || undefined} // Use profile image URL if present
                                    >
                                        {/* Fallback to initials if no image */}
                                        {!userProfile?.basicInfo?.profileImageUrl && userName ? userName.charAt(0).toUpperCase() : <AccountCircle sx={{ fontSize: '1.8rem'}}/>}
                                    </Avatar>
                                 </IconButton>
                             </Tooltip>
                             <Menu
                                id="profile-menu"
                                anchorEl={profileAnchorEl}
                                open={isProfileMenuOpen}
                                onClose={handleProfileMenuClose}
                                disableScrollLock
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                                slotProps={{ // Use slotProps for Paper styling consistency
                                     paper: {
                                         elevation: 0,
                                         sx: {
                                             mt: 1.5, minWidth: 220, // Slightly wider
                                             boxShadow: theme.shadows[4], borderRadius: theme.shape.borderRadius * 1.5, // Consistent radius
                                             border: `1px solid ${theme.palette.divider}`,
                                             overflow: 'visible', // Allow potential pseudo-elements if needed
                                             // Optional: Add arrow pointing to anchor
                                             // '&:before': { content: '""', display: 'block', position: 'absolute', top: 0, right: 14, width: 10, height: 10, bgcolor: 'background.paper', transform: 'translateY(-50%) rotate(45deg)', zIndex: 0, borderTop: `1px solid ${theme.palette.divider}`, borderLeft: `1px solid ${theme.palette.divider}` },
                                         },
                                     }
                                }}
                             >
                                 {userName && ( // Display header only if user info is available
                                    <ProfileMenuHeader>
                                         <Typography variant="subtitle2" fontWeight="600" noWrap>{userName}</Typography>
                                         <Typography variant="caption" color="text.secondary" noWrap>{user?.email}</Typography>
                                    </ProfileMenuHeader>
                                )}
                                {/* Use consistent font size for menu items */}
                                <MenuItem onClick={handleProfileClick} sx={{ fontSize: '0.9rem' }}> <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon> Edit Profile </MenuItem>
                                <MenuItem onClick={handleSettingsClick} sx={{ fontSize: '0.9rem' }}> <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon> Settings </MenuItem>
                                <MenuItem onClick={handleSupportClick} sx={{ fontSize: '0.9rem' }}> <ListItemIcon><SupportAgentIcon fontSize="small" /></ListItemIcon> Support </MenuItem>
                                {isAdmin && ( <MenuItem onClick={handleAdminPanelClick} sx={{ fontSize: '0.9rem' }}> <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon> Admin Panel </MenuItem> )}
                                <Divider sx={{ my: 0.5 }} />
                                <MenuItem onClick={handleLogout} sx={{ color: 'error.main', fontSize: '0.9rem' }}> <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Sign Out </MenuItem>
                             </Menu>
                        </Stack>
                    ) : ( // User is logged out
                        <Button
                            color="primary"
                            onClick={() => navigate('/login')} // Simple navigation
                            variant="contained" // Prominent login action
                            size="small"
                            disableElevation // Cleaner look
                        >
                            Login
                        </Button>
                    )}
                </StyledToolbar>
            </StyledAppBar>

             {/* Navigation Drawers (Render only if user is logged in) */}
             {user && (
                <Box
                    component="nav"
                    sx={{ width: { md: DESKTOP_DRAWER_WIDTH }, flexShrink: { md: 0 } }}
                    aria-label="main navigation"
                >
                    {/* Temporary Drawer (Mobile) */}
                    <Drawer
                        variant="temporary"
                        anchor="left"
                        open={mobileOpen}
                        onClose={handleDrawerToggle} // Close on backdrop click
                        ModalProps={{ keepMounted: true }} // Better open performance
                        sx={{
                            display: { xs: 'block', md: 'none' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: MOBILE_DRAWER_WIDTH,
                                bgcolor: 'background.paper',
                                borderRight: 'none', // Usually no border needed for temp drawer
                                boxShadow: theme.shadows[2], // Add shadow for elevation
                            },
                        }}
                    >
                        {drawerContent} {/* REUSE the drawer content */}
                    </Drawer>

                    {/* Permanent Drawer (Desktop) */}
                    <Drawer
                        variant="permanent"
                        anchor="left"
                        open // Always open
                        sx={{
                            display: { xs: 'none', md: 'block' },
                            '& .MuiDrawer-paper': {
                                boxSizing: 'border-box',
                                width: DESKTOP_DRAWER_WIDTH,
                                borderRight: `1px solid ${theme.palette.divider}`, // Keep border for desktop separation
                                bgcolor: 'background.paper',
                            },
                        }}
                    >
                        {drawerContent} {/* REUSE the drawer content */}
                    </Drawer>
                </Box>
             )}

            {/* Mobile Bottom Navigation */}
            {user && isMobile && (
                <AppBar
                    position="fixed"
                    sx={{
                        top: 'auto', // Position at bottom
                        bottom: 0,
                        zIndex: theme.zIndex.appBar, // Standard z-index for bottom nav
                        bgcolor: 'background.paper', // Match theme
                        boxShadow: `inset 0px 1px 0px ${alpha(theme.palette.divider, 0.6)}`, // Subtle top border instead of box shadow
                     }}
                 >
                     <BottomNavigation
                        sx={{ height: MOBILE_BOTTOM_NAV_HEIGHT }} // Ensure consistent height
                        value={mobileNavValue}
                        onChange={(event, newValue) => {
                            const selectedItem = mobileBottomNavItems.find(item => item.value === newValue);
                            if (selectedItem?.path) { // Check if path exists
                                handleNavigate(selectedItem.path);
                            } else {
                                console.warn(`BottomNav: No path found for value: ${newValue}`);
                                // Potentially open drawer if 'more' was clicked, or handle other actions
                            }
                        }}
                        showLabels // Always show labels for clarity
                    >
                        {mobileBottomNavItems.map((item) => (
                            // Use the styled component for consistent styling
                            <StyledBottomNavigationAction
                                key={item.value}
                                label={item.label}
                                value={item.value}
                                icon={item.icon}
                            />
                        ))}
                    </BottomNavigation>
                 </AppBar>
            )}

             {/* =================================================================== */}
             {/* Main Content Area defined in Parent Layout Component (e.g., MainLayout.js) */}
             {/* Ensure the Layout component correctly calculates offsets for AppBar, Desktop Drawer, and Mobile BottomNav */}
             {/* =================================================================== */}

        </Box> /* End Root Box */
    );
}

export default Navbar;