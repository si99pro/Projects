// src/components/NotificationsPage.js
import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { db } from '../firebase'; // Adjust path if needed
import {
    collection, query, orderBy, limit, getDocs, doc, setDoc,
    serverTimestamp, startAfter, deleteDoc
} from 'firebase/firestore';
import { useAuth } from '../auth/PrivateRoute'; // Adjust path if needed
import { useNavigate } from 'react-router-dom';
import {
    Container, Typography, Box, CircularProgress, Button, Alert, Stack,
    Paper, Skeleton, Dialog, DialogActions, DialogContent,
    DialogContentText, DialogTitle, useTheme, alpha
} from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';

// Import the extracted component
import NotificationItem from '../components/NotificationItem'; // Adjust path if needed

// Icons (Only those needed directly in this page)
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; // Empty state
import DeleteForeverIcon from '@mui/icons-material/DeleteForever'; // Delete confirmation icon

const NOTIFICATIONS_PER_PAGE = 10;

// --- Skeleton Component (Can stay here or move to its own file) ---
const NotificationSkeleton = () => (
    <Paper variant="outlined" sx={{ p: 1.75, mb: 1.5, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Skeleton variant="circular" width={40} height={40} sx={{ mt: 0.25 }}/>
        <Box sx={{ flexGrow: 1, pt: 0.25 }}>
            <Skeleton variant="text" width="85%" sx={{ mb: 0.75, height: '1.4rem' }} />
            <Skeleton variant="text" width="65%" sx={{ mb: 1.25, height: '1rem' }}/>
            <Skeleton variant="text" width="40%" sx={{ height: '0.8rem' }}/>
        </Box>
        <Stack direction="column" spacing={1} sx={{ ml: 'auto', pt: 0.5 }}>
            <Skeleton variant="circular" width={28} height={28} />
            <Skeleton variant="circular" width={28} height={28} />
        </Stack>
    </Paper>
);

// --- Main Page Component ---
function NotificationsPage() {
    const { user, isAdmin } = useAuth();
    const userId = user?.uid;
    const navigate = useNavigate();
    const theme = useTheme();

    // State remains largely the same
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [lastVisible, setLastVisible] = useState(null);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [notificationToDelete, setNotificationToDelete] = useState(null);

    // --- Data Fetching (Identical logic, stable references are good) ---
    const fetchInitialNotifications = useCallback(async () => {
        if (!userId) { setLoading(false); setNotifications([]); setHasMore(false); return; }
        setLoading(true); setError(null); setLastVisible(null); setHasMore(true);
        setNotifications([]); // Clear existing for a clean load with skeletons

        try {
            const notificationsRef = collection(db, 'users', userId, 'notifications');
            const q = query(notificationsRef, orderBy('timestamp', 'desc'), limit(NOTIFICATIONS_PER_PAGE));
            const snapshots = await getDocs(q);
            const fetched = snapshots.docs.map(d => ({ id: d.id, ...d.data() }));
            setNotifications(fetched);
            setLastVisible(snapshots.docs[snapshots.docs.length - 1] || null);
            setHasMore(fetched.length === NOTIFICATIONS_PER_PAGE);
        } catch (err) {
            console.error("Error fetching initial notifications:", err);
            setError("Failed to load notifications. Please try again later.");
            setNotifications([]); setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [userId]); // Dependency: userId

    const fetchMoreNotifications = useCallback(async () => {
        if (!userId || loadingMore || !hasMore || !lastVisible) return;
        setLoadingMore(true); setError(null);
        try {
            const notificationsRef = collection(db, 'users', userId, 'notifications');
            const q = query(notificationsRef, orderBy('timestamp', 'desc'), startAfter(lastVisible), limit(NOTIFICATIONS_PER_PAGE));
            const snapshots = await getDocs(q);
            const newNotifications = snapshots.docs.map(d => ({ id: d.id, ...d.data() }));
            // Use functional update to avoid stale closures if needed, though direct set should be fine here
            setNotifications(prev => [...prev, ...newNotifications]);
            setLastVisible(snapshots.docs[snapshots.docs.length - 1] || null);
            setHasMore(newNotifications.length === NOTIFICATIONS_PER_PAGE);
        } catch (err) {
            console.error("Error fetching more notifications:", err);
            setError("Failed to load more notifications.");
            // Don't necessarily setHasMore(false) on error, maybe just show error and allow retry?
        } finally {
            setLoadingMore(false);
        }
    }, [userId, loadingMore, hasMore, lastVisible]); // Dependencies for fetching more

    useEffect(() => {
        fetchInitialNotifications();
    }, [fetchInitialNotifications]); // Effect runs when fetchInitialNotifications definition changes (only when userId changes)

    // --- Interaction Handlers (Passed down to NotificationItem) ---
    // Wrapped in useCallback to ensure stable references for memoized child component
    const handleMarkReadToggle = useCallback(async (notificationId, currentReadState) => {
        if (!userId || !notificationId) return;
        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        const newState = !currentReadState;

        // Optimistic UI update
        setNotifications(prev => prev.map(n =>
            n.id === notificationId ? { ...n, read: newState } : n
        ));

        try {
            await setDoc(notificationRef, {
                read: newState,
                readTimestamp: newState ? serverTimestamp() : null
            }, { merge: true });
        } catch (error) {
            console.error("Error updating notification read state:", error);
            setError("Couldn't update notification status. Please try again.");
            // Revert on error - use functional update to get latest state
            setNotifications(prev => prev.map(n =>
                n.id === notificationId ? { ...n, read: currentReadState } : n // Revert to original state
            ));
        }
    }, [userId]); // Dependency: userId

    const handleNotificationClick = useCallback((notification) => {
        // Mark as read if unread when clicked (optimistic)
        if (!notification.read) {
            // Call the toggle handler directly - avoids duplicating logic
            handleMarkReadToggle(notification.id, false);
        }

        // Handle navigation/link opening
        if (notification.link && typeof notification.link === 'string' && notification.link.trim() !== '') {
            try {
                if (notification.link.startsWith('http')) {
                    window.open(notification.link, '_blank', 'noopener,noreferrer');
                } else if (notification.link.startsWith('/')) {
                    navigate(notification.link);
                } else {
                    console.warn("Unsupported link format:", notification.link);
                    // Optionally show a user-facing message here if needed
                }
            } catch (e) {
                console.error("Error navigating/opening link:", notification.link, e);
                setError(`Could not open the requested link.`);
            }
        }
        // If no link, clicking primarily marks as read (handled above)
    }, [navigate, handleMarkReadToggle]); // Dependencies: navigate, handleMarkReadToggle

    // --- Delete Handling with Dialog ---
    const handleDeleteRequest = useCallback((notificationId) => {
        // No need for isAdmin check here, the button won't render in NotificationItem if not admin
        setNotificationToDelete(notificationId);
        setDeleteDialogOpen(true);
    }, []); // No dependencies needed

    const handleCloseDeleteDialog = useCallback(() => {
        setDeleteDialogOpen(false);
        // Delay clearing the ID slightly so the dialog can fade out smoothly if needed
        setTimeout(() => setNotificationToDelete(null), 300);
    }, []); // No dependencies needed

    const handleConfirmDelete = useCallback(async () => {
        if (!userId || !notificationToDelete || !isAdmin) {
             // Added isAdmin check here as a safeguard before DB operation
             console.error("Delete prevented: Invalid state (userId, notificationId, or permissions).");
             setError("Could not delete notification due to an internal error.");
             handleCloseDeleteDialog(); // Close dialog even on internal error
             return;
        }

        const notificationId = notificationToDelete; // Capture before state changes
        setDeleteDialogOpen(false); // Close dialog first

        const originalNotifications = notifications; // Keep reference before optimistic update

        // Optimistic UI update (triggers animation via AnimatePresence)
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        setNotificationToDelete(null); // Clear ID after filter starts

        const notificationRef = doc(db, 'users', userId, 'notifications', notificationId);
        try {
            await deleteDoc(notificationRef);
            // Success! No need to do anything else, UI is already updated.
        } catch (error) {
            console.error("Error deleting notification:", error);
            setError("Failed to delete the notification. Please try again.");
            // Revert on error
            setNotifications(originalNotifications);
        }
    }, [userId, isAdmin, notificationToDelete, notifications, handleCloseDeleteDialog]); // Dependencies


    // --- Main Page Render ---
    if (!userId && !loading) {
        return (
            <Container maxWidth="md" sx={{ py: 4, textAlign: 'center' }}>
                 <Alert severity="warning" variant="outlined">Please log in to view your notifications.</Alert>
            </Container>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: { xs: 3, sm: 4 } }}> {/* Responsive padding */}
            <Typography variant="h4" component="h1" sx={{ mb: { xs: 2, sm: 3 }, fontWeight: 700, color: 'text.primary' }}>
                Notifications
            </Typography>

            {/* Sticky Error Alert */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
                        style={{ position: 'sticky', top: theme.spacing(1.5), zIndex: theme.zIndex.appBar + 1, marginBottom: theme.spacing(2) }}
                    >
                        <Alert severity="error" onClose={() => setError(null)} variant="filled" sx={{ width: '100%' }}>
                            {error}
                        </Alert>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Content Area */}
            {loading ? (
                // Skeletons for initial load
                <Stack spacing={0} sx={{ mt: 2 }}> {/* Let item margin handle spacing */}
                    {[...Array(NOTIFICATIONS_PER_PAGE / 2)].map((_, index) => <NotificationSkeleton key={`skeleton-${index}`} />)}
                </Stack>
            ) : notifications.length === 0 ? (
                 // Enhanced Empty State
                 <Box sx={{ textAlign: 'center', mt: { xs: 6, sm: 10 }, color: 'text.secondary' }}>
                    <NotificationsNoneIcon sx={{ fontSize: '5rem', mb: 2, color: theme.palette.grey[400] }} />
                    <Typography variant="h6" component="p" sx={{ mb: 1, fontWeight: 500 }}>All caught up!</Typography>
                    <Typography>You have no new notifications right now.</Typography>
                 </Box>
            ) : (
                 // Notifications List
                 <Box sx={{ mt: 2 }}>
                    {/* AnimatePresence manages mounting/unmounting animations */}
                    {/* Pass stable handlers to the memoized NotificationItem */}
                    <AnimatePresence initial={false}>
                         <Stack spacing={0}> {/* Let item margin handle spacing */}
                            {notifications.map((notification) => (
                                <NotificationItem
                                    key={notification.id}
                                    notification={notification}
                                    isAdmin={isAdmin}
                                    onMarkReadToggle={handleMarkReadToggle}
                                    onNotificationClick={handleNotificationClick}
                                    onDeleteRequest={handleDeleteRequest}
                                />
                            ))}
                        </Stack>
                    </AnimatePresence>

                    {/* Load More Button */}
                    {hasMore && (
                        <Box sx={{ textAlign: 'center', my: 4 }}>
                            <Button
                                variant="outlined" // Outlined feels more like an action button
                                color="primary"
                                onClick={fetchMoreNotifications}
                                disabled={loadingMore}
                                startIcon={loadingMore ? <CircularProgress size={20} color="inherit" /> : null}
                                sx={{ textTransform: 'none', borderRadius: '20px', px: 3 }} // Modern styling
                            >
                                {loadingMore ? 'Loading More...' : 'Load More Notifications'}
                            </Button>
                        </Box>
                    )}
                    {/* Add a subtle indicator if no more notifications exist but some are loaded */}
                    {!hasMore && notifications.length > 0 && !loadingMore && (
                         <Typography variant="caption" display="block" textAlign="center" color="text.disabled" sx={{ my: 4 }}>
                           End of notifications.
                         </Typography>
                    )}
                 </Box>
            )}

            {/* Delete Confirmation Dialog - Refined Styling */}
             <Dialog
                open={deleteDialogOpen}
                onClose={handleCloseDeleteDialog}
                aria-labelledby="delete-confirm-title"
                PaperProps={{ sx: { borderRadius: 2 } }} // Slightly rounded corners
            >
                <DialogTitle id="delete-confirm-title" sx={{ display: 'flex', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}`, pb: 1.5 }}>
                    <DeleteForeverIcon sx={{ mr: 1.5, color: 'error.main' }}/>
                    Confirm Deletion
                </DialogTitle>
                <DialogContent sx={{ pt: '20px !important' }}> {/* Ensure padding top after title border */}
                    <DialogContentText>
                        Are you sure you want to permanently delete this notification? This action cannot be undone.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button onClick={handleCloseDeleteDialog} sx={{ textTransform: 'none', color: 'text.secondary' }}>Cancel</Button>
                    <Button onClick={handleConfirmDelete} color="error" variant="contained" disableElevation sx={{ textTransform: 'none' }} autoFocus>
                        Delete Notification
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default NotificationsPage;