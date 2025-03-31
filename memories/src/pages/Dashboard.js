// src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Avatar,
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
} from '@mui/material';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer'; // Import the Footer component
import styled from '@emotion/styled';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Loader from '../components/Loader'; // Import the loader component
import AllMomentList from '../components/AllMomentList'; // Import AllMomentList
import AssessmentIcon from '@mui/icons-material/Assessment'; // Example Icon
import EventIcon from '@mui/icons-material/Event'; // Example Icon
import PeopleIcon from '@mui/icons-material/People'; // Example Icon
import UpdateIcon from '@mui/icons-material/Update';
import EditIcon from '@mui/icons-material/Edit';

// Styled Components using Emotion
const DashboardContainer = styled(Container)`
  margin-top: 20px;
  padding: 20px;
`;

const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
  border-radius: 10px;
  margin-top: 20px; /* Added top margin */
`;

const WelcomeSection = styled(StyledPaper)`
  background: linear-gradient(45deg, #64b5f6 30%, #bbdefb 90%);
  color: white;
  position: relative; /* Needed for absolute positioning of buttons */
`;

const WelcomeButtons = styled(Box)`
  position: absolute;
  top: 10px; // Adjust as needed
  right: 10px; // Adjust as needed
  display: flex;
  gap: 8px; // Space between buttons
`;

const InfoCard = styled(Card)`
  border-radius: 10px;
  transition: transform 0.3s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const InfoCardContent = styled(CardContent)`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const IconContainer = styled(Avatar)`
  margin-bottom: 10px;
  background-color: #3f51b5;
`;

const SectionTitle = styled(Typography)`
  margin-bottom: 15px;
  color: #333;
  font-weight: 600;
`;

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  borderRadius: '8px',
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileBg, setProfileBg] = useState('');
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('');

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (authUser) => {
      setLoading(true);
      if (authUser) {
        try {
          const userDocRef = doc(db, 'users', authUser.uid);
          const docSnap = await getDoc(userDocRef);

          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser(userData);
            setProfileBg(userData.basicInfo.profilebg);

            // Check if currentStatus exists.  If not, open the modal
            if (!userData.basicInfo.currentStatus) {
              setOpenStatusModal(true);
            } else {
              setCurrentStatus(userData.basicInfo.currentStatus); // Load existing status
            }
          } else {
            console.log('No such document!');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStatusChange = (event) => {
    setCurrentStatus(event.target.value);
  };

  const handleStatusSubmit = async () => {
    try {
      const userDocRef = doc(db, 'users', auth.currentUser.uid); // Use currentUser instead of user.uid
      await updateDoc(userDocRef, {
        'basicInfo.currentStatus': currentStatus,
      });

      // Update the local state immediately to reflect the change
      setUser((prevState) => ({
        ...prevState,
        basicInfo: {
          ...prevState.basicInfo,
          currentStatus: currentStatus,
        },
      }));

      setOpenStatusModal(false);
    } catch (error) {
      console.error('Error updating current status:', error);
    }
  };

  const handleOpenStatusModal = () => {
    setOpenStatusModal(true);
  };

  const handleCloseStatusModal = () => {
    setOpenStatusModal(false);
  };

  // Placeholder for Edit Profile functionality
  const handleEditProfile = () => {
    alert('Edit Profile functionality to be implemented');
    // In a real application, you would navigate to an edit profile page or open a modal.
  };

  if (loading) {
    return <Loader />; // Display the loader while loading
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return (
    <>
      <Navbar /> {/* Use the Navbar component here */}
      <DashboardContainer maxWidth="lg">
        <WelcomeSection elevation={3}>
          <WelcomeButtons>
            <IconButton
              color="primary"
              aria-label="edit profile"
              onClick={handleEditProfile}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="primary"
              aria-label="update status"
              onClick={handleOpenStatusModal}
            >
              <UpdateIcon />
            </IconButton>
          </WelcomeButtons>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <Avatar
                style={{
                  backgroundColor: profileBg,
                  width: 80,
                  height: 80,
                  fontSize: '2rem',
                }}
              >
                {user.basicInfo?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item xs={12} md={9}>
              <Typography variant="h4" gutterBottom>
                Welcome, {user.basicInfo?.fullName}!
              </Typography>
              <Typography variant="subtitle1">
                {user.basicInfo?.batch} | {user.basicInfo?.session}
              </Typography>
            </Grid>
          </Grid>
        </WelcomeSection>

        <Grid container spacing={3}>
          {/* Quick Info Cards */}
          <Grid item xs={12} sm={6} md={4}>
            <InfoCard elevation={3}>
              <InfoCardContent>
                <IconContainer>
                  <AssessmentIcon />
                </IconContainer>
                <Typography variant="h6">Analytics</Typography>
                <Typography variant="body2">View dashboard analytics.</Typography>
              </InfoCardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <InfoCard elevation={3}>
              <InfoCardContent>
                <IconContainer>
                  <EventIcon />
                </IconContainer>
                <Typography variant="h6">Events</Typography>
                <Typography variant="body2">Check upcoming events.</Typography>
              </InfoCardContent>
            </InfoCard>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <InfoCard elevation={3}>
              <InfoCardContent>
                <IconContainer>
                  <PeopleIcon />
                </IconContainer>
                <Typography variant="h6">Community</Typography>
                <Typography variant="body2">Connect with others.</Typography>
              </InfoCardContent>
            </InfoCard>
          </Grid>
        </Grid>

        <StyledPaper elevation={3}>
          <SectionTitle variant="h6">
            Latest Moments
          </SectionTitle>
          <Divider style={{ marginBottom: '15px' }} />
          <AllMomentList />
        </StyledPaper>
      </DashboardContainer>

      {/* Current Status Modal */}
      <Modal
        open={openStatusModal}
        onClose={handleCloseStatusModal}
        aria-labelledby="current-status-modal"
        aria-describedby="update-user-current-status"
      >
        <Box sx={modalStyle}>
          <Typography id="current-status-modal" variant="h6" component="h2">
            Update Your Current Status
          </Typography>
          <FormControl fullWidth margin="normal">
            <InputLabel id="current-status-label">Current Status</InputLabel>
            <Select
              labelId="current-status-label"
              id="current-status-select"
              value={currentStatus}
              label="Current Status"
              onChange={handleStatusChange}
            >
              <MenuItem value="Studying">Studying</MenuItem>
              <MenuItem value="Graduated">Graduated</MenuItem>
              <MenuItem value="Employed">Employed</MenuItem>
              <MenuItem value="Overseas">Overseas</MenuItem>
              <MenuItem value="Unemployed">Unemployed</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            color="primary"
            onClick={handleStatusSubmit}
            style={{ marginTop: '20px' }}
          >
            Submit
          </Button>
        </Box>
      </Modal>

      <Footer /> {/*  Add the Footer component here */}
    </>
  );
}

export default Dashboard;