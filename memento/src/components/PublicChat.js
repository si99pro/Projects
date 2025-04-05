// src/components/PublicChat.js
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
    Box, Typography, TextField, IconButton, Paper, Skeleton, Menu, MenuItem,
    Tooltip, alpha, useTheme, Button, ListItemIcon, Popover, Stack, Chip
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import CancelIcon from '@mui/icons-material/Cancel';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';

// Import styled components
import {
    ChatWrapper, Header, MessagesContainerWrapper, StyledScrollToBottom, ReplyInputPreview,
    InputArea, InputTextField
} from './PublicChatStyles';

// Import the memoized MessageItem component
import MessageItem from './MessageItem';

// Import other dependencies
import EmojiPicker, { EmojiStyle, Theme as EmojiTheme } from 'emoji-picker-react';
import { db } from '../firebase';
import { useAuth } from '../auth/AuthContext';
import {
    collection, query, orderBy, limit, onSnapshot,
    addDoc, serverTimestamp, doc, updateDoc, deleteDoc, runTransaction
} from 'firebase/firestore';
import { format, isSameDay } from 'date-fns';


// --- Constants ---
const MESSAGES_LIMIT = 100;
const DELETED_MESSAGE_TEXT = '[message deleted]';

// --- Main Component ---
function PublicChat({ onClose }) {
    const { user: currentUser, loading: authLoading } = useAuth();
    const theme = useTheme();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingMessageId, setEditingMessageId] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageActionAnchorEl, setMessageActionAnchorEl] = useState(null);
    const [reactionPopoverAnchorEl, setReactionPopoverAnchorEl] = useState(null);
    const [emojiPickerAnchorEl, setEmojiPickerAnchorEl] = useState(null);
    const [selectedMessageForAction, setSelectedMessageForAction] = useState(null);
    const inputRef = useRef(null);
    const editInputRef = useRef(null);
    const chatCollectionRef = useMemo(() => collection(db, 'PublicChat'), []);

    // --- Fetch Messages Effect ---
    useEffect(() => {
        setLoading(true);
        setError(null);
        const q = query(chatCollectionRef, orderBy('timestamp', 'asc'), limit(MESSAGES_LIMIT));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id, ...doc.data(),
                timestamp: doc.data().timestamp?.toDate ? doc.data().timestamp.toDate() : new Date()
            }));
            setMessages(fetchedMessages);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching messages:", err);
            setError("Could not load messages.");
            setLoading(false);
        });
        return () => unsubscribe();
    }, [chatCollectionRef]);

    // --- Memoized Callbacks ---
    const handleSendMessage = useCallback(async (e) => {
        e?.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage === '' || !currentUser || authLoading || loading) return;

        const messageData = {
            text: trimmedMessage, timestamp: serverTimestamp(), userId: currentUser.uid,
            userName: currentUser.displayName || currentUser.email || 'Anonymous',
            userAvatar: currentUser.photoURL || null, edited: false, deleted: false,
            reactions: {}, replyTo: replyingTo ? replyingTo.id : null, mentions: [],
        };
        const currentReply = replyingTo;
        setNewMessage(''); setReplyingTo(null); if (emojiPickerAnchorEl) setEmojiPickerAnchorEl(null);

        try { await addDoc(chatCollectionRef, messageData); }
        catch (error) {
            console.error("Error sending message:", error); setError(`Failed to send. ${error.code || ''}`);
            setNewMessage(trimmedMessage); setReplyingTo(currentReply); // Restore state on error
        }
    }, [newMessage, currentUser, authLoading, loading, replyingTo, chatCollectionRef, emojiPickerAnchorEl]);

    const startEditing = useCallback((message) => {
        if (!message || message.userId !== currentUser?.uid || message.deleted) return;
        setEditingMessageId(message.id); setEditedText(message.text);
        setMessageActionAnchorEl(null); setReactionPopoverAnchorEl(null);
        setTimeout(() => editInputRef.current?.focus(), 100);
    }, [currentUser?.uid]);

    const cancelEditing = useCallback(() => { setEditingMessageId(null); setEditedText(''); }, []);

    const handleSaveEdit = useCallback(async () => {
        if (!editingMessageId || !currentUser) return;
        const msg = messages.find(m => m.id === editingMessageId);
        if (!msg || currentUser.uid !== msg.userId) return;
        const trimmed = editedText.trim();
        if (trimmed === '' || trimmed === msg.text) { cancelEditing(); return; }
        const ref = doc(db, 'PublicChat', editingMessageId);
        cancelEditing(); // Optimistic close
        try { await updateDoc(ref, { text: trimmed, edited: true }); }
        catch (error) { console.error("Error saving edit:", error); setError("Failed to save edit."); }
    }, [editingMessageId, currentUser, editedText, messages, cancelEditing]);

    const handleDeleteMessage = useCallback(async (messageId) => {
        const msg = messages.find(m => m.id === messageId);
        if (!currentUser || !msg || currentUser.uid !== msg.userId) return;
        setMessageActionAnchorEl(null);
        if (window.confirm('Delete this message?')) {
            const ref = doc(db, 'PublicChat', messageId);
            try { await updateDoc(ref, { text: DELETED_MESSAGE_TEXT, deleted: true, reactions: {}, edited: false }); }
            catch (error) { console.error("Error deleting:", error); setError("Failed to delete message."); }
        }
    }, [currentUser, messages]);

    const handleReplyTo = useCallback((message) => {
        if (message.deleted) return;
        setReplyingTo({
            id: message.id, userName: message.userName || 'User',
            textSnippet: message.text.length > 50 ? message.text.substring(0, 47) + '...' : message.text,
        });
        setMessageActionAnchorEl(null); setReactionPopoverAnchorEl(null); inputRef.current?.focus();
    }, []);

    const cancelReplying = useCallback(() => { setReplyingTo(null); }, []);

    const commonReactions = useMemo(() => ['👍', '❤️', '😂', '😮', '😢', '🙏'], []);
    const reactionToUnified = useMemo(() => ({ '👍': '1f44d', '❤️': '2764-fe0f', '😂': '1f602', '😮': '1f62e', '😢': '1f622', '🙏': '1f64f' }), []);

    const handleOpenReactionPopover = useCallback((event, msgId) => { setSelectedMessageForAction(msgId); setReactionPopoverAnchorEl(event.currentTarget); setMessageActionAnchorEl(null); }, []);
    const handleCloseReactionPopover = useCallback(() => { setReactionPopoverAnchorEl(null); }, []);

    const handleReactionClick = useCallback(async (unifiedEmoji) => {
         if (!currentUser || !selectedMessageForAction || authLoading) return;
         const ref = doc(db, 'PublicChat', selectedMessageForAction);
         handleCloseReactionPopover();
         try {
             await runTransaction(db, async (tx) => {
                 const msgDoc = await tx.get(ref);
                 if (!msgDoc.exists() || msgDoc.data().deleted) throw new Error("Msg deleted/not found");
                 const reactions = msgDoc.data().reactions || {};
                 const uid = currentUser.uid; let updated = { ...reactions }; let oldReaction = null;
                 Object.entries(updated).forEach(([uni, list]) => { if (list.includes(uid)) oldReaction = uni; });
                 if (oldReaction === unifiedEmoji) { // Toggle off
                    updated[unifiedEmoji] = (updated[unifiedEmoji] || []).filter(id => id !== uid);
                    if (!updated[unifiedEmoji]?.length) delete updated[unifiedEmoji];
                 } else { // Add new / change
                    if (oldReaction) { // Remove old
                        updated[oldReaction] = (updated[oldReaction] || []).filter(id => id !== uid);
                        if (!updated[oldReaction]?.length) delete updated[oldReaction];
                    } updated[unifiedEmoji] = [...(updated[unifiedEmoji] || []), uid]; // Add new
                 } tx.update(ref, { reactions: updated });
             }); setSelectedMessageForAction(null);
         } catch (error) { console.error("Reaction error:", error); setError("Failed reaction."); setSelectedMessageForAction(null); }
    }, [currentUser, selectedMessageForAction, authLoading, handleCloseReactionPopover]);

    const handleOpenEmojiPicker = useCallback((e) => { setEmojiPickerAnchorEl(e.currentTarget); }, []);
    const handleCloseEmojiPicker = useCallback(() => { setEmojiPickerAnchorEl(null); }, []);
    const onEmojiClick = useCallback((d) => { setNewMessage(p => p + d.emoji); handleCloseEmojiPicker(); inputRef.current?.focus(); }, [handleCloseEmojiPicker]);

    const handleOpenMessageMenu = useCallback((e, msgId) => {
        const msg = messages.find(m => m.id === msgId); if (!msg || msg.deleted || msg.userId !== currentUser?.uid) return;
        setSelectedMessageForAction(msgId); setMessageActionAnchorEl(e.currentTarget); setReactionPopoverAnchorEl(null);
    }, [messages, currentUser?.uid]);
    const handleCloseMessageMenu = useCallback(() => { setMessageActionAnchorEl(null); }, []);

    const handleScrollToMessage = useCallback((msgId) => {
         const el = document.getElementById(`message-${msgId}`);
         el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
         el?.classList.add('highlight'); setTimeout(() => el?.classList.remove('highlight'), 1500);
     }, []);

    const handleEditInputChange = useCallback((e) => { setEditedText(e.target.value); }, []);

    // --- Render ---
    return (
        <ChatWrapper>
            {/* Header */}
            <Header component={Paper} elevation={1}>
                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, overflow: 'hidden', flexGrow: 1 }}>
                    <ChatBubbleOutlineIcon color="primary" />
                    <Typography variant="h6" fontWeight={500} noWrap sx={{ fontSize: '1.1rem' }}>Public Chat</Typography>
                 </Box>
                 {onClose && (<Tooltip title="Close Chat"><IconButton onClick={onClose} size="small"><CloseIcon fontSize="small" /></IconButton></Tooltip>)}
            </Header>

            {/* Messages Area */}
            <MessagesContainerWrapper>
                 <StyledScrollToBottom mode="bottom">
                     {loading && !messages.length && (<Stack spacing={2.5} p={2}><Skeleton variant="rounded" h={55} w="60%"/><Skeleton variant="rounded" h={65} w="70%" sx={{ alignSelf: 'flex-end' }}/><Skeleton variant="rounded" h={45} w="50%"/></Stack>)}
                     {error && (<Typography color="error" textAlign="center" p={3} role="alert">{error}</Typography>)}
                     {!loading && !error && messages.length === 0 && (<Typography color="text.secondary" textAlign="center" p={4}>Be the first to say something! 🎉</Typography>)}
                     {!error && messages.map((msg, i, arr) => (
                         <MessageItem key={msg.id} msg={msg} prevMsg={arr[i - 1]} currentUser={currentUser}
                             isEditingThis={editingMessageId === msg.id} editedText={editedText}
                             onEditChange={handleEditInputChange} onSaveEdit={handleSaveEdit} onCancelEdit={cancelEditing}
                             onStartEditing={() => startEditing(msg)} onDeleteMessage={() => handleDeleteMessage(msg.id)}
                             onReplyTo={handleReplyTo} onOpenReactionPopover={handleOpenReactionPopover}
                             onOpenMessageMenu={handleOpenMessageMenu} onReactionClick={handleReactionClick}
                             onScrollToMessage={handleScrollToMessage} editInputRef={editInputRef}
                             reactionToUnified={reactionToUnified} messages={messages}
                         />
                     ))}
                </StyledScrollToBottom>
            </MessagesContainerWrapper>

             {/* Input Area Wrapper */}
             {/* Use Box to apply top border conditionally */}
             <Box sx={{ flexShrink: 0, borderTop: replyingTo ? 'none' : `1px solid ${theme.palette.divider}` }}>
                 {replyingTo && (
                     <ReplyInputPreview elevation={0}>
                         <Box sx={{ overflow: 'hidden', mr: 1 }}>
                             <Typography variant="caption" fontWeight="bold" color="primary">{`Replying to ${replyingTo.userName}`}</Typography>
                             <Typography variant="caption" sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'text.secondary' }}>{replyingTo.textSnippet}</Typography>
                         </Box>
                         <Tooltip title="Cancel Reply"><IconButton size="small" onClick={cancelReplying}><CancelIcon fontSize="inherit" /></IconButton></Tooltip>
                     </ReplyInputPreview>
                 )}
                 <InputArea component={Paper} elevation={0}>
                     <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
                         <Tooltip title="Emoji" placement="top"><span><IconButton onClick={handleOpenEmojiPicker} sx={{ mb: 0.5 }} disabled={authLoading || loading}><SentimentSatisfiedAltIcon color={emojiPickerAnchorEl ? "primary" : "action"} /></IconButton></span></Tooltip>
                         <InputTextField inputRef={inputRef} multiline maxRows={4} variant="outlined" size="small" fullWidth
                             placeholder={authLoading ? "Connecting..." : (loading ? "Loading..." : "Type a message...")}
                             value={newMessage} onChange={(e) => setNewMessage(e.target.value)} disabled={authLoading || loading} autoComplete="off"
                             onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
                         />
                         <Tooltip title={newMessage.trim() === '' ? "Type a message" : "Send"} placement="top"><span><IconButton type="submit" color="primary" aria-label="Send message" disabled={newMessage.trim() === '' || authLoading || loading} sx={{ bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.dark' }, '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' }, transition: 'background-color 0.2s ease', mb: 0.5 }}><SendIcon /></IconButton></span></Tooltip>
                     </Box>
                 </InputArea>
             </Box>

            {/* Menus and Popovers */}
            <Menu anchorEl={messageActionAnchorEl} open={Boolean(messageActionAnchorEl)} onClose={handleCloseMessageMenu} MenuListProps={{ 'aria-label': 'Message actions' }}>
                {selectedMessageForAction && messages.find(m => m.id === selectedMessageForAction) && (<>
                    <MenuItem onClick={() => { const m = messages.find(id => id.id === selectedMessageForAction); if(m) startEditing(m); }}><ListItemIcon><EditIcon fontSize="small" /></ListItemIcon>Edit</MenuItem>
                    <MenuItem onClick={() => handleDeleteMessage(selectedMessageForAction)} sx={{ color: 'error.main' }}><ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon>Delete</MenuItem>
                </>)}
            </Menu>

            <Popover open={Boolean(reactionPopoverAnchorEl)} anchorEl={reactionPopoverAnchorEl} onClose={handleCloseReactionPopover} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} transformOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ '& .MuiPaper-root': { borderRadius: '20px', p: theme.spacing(0.5, 1), boxShadow: 3, bgcolor: alpha(theme.palette.background.paper, 0.95), backdropFilter: 'blur(4px)', display: 'flex', gap: 0.5 } }} aria-label="Add reaction">
                 {commonReactions.map(emoji => {
                     const msg = messages.find(m => m.id === selectedMessageForAction);
                     const unified = reactionToUnified[emoji];
                     const users = msg?.reactions?.[unified] || [];
                     const reacted = users.includes(currentUser?.uid);
                     return (<Tooltip key={emoji} title={emoji} placement="bottom"><IconButton size="medium" onClick={() => handleReactionClick(unified)} sx={{ bgcolor: reacted ? alpha(theme.palette.primary.main, 0.15) : 'transparent', border: reacted ? `1px solid ${alpha(theme.palette.primary.main, 0.5)}` : '1px solid transparent', transition: 'all 0.15s ease', '&:hover': { transform: 'scale(1.15)' } }} aria-label={`React ${emoji}${reacted ? ' (selected)' : ''}`} aria-pressed={reacted}><Typography sx={{ fontSize: '1.5rem', lineHeight: 1 }}>{emoji}</Typography></IconButton></Tooltip>);
                 })}
            </Popover>

             <Popover open={Boolean(emojiPickerAnchorEl)} anchorEl={emojiPickerAnchorEl} onClose={handleCloseEmojiPicker} anchorOrigin={{ vertical: 'top', horizontal: 'left' }} transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}>
                 <EmojiPicker onEmojiClick={onEmojiClick} autoFocusSearch={false} emojiStyle={EmojiStyle.NATIVE} theme={theme.palette.mode === 'dark' ? EmojiTheme.DARK : EmojiTheme.LIGHT} lazyLoadEmojis={true} height={380} width={320} previewConfig={{ showPreview: false }} />
             </Popover>

        </ChatWrapper>
    );
}

export default PublicChat;