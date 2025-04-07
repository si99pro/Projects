// src/components/MomentList.js
import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
  Alert, // Import Alert for displaying messages
} from '@mui/material';
import styled from '@emotion/styled';
import { auth, db } from '../firebase'; // Assuming '../firebase' is correct path
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment'; // Import moment.js for date formatting
import Loader from './Loader'; // Import the loader component

const StyledListItem = styled(ListItem)`
  padding: 16px;
  &:hover {
    background-color: #f5f5f5; // Optional: Keep hover effect
  }
  /* Ensure items align nicely */
  align-items: flex-start;
`;

const AuthorDateContainer = styled(Box)`
  display: flex;
  align-items: center;
  flex-wrap: wrap; // Allow wrapping if needed on small screens
  gap: 8px;
  margin-top: 8px;
`;

// Helper function for safe date formatting
const formatFirestoreTimestamp = (timestamp) => {
  let dateToFormat = null;
  if (timestamp && typeof timestamp.toDate === 'function') {
    // It's likely a Firestore Timestamp, convert it
    dateToFormat = timestamp.toDate();
  } else if (timestamp instanceof Date) {
    // It might already be a JS Date object
    dateToFormat = timestamp;
  }

  // Check if we have a valid date before formatting
  if (dateToFormat && moment(dateToFormat).isValid()) {
    return moment(dateToFormat).format('MMMM D, YYYY h:mm A');
  }

  // Fallback if the timestamp is invalid or missing
  return 'Invalid date';
};

function MomentList() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [userId, setUserId] = useState('');
  const [error, setError] = useState(null); // State for storing errors
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false); // Track login status

  useEffect(() => {
    const fetchMoments = async () => {
      setLoading(true);
      setError(null); // Reset error on new fetch
      try {
        const user = auth.currentUser;
        if (user) {
          setIsUserLoggedIn(true); // User is logged in
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();

            // Safely check if moments is an array
            if (userData.moments && Array.isArray(userData.moments)) {
              // Sort moments by createdAt in descending order (newest first)
              // Create a copy before sorting
              const sortedMoments = [...userData.moments].sort((a, b) => {
                // Handle potential non-timestamp values during sort
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0); // Fallback to epoch start
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
                return dateB - dateA; // Descending order
              });
              setMoments(sortedMoments);
            } else {
              setMoments([]); // Set empty if moments field is missing or not an array
            }

            // --- Safer access to user info using Optional Chaining (?.) ---
            setUserName(userData.basicInfo?.fullName || 'Unknown User'); // Provide fallback
            setUserId(userData.basicInfo?.studentId || 'N/A'); // Provide fallback
            // --- End Safe Access ---

          } else {
            console.log('User document not found for UID:', user.uid);
            setMoments([]); // Clear moments if user doc doesn't exist
            setUserName('Unknown User');
            setUserId('N/A');
          }
        } else {
          // Handle case where user is not logged in when component mounts
          setIsUserLoggedIn(false);
          setMoments([]);
          setUserName('');
          setUserId('');
          console.log('No user logged in.');
        }
      } catch (err) {
        console.error('Error fetching moments:', err);
        setError('Failed to load moments. Please try again later.'); // Set error message
        setMoments([]); // Clear potentially partial data on error
      } finally {
        setLoading(false); // Stop loading indicator regardless of outcome
      }
    };

    // Using onAuthStateChanged to re-fetch if auth state changes (optional but good practice)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      fetchMoments(); // Fetch data when auth state is known or changes
    });

    // Cleanup function to unsubscribe from auth listener
    return () => unsubscribe();

  }, []); // Empty dependency array: runs once on mount initially, then relies on onAuthStateChanged

  // --- Render Loading State ---
  if (loading) {
    return <Loader />;
  }

  // --- Render Error State ---
  if (error) {
    return <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>;
  }

  // --- Render No User State ---
  if (!isUserLoggedIn) {
    return <Alert severity="info" sx={{ m: 2 }}>Please log in to view your moments.</Alert>;
  }

  // --- Render Empty Moments State ---
  if (moments.length === 0) {
    return <Typography sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>No moments found.</Typography>;
  }

  // --- Render Moments List ---
  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {moments.map((momentItem) => (
        // IMPORTANT: Ensure each 'momentItem' object fetched from Firestore has a unique 'id' property.
        // If not, you might need to use the index as a key (less ideal): key={index}
        <React.Fragment key={momentItem.id || momentItem.title}> {/* Use title as fallback key if no id */}
          <StyledListItem> {/* Removed alignItems, let content flow naturally */}
            <ListItemText
              primary={<Typography variant="h6" sx={{ mb: 1 }}>{momentItem.title || 'Untitled Moment'}</Typography>} // Fallback title
              secondary={
                <>
                  {/* Simplified description rendering */}
                  <Typography
                    component="p" // Use paragraph for description block
                    variant="body2"
                    color="text.primary"
                    sx={{ whiteSpace: 'pre-wrap', mb: 1 }} // Preserve line breaks, add margin
                  >
                    {momentItem.description || 'No description.'} {/* Fallback description */}
                  </Typography>
                  <AuthorDateContainer>
                    {/* Display User Info */}
                    <Typography variant="caption" color="text.secondary">
                      {`${userName} (${userId})`}
                    </Typography>
                    {/* Display Safely Formatted Date */}
                    <Typography variant="caption" color="text.secondary">
                       • {formatFirestoreTimestamp(momentItem.createdAt)}
                    </Typography>
                  </AuthorDateContainer>
                </>
              }
              // Disable typography wrapping if MUI adds extra divs causing issues
              // disableTypography={true}
            />
          </StyledListItem>
          <Divider component="li" variant="inset" /> {/* Use inset divider for visual style */}
        </React.Fragment>
      ))}
    </List>
  );
}

export default MomentList;