// src/components/AllMomentList.js

import React, { useState, useEffect, useCallback } from 'react';

// ========= CORE MUI & MOMENT IMPORTS =========
import {
  Alert, // Needed for error display
  Avatar, // Needed for MomentItem
  Box, // Needed for MomentItem & main layout
  Fade, // Needed for MomentItem
  IconButton, // Needed for MomentItem actions
  Skeleton, // Needed for PostSkeleton
  Stack, // Needed for MomentItem & main layout
  Typography, // Needed for MomentItem & main layout
} from '@mui/material';
import moment from 'moment'; // Needed for MomentItem date formatting

// ========= MUI ICONS IMPORTS =========
// Ensure ALL icons used in MomentItem are imported correctly
import LanguageIcon from '@mui/icons-material/Language';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import ReplyIcon from '@mui/icons-material/Reply';

// ========= FIREBASE IMPORTS =========
import { db } from '../firebase'; // Assuming '../firebase' is correct
import { collection, getDocs } from 'firebase/firestore';


// ========= HELPER FUNCTIONS (Define BEFORE use) =========
function stringToColor(string) {
    let hash = 0;
    let i;
    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */
    return color;
}

function stringAvatar(name = 'User') {
    const nameParts = name.split(' ');
    const initials = nameParts.length > 0 && nameParts[0][0]
      ? `${nameParts[0][0]}${nameParts.length > 1 && nameParts[1][0] ? nameParts[1][0] : ''}`
      : '?';
    return {
      sx: {
        bgcolor: stringToColor(name), // Uses stringToColor
        width: 40,
        height: 40,
      },
      children: initials.toUpperCase(),
    };
}

// ========= SKELETON COMPONENT =========
const PostSkeleton = () => (
    <Box sx={{ width: '100%', p: 1.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2, overflow: 'hidden' }}>
            <Skeleton animation="wave" variant="circular" width={40} height={40} sx={{ mr: 1.5, flexShrink: 0 }} />
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                    <Stack sx={{ flexGrow: 1, minWidth: 0, mr: 1 }}>
                        <Skeleton animation="wave" height={12} width="60%" />
                        <Skeleton animation="wave" height={10} width="40%" sx={{ mt: 0.5 }}/>
                    </Stack>
                    <Skeleton animation="wave" height={10} width="40px" sx={{ flexShrink: 0 }} />
                </Box>
                <Skeleton variant="text" sx={{ fontSize: '0.875rem', mb: 1, width: '100%' }} />
                <Skeleton variant="text" sx={{ fontSize: '0.875rem', width: '80%', mb: 1 }} />
                <Stack direction="row" spacing={1}>
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                    <Skeleton variant="circular" width={24} height={24} />
                </Stack>
            </Box>
        </Box>
    </Box>
);

// ========= MOMENT ITEM COMPONENT =========
const MomentItem = ({ momentItem, onInteraction, onCommentClick }) => {
    const userIdBase = momentItem.userId || '1';
    const userLevel = `Level ${momentItem.userId ? (parseInt(userIdBase.slice(-1), 10) % 5) + 1 : 1}`;
    let displayTime = 'Date unavailable';
    // Safely format time
    try {
        if (momentItem.createdAt && moment(momentItem.createdAt).isValid()) {
            displayTime = moment(momentItem.createdAt).fromNow(true);
        }
    } catch (err) {
        console.error('[MomentItem] Error processing date:', err);
        displayTime = 'Date error';
    }
    const userName = momentItem.userName || 'Anonymous User';
    const description = momentItem.description || 'No content provided.';

  // Ensure all components used inside the return() are imported above
  return (
    <Fade in={true} appear={true}>
        <Box // Uses Box (Imported)
          sx={{
            display: 'flex', alignItems: 'flex-start', gap: 1.5, p: 1.5,
            '&:hover': { backgroundColor: 'action.hover' }, borderBottom: '1px solid',
            borderColor: 'divider', overflow: 'hidden', minWidth: 0, width: '100%'
          }}
        >
          <Avatar // Uses Avatar (Imported)
             {...stringAvatar(userName)} // Uses helper (Defined above)
             sx={{ ...stringAvatar(userName).sx, mt: 0.5, flexShrink: 0 }}
          />
          <Stack sx={{ flexGrow: 1, minWidth: 0 }}> {/* Uses Stack (Imported) */}
              <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1} sx={{ mb: 0.5 }}> {/* Uses Stack */}
                  <Stack sx={{ minWidth: 0 }}> {/* Uses Stack */}
                      <Typography variant="subtitle2" fontWeight="bold" lineHeight={1.3} noWrap sx={{ maxWidth: '100%' }}> {/* Uses Typography (Imported) */}
                          {userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" lineHeight={1.2}> {/* Uses Typography */}
                          {userLevel}
                      </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ flexShrink: 0, whiteSpace: 'nowrap', textAlign: 'right' }}> {/* Uses Typography */}
                     {displayTime}
                  </Typography>
              </Stack>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.primary', overflowWrap: 'break-word', wordWrap: 'break-word', wordBreak: 'break-word' }}> {/* Uses Typography */}
                {description}
              </Typography>
              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ flexWrap: 'wrap' }}> {/* Uses Stack */}
                   <IconButton size="small" aria-label="translate"><LanguageIcon fontSize="inherit" sx={{ color: 'text.secondary' }} /></IconButton> {/* Uses IconButton, LanguageIcon (Imported) */}
                   <IconButton size="small" aria-label="like" onClick={() => onInteraction(momentItem.id, 'like')}><ThumbUpAltOutlinedIcon fontSize="inherit" sx={{ color: 'text.secondary' }}/></IconButton> {/* Uses IconButton, ThumbUpAltOutlinedIcon (Imported) */}
                   <IconButton size="small" aria-label="more options"><MoreHorizIcon fontSize="inherit" sx={{ color: 'text.secondary' }} /></IconButton> {/* Uses IconButton, MoreHorizIcon (Imported) */}
                   <IconButton size="small" aria-label="reply" onClick={() => onCommentClick(momentItem.id)}><ReplyIcon fontSize="inherit" sx={{ color: 'text.secondary' }}/></IconButton> {/* Uses IconButton, ReplyIcon (Imported) */}
              </Stack>
          </Stack>
        </Box>
    </Fade> // Uses Fade (Imported)
  );
};

// ========= MAIN COMPONENT DEFINITION =========
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
        for (const userDoc of querySnapshot.docs) {
          const userData = userDoc.data();
          if (userData?.moments && Array.isArray(userData.moments)) { // Added safe navigation for userData
            const momentWithUserInfo = userData.moments.map((momentItem, index) => {
              const createdAtDate = momentItem.createdAt?.toDate ? momentItem.createdAt.toDate() : null;
              return {
                ...momentItem,
                id: momentItem.id || `${userDoc.id}-moment-${index}`,
                createdAt: createdAtDate,
                userName: userData.basicInfo?.fullName || 'Anonymous User',
                userId: userData.basicInfo?.studentId || `user-${userDoc.id.substring(0, 5)}`,
                description: momentItem.description || '',
                likeCount: momentItem.likeCount || 0,
                commentCount: momentItem.commentCount || 0,
              };
            });
            allMomentsData.push(...momentWithUserInfo);
          }
        }
        allMomentsData.sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0)); // Safer sort
        const momentsWithInteractionState = allMomentsData.map(m => ({ ...m, userAction: 'none' }));
        setAllMoments(momentsWithInteractionState);
      } catch (err) {
        console.error('Error fetching moments:', err);
        setError('Failed to load discussions. Please try again later.');
        setAllMoments([]);
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    };
    fetchAllMoments();
  }, []);

  const handleInteraction = useCallback((momentId, actionType) => { console.log(`Interaction: ${actionType} on ${momentId}`); }, []);
  const handleCommentClick = (momentId) => { console.log(`Reply/Comment clicked for moment: ${momentId}`); };

  // --- Render Logic ---
  if (loading) {
    return ( <Box sx={{ width: '100%' }}> {Array.from(new Array(3)).map((_, index) => (<PostSkeleton key={index} />))} </Box> );
  }
  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>; // Uses Alert (Imported)
  }
  if (allMoments.length === 0) {
    return ( <Typography variant="body2" color="text.secondary" align="center" sx={{ p: 3 }}> No discussions found yet. </Typography> ); // Uses Typography
  }
  return (
    <Stack spacing={0} sx={{ width: '100%' }}> {/* Uses Stack */}
        {allMoments.map((momentItem) => ( <MomentItem key={momentItem.id} momentItem={momentItem} onInteraction={handleInteraction} onCommentClick={handleCommentClick} /> ))}
    </Stack>
  );
}

// ========= EXPORT STATEMENT =========
export default AllMomentList; // Ensure default export is correct