/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Navbar.js

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    AppBar, Toolbar, Typography, Button, Menu, MenuItem, Avatar, IconButton,
    Box, Tooltip, Stack, List, ListItem, ListItemText, ListItemButton, ListItemIcon,
    Divider, Badge, styled, Drawer, useTheme, useMediaQuery, alpha,
    Collapse, CircularProgress, Popover
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications';
import AccountCircle from '@mui/icons-material/AccountCircle';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MarkChatReadIcon from '@mui/icons-material/MarkChatRead';
import BusinessIcon from '@mui/icons-material/Business';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import ReadMoreIcon from '@mui/icons-material/ReadMore'; // Added for View All button

import {
    collection, query, orderBy, onSnapshot, doc, writeBatch,
    serverTimestamp, getDoc, setDoc, limit, where, getDocs
} from 'firebase/firestore';
import { useAuth } from '../auth/PrivateRoute';
import { formatDistanceToNow } from 'date-fns';

// --- Constants ---
const DRAWER_WIDTH = 280;
const NOTIFICATION_POPOVER_WIDTH = 380;
const NOTIFICATION_LIMIT = 7; // Max notifications to fetch AND display in dropdown
const BATCH_START_YEAR = 2016;

// --- Firestore Data Structure Note ---
// User Subcollection: 'users/{userId}/notifications/{notificationId}'
// Fields: title, message, link, category, audienceType, audienceTarget, senderName, senderStudentId, timestamp,
//         read, readTimestamp, createdAt, reacted, commented, shared ...
// ------------------------------------

// --- Styles ---
const StyledAppBar = styled(AppBar)(({ theme }) => ({
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    boxShadow: theme.shadows[2],
}));

const StyledToolbar = styled(Toolbar)(({ theme }) => ({
    display: 'flex',
    justifyContent: 'space-between',
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    minHeight: 64,
}));

const LogoTypography = styled(Typography)(({ theme }) => ({
    cursor: 'pointer',
    fontWeight: 600,
    color: 'inherit',
    '&:hover': {
        opacity: 0.9,
    },
}));

// Updated NotificationItem style with lighter hover effect
const NotificationItem = styled(ListItemButton, {
    shouldForwardProp: (prop) => prop !== 'read',
})(({ theme, read }) => ({
    alignItems: 'flex-start',
    padding: theme.spacing(1.5, 2),
    backgroundColor: read ? 'transparent' : alpha(theme.palette.primary.light, 0.08),
    borderLeft: read ? 'none' : `3px solid ${theme.palette.primary.main}`,
    '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.05) }, // Reduced alpha for lighter hover
    '& .MuiListItemText-root': { marginTop: 0, marginBottom: 0, minWidth: 0, overflow: 'hidden' },
    // **MODIFIED**: Updated secondary text styling for single-line description
    '& .MuiListItemText-secondary': {
        display: 'flex', flexDirection: 'column', fontSize: '0.8rem', color: theme.palette.text.secondary,
        '& .notification-message': {
            // Make description single line with ellipsis
            lineHeight: 1.4,
            whiteSpace: 'nowrap', // Prevent wrapping
            overflow: 'hidden',   // Hide overflow
            textOverflow: 'ellipsis', // Show ellipsis
            marginBottom: theme.spacing(0.5),
            color: theme.palette.text.primary,
        },
        '& .notification-meta': {
            fontSize: '0.75rem', color: theme.palette.text.disabled, whiteSpace: 'nowrap',
            overflow: 'hidden', textOverflow: 'ellipsis',
            display: 'flex', alignItems: 'center', gap: theme.spacing(0.75),
        }
    },
}));

// Helper function to get category colors (now only text color is primarily used)
const getCategoryChipColor = (category, theme) => {
    const catLower = category?.toLowerCase() || 'general';
    switch (catLower) {
        case 'important': // Error/Red
            return { bgcolor: theme.palette.error.light, color: theme.palette.error.dark }; // Using darker text for contrast
        case 'academic': // Info/Blue
            return { bgcolor: theme.palette.info.light, color: theme.palette.info.dark };
        case 'event': // Warning/Orange
            return { bgcolor: theme.palette.warning.light, color: theme.palette.warning.dark };
        case 'discussion': // Success/Green
            return { bgcolor: theme.palette.success.light, color: theme.palette.success.dark };
        case 'general': // Grey
            return { bgcolor: theme.palette.grey[300], color: theme.palette.text.secondary };
        case 'other': // Secondary/Purple
            return { bgcolor: theme.palette.secondary.light, color: theme.palette.secondary.dark };
        default: // Default Grey
            return { bgcolor: theme.palette.grey[200], color: theme.palette.text.secondary };
    }
};

const DropdownButton = styled(Button)(({ theme }) => ({
    color: 'inherit',
    textTransform: 'none',
    fontWeight: 400,
    padding: theme.spacing(0.5, 1.5),
    '& .MuiButton-endIcon': { marginLeft: theme.spacing(0.5) },
    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' }
}));

const DrawerHeader = styled(Box, {
     shouldForwardProp: (prop) => prop !== 'bgImage',
 })(({ theme, bgImage }) => ({
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    justifyContent: 'flex-end',
    padding: theme.spacing(2),
    minHeight: 160,
    backgroundColor: theme.palette.primary.main, // Fallback
    color: theme.palette.primary.contrastText,
    background: bgImage ? `linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.6)), url(${bgImage})` : theme.palette.primary.main,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
}));

const DrawerUsername = styled(Typography)(({ theme }) => ({
    fontWeight: 600,
    color: 'inherit',
    textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
}));

const DrawerEmail = styled(Typography)(({ theme }) => ({
    color: 'rgba(255, 255, 255, 0.8)',
    textShadow: '1px 1px 1px rgba(0,0,0,0.4)',
    fontSize: '0.8rem',
}));

const ProfileMenuHeader = styled(Box)(({ theme }) => ({
    padding: theme.spacing(1.5, 2),
    pointerEvents: 'none',
    borderBottom: `1px solid ${theme.palette.divider}`,
}));
// --- End Styles ---

// --- Navigation Data ---
const deptNavItems = [
    { label: 'Overview', path: '/dept/overview', icon: <BusinessIcon fontSize="small" /> },
    { label: 'Teachers', path: '/dept/teachers', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Students', path: '/dept/students', icon: <SchoolIcon fontSize="small" /> },
    { label: 'Alumni', path: '/dept/alumni', icon: <PeopleIcon fontSize="small" /> },
    { label: 'Materials', path: '/dept/materials', icon: <FolderIcon fontSize="small" /> },
];

function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, profileBg, userName, isAdmin, userProfile } = useAuth();
    const userId = user?.uid;

    // --- States ---
    const [batchAnchorEl, setBatchAnchorEl] = useState(null);
    const [deptAnchorEl, setDeptAnchorEl] = useState(null);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Notification State
    const [notifications, setNotifications] = useState([]); // Holds max NOTIFICATION_LIMIT items for display
    const [totalUnreadCount, setTotalUnreadCount] = useState(0); // Holds the total count of unread notifications
    const [loadingNotifications, setLoadingNotifications] = useState(true); // Loading state for the *displayed* list
    const [senderInfo, setSenderInfo] = useState({});
    const [markingRead, setMarkingRead] = useState(false); // State to disable button during update

    // Drawer Submenu States
    const [deptSubmenuOpen, setDeptSubmenuOpen] = useState(false);
    const [batchSubmenuOpen, setBatchSubmenuOpen] = useState(false);

    // Derived states
    const isBatchMenuOpenDesktop = Boolean(batchAnchorEl);
    const isDeptMenuOpenDesktop = Boolean(deptAnchorEl);
    const isProfileMenuOpen = Boolean(profileAnchorEl);
    const isNotificationPopoverOpen = Boolean(notificationAnchorEl);
    const onDashboard = location.pathname === '/dashboard';

    // --- Fetch Sender User Info (Fallback) - Unchanged ---
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
    }, [senderInfo]);

    // --- Fetch User Notifications & Unread Count Effect - Unchanged ---
    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setTotalUnreadCount(0); // Reset total count
            setSenderInfo({});
            setLoadingNotifications(true);
            return undefined;
        }

        setLoadingNotifications(true); // Still true initially for the display list
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

             // Optional: Ensure state fields exist (unchanged)
             const checkAndEnsureState = async (notification) => {
                 if (notification.read === undefined || notification.createdAt === undefined) {
                     console.warn(`Navbar: Notification ${notification.id} missing state fields. Ensuring state...`);
                     const notificationRef = doc(db, 'users', userId, 'notifications', notification.id);
                     try {
                         await setDoc(notificationRef, {
                             read: notification.read ?? false,
                             readTimestamp: notification.readTimestamp ?? null,
                             createdAt: notification.createdAt ?? serverTimestamp(),
                             reacted: notification.reacted ?? null,
                             commented: notification.commented ?? false,
                             shared: notification.shared ?? false,
                         }, { merge: true });
                     } catch (error) {
                         console.error(`Navbar: Error ensuring state for ${notification.id}:`, error);
                     }
                 }
             };
             fetchedNotifications.forEach(checkAndEnsureState);

            setNotifications(fetchedNotifications); // Update the displayed list

            // Stop loading indicator *for the list display* once the list is fetched
            if (loadingNotifications) {
                setLoadingNotifications(false);
            }

            // Fetch sender info if needed (unchanged logic)
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
                setLoadingNotifications(false); // Stop loading on error too
            }
        });

        // Listener 2: Fetch TOTAL UNREAD COUNT
        const unreadQuery = query(userNotificationsRef, where('read', '==', false));
        const unsubscribeCount = onSnapshot(unreadQuery, (snapshot) => {
            if (isStillMounted) {
                setTotalUnreadCount(snapshot.size); // Update the total unread count state
            }
        }, (error) => {
            console.error("Navbar: Error fetching total unread notification count:", error);
            // Optionally set an error state for the count if needed
        });


        // Cleanup function: Unsubscribe from BOTH listeners
        return () => {
            isStillMounted = false;
            unsubscribeDisplay();
            unsubscribeCount();
        };

    }, [userId, fetchSenderInfo]);


    // --- Memoized Batch Years - Unchanged ---
    const batchYears = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let year = BATCH_START_YEAR; year <= currentYear; year++) {
            years.push(year);
        }
        return years.reverse();
    }, []);

    // --- Handlers - Unchanged ---
    const handleBatchMenuOpen = useCallback((event) => setBatchAnchorEl(event.currentTarget), []);
    const handleBatchMenuClose = useCallback(() => setBatchAnchorEl(null), []);
    const handleDeptMenuOpen = useCallback((event) => setDeptAnchorEl(event.currentTarget), []);
    const handleDeptMenuClose = useCallback(() => setDeptAnchorEl(null), []);
    const handleProfileMenuOpen = useCallback((event) => setProfileAnchorEl(event.currentTarget), []);
    const handleProfileMenuClose = useCallback(() => setProfileAnchorEl(null), []);
    const handleNotificationPopoverOpen = useCallback((event) => setNotificationAnchorEl(event.currentTarget), []);
    const handleNotificationPopoverClose = useCallback(() => setNotificationAnchorEl(null), []);
    const handleDrawerToggle = useCallback(() => {
        setMobileOpen(prev => !prev);
        if (mobileOpen) {
            setDeptSubmenuOpen(false);
            setBatchSubmenuOpen(false);
        }
    }, [mobileOpen]);
    const handleDeptSubmenuToggle = useCallback(() => setDeptSubmenuOpen(prev => !prev), []);
    const handleBatchSubmenuToggle = useCallback(() => setBatchSubmenuOpen(prev => !prev), []);

    const handleNavigate = useCallback((path) => {
        navigate(path);
        setMobileOpen(false);
        setDeptSubmenuOpen(false);
        setBatchSubmenuOpen(false);
        handleBatchMenuClose();
        handleDeptMenuClose();
        handleProfileMenuClose();
        handleNotificationPopoverClose(); // Close notification popover on any navigation
    }, [navigate, handleBatchMenuClose, handleDeptMenuClose, handleProfileMenuClose, handleNotificationPopoverClose]);

    const handleGoToDashboard = useCallback(() => handleNavigate('/dashboard'), [handleNavigate]);
    const handleBatchYearClick = useCallback((year) => handleNavigate(`/batch?year=${year}`), [handleNavigate]);
    const handleDeptItemClick = useCallback((path) => handleNavigate(path), [handleNavigate]);
    const handleProfileClick = useCallback(() => handleNavigate('/profile'), [handleNavigate]);
    const handleSettingsClick = useCallback(() => handleNavigate('/settings'), [handleNavigate]);
    const handleAdminPanelClick = useCallback(() => handleNavigate('/admin'), [handleNavigate]);

    const handleLogout = useCallback(async () => {
        handleProfileMenuClose();
        handleNotificationPopoverClose();
        setMobileOpen(false);
        setDeptSubmenuOpen(false);
        setBatchSubmenuOpen(false);
        try {
            await auth.signOut();
        } catch (error) {
            console.error('Logout Error:', error);
        }
    }, [handleProfileMenuClose, handleNotificationPopoverClose]);

    const handleViewAllNotificationsClick = useCallback(() => handleNavigate('/notifications'), [handleNavigate]);

    // --- Notification Actions ---
    const markNotificationAsRead = useCallback(async (notificationId) => {
        if (!userId || !notificationId) return;
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        try {
            // Use set with merge: true instead of update to handle potential missing docs gracefully
            await setDoc(notificationRef, {
                read: true,
                readTimestamp: serverTimestamp()
            }, { merge: true });
            // Note: totalUnreadCount state will update automatically via its onSnapshot listener
        } catch (error) {
            console.error("Navbar: Error marking notification as read:", error);
        }
    }, [userId]);

    // **MODIFIED**: handleNotificationItemClick no longer navigates based on notification.link
    const handleNotificationItemClick = useCallback((notification) => {
        handleNotificationPopoverClose();
        // Mark as read if unread
        if (!notification.read) {
            markNotificationAsRead(notification.id);
        }
        // ALWAYS navigate to the notifications page, highlighting the item
        // This prevents opening the link directly from the popover.
        navigate(`/notifications#${notification.id}`);
    }, [handleNotificationPopoverClose, markNotificationAsRead, navigate]);

    // --- Mark All As Read (Unchanged Logic, just check implementation) ---
    const handleMarkAllAsRead = useCallback(async () => {
        if (!userId || markingRead || totalUnreadCount === 0) {
             // Prevent concurrent runs or running if nothing is unread
            return;
        }

        setMarkingRead(true); // Set loading state for the button
        console.log("Navbar: Attempting to mark all unread notifications as read...");

        const userNotificationsRef = collection(db, 'users', userId, 'notifications');
        // Query for all documents where 'read' is false
        const unreadQuery = query(userNotificationsRef, where('read', '==', false));

        try {
            // Use getDocs for a one-time fetch of all unread documents
            const unreadSnapshot = await getDocs(unreadQuery);

            if (unreadSnapshot.empty) {
                console.log("Navbar: No unread notifications found to mark.");
                setMarkingRead(false);
                return; // Exit if no documents were found (though totalUnreadCount should prevent this)
            }

            const batch = writeBatch(db);
            const now = serverTimestamp();
            let count = 0;

            unreadSnapshot.docs.forEach((docSnapshot) => {
                // Add an update operation to the batch for each unread document
                batch.set(docSnapshot.ref, { read: true, readTimestamp: now }, { merge: true });
                count++;
            });

            console.log(`Navbar: Committing batch to mark ${count} notifications as read.`);
            await batch.commit();
            console.log("Navbar: Batch commit successful. All unread marked as read.");
            // Note: totalUnreadCount state will update automatically via its listener after the batch commit

        } catch (error) {
            console.error("Navbar: Error in mark all as read batch operation:", error);
            // Handle error appropriately, maybe show a user message
        } finally {
            setMarkingRead(false); // Reset loading state regardless of success or failure
        }
    }, [userId, markingRead, totalUnreadCount]);


    // --- Drawer Content (Memoized - Unchanged) ---
    const drawerContent = useMemo(() => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }} role="presentation">
            <DrawerHeader bgImage={profileBg}>
                {user && (
                    <>
                        <IconButton
                            aria-label="edit profile"
                            onClick={handleProfileClick}
                            sx={{ position: 'absolute', bottom: 10, right: 10, color: 'rgba(255, 255, 255, 0.8)', '&:hover': { color: '#fff', backgroundColor: 'rgba(255, 255, 255, 0.2)' } }}
                        >
                            <EditIcon fontSize='small' />
                        </IconButton>
                        <Avatar
                            sx={{
                                bgcolor: profileBg ? 'transparent' : theme.palette.secondary.main,
                                width: 64, height: 64, fontSize: '2rem', mb: 1,
                                border: profileBg ? '2px solid rgba(255,255,255,0.5)' : 'none'
                            }}
                            alt={userName || ''}
                        >
                             {userName?.charAt(0).toUpperCase()}
                        </Avatar>
                        <DrawerUsername variant="subtitle1" noWrap>
                             {userName || 'User Name'}
                         </DrawerUsername>
                        <DrawerEmail variant="body2" noWrap>
                            {user?.email || 'user@example.com'}
                        </DrawerEmail>
                    </>
                )}
            </DrawerHeader>

            <Box sx={{ flexGrow: 1, overflowY: 'auto', '&::-webkit-scrollbar': { width: '4px' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.grey[300], borderRadius: '2px' } }}>
                <List component="nav" sx={{ p: 0 }} dense>
                    {/* Profile */}
                    <ListItemButton onClick={handleProfileClick} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><AccountCircle /></ListItemIcon>
                        <ListItemText primary="Profile" primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                    </ListItemButton>
                    <Divider light sx={{ my: 0.5 }} />

                    {/* Department */}
                    <ListItemButton onClick={handleDeptSubmenuToggle} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><PeopleIcon /></ListItemIcon>
                        <ListItemText primary="Department" primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                        {deptSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={deptSubmenuOpen} timeout="auto" unmountOnExit>
                        <List component="div" disablePadding dense>
                            {deptNavItems.map((item) => (
                                <ListItemButton key={item.label} onClick={() => handleDeptItemClick(item.path)} sx={{ pl: 4, py: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 36 }}>{item.icon}</ListItemIcon>
                                    <ListItemText primary={item.label} primaryTypographyProps={{ variant: 'body2' }} />
                                </ListItemButton>
                            ))}
                        </List>
                    </Collapse>

                    {/* Batch */}
                    <ListItemButton onClick={handleBatchSubmenuToggle} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><CalendarMonthIcon /></ListItemIcon>
                        <ListItemText primary="Batch" primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                        {batchSubmenuOpen ? <ExpandLess /> : <ExpandMore />}
                    </ListItemButton>
                    <Collapse in={batchSubmenuOpen} timeout="auto" unmountOnExit>
                        <Box sx={{ pl: 4, pr: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                            {batchYears.map((year) => (
                                <Button key={year} variant="outlined" size="small" onClick={() => handleBatchYearClick(year)} sx={{ borderRadius: '16px', minWidth: '65px', py: 0.5, textTransform: 'none' }} >
                                    {year}
                                </Button>
                            ))}
                        </Box>
                    </Collapse>
                    <Divider light sx={{ my: 0.5 }} />

                    {/* Settings */}
                    <ListItemButton onClick={handleSettingsClick} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><SettingsIcon /></ListItemIcon>
                        <ListItemText primary="Settings" primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                    </ListItemButton>

                    {/* Admin Panel */}
                    {isAdmin && (
                        <ListItemButton onClick={handleAdminPanelClick} sx={{ py: 1.5, px: 2.5 }}>
                            <ListItemIcon sx={{ minWidth: 40 }}><AdminPanelSettingsIcon /></ListItemIcon>
                            <ListItemText primary="Admin Panel" primaryTypographyProps={{ variant: 'body1', fontWeight: 500 }} />
                        </ListItemButton>
                    )}
                    <Divider light sx={{ my: 0.5 }} />

                    {/* Sign Out */}
                     <ListItemButton onClick={handleLogout} sx={{ py: 1.5, px: 2.5 }}>
                        <ListItemIcon sx={{ minWidth: 40 }}><LogoutIcon color="error" /></ListItemIcon>
                        <ListItemText primary="Sign Out" primaryTypographyProps={{ variant: 'body1', fontWeight: 500, color: 'error.main' }} />
                    </ListItemButton>
                </List>
            </Box>
        </Box>
    ), [
        user, userName, profileBg, user?.email, isAdmin, theme,
        handleProfileClick, handleSettingsClick, handleAdminPanelClick, handleLogout,
        handleDeptSubmenuToggle, handleBatchSubmenuToggle, handleDeptItemClick, handleBatchYearClick,
        deptSubmenuOpen, batchSubmenuOpen, deptNavItems, batchYears
    ]);

    // --- Notification Popover Content (Memoized - **MODIFIED** Structure for display changes) ---
    const notificationPopoverContent = useMemo(() => {
        const showViewAllButton = !loadingNotifications && notifications.length === NOTIFICATION_LIMIT;

        return (
            <>
                {/* Header */}
                <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}`, flexShrink: 0 }} >
                    <Typography variant="h6" component="div" sx={{ fontWeight: 600, fontSize: '1.1rem' }}>Notifications</Typography>
                    {notifications.length > 0 && (
                        <Button
                            onClick={handleMarkAllAsRead}
                            color="primary"
                            size="small"
                            disabled={markingRead || totalUnreadCount === 0}
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
                    // Scrollbar styling
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

                                // Get color but we'll use it differently now
                                const { color: categoryColor } = getCategoryChipColor(notification.category, theme);
                                const categoryText = notification.category ? `${notification.category.charAt(0).toUpperCase() + notification.category.slice(1)}: ` : '';

                                return (
                                    <React.Fragment key={notification.id}>
                                        <NotificationItem
                                            read={isRead}
                                            // **MODIFIED**: Click handler navigates to detail page, not link
                                            onClick={() => handleNotificationItemClick(notification)}
                                        >
                                            <ListItemText
                                                primary={
                                                    // **MODIFIED**: Wrap Category + Title in a Box for single-line layout
                                                    <Box sx={{ display: 'flex', alignItems: 'baseline', width: '100%', overflow: 'hidden' }}>
                                                        {notification.category && (
                                                            <Typography
                                                                component="span"
                                                                variant="body2" // Or caption
                                                                sx={{
                                                                    color: categoryColor, // Use determined color
                                                                    fontWeight: 600,
                                                                    mr: 0.75, // Space between category and title
                                                                    textTransform: 'capitalize',
                                                                    whiteSpace: 'nowrap', // Keep category on one line
                                                                    flexShrink: 0, // Prevent category from shrinking
                                                                }}
                                                            >
                                                                {notification.category}:
                                                            </Typography>
                                                        )}
                                                        <Typography
                                                            component="span"
                                                            sx={{
                                                                fontWeight: isRead ? 400 : 600,
                                                                fontSize: '0.9rem',
                                                                lineHeight: 1.35,
                                                                color: 'text.primary',
                                                                // Make title single line with ellipsis
                                                                whiteSpace: 'nowrap',
                                                                overflow: 'hidden',
                                                                textOverflow: 'ellipsis',
                                                                flexGrow: 1, // Allow title to take remaining space
                                                                minWidth: 0, // Required for flex ellipsis
                                                            }}
                                                        >
                                                            {notification.title || 'Notification'}
                                                        </Typography>
                                                    </Box>
                                                }
                                                secondary={
                                                    <>
                                                        {/* **MODIFIED**: Ensure description uses the single-line class */}
                                                        <Typography component="span" variant="body2" className="notification-message">
                                                            {notification.message || "..."}
                                                        </Typography>
                                                        <Typography component="div" variant="caption" className="notification-meta">
                                                            {AudienceIcon && (
                                                                <Tooltip title={audienceTooltip} placement="top" arrow>
                                                                    <span>
                                                                        <AudienceIcon
                                                                            fontSize="inherit"
                                                                            sx={{ verticalAlign: 'middle', fontSize: '0.9rem', mr: 0.5 }}
                                                                        />
                                                                    </span>
                                                                </Tooltip>
                                                            )}
                                                            <Box component="span" sx={{ flexShrink: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                {senderDisplayName}
                                                            </Box>
                                                            <Box component="span" sx={{ mx: 0.75 }}>•</Box>
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

                    {/* View All Button inside scroll area */}
                    {showViewAllButton && (
                        <Box sx={{ textAlign: 'center', py: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
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
                </Box>
            </>
        )
    }, [
        loadingNotifications, notifications, senderInfo, totalUnreadCount, markingRead,
        handleNotificationItemClick, handleMarkAllAsRead, handleViewAllNotificationsClick,
        theme // Include theme as dependency for colors/styles
    ]);

    // --- Main Render ---
    return (
        <>
            <StyledAppBar position="sticky">
                <StyledToolbar>
                    {/* Left Side */}
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                         {user && (
                            <IconButton
                                color="inherit"
                                aria-label={onDashboard ? "open drawer" : "go back to dashboard"}
                                edge="start"
                                onClick={onDashboard ? handleDrawerToggle : handleGoToDashboard}
                                sx={{ mr: { xs: 1, sm: 2 }, display: { md: 'none' } }}
                            >
                                {onDashboard ? <MenuIcon /> : <ArrowBackIcon />}
                            </IconButton>
                         )}
                         <LogoTypography
                             variant="h6"
                             onClick={handleGoToDashboard}
                             sx={{
                                 flexGrow: { xs: 1, md: 0 },
                                 display: { xs: (onDashboard && user) ? 'none' : 'block', sm: 'block' }
                             }}
                         >
                             MEmento
                         </LogoTypography>
                    </Box>

                    {/* Right Side */}
                    {user && (
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {/* Desktop Nav */}
                            <Box sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }}>
                                <Stack direction="row" spacing={0.5} alignItems="center">
                                     <DropdownButton
                                         aria-controls={isDeptMenuOpenDesktop ? 'dept-menu' : undefined}
                                         aria-haspopup="true" aria-expanded={isDeptMenuOpenDesktop ? 'true' : undefined}
                                         onClick={handleDeptMenuOpen} endIcon={<ArrowDropDownIcon />}
                                     > Department </DropdownButton>
                                     <Menu
                                        id="dept-menu"
                                        anchorEl={deptAnchorEl}
                                        open={isDeptMenuOpenDesktop}
                                        onClose={handleDeptMenuClose}
                                        // **MODIFIED**: Prevent scroll lock on body
                                        disableScrollLock={true}
                                        PaperProps={{ sx: { mt: 1.5, boxShadow: theme.shadows[4] } }}
                                      >
                                         {deptNavItems.map((item) => (
                                             <MenuItem key={item.label} onClick={() => handleDeptItemClick(item.path)} sx={{ minWidth: 160 }}>
                                                 <ListItemIcon sx={{ mr: 1, minWidth: 'auto' }}>{item.icon}</ListItemIcon> {item.label}
                                             </MenuItem>
                                         ))}
                                     </Menu>
                                     <DropdownButton
                                        aria-controls={isBatchMenuOpenDesktop ? 'batch-menu' : undefined}
                                        aria-haspopup="true" aria-expanded={isBatchMenuOpenDesktop ? 'true' : undefined}
                                        onClick={handleBatchMenuOpen} endIcon={<ArrowDropDownIcon />}
                                    > Batch </DropdownButton>
                                     <Menu
                                        id="batch-menu"
                                        anchorEl={batchAnchorEl}
                                        open={isBatchMenuOpenDesktop}
                                        onClose={handleBatchMenuClose}
                                        // **MODIFIED**: Prevent scroll lock on body
                                        disableScrollLock={true}
                                        // **MODIFIED**: Added PaperProps for styling and modern scrollbar
                                        PaperProps={{
                                            sx: {
                                                mt: 1.5,
                                                boxShadow: theme.shadows[4],
                                                maxHeight: 300, // Keep max height
                                                // Modern Scrollbar Styles
                                                '&::-webkit-scrollbar': {
                                                    width: '6px',
                                                },
                                                '&::-webkit-scrollbar-track': {
                                                    backgroundColor: 'transparent', // Or theme.palette.background.paper
                                                },
                                                '&::-webkit-scrollbar-thumb': {
                                                    backgroundColor: theme.palette.action.selected, // Adjust color as needed
                                                    borderRadius: '3px',
                                                },
                                                '&::-webkit-scrollbar-thumb:hover': {
                                                    backgroundColor: theme.palette.action.active, // Adjust hover color
                                                },
                                                // Firefox fallback
                                                scrollbarWidth: 'thin',
                                                scrollbarColor: `${theme.palette.action.selected} transparent`,
                                            }
                                        }}
                                     >
                                         {batchYears.map((year) => ( <MenuItem key={year} onClick={() => handleBatchYearClick(year)}> {year} </MenuItem> ))}
                                     </Menu>
                                </Stack>
                            </Box>

                            {/* Common Icons */}
                            <Stack direction="row" spacing={isMobile ? 0.5 : 1} alignItems="center" sx={{ ml: { xs: 0, md: 1 } }}>
                                 <Tooltip title="Notifications">
                                     <IconButton id="notification-button" color="inherit" onClick={handleNotificationPopoverOpen} aria-haspopup="true" aria-controls="notification-popover" aria-expanded={isNotificationPopoverOpen ? 'true' : undefined} >
                                        <Badge badgeContent={totalUnreadCount} color="error" max={9}>
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
                                     // **MODIFIED**: Prevent scroll lock on body
                                     disableScrollLock={true}
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
                                                maxHeight: { xs: '75vh', sm: 'calc(100vh - 100px)' },
                                                bgcolor: 'background.paper',
                                                display: 'flex',
                                                flexDirection: 'column',
                                                overflow: 'hidden', // Important for layout
                                            }
                                        }
                                    }}
                                 >
                                     {/* Render the memoized popover content */}
                                     {notificationPopoverContent}
                                 </Popover>

                                 {/* Profile (Desktop) */}
                                  <Box sx={{ display: { xs: 'none', md: 'block' } }}>
                                     <Tooltip title={userName || "Profile"}>
                                         <IconButton id="profile-button" size="small" onClick={handleProfileMenuOpen} color="inherit" aria-haspopup="true" aria-controls="profile-menu" aria-expanded={isProfileMenuOpen ? 'true' : undefined} sx={{ p: 0 }} >
                                            <Avatar sx={{ bgcolor: profileBg || theme.palette.secondary.light, width: 36, height: 36, fontSize: '1rem' }} alt={userName || ''} >
                                                {userName ? userName.charAt(0).toUpperCase() : <AccountCircle />}
                                            </Avatar>
                                         </IconButton>
                                     </Tooltip>
                                     <Menu
                                        id="profile-menu"
                                        anchorEl={profileAnchorEl}
                                        open={isProfileMenuOpen}
                                        onClose={handleProfileMenuClose}
                                        // **MODIFIED**: Prevent scroll lock on body
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
                                        {isAdmin && ( <MenuItem onClick={handleAdminPanelClick}> <ListItemIcon><AdminPanelSettingsIcon fontSize="small" /></ListItemIcon> Admin Panel </MenuItem> )}
                                        <Divider sx={{ my: 0.5 }} />
                                        <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}> <ListItemIcon><LogoutIcon fontSize="small" color="error" /></ListItemIcon> Sign Out </MenuItem>
                                     </Menu>
                                 </Box>
                            </Stack>
                        </Box>
                    )}
                     {!user && ( <Button color="inherit" onClick={() => navigate('/login')}>Login</Button> )}
                </StyledToolbar>
            </StyledAppBar>

            {/* Mobile Drawer */}
            {user && (
                <Drawer
                    variant="temporary" anchor="left" open={mobileOpen} onClose={handleDrawerToggle}
                    // Keep existing ModalProps including disableScrollLock
                    ModalProps={{ keepMounted: true, disableScrollLock: true, disableRestoreFocus: true }}
                    sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { boxSizing: 'border-box', width: DRAWER_WIDTH, borderRight: 'none', bgcolor: 'background.default' } }}
                >
                    {drawerContent}
                </Drawer>
            )}
        </>
    );
}

export default Navbar;