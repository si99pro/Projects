/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/components/Navbar.js - REDESIGNED V7 (Popovers Anchored to Same Point)

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { auth, db } from '../firebase'; // Assuming firebase config is correct
import { useAuth } from '../auth/AuthContext'; // Assuming AuthContext provides user, userName, isAdmin, userProfile
import { formatDistanceToNow } from 'date-fns';

// --- MUI Core Components ---
import {
    AppBar, Toolbar, Typography, Button, Avatar, IconButton,
    Box, Tooltip, Stack, List, ListItem, ListItemText, ListItemButton, ListItemIcon,
    Divider, Badge, styled, Drawer, useTheme, useMediaQuery, alpha,
    Collapse, CircularProgress, Popover, BottomNavigation, BottomNavigationAction,
    ListItemIcon as MuiListItemIcon // Alias to avoid conflict
} from '@mui/material';

// --- MUI Icons ---
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined'; // Department
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined'; // Batch
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkChatReadOutlinedIcon from '@mui/icons-material/MarkChatReadOutlined';
import SupportAgentOutlinedIcon from '@mui/icons-material/SupportAgentOutlined';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // For empty states
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline'; // For empty states
import LaunchIcon from '@mui/icons-material/Launch'; // Example Logo Icon

// --- Firebase Firestore ---
import {
    collection, query, orderBy, onSnapshot, doc, writeBatch,
    serverTimestamp, getDoc, setDoc, limit, where, getDocs
} from 'firebase/firestore';

// --- Constants ---
const SIDEBAR_WIDTH_DESKTOP = 260;
const SIDEBAR_WIDTH_MOBILE = 280;
const APP_BAR_HEIGHT = 64;
const MOBILE_BOTTOM_NAV_HEIGHT = 56;
const POPOVER_WIDTH = 360;
const NOTIFICATION_LIMIT = 7;
const MESSAGE_LIMIT = 5; // Placeholder limit

// --- Unified Popover Style Constants ---
const POPOVER_BORDER_RADIUS_MULTIPLIER = 1;
const POPOVER_SHADOW_INDEX = 8;

// --- Styled Components (Unchanged) ---
const StyledRoot = styled(Box)({ /* ... */ display: 'flex', minHeight: '100vh', backgroundColor: (theme) => theme.palette.background.default, });
const StyledAppBar = styled(AppBar)(({ theme }) => ({ /* ... */ backgroundColor: alpha(theme.palette.background.paper, 0.85), backdropFilter: 'blur(8px)', color: theme.palette.text.primary, boxShadow: 'none', borderBottom: `1px solid ${theme.palette.divider}`, zIndex: theme.zIndex.drawer + 1, }));
const StyledDrawer = styled(Drawer)(({ theme }) => ({ /* ... */ flexShrink: 0, '& .MuiDrawer-paper': { boxSizing: 'border-box', backgroundColor: theme.palette.background.paper, borderRight: `1px solid ${theme.palette.divider}`, boxShadow: 'none', [theme.breakpoints.up('md')]: { width: SIDEBAR_WIDTH_DESKTOP }, [theme.breakpoints.down('md')]: { width: SIDEBAR_WIDTH_MOBILE }, } }));
const LogoBox = styled(Box)(({ theme }) => ({ /* ... */ minHeight: APP_BAR_HEIGHT, display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), padding: theme.spacing(0, 2.5), cursor: 'pointer', borderBottom: `1px dashed ${alpha(theme.palette.divider, 0.6)}`, transition: 'opacity 0.3s ease', '&:hover': { opacity: 0.85 } }));
const NavList = styled(List)(({ theme }) => ({ /* ... */ padding: theme.spacing(1.5, 1), }));
const NavItemButton = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== 'active', })(({ theme, active }) => ({ /* ... */ margin: theme.spacing(0.5, 0), padding: theme.spacing(1, 1.5), borderRadius: theme.shape.borderRadius * 1.5, minHeight: 46, color: active ? theme.palette.primary.main : theme.palette.text.secondary, backgroundColor: active ? alpha(theme.palette.primary.main, 0.08) : 'transparent', transition: 'background-color 0.2s ease-in-out, color 0.2s ease-in-out', '&:hover': { backgroundColor: active ? alpha(theme.palette.primary.main, 0.12) : alpha(theme.palette.action.hover, 0.04), color: active ? theme.palette.primary.dark : theme.palette.text.primary, }, }));
const NavItemIcon = styled(MuiListItemIcon, { shouldForwardProp: (prop) => prop !== 'active', })(({ theme, active }) => ({ /* ... */ minWidth: 'auto', marginRight: theme.spacing(2), color: 'inherit', fontSize: '1.3rem', transition: 'color 0.2s ease-in-out', }));
const NavItemText = styled(ListItemText, { shouldForwardProp: (prop) => prop !== 'active', })(({ theme, active }) => ({ /* ... */ '& .MuiListItemText-primary': { fontSize: '0.9rem', fontWeight: active ? 600 : 400, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', transition: 'font-weight 0.2s ease-in-out', } }));
const UserFooter = styled(Box)(({ theme }) => ({ /* ... */ padding: theme.spacing(2, 1.5), borderTop: `1px dashed ${alpha(theme.palette.divider, 0.6)}`, display: 'flex', alignItems: 'center', gap: theme.spacing(1.5), position: 'sticky', bottom: 0, backgroundColor: theme.palette.background.paper, zIndex: 1, }));
const StyledPopoverPaper = styled(Box)(({ theme }) => ({ /* ... */ marginTop: theme.spacing(1), boxShadow: theme.shadows[POPOVER_SHADOW_INDEX], borderRadius: theme.shape.borderRadius * POPOVER_BORDER_RADIUS_MULTIPLIER, border: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', overflow: 'hidden', maxWidth: '95vw', }));
const PopoverHeader = styled(Box)(({ theme }) => ({ /* ... */ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: theme.spacing(1.5, 2), borderBottom: `1px solid ${theme.palette.divider}`, backgroundColor: alpha(theme.palette.background.default, 0.5), flexShrink: 0, }));
const PopoverFooter = styled(Box)(({ theme }) => ({ /* ... */ textAlign: 'center', padding: theme.spacing(0.5, 0), borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0, backgroundColor: alpha(theme.palette.background.default, 0.5), }));
const ViewAllButton = styled(Button)(({ theme }) => ({ /* ... */ textTransform: 'none', color: theme.palette.primary.main, fontWeight: 500, padding: theme.spacing(0.75, 2), '&:hover': { backgroundColor: alpha(theme.palette.primary.main, 0.05) } }));
const PopoverListItem = styled(ListItemButton, { shouldForwardProp: (prop) => prop !== 'unread', })(({ theme, unread }) => ({ /* ... */ alignItems: 'flex-start', padding: theme.spacing(1.5, 2), transition: 'background-color 0.2s ease', backgroundColor: unread ? alpha(theme.palette.primary.light, 0.08) : 'transparent', '&:hover': { backgroundColor: alpha(theme.palette.action.hover, 0.06) }, '& .MuiListItemIcon-root': { minWidth: 'auto', marginRight: theme.spacing(1.5), marginTop: theme.spacing(0.5) }, '& .MuiListItemText-primary': { fontWeight: unread ? 600 : 500, fontSize: '0.9rem', marginBottom: theme.spacing(0.25), color: theme.palette.text.primary, lineHeight: 1.3 }, '& .MuiListItemText-secondary': { fontSize: '0.8rem', color: theme.palette.text.secondary, lineHeight: 1.4, display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis', maxHeight: '2.8em' }, '& .item-meta': { fontSize: '0.75rem', color: theme.palette.text.disabled, marginTop: theme.spacing(0.5), textAlign: 'right', marginLeft: 'auto', paddingLeft: theme.spacing(1), whiteSpace: 'nowrap', alignSelf: 'flex-start', paddingTop: theme.spacing(0.25) } }));
const StyledBottomNavigation = styled(BottomNavigation)(({ theme }) => ({ /* ... */ height: MOBILE_BOTTOM_NAV_HEIGHT, backgroundColor: theme.palette.background.paper, borderTop: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[2], }));
const StyledBottomNavigationAction = styled(BottomNavigationAction)(({ theme }) => ({ /* ... */ minWidth: 'auto', padding: theme.spacing(.75, 1, 1), color: theme.palette.text.secondary, transition: 'color 0.2s ease-in-out, transform 0.1s ease-in-out', '& .MuiBottomNavigationAction-label': { fontSize: ".7rem", marginTop: "2px", transition: "font-weight .2s ease-in-out, color .2s ease-in-out", '&.Mui-selected': { fontWeight: 600 } }, '& .MuiSvgIcon-root': { fontSize: "1.4rem", transition: "color .2s ease-in-out" }, '&.Mui-selected': { color: theme.palette.primary.main, transform: 'translateY(-2px)' } }));

// --- Navigation Data (Unchanged) ---
const navSections = [ { title: 'Main', items: [ { label: 'Dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> }, { label: 'Department', path: '/dept/overview', icon: <BusinessOutlinedIcon />, base: '/dept' }, { label: 'Batch', path: `/batch?year=${new Date().getFullYear()}`, icon: <CalendarMonthOutlinedIcon />, base: '/batch' } ] }, { title: 'Account', items: [ { label: 'Settings', path: '/settings', icon: <SettingsOutlinedIcon /> }, { label: 'Support', path: '/support', icon: <SupportAgentOutlinedIcon /> } ] }, ];
const adminSection = { title: 'Admin', items: [ { label: 'Admin Panel', path: '/admin', icon: <AdminPanelSettingsOutlinedIcon /> } ] };
const mobileBottomNavItems = [ { label: 'Dashboard', value: '/dashboard', path: '/dashboard', icon: <DashboardOutlinedIcon /> }, { label: 'Department', value: '/dept', path: '/dept/overview', icon: <BusinessOutlinedIcon /> }, { label: 'Messages', value: '/messages', path: '/messages', icon: <MailOutlineIcon /> }, { label: 'Profile', value: '/profile', path: '/profile', icon: <AccountCircleOutlinedIcon /> } ];

// --- Main Component ---
function Navbar() {
    const navigate = useNavigate();
    const theme = useTheme();
    const location = useLocation();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user, userName, isAdmin, userProfile } = useAuth();
    const userId = user?.uid;

    // --- Ref for the Notifications Icon ---
    const notificationIconRef = useRef(null); // Ref for the universal anchor point

    // --- State ---
    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
    // REMOVED: anchorEl states
    const [isNotificationPopoverOpen, setIsNotificationPopoverOpen] = useState(false); // Renamed for clarity
    const [isMessagesPopoverOpen, setIsMessagesPopoverOpen] = useState(false); // Renamed for clarity

    // Data States
    const [notifications, setNotifications] = useState([]);
    const [totalUnreadCount, setTotalUnreadCount] = useState(0);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [markingRead, setMarkingRead] = useState(false);

    // Placeholder States for Messages
    const [messages, setMessages] = useState([]);
    const [unreadMessagesCount, setUnreadMessagesCount] = useState(3);
    const [loadingMessages, setLoadingMessages] = useState(false);

    // --- Derived State (Now just booleans) ---
    const currentPath = location.pathname;
    // No longer need derived booleans, using state directly

    // --- Handlers ---
    const handleDrawerToggle = useCallback(() => setMobileDrawerOpen(prev => !prev), []);

    // Updated Popover Handlers
    const handleNotificationPopoverOpen = useCallback(() => setIsNotificationPopoverOpen(true), []);
    const handleNotificationPopoverClose = useCallback(() => setIsNotificationPopoverOpen(false), []);
    const handleMessagesPopoverOpen = useCallback(() => setIsMessagesPopoverOpen(true), []);
    const handleMessagesPopoverClose = useCallback(() => setIsMessagesPopoverOpen(false), []);

    // Central Navigation Handler
    const handleNavigate = useCallback((path) => {
        if (!path || typeof path !== 'string') { console.warn('Navbar: handleNavigate invalid path:', path); return; }
        navigate(path);
        handleNotificationPopoverClose(); // Close popovers on navigation
        handleMessagesPopoverClose();
        if (mobileDrawerOpen) setMobileDrawerOpen(false);
    }, [navigate, mobileDrawerOpen, handleNotificationPopoverClose, handleMessagesPopoverClose]);

    // Logout Handler
    const handleLogout = useCallback(async () => {
        try { await auth.signOut(); handleNavigate('/login'); }
        catch (error) { console.error('Navbar: Logout Error:', error); }
    }, [handleNavigate]);

    // Notification Actions (Unchanged)
    const markNotificationAsRead = useCallback(async (notificationId) => { if (!userId || !notificationId) return; const nRef = doc(db, 'users', userId, 'notifications', notificationId); try { await setDoc(nRef, { read: true, readTimestamp: serverTimestamp() }, { merge: true }); } catch (e) { console.error("Error marking notification read:", e); } }, [userId]);
    const handleNotificationItemClick = useCallback((notification) => { handleNotificationPopoverClose(); if (notification?.id) { if (!notification.read) { markNotificationAsRead(notification.id); } navigate(`/notifications#${notification.id}`); } else { navigate('/notifications'); } }, [handleNotificationPopoverClose, markNotificationAsRead, navigate]);
    const handleMarkAllNotificationsRead = useCallback(async () => { if (!userId || markingRead || totalUnreadCount === 0) return; setMarkingRead(true); const ref = collection(db, 'users', userId, 'notifications'); const q = query(ref, where('read', '==', false)); try { const snap = await getDocs(q); if (snap.empty) { setMarkingRead(false); return; } const batch = writeBatch(db); const now = serverTimestamp(); snap.docs.forEach((d) => batch.set(d.ref, { read: true, readTimestamp: now }, { merge: true })); await batch.commit(); } catch (e) { console.error("Error mark all notifications read:", e); } finally { setTimeout(() => setMarkingRead(false), 300); } }, [userId, markingRead, totalUnreadCount]);
    const handleViewAllNotificationsClick = useCallback(() => handleNavigate('/notifications'), [handleNavigate]);

    // Message Actions (Placeholders - Unchanged)
    const handleMessageItemClick = useCallback((messageId) => handleNavigate(`/messages/${messageId}`), [handleNavigate]);
    const handleMarkAllMessagesRead = useCallback(async () => { console.log("TODO: Implement mark all messages read"); setUnreadMessagesCount(0); }, []);
    const handleViewAllMessagesClick = useCallback(() => handleNavigate('/messages'), [handleNavigate]);

    // --- Effects ---

    // Fetch Notifications Effect (Unchanged)
    useEffect(() => {
        if (!userId) { setLoadingNotifications(true); setNotifications([]); setTotalUnreadCount(0); return; }
        setLoadingNotifications(true); let isMounted = true;
        const collRef = collection(db, 'users', userId, 'notifications');
        const q = query(collRef, orderBy('timestamp', 'desc'), limit(NOTIFICATION_LIMIT));
        const unsubNotifications = onSnapshot(q, (snap) => { if (isMounted) { setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() }))); setLoadingNotifications(false); } }, (err) => { console.error("Notif listener error:", err); if(isMounted) setLoadingNotifications(false); });
        const countQ = query(collRef, where('read', '==', false));
        const unsubCount = onSnapshot(countQ, (snap) => { if (isMounted) setTotalUnreadCount(snap.size); }, (err) => console.error("Notif count error:", err));
        return () => { isMounted = false; unsubNotifications(); unsubCount(); };
    }, [userId]);

    // **TODO**: Add useEffect for fetching Messages

    // --- Active State Helper (Unchanged) ---
    const isNavItemActive = useCallback((itemPath, itemBase) => {
        if (!itemPath) return false;
        const baseCheckPath = itemBase || itemPath.split('?')[0];
        return currentPath === itemPath || (currentPath.startsWith(baseCheckPath) && baseCheckPath !== '/');
    }, [currentPath]);

    // --- Memoized Content ---

    // Drawer Content (Unchanged)
    const drawerContent = useMemo(() => (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <LogoBox onClick={() => handleNavigate('/dashboard')}> <LaunchIcon sx={{ color: 'primary.main', fontSize: '2rem' }} /> <Typography variant="h6" sx={{ fontWeight: 700, color: 'text.primary', letterSpacing: '-0.5px' }}> MEmento </Typography> </LogoBox>
            <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 1 }}> {navSections.map((section, sectionIndex) => ( <React.Fragment key={section.title || sectionIndex}> <NavList> {section.items.map((item) => { const active = isNavItemActive(item.path, item.base); return ( <NavItemButton key={item.label} active={active} onClick={() => handleNavigate(item.path)}> <NavItemIcon active={active}>{item.icon}</NavItemIcon> <NavItemText primary={item.label} active={active} /> </NavItemButton> ); })} </NavList> {sectionIndex < navSections.length - 1 && <Divider sx={{ my: 1.5, mx: 1, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.6) }} /> } </React.Fragment> ))} {isAdmin && ( <> <Divider sx={{ my: 1.5, mx: 1, borderStyle: 'dashed', borderColor: alpha(theme.palette.divider, 0.6) }} /> <NavList> {adminSection.items.map((item) => { const active = isNavItemActive(item.path, item.base); return ( <NavItemButton key={item.label} active={active} onClick={() => handleNavigate(item.path)}> <NavItemIcon active={active}>{item.icon}</NavItemIcon> <NavItemText primary={item.label} active={active} /> </NavItemButton> ); })} </NavList> </> )} </Box>
            <UserFooter> <Avatar sx={{ width: 40, height: 40 }} alt={userName || ''} src={userProfile?.basicInfo?.profileImageUrl || undefined}> {!userProfile?.basicInfo?.profileImageUrl && userName ? userName.charAt(0).toUpperCase() : <AccountCircleOutlinedIcon />} </Avatar> <Box sx={{ flexGrow: 1, overflow: 'hidden', pr: 1 }}> <Typography variant="subtitle2" noWrap sx={{ fontWeight: 600, color: 'text.primary' }}> {userName || 'User'} </Typography> <Typography variant="caption" noWrap sx={{ color: 'text.secondary', display: 'block' }}> {user?.email || 'No email'} </Typography> </Box> <Tooltip title="Logout"> <IconButton onClick={handleLogout} size="small" sx={{ color: 'text.secondary', '&:hover': { color: 'error.main', bgcolor: alpha(theme.palette.error.main, 0.1) } }}> <LogoutOutlinedIcon fontSize="small"/> </IconButton> </Tooltip> </UserFooter>
        </Box>
    ), [user, userName, userProfile, isAdmin, handleNavigate, handleLogout, isNavItemActive, currentPath, theme]);

    // Notification Popover Content (Unchanged)
    const notificationPopoverContent = useMemo(() => (
        <> <PopoverHeader> <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Notifications</Typography> {totalUnreadCount > 0 && ( <Button onClick={handleMarkAllNotificationsRead} color="primary" size="small" disabled={markingRead} startIcon={markingRead ? <CircularProgress size={14} color="inherit" /> : <MarkChatReadOutlinedIcon fontSize='small' />} sx={{ textTransform: 'none', fontWeight: 500, py: 0.25, px: 1, ml: 1 }}> Mark all read </Button> )} </PopoverHeader> <Box sx={{ maxHeight: 400, overflowY: 'auto' }}> {loadingNotifications && notifications.length === 0 && ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box> )} {!loadingNotifications && notifications.length === 0 && ( <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}> <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled' }} /> <Typography variant="body2" color="text.secondary">You're all caught up!</Typography> </Box> )} {notifications.length > 0 && ( <List disablePadding> {notifications.map((n) => ( <PopoverListItem key={n.id} unread={!n.read} onClick={() => handleNotificationItemClick(n)}> <ListItemText primary={n.title || 'Notification'} secondary={n.message || '...'} primaryTypographyProps={{ noWrap: true }} /> <Typography variant="caption" className="item-meta"> {n.timestamp?.toDate() ? formatDistanceToNow(n.timestamp.toDate(), { addSuffix: true }) : ''} </Typography> </PopoverListItem> ))} </List> )} </Box> {notifications.length >= NOTIFICATION_LIMIT && !loadingNotifications && ( <PopoverFooter> <ViewAllButton onClick={handleViewAllNotificationsClick} size="small" fullWidth> View All Notifications </ViewAllButton> </PopoverFooter> )} </>
    ), [loadingNotifications, notifications, totalUnreadCount, markingRead, handleNotificationItemClick, handleMarkAllNotificationsRead, handleViewAllNotificationsClick]);

    // Message Popover Content (Unchanged)
    const messagePopoverContent = useMemo(() => {
        const placeholderMessages = [ { id: 'm1', senderName: 'Alice Smith', snippet: 'Hey, just checking in about the project deadline. Are we still on track?', timestamp: new Date(Date.now() - 60000 * 5), read: false, senderImage: undefined }, { id: 'm2', senderName: 'Bob Johnson', snippet: 'Meeting confirmed for 3 PM tomorrow in Room 4B.', timestamp: new Date(Date.now() - 60000 * 60 * 2), read: false, senderImage: 'https://mui.com/static/images/avatar/1.jpg' }, { id: 'm3', senderName: 'Charlie Brown', snippet: 'Can you send over the notes from the lecture? I missed the last part. Thanks!', timestamp: new Date(Date.now() - 60000 * 60 * 24), read: true, senderImage: undefined }, { id: 'm4', senderName: 'Diana Prince', snippet: 'Your request has been approved.', timestamp: new Date(Date.now() - 60000 * 60 * 48), read: false, senderImage: 'https://mui.com/static/images/avatar/3.jpg' }, ];
        const displayMessages = messages.length > 0 ? messages : placeholderMessages;
        return (
            <> <PopoverHeader> <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Messages</Typography> {unreadMessagesCount > 0 && ( <Button onClick={handleMarkAllMessagesRead} color="primary" size="small" sx={{ textTransform: 'none', fontWeight: 500, py: 0.25, px: 1, ml: 1 }} startIcon={<MarkChatReadOutlinedIcon fontSize='small' />} > Mark all read </Button> )} </PopoverHeader> <Box sx={{ maxHeight: 400, overflowY: 'auto' }}> {loadingMessages && displayMessages.length === 0 && ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress size={24} /></Box> )} {!loadingMessages && displayMessages.length === 0 && ( <Box sx={{ p: 3, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}> <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.disabled' }} /> <Typography variant="body2" color="text.secondary">No new messages.</Typography> </Box> )} {displayMessages.length > 0 && ( <List disablePadding> {displayMessages.slice(0, MESSAGE_LIMIT).map((m) => ( <PopoverListItem key={m.id} unread={!m.read} onClick={() => handleMessageItemClick(m.id)}> <ListItemIcon> <Avatar sx={{ width: 36, height: 36 }} alt={m.senderName || '?'} src={m.senderImage}> {m.senderName ? m.senderName.split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase() : <AccountCircleOutlinedIcon />} </Avatar> </ListItemIcon> <ListItemText primary={m.senderName || 'Unknown Sender'} secondary={m.snippet || '...'} primaryTypographyProps={{ noWrap: true }} /> <Typography variant="caption" className="item-meta"> {m.timestamp ? formatDistanceToNow(m.timestamp, { addSuffix: true }) : ''} </Typography> </PopoverListItem> ))} </List> )} </Box> {(displayMessages.length > MESSAGE_LIMIT || unreadMessagesCount > 0) && !loadingMessages && ( <PopoverFooter> <ViewAllButton onClick={handleViewAllMessagesClick} size="small" fullWidth> View All Messages </ViewAllButton> </PopoverFooter> )} </>
    )}, [loadingMessages, messages, unreadMessagesCount, handleMessageItemClick, handleMarkAllMessagesRead, handleViewAllMessagesClick]);

    // --- Main Render ---
    return (
        <StyledRoot>
            {/* Top AppBar */}
            {user && (
                <StyledAppBar position="fixed">
                    <Toolbar sx={{ minHeight: APP_BAR_HEIGHT }}>
                        {/* Left section */}
                        <Box sx={{ display: 'flex', alignItems: 'center', width: { xs: 'auto', md: SIDEBAR_WIDTH_DESKTOP }, pl: { xs: 0, md: 2.5 }, pr: { xs: 1, md: 0 } }}>
                            {isMobile ? ( <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}> <MenuIcon /> </IconButton> ) : null }
                            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 700, flexGrow: { xs: 1, md: 0 }, display: 'block' }}> stdDB </Typography>
                        </Box>

                        {/* Spacer */}
                        <Box sx={{ flexGrow: 1 }} />

                        {/* Right Icons */}
                        <Stack direction="row" spacing={{ xs: 0.5, sm: 1 }} alignItems="center" sx={{ ml: 1 }}>
                             <Tooltip title="Messages">
                                 <IconButton
                                     id="messages-button"
                                     color="inherit"
                                     onClick={handleMessagesPopoverOpen} // Uses updated handler
                                     aria-haspopup="true"
                                     aria-controls={isMessagesPopoverOpen ? 'messages-popover' : undefined}
                                     aria-expanded={isMessagesPopoverOpen ? 'true' : undefined}
                                 >
                                    <Badge badgeContent={unreadMessagesCount} color="error" max={99}> <MailOutlineIcon /> </Badge>
                                </IconButton>
                             </Tooltip>
                             <Tooltip title="Notifications">
                                 <IconButton
                                     ref={notificationIconRef} // Assign ref here
                                     id="notification-button"
                                     color="inherit"
                                     onClick={handleNotificationPopoverOpen} // Uses updated handler
                                     aria-haspopup="true"
                                     aria-controls={isNotificationPopoverOpen ? 'notification-popover' : undefined}
                                     aria-expanded={isNotificationPopoverOpen ? 'true' : undefined}
                                 >
                                    <Badge badgeContent={totalUnreadCount} color="error" max={99}> <NotificationsNoneOutlinedIcon /> </Badge>
                                </IconButton>
                             </Tooltip>
                        </Stack>

                        {/* Popovers anchored to the Notification Icon Ref */}
                        {/* Messages Popover */}
                         <Popover
                             id="messages-popover"
                             open={isMessagesPopoverOpen} // Use boolean state
                             anchorEl={notificationIconRef.current} // Anchor to notification icon ref
                             onClose={handleMessagesPopoverClose}
                             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Keep origin relative to anchor
                             transformOrigin={{ vertical: 'top', horizontal: 'right' }} // Keep popover origin
                             disableRestoreFocus disableScrollLock
                             PaperProps={{ component: StyledPopoverPaper, sx: { width: POPOVER_WIDTH } }}
                          >
                             {messagePopoverContent}
                         </Popover>
                         {/* Notifications Popover */}
                         <Popover
                             id="notification-popover"
                             open={isNotificationPopoverOpen} // Use boolean state
                             anchorEl={notificationIconRef.current} // Anchor to notification icon ref
                             onClose={handleNotificationPopoverClose}
                             anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} // Keep origin relative to anchor
                             transformOrigin={{ vertical: 'top', horizontal: 'right' }} // Keep popover origin
                             disableRestoreFocus disableScrollLock
                             PaperProps={{ component: StyledPopoverPaper, sx: { width: POPOVER_WIDTH } }}
                          >
                             {notificationPopoverContent}
                         </Popover>

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
                    ModalProps={isMobile ? { keepMounted: true } : {}}
                >
                    {drawerContent}
                </StyledDrawer>
            )}

            {/* Mobile Bottom Navigation */}
             {user && isMobile && (
                <AppBar position="fixed" sx={{ top: 'auto', bottom: 0, zIndex: theme.zIndex.drawer }}>
                     <StyledBottomNavigation value={mobileBottomNavItems.find(item => isNavItemActive(item.path, item.value))?.value || false} onChange={(event, newValue) => { const selectedItem = mobileBottomNavItems.find(item => item.value === newValue); if (selectedItem?.path) { handleNavigate(selectedItem.path); } }} showLabels >
                        {mobileBottomNavItems.map((item) => ( <StyledBottomNavigationAction key={item.value} label={item.label} value={item.value} icon={item.icon} /> ))}
                    </StyledBottomNavigation>
                 </AppBar>
            )}

            {/* MAIN CONTENT AREA Placeholder */}

        </StyledRoot>
    );
}

export default Navbar;