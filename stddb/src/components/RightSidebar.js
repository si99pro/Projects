// src/components/RightSidebar.js
import React, { useState, useRef, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import Popover from '@mui/material/Popover';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { format, isToday, isYesterday } from 'date-fns';

// --- Firebase Imports ---
import {
    db,                // From your setup
    publicChatCollection, // From your setup
    addDoc,            // From your setup
    query,             // From your setup
    orderBy,           // From your setup
    onSnapshot,        // From your setup
    serverTimestamp,   // From your setup
    doc,               // From your setup
    // deleteDoc is not used for user messages now
    updateDoc,         // From your setup
    Timestamp          // From your setup
    // Ensure 'writeBatch' is NOT listed here
} from '../firebase';

// Import writeBatch DIRECTLY from the firestore library *** CORRECTED IMPORT ***
import { writeBatch } from 'firebase/firestore';

// --- Auth Hook Import ---
import { useAuth } from '../context/AuthContext';

// --- Icons ---
import ForumIcon from '@mui/icons-material/Forum';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
import DeleteIcon from '@mui/icons-material/DeleteOutline';
import EditIcon from '@mui/icons-material/EditOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddReactionIcon from '@mui/icons-material/AddReactionOutlined';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckIcon from '@mui/icons-material/Check';
import BlockIcon from '@mui/icons-material/Block'; // For deleted message

// --- CSS ---
import './RightSidebar.css'; // Ensure this CSS file is updated as per previous instructions

// --- Constants ---
const SIDEBAR_STATE_KEY = 'rightSidebarExpandedState_v2';
const QUICK_EMOJI_REACTIONS = ['👍', '❤️', '😂']; // 3 Quick Emojis
const ALL_EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🤔', '🎉']; // Full picker

// --- Helper Functions ---
// Assuming these helpers are correct and exist elsewhere or defined here
const getCurrentUserDisplayName = (currentUser, userData) => {
    if (userData?.basicInfo?.fullName) return userData.basicInfo.fullName;
    if (currentUser?.displayName) return currentUser.displayName;
    if (currentUser?.email) return currentUser.email.split('@')[0];
    return "Unknown User";
};
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "" || name === "Unknown User") return '?';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '?';
};
const stringToColor = (string) => {
    let hash = 0; let i; if (!string || string.length === 0) return '#bdbdbd';
    for (i = 0; i < string.length; i += 1) { hash = string.charCodeAt(i) + ((hash << 5) - hash); }
    let color = '#'; for (i = 0; i < 3; i += 1) { const value = (hash >> (i * 8)) & 0xff; color += `00${value.toString(16)}`.slice(-2); }
    return color;
};
// --- End Helper Functions ---


const RightSidebar = ({ isOtherSidebarOpen = false }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { currentUser, userData, loading: authLoading } = useAuth();

    // --- State ---
    const getInitialDesktopState = useCallback(() => {
        if (typeof window !== 'undefined' && !isMobile) {
            const storedValue = localStorage.getItem(SIDEBAR_STATE_KEY);
            return storedValue === null ? true : storedValue === 'true';
        }
        return false;
    }, [isMobile]);
    const [isExpanded, setIsExpanded] = useState(getInitialDesktopState);
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const chatBodyRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [errorMessages, setErrorMessages] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null); // More options menu
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState(null); // Full reaction picker
    const [reactionMessageId, setReactionMessageId] = useState(null);

    // --- Firestore Listener ---
    useEffect(() => {
        if (authLoading) {
          console.log("Auth loading, skipping listener setup.");
          setLoadingMessages(true); return;
        }
        if (!currentUser) {
          console.log("No user, skipping listener setup.");
          setMessages([]); setLoadingMessages(false); setErrorMessages(null); return;
        }
        console.log("Setting up Firestore listener");
        setLoadingMessages(true); setErrorMessages(null);
        const q = query(publicChatCollection, orderBy('createdAt', 'asc'));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const msgs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setMessages(msgs);
            setLoadingMessages(false);
            setErrorMessages(null);
        }, (error) => {
            console.error("Firestore Error:", error);
            if (error.code === 'permission-denied' && !currentUser) {
                 console.log("Perm denied likely due to logout."); setMessages([]);
            } else { setErrorMessages("Failed to load messages."); }
            setLoadingMessages(false);
        });
        return () => { console.log("Unsubscribing listener."); unsubscribe(); };
      }, [currentUser, authLoading]);


    // --- Handlers ---
    const handleToggleClick = useCallback((event) => {
        if (isMobile) {
            if (popoverOpen) { setAnchorEl(null); setPopoverOpen(false); }
            else { setAnchorEl(event.currentTarget); setPopoverOpen(true); }
        } else { setIsExpanded(prev => !prev); }
    }, [isMobile, popoverOpen]);

    const handleClosePopover = useCallback(() => {
        setAnchorEl(null); setPopoverOpen(false);
    }, []);

    const handleSendMessage = async () => {
        if (!newMessage.trim() || !currentUser?.uid) return;
        const senderName = getCurrentUserDisplayName(currentUser, userData);
        const senderPhotoURL = userData?.basicInfo?.profileImageUrl || currentUser?.photoURL || null;
        const messageData = {
            text: newMessage.trim(), userId: currentUser.uid, userName: senderName,
            userPhotoURL: senderPhotoURL, createdAt: serverTimestamp(), reactions: {},
            isDeleted: false, // Add isDeleted flag
        };
        if (replyingToMessage) {
            messageData.replyTo = {
                messageId: replyingToMessage.id, userName: replyingToMessage.user,
                text: replyingToMessage.text.length > 70 ? replyingToMessage.text.substring(0, 67) + '...' : replyingToMessage.text,
            };
        }
        const originalNewMessage = newMessage; const originalReplyingTo = replyingToMessage;
        setNewMessage(''); setReplyingToMessage(null);
        try {
            await addDoc(publicChatCollection, messageData);
        } catch (error) {
            console.error("Error sending message: ", error);
            // Restore state on error
            setNewMessage(originalNewMessage);
            setReplyingToMessage(originalReplyingTo);
            setErrorMessages("Couldn't send message.");
        }
    };

    const handleUpdateMessage = async () => {
        if (!newMessage.trim() || !editingMessage || !currentUser?.uid) return;
        const originalMessage = messages.find(msg => msg.id === editingMessage.id);
        if (!originalMessage || originalMessage.userId !== currentUser.uid || originalMessage.isDeleted) {
             setEditingMessage(null); setNewMessage(''); return;
        }
        const messageRef = doc(db, 'publicChat', editingMessage.id);
        const updatedText = newMessage.trim();
        const originalText = originalMessage.text; // Keep original for potential rollback
        setNewMessage(''); setEditingMessage(null);
        try {
            // Ensure we don't accidentally un-delete a message if something weird happens
            await updateDoc(messageRef, { text: updatedText, updatedAt: serverTimestamp(), isDeleted: false });
        } catch (error) {
            console.error("Error updating message: ", error);
            // Restore state on error
            setEditingMessage({ id: editingMessage.id, text: originalText });
            setNewMessage(updatedText);
            setErrorMessages("Couldn't update message.");
        }
    };

    // --- MODIFIED DELETE HANDLER ---
    const handleDeleteMessage = async (messageIdToDelete) => {
        if (!currentUser?.uid) return;
        const messageToDelete = messages.find(msg => msg.id === messageIdToDelete);
         if (!messageToDelete || messageToDelete.userId !== currentUser.uid || messageToDelete.isDeleted) {
             handleCloseMenu(); // Close menu even if already deleted or not owner
             return;
         }
        const messageRef = doc(db, 'publicChat', messageIdToDelete);
        try {
            // Update instead of delete
            await updateDoc(messageRef, {
                text: "Message deleted", // Store placeholder text
                isDeleted: true,
                deletedAt: serverTimestamp(), // Optional: track deletion time
                reactions: {}, // Clear reactions on delete
                replyTo: null, // Clear reply context on delete (optional)
                // Keep userId, userName, createdAt etc. for structure if needed
            });
            handleCloseMenu();
            // Also close reaction menu if it was open for this message
            if (reactionMessageId === messageIdToDelete) handleCloseReactionMenu();
        } catch (error) {
            console.error("Error marking message as deleted: ", error);
            setErrorMessages("Couldn't delete message.");
        }
    };
    // --- END MODIFIED DELETE HANDLER ---

    const handleStartEdit = (message) => {
        if (currentUser && currentUser.uid === message.userId && !message.isDeleted) {
            setEditingMessage({ id: message.id, text: message.text });
            setReplyingToMessage(null); setNewMessage(message.text); handleCloseMenu();
        }
    };
    const handleCancelEdit = () => { setEditingMessage(null); setNewMessage(''); };

    const handleStartReply = (message) => {
        if (message.isDeleted) return; // Don't allow replying to deleted messages
        const replyTextSnippet = message.text.length > 50 ? message.text.substring(0, 47) + '...' : message.text;
        setReplyingToMessage({ id: message.id, user: message.userName || 'Unknown User', text: replyTextSnippet });
        setEditingMessage(null); handleCloseMenu();
    };
    const handleCancelReply = () => { setReplyingToMessage(null); };

    // --- REACTION HANDLER ---
    const handleReaction = async (clickedEmoji) => {
        if (!currentUser?.uid || !reactionMessageId) return;

        const messageRef = doc(db, 'publicChat', reactionMessageId);
        const userId = currentUser.uid;

        const currentMessage = messages.find(msg => msg.id === reactionMessageId);
        if (!currentMessage || currentMessage.isDeleted) return; // Don't react to deleted messages

        const currentReactions = currentMessage.reactions || {};
        let userPreviousReactionEmoji = null;

        // Find if the user already reacted with a different emoji
        for (const emoji in currentReactions) {
            if (currentReactions[emoji]?.includes(userId)) {
                userPreviousReactionEmoji = emoji;
                break;
            }
        }

        // Uses writeBatch imported directly from 'firebase/firestore'
        const batch = writeBatch(db); // db from ../firebase
        let newReactions = { ...currentReactions };

        // 1. Remove previous reaction if exists
        if (userPreviousReactionEmoji) {
            newReactions[userPreviousReactionEmoji] = newReactions[userPreviousReactionEmoji].filter(id => id !== userId);
            // Clean up the emoji key if no users are left
            if (newReactions[userPreviousReactionEmoji].length === 0) {
                delete newReactions[userPreviousReactionEmoji];
            }
        }

        // 2. Add new reaction if it wasn't the same as the one removed
        if (userPreviousReactionEmoji !== clickedEmoji) {
            const usersForNewEmoji = newReactions[clickedEmoji] || [];
            newReactions[clickedEmoji] = [...usersForNewEmoji, userId];
        }
        // If the user clicked the same emoji they already reacted with,
        // the previous step removed it, and this step does nothing, effectively toggling off.

        try {
            batch.update(messageRef, { reactions: newReactions });
            await batch.commit();
            handleCloseReactionMenu(); // Close picker after successful reaction
        } catch (error) {
            console.error("Error updating reaction with batch: ", error);
            setErrorMessages("Couldn't update reaction.");
        }
    };
    // --- End Reaction Handler ---

    // --- Menu Handlers ---
    const handleOpenMenu = (event, messageId) => {
        setMenuAnchorEl(event.currentTarget);
        setSelectedMessageId(messageId);
        // Don't close reaction menu here automatically
    };
    const handleCloseMenu = () => {
        setMenuAnchorEl(null);
        // Don't clear selectedMessageId here, it's needed by the Menu component while closing
    };

    const handleOpenReactionMenu = (event, messageId) => {
        setReactionMenuAnchorEl(event.currentTarget); // Anchor to the clicked icon
        setReactionMessageId(messageId);
        handleCloseMenu(); // Close the main menu if it was open
    };
    const handleCloseReactionMenu = () => {
        setReactionMenuAnchorEl(null);
        // Optionally clear reactionMessageId, but not strictly necessary
        // setReactionMessageId(null);
    };

    // --- Effects ---
    useEffect(() => { // Persist state
        if (typeof window !== 'undefined') {
            if (!isMobile) {
                localStorage.setItem(SIDEBAR_STATE_KEY, isExpanded.toString());
                if (popoverOpen) handleClosePopover(); // Close popover if switching to desktop expanded
            } else {
                // If mobile, ensure expanded state is false (handled by popover)
                if (isExpanded) setIsExpanded(false);
            }
        }
    }, [isExpanded, isMobile, handleClosePopover, popoverOpen]); // Dependencies updated slightly

    const scrollToBottom = useCallback(() => { // Scroll chat body
        const chatVisible = (!isMobile && isExpanded) || (isMobile && popoverOpen);
        if (chatVisible && chatBodyRef.current) {
             // Use requestAnimationFrame for smoother scrolling after render
             requestAnimationFrame(() => {
                 if (chatBodyRef.current) {
                     chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
                 }
             });
        }
    }, [isExpanded, popoverOpen, isMobile]); // Dependencies are correct

    useEffect(() => { // Scroll on messages/visibility change
        if (!loadingMessages) {
             scrollToBottom();
        }
    }, [messages, scrollToBottom, loadingMessages]); // Dependencies are correct


    // --- Time Formatting ---
    const formatTimestamp = (timestamp) => {
        if (!timestamp) return '';
        try {
            // Convert Firestore Timestamp to JS Date if necessary
            const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
            if (isNaN(date.getTime())) return 'Invalid date'; // Basic validation

            if (isToday(date)) return format(date, 'p'); // e.g., 1:30 PM
            if (isYesterday(date)) return 'Yesterday'; // e.g., Yesterday
            return format(date, 'P'); // e.g., 06/15/2024
        } catch (e) {
            console.error("Error formatting date:", timestamp, e);
            return '...';
        }
    };
    // --- End Time Formatting ---


    // --- Dynamic Vars ---
    const hideFab = isMobile && isOtherSidebarOpen;
    const sidebarClass = isMobile ? 'collapsed mobile-fab' : (isExpanded ? 'expanded' : 'collapsed');
    // Find messages based on potentially active IDs for menus/popovers
    const selectedMessageForMenu = messages.find(msg => msg.id === selectedMessageId);
    const messageForReactionMenu = messages.find(msg => msg.id === reactionMessageId);
    // Determine if the current user reacted to the message targeted by the reaction menu
    const userReactionOnSelected = messageForReactionMenu && currentUser && !messageForReactionMenu.isDeleted
        ? Object.entries(messageForReactionMenu.reactions || {})
            .find(([emoji, users]) => users?.includes(currentUser.uid))?.[0] // Get the emoji string if found
        : null;

    // --- Reusable Chat Content JSX ---
    const chatContent = (
        <Box className="sidebar-content-container">
            {/* Header */}
            <Box className="sidebar-header">
                <Typography variant="subtitle1" component="h3" className="sidebar-title">
                    <ForumIcon sx={{ verticalAlign: 'middle', mr: 0.5, fontSize: '1.1rem' }} /> Public Chat
                </Typography>
                <IconButton onClick={isMobile ? handleClosePopover : () => setIsExpanded(false)} size="small" aria-label="Close Chat" className="sidebar-internal-close-button">
                    <CloseIcon fontSize="small" />
                </IconButton>
            </Box>
            <Divider className="sidebar-divider" />

            {/* Content Wrapper */}
            <Box className="sidebar-content-wrapper">
                {/* Chat Body */}
                <Box className="chat-body" ref={chatBodyRef}>
                    {/* Loading/Error/Empty States */}
                    {authLoading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box> )
                    : !currentUser ? ( <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>Please log in to chat.</Typography> )
                    : loadingMessages ? ( <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}><CircularProgress size={24} /></Box> )
                    : errorMessages ? ( <Typography color="error" sx={{ p: 3, textAlign: 'center' }}>{errorMessages}</Typography> )
                    : messages.length === 0 ? ( <Typography sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>No messages yet.</Typography> )
                    : (
                        // --- NEW MINIMAL MESSAGE LIST ---
                        <List dense sx={{ width: '100%', p: 1 }}>
                            {messages.map((msg) => {
                                const isCurrentUser = currentUser && msg.userId === currentUser.uid;
                                const messageDate = msg.createdAt;
                                const isDeleted = msg.isDeleted; // Check deleted status

                                return (
                                    <ListItem
                                        key={msg.id}
                                        className="chat-message-row" // Add class for hover target
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start', // Align avatar and content top
                                            mb: 1, // Increase margin slightly
                                            px: 0.5, // Small horizontal padding for the row
                                            py: 0.5, // Small vertical padding for the row
                                            borderRadius: '4px',
                                            position: 'relative', // Needed for absolute positioning of actions
                                            '&:hover': {
                                                bgcolor: 'action.hover', // Subtle background on hover for the whole row
                                                // Show actions container on hover (desktop only)
                                                '& .message-actions-on-hover': {
                                                    opacity: isMobile || isDeleted ? 0 : 1, // Only show if not mobile AND not deleted
                                                    pointerEvents: isMobile || isDeleted ? 'none' : 'auto',
                                                },
                                            },
                                        }}
                                        disablePadding
                                    >
                                        {/* Avatar */}
                                        <ListItemAvatar sx={{ minWidth: 42, mt: 0.5 }}>
                                            <Avatar
                                                sx={{ width: 32, height: 32, bgcolor: isDeleted ? 'action.disabledBackground' : stringToColor(msg.userName || '?'), fontSize: '0.85rem' }}
                                                alt={msg.userName || 'User'}
                                                src={isDeleted ? undefined : msg.userPhotoURL || undefined}
                                            >
                                                {isDeleted ? <BlockIcon fontSize="inherit" sx={{ color: 'action.disabled' }}/> : (!msg.userPhotoURL ? getInitials(msg.userName) : null)}
                                            </Avatar>
                                        </ListItemAvatar>

                                        {/* Message Content & Actions Container */}
                                        <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, pr: isMobile ? '30px' : 0 /* Space for mobile dots */ }}>
                                            {/* Name • Time Header */}
                                            {!isDeleted && (
                                                <Stack direction="row" spacing={0.5} alignItems="center" sx={{ lineHeight: 1.2 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'text.primary' }}>
                                                        {msg.userName || 'Unknown User'}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', userSelect: 'none' }}>•</Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', userSelect: 'none' }}>
                                                        {formatTimestamp(messageDate)}
                                                    </Typography>
                                                    {msg.updatedAt && !msg.deletedAt && ( // Check not deletedAt if you add that field
                                                        <Tooltip title={`Edited ${formatTimestamp(msg.updatedAt)}`} placement="top">
                                                            <Typography component="span" variant="caption" sx={{ fontStyle: 'italic', color: 'text.secondary', ml: 0.5, fontSize: '0.7rem' }}>(edited)</Typography>
                                                        </Tooltip>
                                                    )}
                                                </Stack>
                                            )}

                                            {/* Reply Context (Minimal) */}
                                            {msg.replyTo && !isDeleted && (
                                                <Box className="reply-context-minimal" sx={{ mt: 0.5, mb: 0.5 }}>
                                                    <Typography variant="caption" sx={{ fontWeight: '500', display:'inline', lineHeight: 1.2, color: 'text.secondary' }}>
                                                        <ReplyIcon sx={{ fontSize: '0.9rem', verticalAlign: 'text-bottom', mr: 0.3, color: 'inherit' }}/>
                                                        Replying to <Box component="span" sx={{ fontWeight: 'bold' }}>{msg.replyTo.userName || 'Original User'}</Box>:
                                                    </Typography>
                                                    <Typography component="span" variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', display: 'inline', lineHeight: 1.2, ml: 0.5 }}>
                                                        "{msg.replyTo.text}"
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Message Text OR Deleted Placeholder */}
                                            <Typography
                                                component="div" // Use div to allow block display
                                                variant="body2"
                                                color={isDeleted ? 'text.disabled' : 'text.primary'}
                                                sx={{
                                                    mt: isDeleted ? 0.5 : 0.25, // Add space below header if not deleted
                                                    whiteSpace: 'pre-wrap',
                                                    overflowWrap: 'break-word',
                                                    wordBreak: 'break-word',
                                                    fontStyle: isDeleted ? 'italic' : 'normal',
                                                    lineHeight: 1.4,
                                                }}
                                            >
                                                {msg.text} {/* Text is "Message deleted" if deleted */}
                                            </Typography>

                                            {/* Reactions Display (Minimal) */}
                                            {msg.reactions && !isDeleted && Object.keys(msg.reactions).length > 0 && (
                                                <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                                                    {Object.entries(msg.reactions)
                                                        .filter(([, users]) => users && users.length > 0) // Ensure users array exists and is not empty
                                                        .map(([emoji, users]) => {
                                                            const userReacted = currentUser && users.includes(currentUser.uid);
                                                            return (
                                                                <Tooltip key={emoji} title={userReacted ? `You reacted with ${emoji}. Click to remove.` : `React with ${emoji}`} placement="top">
                                                                    <Chip
                                                                        label={`${emoji} ${users.length}`}
                                                                        size="small"
                                                                        onClick={() => { setReactionMessageId(msg.id); handleReaction(emoji); }}
                                                                        variant={userReacted ? "filled" : "outlined"}
                                                                        sx={{
                                                                            cursor: 'pointer', height: '22px', fontSize: '0.7rem', borderRadius: '11px',
                                                                            bgcolor: userReacted ? 'primary.light' : 'action.hover',
                                                                            color: userReacted ? 'primary.contrastText' : 'text.secondary',
                                                                            borderColor: userReacted ? 'transparent' : 'divider',
                                                                            '& .MuiChip-label': { px: '6px'},
                                                                            '&:hover': { bgcolor: userReacted ? 'primary.main' : theme.palette.action.selected }
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            );
                                                    })}
                                                </Stack>
                                            )}
                                        </Box> {/* End Message Content Box */}

                                        {/* Hover Actions (Positioned Top Right of Row) - Desktop Only & Not Deleted */}
                                        {!isDeleted && !isMobile && (
                                             <Stack
                                                direction="row"
                                                spacing={0.2}
                                                className="message-actions-on-hover" // Class for hover selector
                                                sx={{
                                                    position: 'absolute',
                                                    top: 2, // Adjust positioning as needed
                                                    right: 2,
                                                    bgcolor: 'background.paper', // Give it a slight background
                                                    borderRadius: '12px',
                                                    boxShadow: theme.shadows[2], // Use theme shadow
                                                    p: '2px', // Padding inside the action bar
                                                    opacity: 0, // Hidden by default
                                                    pointerEvents: 'none', // Not interactive by default
                                                    transition: 'opacity 0.15s ease-in-out',
                                                    zIndex: 1, // Ensure it's above content
                                                }}
                                            >
                                                {/* 3 Quick Emojis */}
                                                {QUICK_EMOJI_REACTIONS.map(emoji => (
                                                    <Tooltip title={`React ${emoji}`} placement="top" key={emoji}>
                                                        <IconButton size="small" onClick={() => { setReactionMessageId(msg.id); handleReaction(emoji); }} sx={{ p: 0.4, fontSize: '1rem' }}>{emoji}</IconButton>
                                                    </Tooltip>
                                                ))}
                                                {/* More Emojis Icon */}
                                                <Tooltip title="Add reaction" placement="top">
                                                    <IconButton size="small" onClick={(e) => handleOpenReactionMenu(e, msg.id)} sx={{ p: 0.4 }}> <AddReactionIcon sx={{ fontSize: '1.1rem' }} /> </IconButton>
                                                </Tooltip>
                                                {/* Reply Icon */}
                                                <Tooltip title="Reply" placement="top">
                                                    <IconButton size="small" onClick={() => handleStartReply(msg)} sx={{ p: 0.4 }}> <ReplyIcon sx={{ fontSize: '1.1rem' }} /> </IconButton>
                                                </Tooltip>
                                                {/* Edit Icon (Own Messages) */}
                                                {isCurrentUser && (
                                                    <Tooltip title="Edit" placement="top">
                                                        <IconButton size="small" onClick={() => handleStartEdit(msg)} sx={{ p: 0.4 }}> <EditIcon sx={{ fontSize: '1.1rem' }} /> </IconButton>
                                                    </Tooltip>
                                                )}
                                                {/* Delete Icon (Own Messages) */}
                                                {isCurrentUser && (
                                                    <Tooltip title="Delete" placement="top">
                                                        <IconButton size="small" onClick={() => handleDeleteMessage(msg.id)} sx={{ p: 0.4, color: 'error.main' }}> <DeleteIcon sx={{ fontSize: '1.1rem' }} /> </IconButton>
                                                    </Tooltip>
                                                )}
                                                 {/* Redundant More Options Icon - Removed as hover bar covers these actions */}
                                                {/* <Tooltip title="More options" placement="top">
                                                    <IconButton size="small" onClick={(e) => handleOpenMenu(e, msg.id)} sx={{ p: 0.4 }}> <MoreVertIcon sx={{ fontSize: '1.1rem' }} /> </IconButton>
                                                </Tooltip> */}
                                            </Stack>
                                        )}

                                         {/* Mobile: Always Visible More Options Button (If not deleted) */}
                                        {isMobile && !isDeleted && (
                                             <Tooltip title="More options" placement="left">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => handleOpenMenu(e, msg.id)}
                                                    sx={{
                                                        p: 0.3,
                                                        position: 'absolute', // Position relative to ListItem
                                                        top: 4,
                                                        right: 4,
                                                        color: 'text.secondary'
                                                     }}
                                                    aria-label="Message options"
                                                    id={`message-options-${msg.id}`}
                                                >
                                                    <MoreVertIcon fontSize="inherit" sx={{ fontSize: '1.2rem' }}/>
                                                </IconButton>
                                            </Tooltip>
                                        )}

                                    </ListItem>
                                );
                            })}
                        </List> // End Message List
                    )}
                </Box> {/* End Chat Body */}

                {/* Input Area */}
                {currentUser && (
                    <Box className="chat-input-area">
                        {/* Reply/Edit Context Bars */}
                        {replyingToMessage && (
                             <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', px: 1, py: 0.5, mb: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                                 <ReplyIcon fontSize="inherit" sx={{ mr: 0.5, flexShrink: 0 }} /> <Typography variant="caption" sx={{ mr: 0.5, whiteSpace: 'nowrap' }}>Replying to</Typography> <Typography variant="caption" sx={{ fontWeight: 'bold', mr: 0.5, whiteSpace: 'nowrap' }}>{replyingToMessage.user}</Typography> <Typography variant="caption" sx={{ fontStyle: 'italic', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flexGrow: 1 }}>: "{replyingToMessage.text}"</Typography> <IconButton size="small" onClick={handleCancelReply} sx={{ ml: 'auto', p: 0.2, flexShrink: 0 }} aria-label="Cancel reply"> <CancelIcon fontSize="inherit" /> </IconButton>
                             </Box>
                         )}
                         {editingMessage && (
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.8rem', px: 1, py: 0.5, mb: 1, borderRadius: 1, bgcolor: 'action.hover' }}>
                                <EditIcon fontSize="inherit" sx={{ mr: 0.5 }} /> <Typography variant="caption">Editing message...</Typography> <IconButton size="small" onClick={handleCancelEdit} sx={{ ml: 'auto', p: 0.2 }} aria-label="Cancel edit"> <CancelIcon fontSize="inherit" /> </IconButton>
                            </Box>
                        )}
                        {/* Input TextField */}
                        <TextField
                            fullWidth variant="outlined" size="small" placeholder="Type message..."
                            value={newMessage} onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); if (editingMessage) { handleUpdateMessage(); } else { handleSendMessage(); } } }}
                            InputProps={{
                                endAdornment: ( <InputAdornment position="end"> <Tooltip title={editingMessage ? "Save Changes (Enter)" : "Send Message (Enter)"}> <span> <IconButton edge="end" color="primary" size="small" aria-label={editingMessage ? "Save changes" : "Send message"} onClick={editingMessage ? handleUpdateMessage : handleSendMessage} disabled={!newMessage.trim() || authLoading || !currentUser} > {editingMessage ? <CheckIcon fontSize='small'/> : <SendIcon fontSize='small' />} </IconButton> </span> </Tooltip> </InputAdornment> ),
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': { borderRadius: '16px', backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)', paddingRight: '8px' }, '& fieldset': { border: 'none' }
                            }}
                            multiline maxRows={4}
                        />
                    </Box>
                )}
            </Box> {/* End Content Wrapper */}
        </Box> // End sidebar-content-container
    );

    // --- Component Return ---
    return (
        <>
            {/* Sidebar / FAB Container */}
            {!authLoading && (
                 <Paper component="aside" elevation={isExpanded && !isMobile ? 1 : 6} square={isExpanded && !isMobile} className={`right-sidebar ${sidebarClass}`} aria-label={isExpanded && !isMobile ? "Public Chat Area" : "Public Chat Toggle"} sx={{ display: hideFab ? 'none' : 'flex' }} >
                    {!isMobile && isExpanded && chatContent}
                    {(!isExpanded || isMobile) && (
                        <Tooltip title={popoverOpen ? "Close Chat" : "Public Chat"} placement="left">
                            <IconButton onClick={handleToggleClick} size="large" aria-label={popoverOpen ? "Close Chat" : "Open Public Chat"} className="sidebar-toggle-button" id="chat-fab-button" aria-controls={popoverOpen ? 'chat-popover' : undefined} aria-haspopup="true" aria-expanded={popoverOpen ? 'true' : undefined} sx={{ width: '100%', height: '100%'}} > <ForumIcon /> </IconButton>
                        </Tooltip>
                    )}
                </Paper>
            )}

            {/* Mobile Chat Popover */}
            {isMobile && ( <Popover id="chat-popover" open={popoverOpen} anchorEl={anchorEl} onClose={handleClosePopover} anchorOrigin={{ vertical: 'top', horizontal: 'right' }} transformOrigin={{ vertical: 'bottom', horizontal: 'right' }} PaperProps={{ className: 'chat-popover-paper', sx: { width: 'calc(100vw - 32px)', maxWidth: '400px', maxHeight: 'calc(100vh - 100px)', height: '60vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', bottom: 'calc(var(--fab-position-bottom, 24px) + var(--right-sidebar-collapsed-size, 56px) + 10px)', right: 'var(--fab-position-right, 24px)', left: 'auto', top: 'auto', boxShadow: theme.shadows[8], } }} > {chatContent} </Popover> )}

            {/* Message Action Menu (Triggered by MoreVertIcon on Mobile) */}
            <Menu
                id="message-action-menu" anchorEl={menuAnchorEl} open={Boolean(menuAnchorEl)} onClose={handleCloseMenu}
                MenuListProps={{ 'aria-labelledby': selectedMessageId ? `message-options-${selectedMessageId}` : undefined, dense: true }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                {/* Ensure message exists and is NOT deleted before showing options */}
                {selectedMessageForMenu && !selectedMessageForMenu.isDeleted && (
                    <div> {/* Wrapper needed for multiple elements/array */}
                        <MenuItem onClick={() => handleStartReply(selectedMessageForMenu)}> <ReplyIcon sx={{ mr: 1.5 }} fontSize="small"/> Reply </MenuItem>
                         <MenuItem onClick={(e) => { handleOpenReactionMenu(e, selectedMessageForMenu.id); }}> <AddReactionIcon sx={{ mr: 1.5 }} fontSize="small"/> React </MenuItem>
                        {/* Conditionally render Edit/Delete only if it's the current user's message */}
                        {currentUser && selectedMessageForMenu.userId === currentUser.uid && [
                            <Divider key="divider-edit" sx={{ my: 0.5 }}/>,
                            <MenuItem key="edit" onClick={() => handleStartEdit(selectedMessageForMenu)}> <EditIcon sx={{ mr: 1.5 }} fontSize="small"/> Edit </MenuItem>,
                            <MenuItem key="delete" onClick={() => handleDeleteMessage(selectedMessageForMenu.id)} sx={{ color: 'error.main'}}> <DeleteIcon sx={{ mr: 1.5 }} fontSize="small"/> Delete </MenuItem>
                         ]}
                     </div>
                )}
            </Menu>

            {/* Reaction Picker Menu (Full Emoji List) */}
            <Menu
                id="reaction-picker-menu" anchorEl={reactionMenuAnchorEl} open={Boolean(reactionMenuAnchorEl)} onClose={handleCloseReactionMenu}
                MenuListProps={{ sx: { p: 0.5 } }} // Padding around the grid
                 anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                 {/* Use a Box with grid display for better layout */}
                 <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px' }}>
                    {ALL_EMOJI_REACTIONS.map(emoji => {
                        // Determine if this emoji is the one the user reacted with (if any)
                        const isSelected = userReactionOnSelected === emoji;
                        return (
                            <IconButton
                                 key={emoji} onClick={() => handleReaction(emoji)} size="small"
                                 sx={{
                                     fontSize: '1.2rem', // Slightly larger emoji
                                     p: 0.5,
                                     borderRadius: '50%', // Circular background
                                     bgcolor: isSelected ? 'action.selected' : 'transparent',
                                     '&:hover': { bgcolor: 'action.hover' }
                                 }}
                                 aria-label={`React with ${emoji}`}
                            > {emoji} </IconButton>
                        );
                    })}
                 </Box>
            </Menu>
        </>
    );
};

export default RightSidebar;