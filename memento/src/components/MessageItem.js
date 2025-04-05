/* eslint-disable no-unused-vars */
// src/components/MessageItem.js
import React, { memo } from 'react';
import {
    Box, Typography, Paper, Avatar, Tooltip, IconButton, Menu, MenuItem,
    ListItemIcon, Stack, Button, Chip, TextField, alpha, useTheme, Popover
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import AddReactionOutlinedIcon from '@mui/icons-material/AddReactionOutlined';
import ReplyIcon from '@mui/icons-material/Reply';
import DoneIcon from '@mui/icons-material/Done';
import CheckIcon from '@mui/icons-material/Check'; // Sent indicator
import { format, isToday, isYesterday, isSameDay, differenceInMinutes } from 'date-fns';
import { Emoji, EmojiStyle } from 'emoji-picker-react';

// Import styled components from the central file
import {
    MessageItemContainer, AvatarContainer, MessageContent, MessageBubble, BubbleMeta,
    TimestampText, EditedText, HoverActions, ReactionChipContainer, ReactionChip,
    ReplyInBubblePreview, EditInputWrapper, DateSeparator, DateChip,
    InputTextField as EditInputTextField // Alias needed
} from './PublicChatStyles';

// --- Constants ---
const DELETED_MESSAGE_TEXT = '[message deleted]';
const MESSAGE_GROUP_TIME_THRESHOLD_MINUTES = 5;

// --- Helper Functions ---
const formatTimestamp = (date) => {
    if (!date) return '';
    try {
        return new Intl.DateTimeFormat(navigator.language || 'en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).format(date);
    } catch (e) { return '??:??'; }
};

const formatDateSeparatorLabel = (date) => {
    if (!date) return null;
    const now = new Date();
    if (isToday(date)) return 'Today';
    if (isYesterday(date)) return 'Yesterday';
    if (date.getFullYear() === now.getFullYear()) { return format(date, 'MMMM d'); }
    return format(date, 'MMMM d, yyyy');
};

const shouldShowMessageMeta = (msg, prevMsg) => {
    if (!prevMsg) return true;
    if (msg.userId !== prevMsg.userId) return true;
    if (msg.replyTo && msg.replyTo !== prevMsg.replyTo) return true;
    if (!msg.timestamp || !prevMsg.timestamp) return true;
    const diff = differenceInMinutes(msg.timestamp, prevMsg.timestamp);
    return diff >= MESSAGE_GROUP_TIME_THRESHOLD_MINUTES;
};

// --- MessageItem Component ---
const MessageItem = memo(({
    msg, prevMsg, currentUser, isEditingThis, editedText,
    onEditChange, onSaveEdit, onCancelEdit, onStartEditing, onDeleteMessage,
    onReplyTo, onOpenReactionPopover, onOpenMessageMenu, onReactionClick,
    onScrollToMessage, editInputRef, reactionToUnified, messages
}) => {
    const theme = useTheme();
    const isSender = currentUser?.uid === msg.userId;
    const canModify = isSender && !msg.deleted && currentUser?.uid === msg.userId;

    const showMeta = shouldShowMessageMeta(msg, prevMsg);
    const isGrouped = !showMeta && prevMsg?.userId === msg.userId;
    const showDateSeparator = !prevMsg || (msg.timestamp && prevMsg.timestamp && !isSameDay(msg.timestamp, prevMsg.timestamp));
    const dateSeparatorLabel = showDateSeparator ? formatDateSeparatorLabel(msg.timestamp) : null;

    const userReactionsMap = msg.reactions || {};
    const repliedMsgData = msg.replyTo ? messages.find(m => m.id === msg.replyTo) : null;

    const getUserNameById = (userId) => {
         const userMsg = messages.find(m => m.userId === userId);
         return userMsg?.userName || 'User'; // Simple fallback
    };

    return (
        <React.Fragment>
            {/* Date Separator */}
            {showDateSeparator && dateSeparatorLabel && (
                <DateSeparator>
                    <DateChip label={dateSeparatorLabel} />
                </DateSeparator>
            )}
            {/* Message Item Row */}
            <MessageItemContainer id={`message-${msg.id}`} isSender={isSender} isGrouped={isGrouped}>
                {/* Avatar */}
                <AvatarContainer sx={{ visibility: isGrouped && !isSender ? 'hidden' : 'visible' }}>
                    {showMeta && !isSender && (
                        <Tooltip title={msg.userName || 'User'} placement="right">
                            <Avatar
                                sx={{ width: 32, height: 32, fontSize: '0.9rem' }} // Removed explicit bgcolor
                                src={msg.userAvatar || undefined}
                                alt={msg.userName?.charAt(0)?.toUpperCase() || '?'}
                            >
                                {msg.userName?.charAt(0)?.toUpperCase() || '?'}
                            </Avatar>
                        </Tooltip>
                    )}
                </AvatarContainer>
                {/* Content */}
                <MessageContent isSender={isSender}>
                    {/* User Name (Receiver) */}
                    {!isSender && showMeta && !msg.deleted && (
                        <Typography variant="caption" fontWeight="bold" color="text.secondary" sx={{ mb: 0.25, ml: 1.5 }}>
                            {msg.userName || 'User'}
                        </Typography>
                    )}
                    {/* Bubble or Edit Input */}
                    <Box sx={{ position: 'relative', width: 'auto', alignSelf: isSender ? 'flex-end' : 'flex-start' }}>
                        {isEditingThis ? (
                            <EditInputWrapper>
                                <EditInputTextField
                                    multiline fullWidth variant="outlined" size="small"
                                    value={editedText} onChange={onEditChange} inputRef={editInputRef} autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSaveEdit(); }
                                        if (e.key === 'Escape') { onCancelEdit(); }
                                    }}
                                    sx={{
                                        bgcolor: alpha(theme.palette.info.light, 0.2), // Use style from MessageBubble
                                        '& .MuiOutlinedInput-root': { borderRadius: '10px'}
                                    }}
                                />
                                <Stack direction="row" justifyContent="flex-end" spacing={1} sx={{ fontSize: '0.75rem', mt: 0.5 }}>
                                    <Button size="small" onClick={onCancelEdit} variant="text" sx={{ color: theme.palette.text.secondary }}>Cancel</Button>
                                    <Button size="small" variant="contained" color="primary" onClick={onSaveEdit}
                                        disabled={editedText.trim() === '' || editedText === msg.text}
                                        startIcon={<DoneIcon fontSize="small" />}
                                    > Save </Button>
                                </Stack>
                            </EditInputWrapper>
                        ) : (
                            <MessageBubble isSender={isSender} isDeleted={msg.deleted} isEditing={msg.edited && !msg.deleted}>
                                {/* Reply Preview */}
                                {repliedMsgData && !msg.deleted && (
                                    <ReplyInBubblePreview isSender={isSender} tabIndex={0}
                                        onClick={(e) => { e.preventDefault(); onScrollToMessage(repliedMsgData.id); }}
                                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onScrollToMessage(repliedMsgData.id)}}
                                        aria-label={`Reply to ${repliedMsgData.userName}: ${repliedMsgData.deleted ? DELETED_MESSAGE_TEXT : repliedMsgData.text.substring(0,30)}... Click to view original.`}
                                    >
                                        <Typography variant="caption" fontWeight="bold"
                                            color={isSender ? alpha(theme.palette.common.white, 0.9) : theme.palette.primary.main}
                                            sx={{ display: 'block' }}
                                        > {repliedMsgData.userName || 'User'} </Typography>
                                        <Typography variant="caption"
                                            color={isSender ? alpha(theme.palette.common.white, 0.8) : "text.secondary"}
                                            sx={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                        > {repliedMsgData.deleted ? DELETED_MESSAGE_TEXT : repliedMsgData.text} </Typography>
                                    </ReplyInBubblePreview>
                                )}
                                {/* Message Text */}
                                <Typography variant="body2" sx={{ py: repliedMsgData ? 0.25 : 0 }}> {msg.text} </Typography>
                                {/* Meta Info */}
                                {!msg.deleted && (
                                    <BubbleMeta isSender={isSender}>
                                        {msg.edited && <EditedText>(edited)</EditedText>}
                                        <Tooltip title={msg.timestamp ? format(msg.timestamp, 'Pp') : ''} placement="top">
                                            <TimestampText>{formatTimestamp(msg.timestamp)}</TimestampText>
                                        </Tooltip>
                                        {isSender && <CheckIcon sx={{ fontSize: '0.9rem', opacity: 0.8 }} />}
                                    </BubbleMeta>
                                )}
                            </MessageBubble>
                        )}
                        {/* Hover Actions */}
                         {!isEditingThis && !msg.deleted && (
                            <HoverActions className="message-actions-hover" isSender={isSender}>
                                <Tooltip title="React" placement="top">
                                    <IconButton size="small" onClick={(e) => onOpenReactionPopover(e, msg.id)} aria-label="React to message">
                                        <AddReactionOutlinedIcon />
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Reply" placement="top">
                                    <IconButton size="small" onClick={() => onReplyTo(msg)} aria-label="Reply to message">
                                        <ReplyIcon sx={{ transform: 'scaleX(-1)' }} />
                                    </IconButton>
                                </Tooltip>
                                {canModify && (
                                    <Tooltip title="More" placement="top">
                                        <IconButton size="small" onClick={(e) => onOpenMessageMenu(e, msg.id)} aria-label="More message options">
                                            <MoreHorizIcon />
                                        </IconButton>
                                    </Tooltip>
                                )}
                            </HoverActions>
                        )}
                    </Box>
                    {/* Reactions */}
                    {!msg.deleted && Object.keys(userReactionsMap).length > 0 && (
                        <ReactionChipContainer isSender={isSender}>
                            {Object.entries(userReactionsMap)
                                .filter(([_, userIds]) => userIds?.length > 0)
                                .sort(([, aUserIds], [, bUserIds]) => bUserIds.length - aUserIds.length) // Sort by count desc
                                .map(([unifiedEmoji, userIds]) => {
                                    const reactedByCurrentUser = userIds.includes(currentUser?.uid);
                                    const tooltipTitle = userIds
                                        .map(uid => (uid === currentUser?.uid ? 'You' : getUserNameById(uid)))
                                        .slice(0, 10).join(', ') + (userIds.length > 10 ? ` and ${userIds.length - 10} others` : '');
                                    // Find the display emoji (this assumes reactionToUnified covers all possibilities)
                                    const displayEmoji = Object.keys(reactionToUnified).find(key => reactionToUnified[key] === unifiedEmoji) || '?';

                                    return (
                                        <Tooltip key={unifiedEmoji} title={`Reacted with ${displayEmoji}: ${tooltipTitle}`} placement="top">
                                            <ReactionChip
                                                reacted={reactedByCurrentUser} tabIndex={0}
                                                onClick={() => onReactionClick(unifiedEmoji)}
                                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onReactionClick(unifiedEmoji)}}
                                                aria-label={`${userIds.length} reaction${userIds.length !== 1 ? 's' : ''}: ${displayEmoji}. ${reactedByCurrentUser ? 'You reacted.' : ''} Click to ${reactedByCurrentUser ? 'remove' : 'add'} reaction.`}
                                            >
                                                <Emoji unified={unifiedEmoji} size={15} emojiStyle={EmojiStyle.NATIVE} />
                                                <Typography variant="caption" component="span" sx={{ fontWeight: 500 }}>
                                                    {userIds.length}
                                                </Typography>
                                            </ReactionChip>
                                        </Tooltip>
                                    );
                                })}
                        </ReactionChipContainer>
                    )}
                </MessageContent>
            </MessageItemContainer>
        </React.Fragment>
    );
});

export default MessageItem;