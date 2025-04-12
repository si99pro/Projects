// src/components/PublicChat.js  <--- FILENAME CHANGED
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
    db, publicChatCollection, addDoc, query, orderBy, onSnapshot,
    serverTimestamp, doc, updateDoc, Timestamp
} from '../firebase';
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
import BlockIcon from '@mui/icons-material/Block';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';

// --- CSS ---
// Consider renaming or creating a specific CSS file if needed: import './PublicChat.css';
import './RightSidebar.css'; // Or keep using the existing one if styles apply

// --- Constants ---
const QUICK_EMOJI_REACTIONS = ['👍', '❤️', '😂'];
const ALL_EMOJI_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '🙏', '🤔', '🎉'];
const COLLAPSED_HEIGHT = '60px';
const EXPANDED_HEIGHT = '450px';
const PANEL_WIDTH = '320px';
const PANEL_RIGHT_OFFSET = '20px';

// --- Helper Functions ---
const getCurrentUserDisplayName = (currentUser, userData) => { if (userData?.basicInfo?.fullName) return userData.basicInfo.fullName; if (currentUser?.displayName) return currentUser.displayName; if (currentUser?.email) return currentUser.email.split('@')[0]; return "Unknown User"; };
const getInitials = (name) => { if (!name || typeof name !== 'string' || name.trim() === "" || name === "Unknown User") return '?'; const nameParts = name.trim().split(' ').filter(Boolean); if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[1][0]).toUpperCase(); if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase(); return '?'; };
const stringToColor = (string) => { let hash = 0; let i; if (!string || string.length === 0) return '#bdbdbd'; for (i = 0; i < string.length; i += 1) { hash = string.charCodeAt(i) + ((hash << 5) - hash); } let color = '#'; for (i = 0; i < 3; i += 1) { const value = (hash >> (i * 8)) & 0xff; color += `00${value.toString(16)}`.slice(-2); } const r = parseInt(color.substring(1, 3), 16); const g = parseInt(color.substring(3, 5), 16); const b = parseInt(color.substring(5, 7), 16); const brightness = (r * 299 + g * 587 + b * 114) / 1000; return brightness < 128 ? color : '#a0a0a0'; };
const formatTimestamp = (timestamp) => { if (!timestamp) return ''; try { const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp); if (isNaN(date.getTime())) return 'Invalid date'; if (isToday(date)) return format(date, 'p'); if (isYesterday(date)) return 'Yesterday'; return format(date, 'P'); } catch (e) { console.error("Error formatting date:", timestamp, e); return '...'; } };
// --- End Helper Functions ---


// **** CHANGE COMPONENT NAME ****
const PublicChat = () => {
// ****************************
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md')); // Hide floating panel on mobile
    const { currentUser, userData, loading: authLoading } = useAuth();

    // --- State ---
    // (Keep all state variables as they were in the floating panel code)
    const [isExpanded, setIsExpanded] = useState(false);
    const chatBodyRef = useRef(null);
    const [messages, setMessages] = useState([]);
    const [loadingMessages, setLoadingMessages] = useState(true);
    const [errorMessages, setErrorMessages] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [editingMessage, setEditingMessage] = useState(null);
    const [replyingToMessage, setReplyingToMessage] = useState(null);
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);
    const [selectedMessageId, setSelectedMessageId] = useState(null);
    const [reactionMenuAnchorEl, setReactionMenuAnchorEl] = useState(null);
    const [reactionMessageId, setReactionMessageId] = useState(null);
    const [showPanel, setShowPanel] = useState(true);

    // --- Firestore Listener ---
    useEffect(() => { /* ... listener logic ... */ }, [currentUser, authLoading]);

    // --- Handlers (Send, Update, Delete, Edit, Reply, Reactions, Menus, Expand, Close) ---
    // (Keep all handlers as they were in the floating panel code)
    const handleSendMessage = async () => { /* ... */ };
    const handleUpdateMessage = async () => { /* ... */ };
    const handleDeleteMessage = async (messageIdToDelete) => { /* ... */ };
    const handleStartEdit = (message) => { /* ... */ };
    const handleCancelEdit = () => { /* ... */ };
    const handleStartReply = (message) => { /* ... */ };
    const handleCancelReply = () => { /* ... */ };
    const handleReaction = async (clickedEmoji) => { /* ... */ };
    const handleOpenMenu = (event, messageId) => { /* ... */ };
    const handleCloseMenu = () => { /* ... */ };
    const handleOpenReactionMenu = (event, messageId) => { /* ... */ };
    const handleCloseReactionMenu = () => { /* ... */ };
    const handleToggleExpand = () => { setIsExpanded(prev => !prev); };
    const handleClosePanel = () => { setShowPanel(false); setIsExpanded(false); };

    // --- Effects ---
    const scrollToBottom = useCallback(() => { /* ... scroll logic ... */ }, [isExpanded]);
    useEffect(() => { /* ... scroll effect ... */ }, [messages, scrollToBottom, loadingMessages, isExpanded]);

    // --- Dynamic Vars ---
    // (Keep these as they were)
    const selectedMessageForMenu = messages.find(msg => msg.id === selectedMessageId);
    const messageForReactionMenu = messages.find(msg => msg.id === reactionMessageId);
    const userReactionOnSelected = messageForReactionMenu && currentUser && !messageForReactionMenu.isDeleted ? Object.entries(messageForReactionMenu.reactions || {}).find(([emoji, users]) => users?.includes(currentUser.uid))?.[0] : null;

    // --- Component Return ---
    // (Keep the exact return structure of the floating panel)
    if (isMobile || !showPanel || authLoading) { return null; }

    return (
        <>
            {/* Fixed Position Panel */}
            <Paper
                component="aside" // Use aside or div
                elevation={6}
                square={false}
                aria-label="Public Chat Panel"
                sx={{
                    position: 'fixed', bottom: 0, right: PANEL_RIGHT_OFFSET, width: PANEL_WIDTH,
                    height: isExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
                    bgcolor: 'var(--color-bg-card)', color: 'var(--color-text-primary)',
                    borderRadius: '8px 8px 0 0', boxShadow: theme.shadows[6],
                    display: 'flex', flexDirection: 'column', overflow: 'hidden',
                    transition: 'height 0.25s ease-in-out', zIndex: 1200,
                    border: `1px solid var(--color-border)`, borderBottom: 'none',
                }}
            >
                {/* Header */}
                <Box onClick={handleToggleExpand} sx={{ display: 'flex', /* ...header styles... */ }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', overflow: 'hidden' }}>
                        {!isExpanded && currentUser && ( <Avatar sx={{ /*...*/ }} /*...*/ /> )}
                        <Typography variant="subtitle1" component="h3" noWrap sx={{ fontWeight: 600 }}>Messaging</Typography>
                    </Box>
                    <Box> {/* Expand/Collapse/Close buttons */} </Box>
                </Box>

                {/* Content Wrapper (Chat + Input) - Only visible when expanded */}
                {isExpanded && (
                     <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                        {/* Chat Body - Scrolls internally */}
                        <Box className="chat-body" ref={chatBodyRef} sx={{ flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
                            {/* Loading/Error/Message List rendering */}
                            {/* ... (Exact same rendering logic as before) ... */}
                        </Box>

                        {/* Input Area */}
                        {currentUser && ( <Box className="chat-input-area" sx={{ p: 1, borderTop: `1px solid var(--color-border)`, flexShrink: 0 }}>
                               {/* ... Reply/Edit bars & TextField ... */}
                           </Box>
                        )}
                     </Box>
                 )}
            </Paper>

            {/* Menus (Positioned absolutely relative to triggers) */}
            <Menu id="message-action-menu" anchorEl={menuAnchorEl} /*...*/ >{/*...*/}</Menu>
            <Menu id="reaction-picker-menu" anchorEl={reactionMenuAnchorEl} /*...*/ >{/*...*/}</Menu>
        </>
    );
};

// **** CHANGE DEFAULT EXPORT ****
export default PublicChat;
// ******************************

// --- Helper function implementations (if defined locally) ---
// const getCurrentUserDisplayName = ...
// const getInitials = ...
// const stringToColor = ...
// const formatTimestamp = ...