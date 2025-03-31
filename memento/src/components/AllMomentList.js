// src/components/AllMomentList.js
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
import { db } from '../firebase'; // Removed auth from import
import { collection, getDocs } from 'firebase/firestore';
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

function AllMomentList() {
  const [allMoments, setAllMoments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAllMoments = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const allMomentsData = [];

        for (const doc of querySnapshot.docs) {
          const userData = doc.data();
          if (userData.moments) {
            // Attach username and id to each moment

            const momentWithUserInfo = userData.moments.map(moment => ({
              ...moment,
              userName: userData.basicInfo?.fullName,
              userId: userData.basicInfo?.studentId
            }));

            allMomentsData.push(...momentWithUserInfo);
          }
        }

        // Sort all moments by createdAt in descending order
        allMomentsData.sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());

        setAllMoments(allMomentsData);
      } catch (error) {
        console.error('Error fetching moments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllMoments();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <List>
      {allMoments.map((momentItem) => (
        <React.Fragment key={momentItem.id}>
          <StyledListItem alignItems="flex-start">
            <ListItemText
              primary={<Typography variant="h6">{momentItem.title}</Typography>}
              secondary={
                <>
                  <Typography
                    sx={{ display: 'inline' }}
                    component="span"
                    variant="body2"
                    color="text.primary"
                  >
                    {momentItem.description}
                  </Typography>
                  <AuthorDateContainer>
                    <Typography variant="caption" color="text.secondary">
                      {momentItem.userName} ({momentItem.userId}) • {moment(momentItem.createdAt.toDate()).format('MMMM D, YYYY h:mm A')}
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

export default AllMomentList;