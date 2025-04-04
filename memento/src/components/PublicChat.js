// src/components/PublicChat.js
import React, { useState, useEffect, useRef, useCallback } from 'react'; // <-- Import React hooks

// --- MUI Imports ---
import {
    Box, Typography, TextField, IconButton, Paper, Divider,
    Avatar, Skeleton, Menu, MenuItem, CircularProgress, Tooltip, Link as MuiLink,
    alpha,         // For color transparency
    useTheme,      // To access theme
    Button,        // For Edit/Save buttons
    ListItemIcon,  // For icons in MenuItems
    Popover        // For Emoji Picker display
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import CancelIcon from '@mui/icons-material/Cancel';

// --- Styling Imports ---
import styled from '@emotion/styled'; // <-- Import styled

// --- External Library Imports ---
import ScrollToBottom from 'react-scroll-to-bottom';
import { formatDistanceToNowStrict } from 'date-fns'; // For timestamps
import EmojiPicker, { EmojiStyle, Emoji } from 'emoji-picker-react';

// --- Firebase Imports ---
import { db, auth } from '../firebase'; // Assuming auth is also exported or use useAuth
import { useAuth } from '../auth/AuthContext'; // <-- Import useAuth
import {
    collection, query, orderBy, limit, onSnapshot,
    addDoc, serverTimestamp, doc, updateDoc, deleteDoc,
    getDoc, runTransaction, Timestamp
} from 'firebase/firestore'; // <-- Import Firestore functions


// --- Styled Components ---
// (These should now work as 'styled', 'Box', 'Paper', 'alpha', 'Typography' are imported)
const MessagesContainerWrapper = styled(Box)(({ theme }) => ({ flexGrow: 1, position: 'relative', overflow: 'hidden', backgroundColor: theme.palette.background.default, }));
const StyledScrollToBottom = styled(ScrollToBottom)(({ theme }) => ({ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, padding: theme.spacing(1.5, 2), '& > div:first-of-type': { '&::-webkit-scrollbar': { width: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400], borderRadius: '3px' }, '&::-webkit-scrollbar-thumb:hover': { background: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[500] }, scrollbarWidth: 'thin', scrollbarColor: `${theme.palette.mode === 'dark' ? theme.palette.grey[700] : theme.palette.grey[400]} transparent`, } }));
const MessageItem = styled(Box)(({ theme, isSender }) => ({ display: 'flex', marginBottom: theme.spacing(0.5), padding: theme.spacing(0.75, 0), flexDirection: isSender ? 'row-reverse' : 'row', position: 'relative', borderRadius: theme.shape.borderRadius, transition: 'background-color 0.15s ease-in-out', '&:hover': { backgroundColor: theme.palette.action.hover, '& .message-actions-hover': { opacity: 1, visibility: 'visible', }, }, }));
const MessageContent = styled(Box)(({ theme, isSender }) => ({ display: 'flex', flexDirection: 'column', alignItems: isSender ? 'flex-end' : 'flex-start', maxWidth: '75%', overflowWrap: 'break-word', }));
const MessageBubble = styled(Paper)(({ theme, isSender, isDeleted, isEditing }) => ({ padding: theme.spacing(0.75, 1.25), borderRadius: isSender ? '12px 12px 2px 12px' : '12px 12px 12px 2px', backgroundColor: isDeleted ? theme.palette.action.disabledBackground : isEditing ? alpha(theme.palette.info.light, 0.2) : isSender ? theme.palette.primary.main : theme.palette.grey[200], color: isDeleted ? theme.palette.text.disabled : isSender ? theme.palette.primary.contrastText : theme.palette.text.primary, boxShadow: theme.shadows[1], wordBreak: 'break-word', fontStyle: isDeleted ? 'italic' : 'normal', cursor: 'default', position: 'relative', minWidth: '40px', }));
const MessageMeta = styled(Typography)(({ theme, isSender }) => ({ fontSize: '0.65rem', color: theme.palette.text.disabled, marginTop: theme.spacing(0.25), paddingLeft: isSender ? 0 : theme.spacing(1.5), paddingRight: isSender ? theme.spacing(1.5) : 0, textAlign: isSender ? 'right' : 'left', }));
const HoverActions = styled(Box)(({ theme, isSender }) => ({ position: 'absolute', top: theme.spacing(-1.5), left: isSender ? 'auto' : `calc(75% + ${theme.spacing(1)})`, right: isSender ? `calc(75% + ${theme.spacing(1)})` : 'auto', transform: isSender ? 'translateX(50%)' : 'translateX(-50%)', display: 'flex', alignItems: 'center', gap: theme.spacing(0.25), backgroundColor: theme.palette.background.paper, borderRadius: '15px', padding: theme.spacing(0.25, 0.5), boxShadow: theme.shadows[3], opacity: 0, visibility: 'hidden', transition: 'opacity 0.15s ease-in-out, visibility 0.15s ease-in-out', zIndex: 2, pointerEvents: 'auto', '& .MuiIconButton-root': { padding: theme.spacing(0.5), color: theme.palette.text.secondary, '&:hover': { backgroundColor: theme.palette.action.hover, color: theme.palette.text.primary, } }, '& .MuiSvgIcon-root': { fontSize: '1.1rem', } }));
const ReactionChipContainer = styled(Box)(({ theme, isSender }) => ({ marginTop: theme.spacing(0.5), display: 'flex', gap: theme.spacing(0.5), flexWrap: 'wrap', justifyContent: isSender ? 'flex-end' : 'flex-start', paddingLeft: isSender ? 0 : theme.spacing(1.5), paddingRight: isSender ? theme.spacing(1.5) : 0, }));
const ReactionChip = styled(Box)(({ theme, reacted }) => ({ display: 'inline-flex', alignItems: 'center', gap: theme.spacing(0.5), padding: theme.spacing(0.25, 0.75), borderRadius: '10px', border: `1px solid ${reacted ? theme.palette.primary.main : theme.palette.divider}`, backgroundColor: reacted ? alpha(theme.palette.primary.main, 0.1) : 'transparent', cursor: 'pointer', fontSize: '0.7rem', transition: 'background-color 0.2s, border-color 0.2s', '&:hover': { borderColor: theme.palette.primary.light, backgroundColor: alpha(theme.palette.primary.light, 0.15), } }));
const ReplyPreview = styled(Box)(({ theme }) => ({ padding: theme.spacing(0.75, 1.5), backgroundColor: theme.palette.action.hover, borderLeft: `3px solid ${theme.palette.primary.main}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: theme.spacing(0.5), }));
const EditedInputWrapper = styled(Box)({ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%', });

// Define the common reactions
const commonReactions = ['👍', '❤️', '😂', '😮', '😢', '🙏'];
const reactionToUnified = { '👍': '1f44d', '❤️': '2764-fe0f', '😂': '1f602', '😮': '1f62e', '😢': '1f622', '🙏': '1f64f' };

// --- Main Component ---

function PublicChat({ onClose }) {
    const { user: currentUser, loading: authLoading } = useAuth(); // Now defined
    const theme = useTheme(); // Now defined

    // Hooks are now defined
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingMessage, setEditingMessage] = useState(null);
    const [editedText, setEditedText] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [messageActionAnchorEl, setMessageActionAnchorEl] = useState(null);
    const [reactionPopoverAnchorEl, setReactionPopoverAnchorEl] = useState(null);
    const [selectedMessageForAction, setSelectedMessageForAction] = useState(null);
    const inputRef = useRef(null);
    const editInputRef = useRef(null);

    const chatCollectionRef = collection(db, 'PublicChat'); // Firebase funcs now defined

    // --- Fetch Messages Effect ---
    useEffect(() => { // useEffect now defined
        setLoading(true);
        const q = query(chatCollectionRef, orderBy('timestamp', 'asc'), limit(100)); // query, orderBy, limit now defined
        const unsubscribe = onSnapshot(q, (querySnapshot) => { // onSnapshot now defined
            const fetchedMessages = [];
            querySnapshot.forEach((doc) => { // doc implicit from snapshot
                fetchedMessages.push({ id: doc.id, ...doc.data(), timestamp: doc.data().timestamp?.toDate() });
            });
            setMessages(fetchedMessages); setLoading(false); setError(null);
        }, (err) => { console.error("Error fetching chat messages:", err); setError("Could not load messages."); setLoading(false); });
        return () => unsubscribe();
    }, []); // Dependencies correct

    // --- Handlers ---

    const handleSendMessage = async (e) => {
        e?.preventDefault();
        const trimmedMessage = newMessage.trim();
        if (trimmedMessage === '' || !currentUser || authLoading) return;
        const messageData = { text: trimmedMessage, timestamp: serverTimestamp(), /* etc */ userId: currentUser.uid, userName: currentUser.displayName || 'Anonymous', userAvatar: currentUser.photoURL || null, edited: false, deleted: false, reactions: {}, replyTo: replyingTo ? replyingTo.id : null, mentions: [], };
        setNewMessage(''); setReplyingTo(null);
        try { await addDoc(chatCollectionRef, messageData); } // addDoc now defined
        catch (error) { console.error("Error sending message:", error); setError("Failed to send message."); }
    };

    // Edit Handlers
    const startEditing = (message) => { setEditingMessage(message); setEditedText(message.text); setMessageActionAnchorEl(null); setTimeout(() => editInputRef.current?.focus(), 0); };
    const cancelEditing = () => { setEditingMessage(null); setEditedText(''); };
    const handleSaveEdit = async () => { if (!editingMessage || !currentUser || currentUser.uid !== editingMessage.userId) return; const trimmedEdit = editedText.trim(); if (trimmedEdit === '' || trimmedEdit === editingMessage.text) { cancelEditing(); return; } const messageRef = doc(db, 'PublicChat', editingMessage.id); try { await updateDoc(messageRef, { text: trimmedEdit, edited: true, }); cancelEditing(); } catch (error) { console.error("Error updating message:", error); setError("Failed to save edit."); } }; // doc, db, updateDoc now defined

    // Delete Handler
    const handleDeleteMessage = async (messageId, messageUserId) => { if (!currentUser || currentUser.uid !== messageUserId) return; setMessageActionAnchorEl(null); if (window.confirm('Are you sure you want to delete this message?')) { const messageRef = doc(db, 'PublicChat', messageId); try { await updateDoc(messageRef, { text: '[message deleted]', deleted: true, }); } catch (error) { console.error("Error deleting message:", error); setError("Failed to delete message."); } } }; // doc, db, updateDoc now defined

    // Reply Handlers
    const handleReplyTo = (message) => { setReplyingTo({ id: message.id, userName: message.userName, textSnippet: message.text.length > 50 ? message.text.substring(0, 47) + '...' : message.text, }); setMessageActionAnchorEl(null); inputRef.current?.focus(); };
    const cancelReplying = () => { setReplyingTo(null); };

    // Reaction Handlers
    const handleOpenReactionPopover = (event, messageId) => { setSelectedMessageForAction(messageId); setReactionPopoverAnchorEl(event.currentTarget); setMessageActionAnchorEl(null); };
    const handleCloseReactionPopover = () => { setReactionPopoverAnchorEl(null); };
    const handleReactionClick = async (emoji) => { if (!currentUser || !selectedMessageForAction) return; const messageRef = doc(db, 'PublicChat', selectedMessageForAction); const unifiedEmoji = reactionToUnified[emoji]; handleCloseReactionPopover(); try { await runTransaction(db, async (transaction) => { const messageDoc = await transaction.get(messageRef); if (!messageDoc.exists()) throw new Error("Message does not exist!"); const currentReactions = messageDoc.data().reactions || {}; const userId = currentUser.uid; let userCurrentReactionEmoji = null; for (const [e, userList] of Object.entries(currentReactions)) { if (userList.includes(userId)) { userCurrentReactionEmoji = e; break; } } let updatedReactions = { ...currentReactions }; if (userCurrentReactionEmoji === unifiedEmoji) { updatedReactions[unifiedEmoji] = (updatedReactions[unifiedEmoji] || []).filter(id => id !== userId); if (updatedReactions[unifiedEmoji].length === 0) { delete updatedReactions[unifiedEmoji]; } } else { if (userCurrentReactionEmoji) { updatedReactions[userCurrentReactionEmoji] = (updatedReactions[userCurrentReactionEmoji] || []).filter(id => id !== userId); if (updatedReactions[userCurrentReactionEmoji].length === 0) { delete updatedReactions[userCurrentReactionEmoji]; } } updatedReactions[unifiedEmoji] = [...(updatedReactions[unifiedEmoji] || []), userId]; } transaction.update(messageRef, { reactions: updatedReactions }); }); setSelectedMessageForAction(null); } catch (error) { console.error("Error updating reaction: ", error); setError("Failed to update reaction."); setSelectedMessageForAction(null); } }; // doc, db, runTransaction now defined

    // Message Action Menu Handlers
    const handleOpenMessageMenu = (event, message) => { setSelectedMessageForAction(message.id); setReactionPopoverAnchorEl(null); setMessageActionAnchorEl(event.currentTarget); };
    const handleCloseMessageMenu = () => { setMessageActionAnchorEl(null); };

    // Helper Functions
    const formatTimestamp = (date) => { if (!date) return ''; try { return formatDistanceToNowStrict(date, { addSuffix: true }); } catch (e) { console.error("Error formatting date:", e); return date.toLocaleString(); } }; // formatDistanceToNowStrict now defined

    // --- Render ---
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: 'background.paper' }}>
            {/* Chat Header */}
            {/* Components ChatIcon, Typography, Tooltip, IconButton, CloseIcon are now defined */}
            <Box sx={{ p: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1 }}> <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}> <ChatIcon color="primary"/> <Typography variant="subtitle1" fontWeight={600}>Public Chat</Typography> </Box> {onClose && ( <Tooltip title="Minimize Chat"><IconButton onClick={onClose} size="small" aria-label="minimize chat"><CloseIcon fontSize="small" /></IconButton></Tooltip> )} </Box>

            {/* Messages Area */}
            <MessagesContainerWrapper>
                <StyledScrollToBottom mode="bottom">
                    {loading && ( <Box p={2}>{/* Skeleton */}</Box> )}
                    {!loading && error && ( <Typography color="error" textAlign="center" p={2}>{error}</Typography> )}
                    {!loading && !error && messages.map((msg) => {
                        const isSender = currentUser?.uid === msg.userId;
                        const isEditingThis = editingMessage?.id === msg.id;
                        const canModify = isSender && !msg.deleted;
                        const userReactionsMap = msg.reactions || {};
                        const userHasReactedWith = Object.entries(userReactionsMap).find(([emojiUnified, userList]) => userList.includes(currentUser?.uid))?.[0];

                        return (
                            // Components MessageItem, Avatar, MessageContent, Typography, MuiLink, Box, TextField, Button, HoverActions, Tooltip, IconButton, AddReactionOutlinedIcon, ReplyIcon, MoreVertIcon, ReactionChipContainer, ReactionChip, Emoji are now defined
                            <MessageItem key={msg.id} isSender={isSender} id={`message-${msg.id}`}>
                                <Avatar sx={{ width: 32, height: 32, fontSize: '0.9rem', mt: 0.5, ml: isSender ? 1 : 0, mr: isSender ? 0 : 1, bgcolor: isSender ? 'primary.light' : 'secondary.light', alignSelf: 'flex-start' }} src={msg.userAvatar || undefined} > {msg.userName?.charAt(0).toUpperCase() || '?'} </Avatar>
                                <MessageContent isSender={isSender}>
                                    {!isSender && !msg.deleted && ( <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ ml: 1.5, mb: 0.25 }}> {msg.userName} </Typography> )}
                                    {msg.replyTo && !msg.deleted && ( <MuiLink href={`#message-${msg.replyTo}`} underline="hover" onClick={(e) => { e.preventDefault(); document.getElementById(`message-${msg.replyTo}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }} sx={{ fontSize: '0.75rem', bgcolor: alpha(theme.palette.text.primary, 0.05), px: 1, py: 0.25, borderRadius: 1, mb: 0.5, display: 'inline-block', maxWidth: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} > Replying to {messages.find(m => m.id === msg.replyTo)?.userName || '...'} </MuiLink> )}
                                    <Box sx={{ position: 'relative', width: 'auto', alignSelf: isSender ? 'flex-end' : 'flex-start' }}>
                                        {isEditingThis ? ( <EditedInputWrapper><TextField multiline fullWidth variant="outlined" size="small" value={editedText} onChange={(e) => setEditedText(e.target.value)} inputRef={editInputRef} autoFocus onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSaveEdit(); } if (e.key === 'Escape') { cancelEditing(); } }} /><Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, fontSize: '0.75rem' }}><Button size="small" onClick={cancelEditing}>Cancel</Button><Button size="small" variant="contained" onClick={handleSaveEdit} disabled={editedText.trim() === '' || editedText === editingMessage.text}>Save</Button></Box></EditedInputWrapper> ) : ( <MessageBubble elevation={0} variant="outlined" isSender={isSender} isDeleted={msg.deleted} > <Typography variant="body2">{msg.text}</Typography> </MessageBubble> )}
                                        {!isEditingThis && !msg.deleted && ( <HoverActions className="message-actions-hover" isSender={isSender}><Tooltip title="React"><IconButton size="small" onClick={(e) => handleOpenReactionPopover(e, msg.id)}><AddReactionOutlinedIcon/></IconButton></Tooltip><Tooltip title="Reply"><IconButton size="small" onClick={() => handleReplyTo(msg)}><ReplyIcon/></IconButton></Tooltip>{canModify && ( <Tooltip title="More"><IconButton size="small" onClick={(e) => handleOpenMessageMenu(e, msg)}><MoreVertIcon/></IconButton></Tooltip> )}</HoverActions> )}
                                    </Box>
                                    <MessageMeta isSender={isSender}> {formatTimestamp(msg.timestamp)} {msg.edited && !msg.deleted && ' (edited)'} </MessageMeta>
                                    {!msg.deleted && Object.keys(userReactionsMap).length > 0 && ( <ReactionChipContainer isSender={isSender}>{Object.entries(userReactionsMap).map(([unifiedEmoji, userIds]) => ( userIds?.length > 0 && ( <ReactionChip key={unifiedEmoji} reacted={userIds.includes(currentUser?.uid)} onClick={(e) => handleOpenReactionPopover(e, msg.id)} > <Emoji unified={unifiedEmoji} size={14} emojiStyle={EmojiStyle.NATIVE} /> <span>{userIds.length}</span> </ReactionChip> ) ))}</ReactionChipContainer> )}
                                </MessageContent>
                            </MessageItem>
                        );
                    })}
                </StyledScrollToBottom>
            </MessagesContainerWrapper>

            {/* Input Area */}
             {/* Components Divider, Box, Typography, IconButton, CancelIcon, TextField, SendIcon are now defined */}
            <Divider />
            <Box sx={{ p: 1.5, flexShrink: 0, bgcolor: 'background.paper' }}> {replyingTo && ( <ReplyPreview><Box sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>Replying to <strong>{replyingTo.userName}</strong>:<Typography variant="caption" sx={{ ml: 0.5, fontStyle: 'italic', color: 'text.secondary' }}>{replyingTo.textSnippet}</Typography></Box><IconButton size="small" onClick={cancelReplying} aria-label="cancel reply"><CancelIcon fontSize="inherit"/></IconButton></ReplyPreview> )} <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><TextField inputRef={inputRef} variant="outlined" size="small" fullWidth placeholder="Type a message..." value={newMessage} onChange={(e) => setNewMessage(e.target.value)} autoComplete="off" onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }} sx={{ '& .MuiOutlinedInput-root': { borderRadius: '20px', backgroundColor: 'action.hover', '& fieldset': { border: 'none' } } }} /><IconButton type="submit" color="primary" aria-label="send message" disabled={newMessage.trim() === '' || authLoading}><SendIcon /></IconButton></Box> </Box>

            {/* Message Action Menu */}
            {/* Components Menu, MenuItem, ListItemIcon, EditIcon, DeleteOutlineIcon are now defined */}
            <Menu anchorEl={messageActionAnchorEl} open={Boolean(messageActionAnchorEl)} onClose={handleCloseMessageMenu} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }} transformOrigin={{ vertical: 'top', horizontal: 'right' }} > <MenuItem onClick={() => startEditing(messages.find(m => m.id === selectedMessageForAction))}> <ListItemIcon><EditIcon fontSize="small" /></ListItemIcon> Edit </MenuItem> <MenuItem onClick={() => handleDeleteMessage(selectedMessageForAction, messages.find(m => m.id === selectedMessageForAction)?.userId)} sx={{ color: 'error.main' }}> <ListItemIcon><DeleteOutlineIcon fontSize="small" color="error" /></ListItemIcon> Delete </MenuItem> </Menu>

            {/* Fixed Reaction Popover */}
             {/* Component Popover is now defined */}
            <Popover open={Boolean(reactionPopoverAnchorEl)} anchorEl={reactionPopoverAnchorEl} onClose={handleCloseReactionPopover} anchorOrigin={{ vertical: 'top', horizontal: 'center' }} transformOrigin={{ vertical: 'bottom', horizontal: 'center' }} sx={{ '& .MuiPaper-root': { borderRadius: '20px', p: 0.5 } }} >
                 <Box sx={{ display: 'flex', gap: 0.5 }}>
                     {commonReactions.map(emoji => {
                         const unified = reactionToUnified[emoji];
                         const msg = messages.find(m => m.id === selectedMessageForAction);
                         const usersReacted = msg?.reactions?.[unified] || [];
                         const alreadyReacted = usersReacted.includes(currentUser?.uid);
                         return (
                            // Components Tooltip, IconButton, Typography are now defined
                            <Tooltip key={emoji} title={emoji}>
                                <IconButton size="small" onClick={() => handleReactionClick(emoji)} sx={{ bgcolor: alreadyReacted ? alpha(theme.palette.primary.main, 0.15) : 'transparent', '&:hover': { bgcolor: alpha(theme.palette.action.selected, 0.1) } }} >
                                    <Typography sx={{ fontSize: '1.2rem' }}>{emoji}</Typography>
                                </IconButton>
                            </Tooltip>
                         );
                     })}
                 </Box>
            </Popover>

        </Box>
    );
}

export default PublicChat;