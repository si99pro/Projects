import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { Navigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Modal,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from '@mui/material';
import Navbar from './Navbar';
import styled from '@emotion/styled';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import Loader from './Loader';  // Import the loader component
import AllMomentList from './AllMomentList';  // Import AllMomentList
import ProfileCard from './ProfileCard'; // Import ProfileCard (adjust path)


const StyledPaper = styled(Paper)`
  padding: 20px;
  margin-bottom: 20px;
`;

const DashboardContainer = styled(Container)`
  margin-top: 20px;
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
};

function Dashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ setProfileBg] = useState('');
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
  },);

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
      setUser(prevState => ({
        ...prevState,
        basicInfo: {
          ...prevState.basicInfo,
          currentStatus: currentStatus,
        }
      }));

      setOpenStatusModal(false);
    } catch (error) {
      console.error('Error updating current status:', error);
    }
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
      <DashboardContainer maxWidth="md">
        {/*  REPLACE THIS SECTION WITH THE ProfileCard*/}
        {/*<StyledPaper elevation={3}>
          <Grid container spacing={2} alignItems="center">
            <Grid item>
              <Avatar
                style={{ backgroundColor: profileBg }}
              >
                {user.basicInfo?.fullName?.charAt(0).toUpperCase()}
              </Avatar>
            </Grid>
            <Grid item>
              <Typography variant="h5">
                Welcome, {user.basicInfo?.fullName}!
              </Typography>
              <Typography variant="body2">
                {user.basicInfo?.batch} | {user.basicInfo?.session}
              </Typography>
            </Grid>
          </Grid>
        </StyledPaper>*/}

        {/* Render the ProfileCard */}
        {user && (
          <ProfileCard
            name={user.basicInfo?.fullName}
            title={user.basicInfo?.title} // Or whatever you want to display as title if no work info
            image={user.basicInfo?.profileImage} // Assuming you have profileImage in basicInfo
            bio={user.detailInfo?.bio}
            twitter={user.contactInfo?.twitter}
            website={user.contactInfo?.website}
            profileBg={user.basicInfo?.profilebg}
            companyName={user.workInfo?.workExperience?.[0]?.company} // Safely access company
            position={user.workInfo?.workExperience?.[0]?.position}   // Safely access position
          />
        )}

        <StyledPaper elevation={3}>
          <Typography variant="h6" gutterBottom>
            Latest Moments
          </Typography>
          <AllMomentList />
        </StyledPaper>
      </DashboardContainer>

      {/* Current Status Modal */}
      <Modal
        open={openStatusModal}
        onClose={() => setOpenStatusModal(false)}
        aria-labelledby="current-status-modal"
        aria-describedby="update-user-current-status"
      >
        <Box sx={modalStyle}>
          <Typography id="current-status-modal" variant="h6" component="h2">
            Update Your Current Status
          </Typography>
          <FormControl fullWidth>
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
          <Button variant="contained" color="primary" onClick={handleStatusSubmit} style={{marginTop: '20px'}}>
            Submit
          </Button>
        </Box>
      </Modal>
    </>
  );
}

export default Dashboard;