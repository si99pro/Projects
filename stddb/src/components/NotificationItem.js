/* eslint-disable no-unused-vars */
// src/components/NotificationItem.js
import React from 'react';
import {
    Paper, Box, Typography, Avatar, IconButton, Tooltip, Chip, Link as MuiLink,
    alpha, useTheme
} from '@mui/material';
import { formatDistanceToNow } from 'date-fns';
import { motion } from 'framer-motion';

// Icons (Import only those needed here)
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MarkAsUnreadIcon from '@mui/icons-material/MarkAsUnread';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

const NotificationItem = React.memo(({
    notification,
    isAdmin,
    onMarkReadToggle,
    onNotificationClick,
    onDeleteRequest
}) => {
    const theme = useTheme();

    // --- Calculations (Derived from props) ---
    const timeAgo = notification.timestamp?.toDate()
        ? formatDistanceToNow(notification.timestamp.toDate(), { addSuffix: true })
        : 'Just now';

    const senderDisplayName = notification.senderName || 'System Update';
    const senderDetail = notification.senderStudentId
        ? `${senderDisplayName} (${notification.senderStudentId})`
        : senderDisplayName;
    const senderInitial = senderDisplayName?.charAt(0).toUpperCase() || 'S';

    // --- Styling based on state ---
    const isUnread = !notification.read;
    const itemBackgroundColor = isUnread
        ? alpha(theme.palette.primary.main, 0.07) // Slightly more visible tint
        : theme.palette.background.paper;
    const hoverBackgroundColor = isUnread
        ? alpha(theme.palette.primary.main, 0.12)
        : alpha(theme.palette.action.hover, 0.04); // Use theme's hover alpha

    const canItemBeClicked = isUnread || notification.link;

    // --- Event Handlers ---
    // Prevent accidental double-clicks or propagation issues
    const handleMainClick = (e) => {
        if (canItemBeClicked) {
            onNotificationClick(notification);
        }
    };

    const handleLinkClick = (e) => {
        e.stopPropagation(); // Don't trigger main click if clicking the dedicated link button
        onNotificationClick(notification); // Let the parent handler decide action based on link
    };

    const handleToggleReadClick = (e) => {
        e.stopPropagation();
        onMarkReadToggle(notification.id, notification.read);
    };

    const handleDeleteClick = (e) => {
        e.stopPropagation();
        onDeleteRequest(notification.id);
    };

    return (
        // motion.div enables animations via AnimatePresence in the parent
        <motion.div
            layout // Animates layout changes (e.g., when an item is removed)
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -30, transition: { duration: 0.25 } }} // Smoother exit animation
            transition={{ type: 'spring', stiffness: 260, damping: 25 }} // Spring animation for enter/update
        >
            <Paper
                variant="outlined"
                sx={{
                    p: 1.75, // Consistent padding
                    mb: 1.5,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'flex-start',
                    backgroundColor: itemBackgroundColor,
                    borderLeft: `3px solid ${isUnread ? theme.palette.primary.main : 'transparent'}`, // Unread indicator bar
                    transition: theme.transitions.create(['background-color', 'box-shadow', 'border-left-color'], {
                        duration: theme.transitions.duration.short, // Use theme duration
                    }),
                    cursor: canItemBeClicked ? 'pointer' : 'default',
                    '&:hover': {
                        boxShadow: theme.shadows[3], // Slightly more pronounced hover shadow
                        backgroundColor: hoverBackgroundColor,
                    },
                }}
                onClick={handleMainClick}
            >
                {/* Avatar */}
                <Avatar
                    sx={{
                        bgcolor: isUnread ? 'primary.main' : 'grey.500',
                        width: 40,
                        height: 40,
                        mt: 0.25, // Align better with text baseline
                        fontSize: '1.1rem',
                        transition: 'background-color 0.3s ease',
                    }}
                >
                    {senderInitial}
                </Avatar>

                {/* Content Area */}
                <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', pt: 0.25 }}>
                    <Typography
                        variant="body1"
                        sx={{
                            fontWeight: isUnread ? 600 : 400, // Bolder if unread
                            mb: 0.5, // Space between title and message
                            lineHeight: 1.4, // Improve readability
                            // Allow clicking title/message to trigger main onClick
                            pointerEvents: 'none', // Let parent Paper handle click
                        }}
                    >
                        {notification.title || 'Notification'}
                    </Typography>

                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mb: 1, pointerEvents: 'none', lineHeight: 1.5 }}
                    >
                        {notification.message || ""}
                    </Typography>

                    {/* Metadata: Sender, Time, Category */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                         {/* Group sender + time */}
                         <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                             <Typography variant="caption" color="text.secondary" sx={{ pointerEvents: 'none' }}>
                                 From: {senderDetail}
                             </Typography>
                             <Typography variant="caption" color={isUnread ? 'primary.dark' : 'text.disabled'} sx={{ pointerEvents: 'none', fontWeight: isUnread ? 500 : 400 }}>
                                 • {timeAgo}
                             </Typography>
                         </Box>

                        {notification.category && (
                            <Chip
                                size="small"
                                label={notification.category}
                                sx={{
                                    height: '20px',
                                    fontSize: '0.7rem',
                                    pointerEvents: 'none',
                                    bgcolor: alpha(theme.palette.secondary.main, 0.1), // Use secondary color tint for chip
                                    color: 'secondary.dark',
                                    fontWeight: 500,
                                }}
                            />
                        )}
                    </Box>
                </Box>

                {/* Actions Area - Consistent spacing and alignment */}
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 0.5, ml: 'auto', pt: 0.5 }}>
                     {/* Link Button (only if link exists) */}
                     {notification.link && (
                        <Tooltip title="Open Link" placement="left">
                            <IconButton
                                size="small"
                                onClick={handleLinkClick}
                                aria-label="Open link"
                                sx={{ color: 'primary.main', '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.1)} }}
                            >
                                <OpenInNewIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                    {/* Mark Read/Unread Button */}
                    <Tooltip title={isUnread ? "Mark as Read" : "Mark as Unread"} placement="left">
                        <IconButton
                            size="small"
                            onClick={handleToggleReadClick}
                            aria-label={isUnread ? "Mark as read" : "Mark as unread"}
                            sx={{
                                color: isUnread ? 'primary.main' : 'text.secondary',
                                '&:hover': { bgcolor: alpha(isUnread ? theme.palette.primary.main : theme.palette.action.active, 0.1)}
                            }}
                        >
                            {isUnread
                                ? <CheckCircleOutlineIcon sx={{ fontSize: '1.1rem' }} />
                                : <MarkAsUnreadIcon sx={{ fontSize: '1.1rem' }} />
                            }
                        </IconButton>
                    </Tooltip>
                    {/* Delete Button (Admin only) */}
                    {isAdmin && (
                        <Tooltip title="Delete Notification" placement="left">
                            <IconButton
                                size="small"
                                onClick={handleDeleteClick}
                                color="error"
                                aria-label="Delete notification"
                                sx={{ '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.15) } }}
                            >
                                <DeleteOutlineIcon sx={{ fontSize: '1.1rem' }} />
                            </IconButton>
                        </Tooltip>
                    )}
                </Box>
            </Paper>
        </motion.div>
    );
}); // Wrap with React.memo

export default NotificationItem;