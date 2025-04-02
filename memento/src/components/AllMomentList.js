// src/components/AllMomentList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Skeleton,
  Container,
  Fade,
  Avatar,        // For author avatar
  IconButton,    // For action buttons
  Stack,         // For layout
} from '@mui/material';
// Removed Card components as we are building a simpler structure
// import { deepOrange } from '@mui/material/colors'; // Not strictly needed for stringAvatar
import LanguageIcon from '@mui/icons-material/Language'; // Globe icon
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
// import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'; // Keep if needed for liked state
import MoreHorizIcon from '@mui/icons-material/MoreHoriz'; // More options icon
import ReplyIcon from '@mui/icons-material/Reply'; // Reply icon
// Removed styled from emotion
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import moment from 'moment';

// --- Helper Function for Avatar ---
// (Keep stringToColor and stringAvatar functions as they are)
function stringToColor(string) {
  let hash = 0;
  let i;
  for (i = 0; i < string.length; i += 1) {
    hash = string.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (i = 0; i < 3; i += 1) {
    const value = (hash >> (i * 8)) & 0xff;
    color += `00${value.toString(16)}`.slice(-2);
  }
  return color;
}

function stringAvatar(name = 'User') { // Added default value
  const nameParts = name.split(' ');
  // Simple initials logic, can be refined
  const initials = nameParts.length > 0 && nameParts[0][0]
    ? `${nameParts[0][0]}${nameParts.length > 1 && nameParts[1][0] ? nameParts[1][0] : ''}`
    : '?'; // Fallback if name is empty or unexpected format
  return {
    sx: {
      bgcolor: stringToColor(name),
      width: 40, // Consistent size
      height: 40,
    },
    children: initials.toUpperCase(),
  };
}


// --- Skeleton Loader Component for Post/Comment ---
const PostSkeleton = () => (
  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, p: 1.5 }}> {/* Added padding similar to final item */}
    <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ mr: 1.5 }} />
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
        <Stack>
            <Skeleton animation="wave" height={12} width="100px" />
            <Skeleton animation="wave" height={10} width="60px" sx={{ mt: 0.5 }}/>
        </Stack>
        <Skeleton animation="wave" height={10} width="30px" />
      </Box>
      <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 1 }} />
      <Skeleton variant="text" sx={{ fontSize: '1rem', width: '80%', mb: 1 }} />
      <Stack direction="row" spacing={1}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </Stack>
    </Box>
  </Box>
);

// --- Single Post/Comment Item Component ---
const MomentItem = ({ momentItem, onInteraction, onCommentClick }) => {
  // Simulating level data - replace with actual data if available
  const userLevel = `Level ${momentItem.userId ? (parseInt(momentItem.userId.slice(-1), 10) % 5) + 1 : 3}`; // Example level based on ID

  return (
    <Fade in={true}>
      {/* Use Box instead of Card for less defined borders */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', p: 1.5, '&:hover': { backgroundColor: 'action.hover' } }}> {/* Padding matches target image feel */}
        {/* Avatar on the left */}
        <Avatar {...stringAvatar(momentItem.userName)} sx={{ ...stringAvatar(momentItem.userName).sx, mr: 1.5, mt: 0.5 }} />

        {/* Content Area taking remaining space */}
        <Box sx={{ flexGrow: 1 }}>
            {/* Header: Name, Level, Timestamp */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Stack>
                    <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.3}>
                        {momentItem.userName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" lineHeight={1.2}>
                        {userLevel} {/* Display simulated level */}
                    </Typography>
                </Stack>
                <Typography variant="caption" color="text.secondary" sx={{ ml: 1, flexShrink: 0 }}>
                    {moment(momentItem.createdAt).fromNow(true)} {/* 'true' removes "ago" */}
                </Typography>
            </Box>

            {/* Main Content Text */}
            {/* Combine title and description into one block if desired, or display description only */}
            <Typography variant="body2" sx={{ mb: 1, color: 'text.primary' }}> {/* Match text appearance */}
              {/* If you have a title, you might display it differently or prepend it */}
              {/* momentItem.title ? `${momentItem.title}. ` : '' */}
              {momentItem.description || "No content"} {/* Use description as main text */}
            </Typography>

            {/* Action Icons */}
            <Stack direction="row" spacing={1} alignItems="center">
                {/* Translate/Web Icon */}
                 <IconButton size="small" aria-label="translate">
                    <LanguageIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                 </IconButton>
                 {/* Like Icon */}
                 <IconButton
                    size="small"
                    aria-label="like"
                    onClick={() => onInteraction(momentItem.id, 'like')}
                    // Add color logic if tracking liked state
                 >
                    <ThumbUpAltOutlinedIcon fontSize="inherit" sx={{ color: 'text.secondary' }}/>
                 </IconButton>
                 {/* More Options Icon */}
                 <IconButton size="small" aria-label="more options">
                    <MoreHorizIcon fontSize="inherit" sx={{ color: 'text.secondary' }} />
                 </IconButton>
                 {/* Reply Icon */}
                 <IconButton size="small" aria-label="reply" onClick={() => onCommentClick(momentItem.id)}>
                    <ReplyIcon fontSize="inherit" sx={{ color: 'text.secondary' }}/>
                 </IconButton>
            </Stack>
        </Box>
      </Box>
    </Fade>
  );
};


// --- Main Component ---
function AllMomentList() {
  const [allMoments, setAllMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllMoments = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let allMomentsData = [];

        for (const doc of querySnapshot.docs) {
          const userData = doc.data();
          if (userData.moments && Array.isArray(userData.moments)) {
            const momentWithUserInfo = userData.moments.map((momentItem, index) => ({
              ...momentItem,
              id: momentItem.id || `${doc.id}-moment-${index}`, // Ensure unique ID
              createdAt: momentItem.createdAt?.toDate ? momentItem.createdAt.toDate() : new Date(),
              userName: userData.basicInfo?.fullName || 'Anonymous User',
              // Include userId to simulate level or other info
              userId: userData.basicInfo?.studentId || `user-${doc.id.substring(0, 5)}`,
               // Add placeholder text if description is missing
              description: momentItem.description || `This is placeholder content for moment ${index + 1} from ${userData.basicInfo?.fullName || 'Anonymous User'}. It demonstrates how text flows.`,
            }));
            allMomentsData.push(...momentWithUserInfo);
          }
        }

        allMomentsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // Add interaction state locally (as before, simulation)
        const momentsWithInteractionState = allMomentsData.map(m => ({
            ...m,
            likeCount: m.likeCount || 0, // Start counts at 0 for cleaner display maybe
            commentCount: m.commentCount || 0,
            userAction: 'none' // 'none', 'liked'
        }));

        setAllMoments(momentsWithInteractionState);

      } catch (err) {
        console.error('Error fetching moments:', err);
        setError('Failed to load moments. Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 600);
      }
    };

    fetchAllMoments();
  }, []);

  // --- Interaction Handlers (Simplified Local Update) ---
  // Keep interaction logic, but it might not directly affect the simplified UI state shown
  const handleInteraction = useCallback((momentId, actionType) => {
    console.log(`Interaction: ${actionType} on ${momentId}`);
    // Basic like toggle example (local state only)
    setAllMoments(currentMoments =>
      currentMoments.map(momentItem => {
        if (momentItem.id === momentId && actionType === 'like') {
           // In a real app update counts and userAction state here
           console.log("Like toggled locally for", momentId);
           // Example: return { ...momentItem, userAction: momentItem.userAction === 'liked' ? 'none' : 'liked', likeCount: momentItem.userAction === 'liked' ? momentItem.likeCount -1 : momentItem.likeCount + 1 };
        }
        return momentItem;
      })
    );
     // TODO: Add API call here to update Firestore
  }, []);

  const handleCommentClick = (momentId) => {
      console.log(`Reply/Comment clicked for moment: ${momentId}`);
      // TODO: Implement comment/reply logic here
  };

  // --- Render Logic ---
  if (loading || error) {
    return (
      // Use sm or xs for max width for a comment-like feed
      <Container maxWidth="sm" sx={{ mt: 2 }}>
        {loading ? (
          Array.from(new Array(4)).map((_, index) => (
            <PostSkeleton key={index} />
          ))
        ) : (
          <Typography color="error" align="center">{error}</Typography>
        )}
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 2 }}>
      {/* Use Stack for spacing between items, remove default card spacing */}
      <Stack spacing={0}> {/* No extra space from Stack, handled by item padding/margin */}
        {allMoments.map((momentItem) => (
            <MomentItem
                key={momentItem.id}
                momentItem={momentItem}
                onInteraction={handleInteraction}
                onCommentClick={handleCommentClick}
            />
        ))}

        {/* Handle empty state */}
        {!loading && allMoments.length === 0 && (
           <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
             No moments found.
           </Typography>
        )}
      </Stack>
    </Container>
  );
}

export default AllMomentList;