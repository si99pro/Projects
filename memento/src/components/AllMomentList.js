// src/components/AllMomentList.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  Box,
  Skeleton,
  Container,
  Fade,
  Avatar,        // For author avatar
  IconButton,    // For action buttons
  Stack,         // For layout within CardActions
  Divider        // Optional separator
} from '@mui/material';
import { deepOrange } from '@mui/material/colors'; // For Avatar color
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt'; // Filled Like
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt'; // Filled Dislike
import ChatBubbleOutlineOutlinedIcon from '@mui/icons-material/ChatBubbleOutlineOutlined';
// Removed styled from emotion
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import moment from 'moment';

// --- Helper Function for Avatar ---
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
  const initials = nameParts.length > 1
    ? `${nameParts[0][0]}${nameParts[1][0]}`
    : `${nameParts[0][0]}`;
  return {
    sx: {
      bgcolor: stringToColor(name),
    },
    children: initials.toUpperCase(),
  };
}


// --- Skeleton Loader Component for Social Post ---
const PostSkeleton = () => (
  <Card sx={{ mb: 3 }}> {/* Consistent margin-bottom */}
    <CardHeader
      avatar={<Skeleton animation="wave" variant="circular" width={40} height={40} />}
      title={<Skeleton animation="wave" height={10} width="40%" style={{ marginBottom: 6 }} />}
      subheader={<Skeleton animation="wave" height={10} width="30%" />}
    />
    <CardContent sx={{ pt: 0 }}> {/* Reduce top padding */}
      <Skeleton variant="text" sx={{ fontSize: '1.2rem' }} /> {/* Title */}
      <Skeleton variant="text" /> {/* Description */}
      <Skeleton variant="text" width="80%" /> {/* Description */}
    </CardContent>
    <CardActions disableSpacing sx={{ justifyContent: 'space-around', borderTop: '1px solid #eee', px: 2, py: 1 }}>
        <Skeleton variant="rounded" width={60} height={30} />
        <Skeleton variant="rounded" width={60} height={30} />
        <Skeleton variant="rounded" width={60} height={30} />
    </CardActions>
  </Card>
);

// --- Main Component ---
function AllMomentList() {
  // Enhanced state: Add interaction fields locally after fetch
  const [allMoments, setAllMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAllMoments = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        let allMomentsData = []; // Use let for reassignment

        for (const doc of querySnapshot.docs) {
          const userData = doc.data();
          if (userData.moments && Array.isArray(userData.moments)) {
            const momentWithUserInfo = userData.moments.map(momentItem => ({
              ...momentItem,
              id: momentItem.id || `${doc.id}-${Math.random().toString(36).substr(2, 9)}`, // Ensure unique ID
              createdAt: momentItem.createdAt?.toDate ? momentItem.createdAt.toDate() : new Date(),
              userName: userData.basicInfo?.fullName || 'Anonymous User',
              userId: userData.basicInfo?.studentId || 'N/A'
            }));
            allMomentsData.push(...momentWithUserInfo);
          }
        }

        // Sort by date
        allMomentsData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

        // *** Add local interaction state (simulation) ***
        // In a real app, fetch these counts/states from Firestore
        const momentsWithInteractionState = allMomentsData.map(m => ({
            ...m,
            likeCount: m.likeCount || Math.floor(Math.random() * 50), // Placeholder count
            dislikeCount: m.dislikeCount || Math.floor(Math.random() * 10), // Placeholder count
            commentCount: m.commentCount || Math.floor(Math.random() * 20), // Placeholder count
            userAction: 'none' // 'none', 'liked', 'disliked' - initial state for session
        }));

        setAllMoments(momentsWithInteractionState);

      } catch (err) {
        console.error('Error fetching moments:', err);
        setError('Failed to load moments. Please try again later.');
      } finally {
        setTimeout(() => setLoading(false), 600); // Slightly longer delay often feels better
      }
    };

    fetchAllMoments();
  }, []);

  // --- Interaction Handlers (Local State Update) ---
  // NOTE: These only update the local state. Need backend integration for persistence.
  const handleInteraction = useCallback((momentId, actionType) => {
    setAllMoments(currentMoments =>
      currentMoments.map(momentItem => {
        if (momentItem.id === momentId) {
          let { likeCount, dislikeCount, userAction } = momentItem;

          const isCurrentlyLiked = userAction === 'liked';
          const isCurrentlyDisliked = userAction === 'disliked';

          if (actionType === 'like') {
            if (isCurrentlyLiked) {
              // Unlike
              likeCount -= 1;
              userAction = 'none';
            } else {
              // Like
              likeCount += 1;
              userAction = 'liked';
              // If was disliked, remove dislike
              if (isCurrentlyDisliked) {
                dislikeCount -= 1;
              }
            }
          } else if (actionType === 'dislike') {
            if (isCurrentlyDisliked) {
              // Undislike
              dislikeCount -= 1;
              userAction = 'none';
            } else {
              // Dislike
              dislikeCount += 1;
              userAction = 'disliked';
              // If was liked, remove like
              if (isCurrentlyLiked) {
                likeCount -= 1;
              }
            }
          }
          // Ensure counts don't go below 0
          likeCount = Math.max(0, likeCount);
          dislikeCount = Math.max(0, dislikeCount);

          // TODO: Add API call here to update Firestore
          // updateDoc(doc(db, 'path/to/moment', momentId), { likeCount, dislikeCount, /* maybe update user's liked list */ });

          return { ...momentItem, likeCount, dislikeCount, userAction };
        }
        return momentItem;
      })
    );
  }, []); // useCallback depends on setAllMoments

  const handleCommentClick = (momentId) => {
      console.log(`Comment clicked for moment: ${momentId}`);
      // TODO: Implement comment modal or navigation logic here
  };

  // --- Render Logic ---
  if (loading || error) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}> {/* sm is often better for feeds */}
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
    <Container maxWidth="sm" sx={{ mt: 4 }}> {/* Max width 'sm' is common for feeds */}
      <Stack spacing={3}> {/* Use Stack for consistent spacing between cards */}
        {allMoments.map((momentItem) => {
            const isLiked = momentItem.userAction === 'liked';
            const isDisliked = momentItem.userAction === 'disliked';

            return (
          <Fade in={!loading} key={momentItem.id}>
            <Card
              variant="outlined"
              sx={{
                 // No hover transform needed for feed usually
                 // boxShadow: 1 // Subtle shadow
              }}
            >
              {/* Post Header: Avatar, Name, Timestamp */}
              <CardHeader
                avatar={
                  <Avatar {...stringAvatar(momentItem.userName)} />
                }
                title={
                    <Typography variant="subtitle1" fontWeight="bold">
                        {momentItem.userName}
                    </Typography>
                }
                subheader={
                    <Typography variant="caption" color="text.secondary">
                        {moment(momentItem.createdAt).fromNow()} {/* Use relative time */}
                         {' • '} ID: {momentItem.userId} {/* Optional: Include ID */}
                    </Typography>
                }
                // action={ // Placeholder for potential 'more options' menu
                //   <IconButton aria-label="settings">
                //     <MoreVertIcon />
                //   </IconButton>
                // }
                sx={{ pb: 0 }} // Reduce bottom padding
              />

              {/* Post Content: Title & Description */}
              <CardContent sx={{ pt: 1 }}> {/* Adjust top padding */}
                <Typography variant="h6" gutterBottom>
                  {momentItem.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {momentItem.description}
                </Typography>
              </CardContent>

              {/* Optional Divider */}
              {/* <Divider variant="middle" sx={{ my: 1 }}/> */}

              {/* Post Actions: Like, Dislike, Comment */}
              <CardActions disableSpacing sx={{ justifyContent: 'space-around', borderTop: '1px solid #eee', px: 2, py: 0.5 }}>
                  {/* Like Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                          aria-label="like post"
                          onClick={() => handleInteraction(momentItem.id, 'like')}
                          color={isLiked ? 'primary' : 'default'} // Highlight if liked
                      >
                          {isLiked ? <ThumbUpAltIcon fontSize="small"/> : <ThumbUpAltOutlinedIcon fontSize="small"/>}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: '2ch', textAlign: 'left' }}>
                          {momentItem.likeCount > 0 ? momentItem.likeCount : ''}
                      </Typography>
                  </Box>

                  {/* Dislike Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton
                          aria-label="dislike post"
                          onClick={() => handleInteraction(momentItem.id, 'dislike')}
                          color={isDisliked ? 'error' : 'default'} // Use error color if disliked
                      >
                          {isDisliked ? <ThumbDownAltIcon fontSize="small"/> : <ThumbDownAltOutlinedIcon fontSize="small"/>}
                      </IconButton>
                      <Typography variant="body2" color="text.secondary" sx={{ minWidth: '2ch', textAlign: 'left' }}>
                          {momentItem.dislikeCount > 0 ? momentItem.dislikeCount : ''}
                       </Typography>
                  </Box>

                  {/* Comment Button */}
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <IconButton aria-label="comment on post" onClick={() => handleCommentClick(momentItem.id)}>
                          <ChatBubbleOutlineOutlinedIcon fontSize="small"/>
                      </IconButton>
                       <Typography variant="body2" color="text.secondary" sx={{ minWidth: '2ch', textAlign: 'left' }}>
                          {momentItem.commentCount > 0 ? momentItem.commentCount : ''}
                       </Typography>
                  </Box>
              </CardActions>
            </Card>
          </Fade>
            );
        })}

        {/* Handle empty state */}
        {!loading && allMoments.length === 0 && (
           <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
             No moments found in the feed.
           </Typography>
        )}
      </Stack>
    </Container>
  );
}

export default AllMomentList;