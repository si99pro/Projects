/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
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
import Paper from '@mui/material/Paper';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link';

// MUI Icons (remain the same)
import SchoolIcon from '@mui/icons-material/School';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CampaignIcon from '@mui/icons-material/Campaign';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EditNoteIcon from '@mui/icons-material/EditNote';
import SpeedIcon from '@mui/icons-material/Speed';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import ContactMailIcon from '@mui/icons-material/ContactMail';

// --- Start of Component Function ---
const Home = () => {
  const theme = useTheme(); // Keep theme for other uses like shadows, spacing etc.
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // --- Dummy Data (remains the same) ---
  const [academicData, setAcademicData] = useState({ gpa: '3.75', status: 'Good Standing' });
  const [financialData, setFinancialData] = useState({ balance: '$250.50', dueDate: 'Nov 15, 2023' });
  const [advisorData, setAdvisorData] = useState({ name: 'Dr. Evelyn Reed', email: 'e.reed@university.edu', office: 'Science Bldg, Room 302' });

  // --- Handler (remains the same) ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect (remains the same) ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserInfo = async () => {
        if (isMounted && !loading) setLoading(true);
        if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); } return; }
        try {
            const userDocRef = doc(db, "users", currentUser.uid);
            const docSnap = await getDoc(userDocRef);
            if (isMounted) {
                if (docSnap.exists()) {
                    const fetchedData = docSnap.data(); setBasicInfo(fetchedData.basicInfo || { email: currentUser?.email });
                } else {
                    setError('User profile not found. Please complete setup.'); setBasicInfo({ email: currentUser?.email });
                    setAcademicData({ gpa: 'N/A', status: 'Unknown' }); setFinancialData({ balance: 'N/A', dueDate: 'N/A' }); setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' });
                } setLoading(false);
            }
        } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load user data.'); setLoading(false); } }
    };
    if (contextUserData?.basicInfo && loading) { setBasicInfo(contextUserData.basicInfo); setLoading(false); }
    else if (!currentUser && loading) { setLoading(false); setError("Not logged in."); }
    else if (currentUser && loading) { fetchUserInfo(); }
    else if (!currentUser && !loading) { setError("Not logged in."); }
    return () => { isMounted = false; };
  }, [currentUser, contextUserData]);

  const displayName = basicInfo?.fullName || basicInfo?.email || currentUser?.email || 'User';

  // --- Card Styling (Using CSS Variables Explicitly) ---
  const cardSx = {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'var(--color-bg-card)', // Explicit background
    border: `1px solid ${theme.palette.divider}`, // Border using theme (usually ok)
    borderRadius: 'var(--border-radius-lg, 12px)',
    overflow: 'hidden',
  };

  // --- Define Text Color SX using CSS Variables ---
  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)' };
  const boldPrimaryTextSx = { fontWeight: 'bold', color: 'var(--color-text-primary)' };


  // --- Render Logic ---
  return (
    <Container component="section" maxWidth="lg" disableGutters sx={{ flexGrow: 1, py: { xs: 2, sm: 3 } }}>
      {loading ? ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}><CircularProgress /></Box> )
       : error ? ( <Alert severity="error" sx={{ width: 'auto', mt: 2, mx: { xs: 2, sm: 0 } }}>{error}</Alert> )
       : (
        <Box>
          {/* Welcome Header - Use explicit primary text color */}
          <Typography variant="h4" component="h1" sx={{ mb: 3, px: { xs: 2, sm: 0 }, ...primaryTextSx }}>
            Welcome, {displayName}!
          </Typography>

          <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ px: { xs: 2, sm: 0 } }}>

            {/* Apply explicit text color styles */}
            {/* Card 1: My Courses */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper elevation={0} sx={cardSx}>
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Title uses primary text sx */}
                  <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }}/> My Courses
                  </Typography>
                  {/* Body text uses secondary text sx, bold part uses bold primary sx */}
                  <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Currently Enrolled: <Typography component="span" sx={boldPrimaryTextSx}>4</Typography>
                  </Typography>
                  <Typography variant="body2" sx={secondaryTextSx}>
                     Next Class: Intro to Databases (Mon 10 AM)
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                  {/* Buttons usually adapt well, but check if specific color needed */}
                  <Button component={RouterLink} to="/courses" size="small">View Courses</Button>
                  <Button component={RouterLink} to="/schedule" size="small">My Schedule</Button>
                </CardActions>
              </Paper>
            </Grid>

            {/* Card 2: Quick Actions */}
            <Grid item xs={12} md={6} lg={4}>
               <Paper elevation={0} sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, ...primaryTextSx }}>
                     <SpeedIcon sx={{ mr: 1.5, color: 'success.main' }}/> Quick Actions
                   </Typography>
                   {/* Buttons should adapt, assuming theme Button styles are correct */}
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button component={RouterLink} to="/grades" variant="outlined" startIcon={<AssessmentIcon />} fullWidth>Check Grades</Button>
                      <Button component={RouterLink} to="/registration" variant="outlined" startIcon={<EditNoteIcon />} fullWidth>Register Courses</Button>
                      <Button component={RouterLink} to="/profile" variant="outlined" startIcon={<PersonIcon />} fullWidth>Update Profile</Button>
                   </Box>
                 </CardContent>
               </Paper>
            </Grid>

             {/* Card 3: Upcoming Deadlines */}
             <Grid item xs={12} md={6} lg={4}>
                <Paper elevation={0} sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <CalendarMonthIcon sx={{ mr: 1.5, color: 'warning.main' }}/> Upcoming Deadlines
                    </Typography>
                    <List dense disablePadding sx={{ width: '100%' }}>
                      {/* Apply explicit colors via primary/secondaryTypographyProps */}
                      <ListItem disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText primary="Project Proposal Due" secondary="Software Eng - Oct 28" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                      <Divider component="li" /> {/* Divider adapts color */}
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemText primary="Midterm Exam" secondary="Calculus II - Nov 02" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                      <Divider component="li" />
                      <ListItem disablePadding sx={{ pt: 0.5 }}>
                        <ListItemText primary="Lab Report 3" secondary="Physics I - Nov 05" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                    </List>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={RouterLink} to="/calendar" size="small">View Full Calendar</Button>
                  </CardActions>
                </Paper>
              </Grid>

            {/* Apply similar explicit text color sx to remaining cards */}

            {/* Card 4: Announcements */}
            <Grid item xs={12} md={6} lg={4}>
               <Paper elevation={0} sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                     <CampaignIcon sx={{ mr: 1.5, color: 'info.main' }}/> Announcements
                   </Typography>
                   <List dense disablePadding sx={{ width: '100%' }}>
                      <ListItem disablePadding sx={{ pb: 0.5 }}>
                        <ListItemText primary="Library hours extended..." secondary="2 days ago" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                      <Divider component="li" />
                      <ListItem disablePadding sx={{ py: 0.5 }}>
                        <ListItemText primary="System Maintenance: Sat Nov 4th..." secondary="3 days ago" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                      <Divider component="li" />
                      <ListItem disablePadding sx={{ pt: 0.5 }}>
                        <ListItemText primary="Spring registration dates..." secondary="5 days ago" primaryTypographyProps={{ sx: primaryTextSx }} secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                      </ListItem>
                   </List>
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                   <Button component={RouterLink} to="/announcements" size="small">View All Announcements</Button>
                 </CardActions>
               </Paper>
             </Grid>

             {/* Card 5: Academic Standing */}
             <Grid item xs={12} md={6} lg={4}>
               <Paper elevation={0} sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                     <TrendingUpIcon sx={{ mr: 1.5, color: 'secondary.main' }}/> Academic Standing
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Current GPA: <Typography component="span" sx={boldPrimaryTextSx}>{academicData.gpa}</Typography>
                   </Typography>
                   <Typography variant="body2" sx={secondaryTextSx}> Status: {academicData.status} </Typography>
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                   <Button component={RouterLink} to="/grades" size="small">View Detailed Grades</Button>
                 </CardActions>
               </Paper>
             </Grid>

             {/* Card 6: Account Balance */}
             <Grid item xs={12} md={6} lg={4}>
                <Paper elevation={0} sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <AccountBalanceWalletIcon sx={{ mr: 1.5, color: 'success.dark' }}/> Account Summary
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                       Current Balance: <Typography component="span" sx={boldPrimaryTextSx}>{financialData.balance}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={secondaryTextSx}> Next Payment Due: {financialData.dueDate} </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={RouterLink} to="/billing" size="small">View Billing Details</Button>
                    <Button component={RouterLink} to="/financial-aid" size="small">Financial Aid</Button>
                  </CardActions>
                </Paper>
              </Grid>

             {/* Card 7: Advisor Info */}
             <Grid item xs={12} md={6} lg={4}>
                <Paper elevation={0} sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <ContactMailIcon sx={{ mr: 1.5, color: 'primary.dark' }}/> My Advisor
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, ...secondaryTextSx }}>
                        Name: <Typography component="span" sx={boldPrimaryTextSx}>{advisorData.name}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...secondaryTextSx }}>
                      Email: 
                      {/* Link color usually adapts well, but could force with sx if needed */}
                      <Link href={`mailto:${advisorData.email}`} sx={{ wordBreak: 'break-all', color: 'var(--color-text-link)' }}>{advisorData.email}</Link>
                    </Typography>
                     <Typography variant="body2" sx={secondaryTextSx}> Office: {advisorData.office} </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                    <Button component={RouterLink} to="/advising" size="small">Advising Center</Button>
                  </CardActions>
                </Paper>
              </Grid>

          </Grid> {/* End Grid Container */}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">{snackbar.message}</Alert>
      </Snackbar>

    </Container>
  );
};

export default Home;