/* eslint-disable no-unused-vars */
// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Assuming db is exported correctly
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';

// --- Start of Component Function ---
const Home = () => {
  const theme = useTheme();
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserInfo = async () => {
      if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); } return; }
      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(userDocRef);
        if (isMounted) {
          if (docSnap.exists()) {
            const fetchedData = docSnap.data();
            if (fetchedData.basicInfo) { setBasicInfo(fetchedData.basicInfo); }
            else { console.warn("Home: Fetched user data missing basicInfo structure."); setError("User data structure invalid."); setBasicInfo({ email: currentUser?.email }); }
          } else { console.log("No such user document!"); setError('User profile not found. Please complete setup.'); setBasicInfo({ email: currentUser?.email }); }
          setLoading(false);
        }
      } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load user data.'); setLoading(false); } }
    };

    if (contextUserData?.basicInfo && !loading) { setBasicInfo(contextUserData.basicInfo); setLoading(false); }
    else if (!currentUser && loading) { setLoading(false); setError("Not logged in."); }
    else if (currentUser && loading) { fetchUserInfo(); }
    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading, navigate]); // Dependency array as before

  const displayName = basicInfo?.fullName || basicInfo?.email || currentUser?.email || 'User';

  // --- Render Logic ---
  return (
    // Container has disableGutters, removing its horizontal padding
    <Container
        component="main"
        maxWidth="lg"
        disableGutters // <-- Removes Container's default horizontal padding
        sx={{
            flexGrow: 1,
            pt: 1, // Keep minimal top padding or set to 0
            pb: 3  // Keep bottom padding
        }}
    >
      {loading ? (
         <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', pt: 10 }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>{error}</Alert>
      ) : (
        // REMOVED px from this Box to make content flush with container edges
        <Box>
          {/* Welcome Header */}
          <Typography variant="h4" component="h1" sx={{ mb: 2 }}>
            Welcome, {displayName}!
          </Typography>

          {/* Dashboard Cards Grid */}
          {/* Grid spacing controls space BETWEEN cards, not around the whole grid */}
          <Grid container spacing={2}>

            {/* Card 1: My Courses */}
            <Grid item xs={12} sm={6} lg={4}>
              <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 3 } }}>
                {/* CardContent provides padding INSIDE the card */}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }}/> My Courses
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}> Currently Enrolled: <b>4</b> </Typography>
                  <Typography variant="body2" color="text.secondary"> Next Class: Intro to Databases (Mon 10 AM) </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  <Button component={RouterLink} to="/courses" size="small">View Courses</Button>
                  <Button component={RouterLink} to="/schedule" size="small">My Schedule</Button>
                </CardActions>
              </Card>
            </Grid>

            {/* Card 2 (Previously Card 4): Quick Actions - MOVED HERE */}
            <Grid item xs={12} sm={6} lg={4}>
               <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 3 } }}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                     <SpeedIcon sx={{ mr: 1.5, color: 'success.main' }}/> Quick Actions
                   </Typography>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <Button component={RouterLink} to="/grades" variant="outlined" startIcon={<AssessmentIcon />} fullWidth>Check Grades</Button>
                      <Button component={RouterLink} to="/registration" variant="outlined" startIcon={<EditNoteIcon />} fullWidth>Register Courses</Button>
                      <Button component={RouterLink} to="/profile" variant="outlined" startIcon={<PersonIcon />} fullWidth>Update Profile</Button>
                   </Box>
                 </CardContent>
               </Card>
            </Grid>

             {/* Card 3 (Previously Card 2): Upcoming Deadlines */}
             <Grid item xs={12} sm={6} lg={4}>
                <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 3 } }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <CalendarMonthIcon sx={{ mr: 1.5, color: 'warning.main' }}/> Upcoming Deadlines
                    </Typography>
                    <List dense disablePadding sx={{ width: '100%' }}>
                      <ListItem disablePadding sx={{ pb: 0.5 }}><ListItemText primary="Project Proposal Due" secondary="Software Eng - Oct 28" /></ListItem>
                      <Divider component="li" light/>
                      <ListItem disablePadding sx={{ py: 0.5 }}><ListItemText primary="Midterm Exam" secondary="Calculus II - Nov 02" /></ListItem>
                      <Divider component="li" light/>
                      <ListItem disablePadding sx={{ pt: 0.5 }}><ListItemText primary="Lab Report 3" secondary="Physics I - Nov 05" /></ListItem>
                    </List>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={RouterLink} to="/calendar" size="small">View Full Calendar</Button>
                  </CardActions>
                </Card>
              </Grid>

            {/* Card 4 (Previously Card 3): Announcements */}
            <Grid item xs={12} sm={6} lg={4}>
               <Card variant="outlined" sx={{ height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: 3 } }}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                     <CampaignIcon sx={{ mr: 1.5, color: 'info.main' }}/> Announcements
                   </Typography>
                   <List dense disablePadding sx={{ width: '100%' }}>
                      <ListItem disablePadding sx={{ pb: 0.5 }}><ListItemText primary="Library hours extended during finals..." secondary="2 days ago" /></ListItem>
                      <Divider component="li" light/>
                      <ListItem disablePadding sx={{ py: 0.5 }}><ListItemText primary="System Maintenance: Sat Nov 4th..." secondary="3 days ago" /></ListItem>
                      <Divider component="li" light/>
                      <ListItem disablePadding sx={{ pt: 0.5 }}><ListItemText primary="Spring registration dates announced..." secondary="5 days ago" /></ListItem>
                   </List>
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                   <Button component={RouterLink} to="/announcements" size="small">View All Announcements</Button>
                 </CardActions>
               </Card>
             </Grid>

          </Grid> {/* End Grid Container */}
        </Box> // End Content Wrapper Box
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

    </Container> // End Main Container
  );
};

export default Home;