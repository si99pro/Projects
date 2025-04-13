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

// MUI Icons
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
  const theme = useTheme();
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // --- Dummy Data (Keep or replace with real data fetching) ---
  const [academicData, setAcademicData] = useState({ gpa: '3.75', status: 'Good Standing' });
  const [financialData, setFinancialData] = useState({ balance: '$250.50', dueDate: 'Nov 15, 2023' });
  const [advisorData, setAdvisorData] = useState({ name: 'Dr. Evelyn Reed', email: 'e.reed@university.edu', office: 'Science Bldg, Room 302' });
  const [courseData, setCourseData] = useState({ enrolled: 4, nextClass: 'Intro to Databases (Mon 10 AM)'});
  const [deadlines, setDeadlines] = useState([
    { id: 1, title: "Project Proposal Due", course: "Software Eng", date: "Oct 28" },
    { id: 2, title: "Midterm Exam", course: "Calculus II", date: "Nov 02" },
    { id: 3, title: "Lab Report 3", course: "Physics I", date: "Nov 05" },
  ]);
   const [announcements, setAnnouncements] = useState([
    { id: 1, title: "Library hours extended for finals", date: "2 days ago" },
    { id: 2, title: "System Maintenance: Sat Nov 4th", date: "3 days ago" },
    { id: 3, title: "Spring registration dates announced", date: "5 days ago" },
  ]);
  // --- End Dummy Data ---

  // --- Handler ---
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
                  setBasicInfo(fetchedData.basicInfo || { email: currentUser?.email });
                  // TODO: Fetch other data (academic, financial, etc.) here if needed
              } else {
                  setError('User profile not found. Please complete setup.');
                  setBasicInfo({ email: currentUser?.email });
                  // Set dummy/default data if profile not found
                  setAcademicData({ gpa: 'N/A', status: 'Unknown' });
                  setFinancialData({ balance: 'N/A', dueDate: 'N/A' });
                  setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' });
                  setCourseData({ enrolled: 'N/A', nextClass: 'N/A'});
                  setDeadlines([]);
                  setAnnouncements([]);
              }
              setLoading(false);
          }
      } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load user data.'); setLoading(false); } }
    };
    if (contextUserData?.basicInfo && loading) { setBasicInfo(contextUserData.basicInfo); setLoading(false); /* TODO: Set other context data if available */ }
    else if (!currentUser && loading) { setLoading(false); setError("Not logged in."); }
    else if (currentUser && loading) { fetchUserInfo(); }
    else if (!currentUser && !loading) { setError("Not logged in."); }
    return () => { isMounted = false; };
  }, [currentUser, contextUserData]); // Removed loading dependency

  const displayName = basicInfo?.fullName || basicInfo?.email || currentUser?.email || 'User';

  // --- Card Styling ---
  const cardSx = {
    height: '100%', // Ensure cards try to fill height within grid item
    display: 'flex',
    flexDirection: 'column',
    bgcolor: 'var(--color-bg-card)',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: 'var(--border-radius-lg, 12px)', // Using CSS var with fallback
    overflow: 'hidden', // Prevent content spillover
    boxShadow: 'none', // Remove default Paper elevation shadow if using border
  };

  // --- Define Text Color SX ---
  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)' };
  const boldPrimaryTextSx = { fontWeight: 'bold', color: 'var(--color-text-primary)' };


  // --- Render Logic ---
  return (
    <Container
        component="section"
        // Use 'xl' or false to allow container to grow wider if needed
        maxWidth="xl"
        disableGutters={false}
        sx={{
            flexGrow: 1,
            pt: 3, // Added some top padding inside container
            px: { xs: 2, md: 'var(--layout-padding-x)' }, // Use theme variables
            pb: { xs: 2, md: 'var(--layout-padding-y)' }  // Use theme variables
        }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - var(--header-height) - 60px)' }}><CircularProgress /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ width: 'auto', mt: 2, mx: 'auto' }}>{error}</Alert>
      ) : (
        <Box>
          {/* Welcome Header */}
          <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600, ...primaryTextSx }}>
            Welcome, {displayName}!
          </Typography>

          {/* Grid Container - Use theme variable for spacing */}
          <Grid container spacing={{ xs: 2, md: 'var(--layout-gap)' }}>

            {/* --- Row 1 (3 items) --- */}
            {/* Card 1: My Courses */}
            <Grid item xs={12} md={6} lg={4}> {/* Keep lg={4} for 3 columns on large screens */}
              <Paper sx={cardSx}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main' }}/> My Courses
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Currently Enrolled: <Typography component="span" sx={boldPrimaryTextSx}>{courseData.enrolled}</Typography>
                  </Typography>
                  <Typography variant="body2" sx={secondaryTextSx}>
                     Next Class: {courseData.nextClass}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                  <Button component={RouterLink} to="/courses" size="small">View Courses</Button>
                  <Button component={RouterLink} to="/schedule" size="small">My Schedule</Button>
                </CardActions>
              </Paper>
            </Grid>

            {/* Card 2: Quick Actions */}
            <Grid item xs={12} md={6} lg={4}> {/* Keep lg={4} */}
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 2, ...primaryTextSx }}>
                     <SpeedIcon sx={{ mr: 1.5, color: 'success.main' }}/> Quick Actions
                   </Typography>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button component={RouterLink} to="/grades" variant="outlined" startIcon={<AssessmentIcon />} fullWidth>Check Grades</Button>
                      <Button component={RouterLink} to="/registration" variant="outlined" startIcon={<EditNoteIcon />} fullWidth>Register Courses</Button>
                      <Button component={RouterLink} to="/profile" variant="outlined" startIcon={<PersonIcon />} fullWidth>Update Profile</Button>
                   </Box>
                 </CardContent>
                  {/* Optional: Add CardActions if needed later */}
                  {/* <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}></CardActions> */}
               </Paper>
            </Grid>

             {/* Card 3: Upcoming Deadlines */}
             <Grid item xs={12} md={6} lg={4}> {/* Keep lg={4} */}
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <CalendarMonthIcon sx={{ mr: 1.5, color: 'warning.main' }}/> Upcoming Deadlines
                    </Typography>
                    {deadlines.length > 0 ? (
                      <List dense disablePadding sx={{ width: '100%' }}>
                        {deadlines.slice(0, 3).map((item, index) => ( // Show max 3
                          <React.Fragment key={item.id}>
                            <ListItem disablePadding sx={{ py: 0.75 }}>
                              <ListItemText
                                primary={item.title}
                                secondary={`${item.course} - ${item.date}`}
                                primaryTypographyProps={{ sx: primaryTextSx, fontWeight: 500 }}
                                secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                            </ListItem>
                            {index < deadlines.slice(0, 3).length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={secondaryTextSx}>No upcoming deadlines found.</Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/calendar" size="small">View Full Calendar</Button>
                  </CardActions>
                </Paper>
              </Grid>

            {/* --- Row 2 (2 items - CHANGED) --- */}
            {/* Card 4: Announcements */}
            <Grid item xs={12} md={6} lg={6}> {/* <<< CHANGED lg to 6 */}
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                     <CampaignIcon sx={{ mr: 1.5, color: 'info.main' }}/> Announcements
                   </Typography>
                   {announcements.length > 0 ? (
                     <List dense disablePadding sx={{ width: '100%' }}>
                        {announcements.slice(0, 3).map((item, index) => ( // Show max 3
                          <React.Fragment key={item.id}>
                            <ListItem disablePadding sx={{ py: 0.75 }}>
                              <ListItemText
                                primary={item.title}
                                secondary={item.date}
                                primaryTypographyProps={{ sx: primaryTextSx, fontWeight: 500 }}
                                secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                            </ListItem>
                            {index < announcements.slice(0, 3).length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                     </List>
                   ) : (
                     <Typography variant="body2" sx={secondaryTextSx}>No recent announcements.</Typography>
                   )}
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                   <Button component={RouterLink} to="/announcements" size="small">View All Announcements</Button>
                 </CardActions>
               </Paper>
             </Grid>

             {/* Card 5: Academic Standing */}
             <Grid item xs={12} md={6} lg={6}> {/* <<< CHANGED lg to 6 */}
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                     <TrendingUpIcon sx={{ mr: 1.5, color: 'secondary.main' }}/> Academic Standing
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Current GPA: <Typography component="span" sx={boldPrimaryTextSx}>{academicData.gpa}</Typography>
                   </Typography>
                   <Typography variant="body2" sx={secondaryTextSx}>
                     Status: <Typography component="span" sx={{ fontWeight: 500, color: academicData.status === 'Good Standing' ? 'success.main' : 'warning.main' }}>{academicData.status}</Typography>
                   </Typography>
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                   <Button component={RouterLink} to="/grades" size="small">View Detailed Grades</Button>
                 </CardActions>
               </Paper>
             </Grid>

            {/* --- Row 3 (2 items - CHANGED) --- */}
             {/* Card 6: Account Summary */}
             <Grid item xs={12} md={6} lg={6}> {/* <<< CHANGED lg to 6 */}
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <AccountBalanceWalletIcon sx={{ mr: 1.5, color: 'success.dark' }}/> Account Summary
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                       Current Balance: <Typography component="span" sx={boldPrimaryTextSx}>{financialData.balance}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={secondaryTextSx}>
                       Next Payment Due: <Typography component="span" sx={{ fontWeight: 500 }}>{financialData.dueDate}</Typography>
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/billing" size="small">View Billing Details</Button>
                    <Button component={RouterLink} to="/financial-aid" size="small">Financial Aid</Button>
                  </CardActions>
                </Paper>
              </Grid>

             {/* Card 7: Advisor Info */}
             <Grid item xs={12} md={6} lg={6}> {/* <<< CHANGED lg to 6 */}
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={{ display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx }}>
                      <ContactMailIcon sx={{ mr: 1.5, color: 'primary.dark' }}/> My Advisor
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, ...secondaryTextSx }}>
                        Name: <Typography component="span" sx={boldPrimaryTextSx}>{advisorData.name}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...secondaryTextSx }}>
                      Email:  {/* Use non-breaking space */}
                      <Link href={`mailto:${advisorData.email}`} sx={{ wordBreak: 'break-all', color: 'var(--color-text-link)' }}>{advisorData.email}</Link>
                    </Typography>
                     <Typography variant="body2" sx={secondaryTextSx}>
                        Office: <Typography component="span" sx={{ fontWeight: 500 }}>{advisorData.office}</Typography>
                     </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/advising" size="small">Advising Center</Button>
                  </CardActions>
                </Paper>
              </Grid>
             {/* --- END GRID ITEMS --- */}

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