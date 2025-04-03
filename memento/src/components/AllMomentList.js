/* eslint-disable no-unused-vars */

// src/components/AllMomentList.js

import React, { useState, useEffect, useCallback } from 'react';

// ========= CORE MUI & MOMENT IMPORTS =========
import {
  Alert,
  Avatar,
  Box,
  IconButton,
  Skeleton,
  Stack,
  Typography,
  Paper, // Added for chat container feel
  useTheme, // Added to use theme spacing and palette
} from '@mui/material';
import moment from 'moment';

// ========= MUI ICONS IMPORTS =========
// import LanguageIcon from '@mui/icons-material/Language'; // Optional: Translate
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined'; // Like
// import MoreHorizIcon from '@mui/icons-material/MoreHoriz'; // More Options (Optional)
import ReplyIcon from '@mui/icons-material/Reply'; // Reply/Comment

// ========= FIREBASE IMPORTS =========
import { db } from '../firebase'; // Assuming '../firebase' is correct
import { collection, getDocs } from 'firebase/firestore';

// ========= HELPER FUNCTIONS =========

// Simplified stringAvatar helper
function stringAvatar(name = 'User') {
    const nameParts = name.split(' ');
    const initials = nameParts.length > 0 && nameParts[0][0]
      ? `${nameParts[0][0]}${nameParts.length > 1 && nameParts[1][0] ? nameParts[1][0] : ''}`
      : '?';
    // Added a simple hashing function for pseudo-random background colors based on name
    let hash = 0;
    for (let i = 0; i < name.length; i += 1) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    // Ensure minimum brightness for readability (simple approach)
    // A better approach would involve converting to HSL and adjusting lightness
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    const finalBgColor = brightness > 180 ? '#aaaaaa' : color; // Use grey if too bright

    return {
      sx: {
          bgcolor: finalBgColor, // Assign pseudo-random color
          width: 40,
          height: 40,
          fontSize: '1rem', // Slightly smaller font
      },
      children: initials.toUpperCase(),
    };
}

// ========= SKELETON COMPONENT (Chat Message Style) =========
const PostSkeleton = ({ theme }) => (
    // Mimics MomentItem structure
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, py: 1.5, px: { xs: 1.5, sm: 2 } }}>
        <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ mt: 0.5, flexShrink: 0 }} />
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            {/* Skeleton for Header (Name + Time) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Skeleton animation="wave" height={18} width="40%" />
                <Skeleton animation="wave" height={14} width="25%" />
            </Box>
            {/* Skeleton for Message Body */}
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', mb: 1 }} />
            <Skeleton variant="text" sx={{ fontSize: '0.9rem', width: '80%', mb: 1 }} />
             {/* Optional: Skeleton for action icons */}
            <Stack direction="row" spacing={0.5} sx={{ mt: 0.5 }}>
                <Skeleton variant="circular" width={24} height={24} />
                <Skeleton variant="circular" width={24} height={24} />
            </Stack>
        </Box>
    </Box>
);

// ========= MOMENT ITEM COMPONENT (Chat Message Style) =========
const MomentItem = React.memo(({ momentItem, onInteraction, onCommentClick, theme }) => {
    // --- Date Formatting ---
    let displayTime = '...'; // Placeholder
    try {
        // Ensure createdAt is a valid date object before formatting
        const validDate = momentItem.createdAt instanceof Date ? momentItem.createdAt : null;
        if (validDate && moment(validDate).isValid()) {
            const messageDate = moment(validDate);
            const now = moment();
            if (now.isSame(messageDate, 'day')) {
                displayTime = messageDate.format('h:mm A'); // e.g., 2:30 PM
            } else if (now.clone().subtract(1, 'day').isSame(messageDate, 'day')) {
                displayTime = 'Yesterday'; // Yesterday
            } else if (now.isSame(messageDate, 'year')) {
                 displayTime = messageDate.format('MMM D'); // e.g., Aug 15 (if same year)
            } else {
                displayTime = messageDate.format('MMM D, YYYY'); // e.g., Aug 15, 2023
            }
        } else {
           displayTime = 'Invalid date';
        }
    } catch (err) {
        console.warn('[MomentItem] Error processing date:', err, 'Raw data:', momentItem.createdAt);
        displayTime = 'Date error';
    }

    const userName = momentItem.userName || 'Anonymous';
    const description = momentItem.description || '(no message content)';

    return (
        // Container for a single message row
        <Box
            sx={{
                display: 'flex',
                alignItems: 'flex-start', // Align avatar top
                gap: 1.5, // Gap between avatar and content
                py: 1.5, // Vertical padding
                px: { xs: 1.5, sm: 2 }, // Horizontal padding (responsive)
                borderBottom: `1px solid ${theme.palette.divider}`, // Separator line
                '&:last-child': {
                    borderBottom: 'none', // No border for the last item
                },
                // Add hover effect for interaction indication (optional)
                // '&:hover .moment-actions': {
                //     opacity: 1,
                // },
            }}
        >
            {/* Avatar */}
            <Avatar
                {...stringAvatar(userName)} // Uses helper for initials and color
                aria-label={`${userName} avatar`}
                sx={{ mt: 0.5, flexShrink: 0 }} // Nudge avatar down slightly, prevent shrinking
            />

            {/* Message Content Area */}
            <Box sx={{ flexGrow: 1, minWidth: 0 }}> {/* flexGrow + minWidth to prevent overflow */}
                {/* Header: Name and Time */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        mb: 0.5, // Space between header and message body
                    }}
                >
                    <Typography
                        variant="subtitle2"
                        fontWeight="600" // Bold name
                        sx={{
                            color: 'text.primary',
                            overflow: 'hidden', // Prevent long names breaking layout
                            textOverflow: 'ellipsis', // Add ellipsis if too long
                            whiteSpace: 'nowrap', // Keep on one line
                            pr: 1, // Padding right to ensure space from timestamp
                        }}
                        title={userName} // Tooltip for potentially truncated name
                    >
                        {userName}
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: 'text.secondary', flexShrink: 0, ml: 1 }} // Prevent timestamp shrinking, add left margin
                    >
                        {displayTime}
                    </Typography>
                </Box>

                {/* Message Body */}
                <Typography
                    variant="body2" // Standard body text
                    sx={{
                        color: 'text.primary',
                        wordBreak: 'break-word', // Allow long words/links to wrap
                        whiteSpace: 'pre-wrap', // Respect newlines in the description
                        pb: 0.5, // Padding below text before actions
                        lineHeight: 1.45, // Improve readability
                    }}
                >
                    {description}
                </Typography>

                {/* Action Icons */}
                <Stack
                    direction="row"
                    spacing={0.5} // Reduced spacing between icons
                    alignItems="center"
                    className="moment-actions" // Class for potential hover targeting
                    sx={{
                        mt: 0.5, // Margin top
                        // opacity: 0, // Initially hidden (if using hover effect)
                        // transition: theme.transitions.create('opacity'), // Smooth fade (if using hover effect)
                    }}
                >
                    {/* Smaller icon buttons with less prominent color */}
                    <IconButton
                        size="small"
                        aria-label={`Like message from ${userName}`}
                        onClick={() => onInteraction(momentItem.id, 'like')}
                        sx={{ color: 'action.active', '&:hover': { bgcolor: 'action.hover' } }}
                        title="Like"
                    >
                        <ThumbUpAltOutlinedIcon sx={{ fontSize: '1rem' }} />
                        {/* Optionally display like count */}
                        {/* momentItem.likeCount > 0 && <Typography variant="caption" sx={{ pl: 0.5 }}>{momentItem.likeCount}</Typography> */}
                    </IconButton>
                    <IconButton
                        size="small"
                        aria-label={`Reply to message from ${userName}`}
                        onClick={() => onCommentClick(momentItem.id)}
                        sx={{ color: 'action.active', '&:hover': { bgcolor: 'action.hover' } }}
                        title="Reply"
                    >
                        <ReplyIcon sx={{ fontSize: '1rem' }} />
                    </IconButton>
                    {/* Add other actions like MoreHorizIcon if needed, styled similarly */}
                </Stack>
            </Box>
        </Box>
    );
});
MomentItem.displayName = 'MomentItem'; // Add display name for React DevTools

// ========= MAIN COMPONENT DEFINITION =========
function AllMomentList() {
  const theme = useTheme(); // Get theme for styling children
  const [allMoments, setAllMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Data Fetching ---
  useEffect(() => {
    const fetchAllMoments = async () => {
      setLoading(true);
      setError(null);
      console.log("Fetching discussions..."); // Log start
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let allMomentsData = [];
        console.log(`Found ${usersSnapshot.docs.length} user documents.`); // Log user count

        for (const userDoc of usersSnapshot.docs) {
          const userData = userDoc.data();
          // Check if moments exist and is an array AND not empty
          if (userData?.moments && Array.isArray(userData.moments) && userData.moments.length > 0) {
            console.log(`Processing moments for user: ${userDoc.id}`); // Log processing user
            const userMoments = userData.moments.map((momentItem, index) => {
              // Convert Firestore Timestamp to Date object safely
              const createdAtDate = momentItem.createdAt?.toDate ? momentItem.createdAt.toDate() : null;
              // Basic check if conversion worked
              if (!createdAtDate) {
                  console.warn(`Invalid or missing createdAt timestamp for moment ${index} in user ${userDoc.id}`);
              }
              // Construct moment object with user info
              return {
                ...momentItem,
                // Ensure unique ID: use moment's own ID if present, otherwise generate one
                id: momentItem.id || `${userDoc.id}-moment-${index}-${Date.now()}`, // Added timestamp for better uniqueness fallback
                createdAt: createdAtDate, // This will be null if conversion failed
                userName: userData.basicInfo?.fullName || 'Anonymous', // Default name
                userId: userDoc.id, // Use Firestore doc ID as user identifier
                description: momentItem.description || '',
                likeCount: momentItem.likeCount || 0, // Keep counts if available
                commentCount: momentItem.commentCount || 0,
              };
            }).filter(moment => moment.createdAt); // Filter out moments where date conversion failed

            allMomentsData.push(...userMoments);
          } else {
             // console.log(`No valid moments array found for user: ${userDoc.id}`); // Log skipped users
          }
        }

        console.log(`Total moments extracted: ${allMomentsData.length}`); // Log total moments

        // Sort messages: newest first (Handle potential null dates safely)
        allMomentsData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0));

        setAllMoments(allMomentsData);
        console.log("Discussions loaded and sorted."); // Log success

      } catch (err) {
        console.error('Error fetching moments:', err);
        setError('Failed to load discussions. Please try again later.');
        setAllMoments([]); // Clear moments on error
      } finally {
         setLoading(false); // Stop loading indicator
         console.log("Fetching process finished."); // Log end
      }
    };
    fetchAllMoments();
  }, []); // Empty dependency array ensures this runs once on mount

  // --- Interaction Handlers --- (Placeholders)
  const handleInteraction = useCallback((momentId, actionType) => {
    console.log(`Interaction: ${actionType} on ${momentId}`);
    // TODO: Implement interaction logic (e.g., update like count in Firestore)
    // Example: Update local state optimistically + trigger Firestore update
    // setAllMoments(prevMoments => prevMoments.map(m =>
    //    m.id === momentId ? { ...m, likeCount: (m.likeCount || 0) + 1 } : m
    // ));
    // updateLikeInFirestore(momentId, userId); // Replace with actual function
  }, []);

  const handleCommentClick = useCallback((momentId) => {
    console.log(`Reply/Comment clicked for moment: ${momentId}`);
    // TODO: Implement comment opening logic
    // Example: Set state to show a comment input field below this message,
    // or navigate to a detailed view with comments.
  }, []);


  // --- Render Logic ---
  if (loading) {
    // Use Paper container for skeletons too for consistent look
    return (
        <Paper variant="outlined" sx={{ border: 'none', bgcolor:'transparent' }}>
            {/* Show more skeletons for perceived performance */}
            {Array.from(new Array(5)).map((_, index) => (
                <PostSkeleton key={index} theme={theme} />
            ))}
        </Paper>
    );
  }

  if (error) {
    // Display error within the component area
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>; // Use error severity
  }

  if (allMoments.length === 0) {
    // Centered message for no content
    return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4, minHeight: 150, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
                Be the first one to start a discussion! ✨
            </Typography>
        </Box>
    );
  }

  // Render the list of messages within a Paper container
  // Note: If this list gets very long, consider using react-window or react-virtualized for performance.
  return (
    <Paper
        variant="outlined"
        sx={{
            border: 'none', // Remove outline border if nested
            bgcolor: 'transparent', // Inherit background if nested
            // Consider adding overflowY: 'auto' and a maxHeight if this component itself should scroll
            // maxHeight: 'calc(100vh - 200px)', // Example: Adjust based on surrounding layout
            // overflowY: 'auto',
         }}
    >
        {allMoments.map((momentItem) => (
            <MomentItem
                key={momentItem.id} // Use the unique ID
                momentItem={momentItem}
                onInteraction={handleInteraction}
                onCommentClick={handleCommentClick}
                theme={theme}
            />
        ))}
    </Paper>
  );
}

// ========= EXPORT STATEMENT =========
export default AllMomentList;