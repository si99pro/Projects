// src/components/MomentList.js
import React, { useState, useEffect } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Divider,
  Box,
} from '@mui/material';
import styled from '@emotion/styled';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import moment from 'moment';  // Import moment.js for date formatting
import Loader from './Loader'; // Import the loader component

const StyledListItem = styled(ListItem)`
  padding: 16px;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const AuthorDateContainer = styled(Box)`
  display: flex;
  align-items: center;
  gap: 8px; /* Adjust the gap for spacing */
  margin-top: 8px;
`;

function MomentList() {
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState(''); // Store user's name
  const [userId, setUserId] = useState('');   // Store user's ID

  useEffect(() => {
    const fetchMoments = async () => {
      setLoading(true);
      try {
        const user = auth.currentUser;
        if (user) {
          const userDocRef = doc(db, 'users', user.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            // Check if moments exists in the user data.
            if(userData.moments){
              // Sort moments by createdAt in descending order (newest first)
              const sortedMoments = [...userData.moments].sort(
                (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
              );
              setMoments(sortedMoments);
            } else {
              setMoments([]); // Handle the case where user has no moments
            }
            // Extract user name and id from the basicInfo
            setUserName(userData.basicInfo.fullName)
            setUserId(userData.basicInfo.studentId);
          } else {
            console.log('No such document!');
            setMoments([]); // Handle the case where user document doesn't exist
          }
        }
      } catch (error) {
        console.error('Error fetching moments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMoments();
  }, []);

  if (loading) {
    return <Loader />; // Display the loader while loading  // Display the loader
  }

  return (
    <List>
      {moments.map((memory) => ( // Changed key to memory.id (assuming memory has an id)
        <React.Fragment key={memory.id}>
          <StyledListItem alignItems="flex-start">
            <ListItemText
              primary={<Typography variant="h6">{memory.title}</Typography>}
              secondary={
                <>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {memory.description}
                  </Typography>
                  <AuthorDateContainer>
                    <Typography variant="caption" color="text.secondary">
                      {userName} ({userId}) • {moment(memory.createdAt.toDate()).format('MMMM D, YYYY h:mm A')}
                    </Typography>
                  </AuthorDateContainer>
                </>
              }
            />
          </StyledListItem>
          <Divider component="li" />
        </React.Fragment>
      ))}
    </List>
  );
}

export default MomentList;