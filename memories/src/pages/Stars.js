import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import styled from '@emotion/styled';
import Navbar from '../components/Navbar';
import Loader from '../components/Loader';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import FacebookIcon from '@mui/icons-material/Facebook';

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
  transition: transform 0.2s;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const DashboardContainer = styled(Container)`
  margin-top: 20px;
`;

const UserInfoBox = styled(Box)`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TitleTypography = styled(Typography)`
  font-weight: bold;
`;

const SubtitleTypography = styled(Typography)`
  margin-bottom: 16px;
`;

function Stars() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchUsers() {
      setLoading(true);
      setError(null);

      try {
        const usersCollection = collection(db, 'users');
        const usersSnapshot = await getDocs(usersCollection);
        const usersList = usersSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(usersList);
      } catch (e) {
        setError(e);
        console.error('Error fetching users:', e);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <p>Error loading users: {error.message}</p>;
  }

  // Function to determine the latest work experience
  const getLatestWorkExperience = (workExperiences) => {
    if (!workExperiences || workExperiences.length === 0) {
      return null;
    }

    let latestExperience = workExperiences[0];

    for (let i = 1; i < workExperiences.length; i++) {
      const currentExperience = workExperiences[i];

      // Extract end year. Handle 'Present' case.
      const latestEndYear = latestExperience.duration.includes('Present')
        ? Infinity // Treat 'Present' as the largest year
        : parseInt(latestExperience.duration.split('-')[1], 10);

      const currentEndYear = currentExperience.duration.includes('Present')
        ? Infinity
        : parseInt(currentExperience.duration.split('-')[1], 10);

      if (currentEndYear > latestEndYear) {
        latestExperience = currentExperience;
      }
    }

    return latestExperience;
  };

  return (
    <>
      <Navbar />
      <DashboardContainer maxWidth="xl">
        <Typography variant="h4" gutterBottom>Our latest stars</Typography>
        <SubtitleTypography variant="subtitle1" color="textSecondary">
          This page will display our gems from the department
        </SubtitleTypography>
        {users.length === 0 ? (
          <p>No stars available.</p>
        ) : (
          <Grid container spacing={3}>
            {users.map((user) => {
              const latestWorkExperience = getLatestWorkExperience(
                user.workInfo?.workExperience
              );

              return (
                <Grid
                  item
                  xs={12}
                  md={6}
                  lg={4}
                  key={user.id}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <StyledPaper elevation={3}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item>
                        <Avatar
                          style={{
                            backgroundColor:
                              user.basicInfo?.profilebg || '#9e9e9e',
                            width: 60,
                            height: 60,
                          }}
                        >
                          {user.basicInfo?.fullName?.charAt(0).toUpperCase() ||
                            '?'}
                        </Avatar>
                      </Grid>
                      <Grid item xs={12} sm container>
                        <Grid item xs container direction="column" spacing={2}>
                          <Grid item xs>
                            <TitleTypography variant="h6">
                              {user.basicInfo?.fullName || 'N/A'}
                            </TitleTypography>
                            <UserInfoBox>
                              <Typography variant="body2" color="textSecondary">
                                {latestWorkExperience?.position || 'N/A'}
                              </Typography>
                              <Typography variant="body2" color="textSecondary">
                                {latestWorkExperience?.company || 'N/A'}
                              </Typography>
                            </UserInfoBox>
                            <Box mt={2}>
                              <IconButton
                                aria-label="email"
                                href={`mailto:${user.basicInfo?.email || '#'}`}
                              >
                                <EmailIcon />
                              </IconButton>
                              <IconButton
                                aria-label="phone"
                                href={`tel:${user.basicInfo?.phone || '#'}`}
                              >
                                <PhoneIcon />
                              </IconButton>
                              <IconButton
                                aria-label="linkedin"
                                href={user.basicInfo?.linkedin || '#'}
                                target="_blank"
                              >
                                <LinkedInIcon />
                              </IconButton>
                              <IconButton
                                aria-label="facebook"
                                href={user.basicInfo?.facebook || '#'}
                                target="_blank"
                              >
                                <FacebookIcon />
                              </IconButton>
                            </Box>
                          </Grid>
                        </Grid>
                      </Grid>
                    </Grid>
                  </StyledPaper>
                </Grid>
              );
            })}
          </Grid>
        )}
      </DashboardContainer>
    </>
  );
}

export default Stars;