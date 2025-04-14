/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Assuming firebase is configured
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container'; // Using Container to constrain width
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
  const { currentUser, contextUserData } = useAuth();
  // const navigate = useNavigate(); // Uncomment if needed

  // --- State Management ---
  const [basicInfo, setBasicInfo] = useState(null);
  const [loading, setLoading] = useState(true); // Start in loading state
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' });

  // --- Dummy/Default Data (Replace with actual fetching logic as needed) ---
  const [academicData, setAcademicData] = useState({ gpa: 'N/A', status: 'Unknown' });
  const [financialData, setFinancialData] = useState({ balance: 'N/A', dueDate: 'N/A' });
  const [advisorData, setAdvisorData] = useState({ name: 'N/A', email: 'N/A', office: 'N/A' });
  const [courseData, setCourseData] = useState({ enrolled: 'N/A', nextClass: 'N/A' });
  const [deadlines, setDeadlines] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // --- Handler ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect (Keep as is) ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        if (isMounted) {
          setError("Not logged in.");
          setLoading(false);
          setBasicInfo(null); setAcademicData({ gpa: 'N/A', status: 'Unknown' }); setFinancialData({ balance: 'N/A', dueDate: 'N/A' }); setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' }); setCourseData({ enrolled: 'N/A', nextClass: 'N/A' }); setDeadlines([]); setAnnouncements([]);
        } return;
      }
      if (contextUserData?.basicInfo && loading) {
          setBasicInfo(contextUserData.basicInfo); setAcademicData({ gpa: 'N/A', status: 'Unknown' }); setFinancialData({ balance: 'N/A', dueDate: 'N/A' }); setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' }); setCourseData({ enrolled: 'N/A', nextClass: 'N/A'}); setDeadlines([]); setAnnouncements([]);
          if (isMounted) setLoading(false); return;
      }
      if (loading) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (isMounted) {
            if (docSnap.exists()) {
              const fetchedData = docSnap.data(); setBasicInfo(fetchedData.basicInfo || { email: currentUser.email, fullName: 'Your Name' }); setAcademicData({ gpa: 'N/A', status: 'Unknown' }); setFinancialData({ balance: 'N/A', dueDate: 'N/A' }); setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' }); setCourseData({ enrolled: 'N/A', nextClass: 'N/A'}); setDeadlines([]); setAnnouncements([]);
            } else {
              setError('User profile not found.'); setBasicInfo({ email: currentUser.email, fullName: 'Your Name' }); setAcademicData({ gpa: 'N/A', status: 'Unknown' }); setFinancialData({ balance: 'N/A', dueDate: 'N/A' }); setAdvisorData({ name: 'N/A', email: 'N/A', office: 'N/A' }); setCourseData({ enrolled: 'N/A', nextClass: 'N/A'}); setDeadlines([]); setAnnouncements([]);
            } setLoading(false);
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
          if (isMounted) { setError('Failed to load user data.'); setBasicInfo({ email: currentUser.email, fullName: 'Your Name' }); setLoading(false); }
        }
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading]); // Ensure loading is dependency if needed

  // --- Dynamic Display Name ---
  const displayName = basicInfo?.fullName || basicInfo?.email || 'User';
  // const displayRoleEmail = basicInfo?.headline || basicInfo?.email || 'Your Role/Email'; // Not used currently

  // --- Consistent Card Styling (Keep as is) ---
  const cardSx = {
    height: '100%', display: 'flex', flexDirection: 'column', bgcolor: 'var(--color-bg-card)',
    border: `1px solid var(--color-border)`, borderRadius: 'var(--border-radius, 6px)',
    overflow: 'hidden', boxShadow: 'none',
  };

  // --- Reusable Text Color Styles (Keep as is) ---
  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)', fontSize: '0.875rem' };
  const boldPrimaryTextSx = { fontWeight: 600, color: 'var(--color-text-primary)' };
  const cardTitleSx = { display: 'flex', alignItems: 'center', mb: 1.5, ...primaryTextSx, fontWeight: 500 };


  // --- Render Logic ---
  return (
    // Modified Container: Removed padding/gutters
    <Container
        component="section"
        maxWidth="lg" // Keep controlling max width, or set to false
        disableGutters={true} // <<< MODIFIED: Remove horizontal gutters
        sx={{
            flexGrow: 1, // Allow container to grow
            // <<< MODIFIED: Remove vertical padding (py) >>>
            // Vertical padding is handled by .main-content-wrapper in Layout.css
            pt: 0,
            pb: 0,
        }}
    >
      {loading ? (
        // Centered Loader - Consider adjusting height calculation if needed
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' /* Use minHeight for flexibility */ }}>
            <CircularProgress />
        </Box>
      ) : error ? (
        // Error Alert - Add margin if needed since container padding is removed
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', pt: 2, pb: 2 /* Add padding here if needed */ }}>
            <Alert severity="error" sx={{ width: 'auto', mx: { xs: 2, sm: 0 } /* Add horizontal margin if needed */ }}>{error}</Alert>
        </Box>
      ) : (
        // Main Content Box (inside Container)
        // We need to add padding/margin here manually if desired around the content,
        // since the Container no longer provides it.
        // Alternatively, let the Layout.css handle it.
        <Box sx={{
            // Optional: Add padding here if you want space specifically
            // around the Home content, independent of Layout.css padding.
            // Example: px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 }
            // If Layout.css .main-content-wrapper padding is sufficient, leave this Box sx empty or remove Box.
           }}
        >
          {/* Welcome Header */}
          <Typography variant="h4" component="h1" sx={{ mb: 3, fontWeight: 600, ...primaryTextSx }}>
            Welcome, {displayName}!
          </Typography>

          {/* Grid Container for Cards - Spacing handles space between cards */}
          <Grid container spacing={'var(--layout-gap, 20px)'}>

            {/* --- Row 1 (3 items: lg=4) --- */}
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={cardSx}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                    <SchoolIcon sx={{ mr: 1.5, color: 'primary.main', fontSize:'1.3rem' }}/> My Courses
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Currently Enrolled: <Typography component="span" sx={boldPrimaryTextSx}>{courseData.enrolled}</Typography>
                  </Typography>
                  <Typography variant="body2" sx={secondaryTextSx}>
                     Next Class: {courseData.nextClass}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                  <Button component={RouterLink} to="/courses" size="small">View Courses</Button>
                  <Button component={RouterLink} to="/schedule" size="small">My Schedule</Button>
                </CardActions>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6} lg={4}>
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                     <SpeedIcon sx={{ mr: 1.5, color: 'success.main', fontSize:'1.3rem' }}/> Quick Actions
                   </Typography>
                   <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Button component={RouterLink} to="/grades" variant="outlined" startIcon={<AssessmentIcon />} fullWidth>Check Grades</Button>
                      <Button component={RouterLink} to="/registration" variant="outlined" startIcon={<EditNoteIcon />} fullWidth>Register Courses</Button>
                      <Button component={RouterLink} to="/profile" variant="outlined" startIcon={<PersonIcon />} fullWidth>Update Profile</Button>
                   </Box>
                 </CardContent>
                 {/* No actions needed */}
               </Paper>
            </Grid>

             <Grid item xs={12} md={6} lg={4}>
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                      <CalendarMonthIcon sx={{ mr: 1.5, color: 'warning.main', fontSize:'1.3rem' }}/> Upcoming Deadlines
                    </Typography>
                    {deadlines.length > 0 ? (
                      <List dense disablePadding sx={{ width: '100%' }}>
                        {deadlines.slice(0, 3).map((item, index) => (
                          <React.Fragment key={item.id || index}> {/* Add fallback key */}
                            <ListItem disablePadding sx={{ py: 0.75 }}>
                              <ListItemText
                                primary={item.title}
                                secondary={`${item.course || ''} - ${item.date || ''}`}
                                primaryTypographyProps={{ sx: {...primaryTextSx, fontWeight: 500, fontSize: '0.9rem'} }}
                                secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                            </ListItem>
                            {index < deadlines.slice(0, 3).length - 1 && <Divider component="li" light sx={{ borderColor: 'var(--color-border)' }} />}
                          </React.Fragment>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" sx={secondaryTextSx}>No upcoming deadlines found.</Typography>
                    )}
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/calendar" size="small">View Full Calendar</Button>
                  </CardActions>
                </Paper>
              </Grid>

            {/* --- Row 2 (2 items: lg=6) --- */}
            <Grid item xs={12} md={6} lg={6}>
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                     <CampaignIcon sx={{ mr: 1.5, color: 'info.main', fontSize:'1.3rem' }}/> Announcements
                   </Typography>
                   {announcements.length > 0 ? (
                     <List dense disablePadding sx={{ width: '100%' }}>
                        {announcements.slice(0, 3).map((item, index) => (
                          <React.Fragment key={item.id || index}> {/* Add fallback key */}
                            <ListItem disablePadding sx={{ py: 0.75 }}>
                              <ListItemText
                                primary={item.title}
                                secondary={item.date || ''}
                                primaryTypographyProps={{ sx: {...primaryTextSx, fontWeight: 500, fontSize: '0.9rem'} }}
                                secondaryTypographyProps={{ sx: secondaryTextSx }}/>
                            </ListItem>
                            {index < announcements.slice(0, 3).length - 1 && <Divider component="li" light sx={{ borderColor: 'var(--color-border)' }} />}
                          </React.Fragment>
                        ))}
                     </List>
                   ) : (
                     <Typography variant="body2" sx={secondaryTextSx}>No recent announcements.</Typography>
                   )}
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                   <Button component={RouterLink} to="/announcements" size="small">View All Announcements</Button>
                 </CardActions>
               </Paper>
             </Grid>

             <Grid item xs={12} md={6} lg={6}>
               <Paper sx={cardSx}>
                 <CardContent sx={{ flexGrow: 1 }}>
                   <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                     <TrendingUpIcon sx={{ mr: 1.5, color: 'secondary.main', fontSize:'1.3rem' }}/> Academic Standing
                   </Typography>
                   <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                     Current GPA: <Typography component="span" sx={boldPrimaryTextSx}>{academicData.gpa}</Typography>
                   </Typography>
                   <Typography variant="body2" sx={secondaryTextSx}>
                     Status: <Typography component="span" sx={{ fontWeight: 500, color: academicData.status === 'Good Standing' ? 'success.main' : (academicData.status === 'Unknown' || academicData.status === 'N/A' ? 'text.disabled' : 'warning.main') }}>{academicData.status}</Typography>
                   </Typography>
                 </CardContent>
                 <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                   <Button component={RouterLink} to="/grades" size="small">View Detailed Grades</Button>
                 </CardActions>
               </Paper>
             </Grid>

            {/* --- Row 3 (2 items: lg=6) --- */}
             <Grid item xs={12} md={6} lg={6}>
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                      <AccountBalanceWalletIcon sx={{ mr: 1.5, color: 'success.dark', fontSize:'1.3rem' }}/> Account Summary
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 1, ...secondaryTextSx }}>
                       Current Balance: <Typography component="span" sx={boldPrimaryTextSx}>{financialData.balance}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={secondaryTextSx}>
                       Next Payment Due: <Typography component="span" sx={{ fontWeight: 500 }}>{financialData.dueDate}</Typography>
                    </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/billing" size="small">View Billing Details</Button>
                    <Button component={RouterLink} to="/financial-aid" size="small">Financial Aid</Button>
                  </CardActions>
                </Paper>
              </Grid>

             <Grid item xs={12} md={6} lg={6}>
                <Paper sx={cardSx}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom sx={cardTitleSx}>
                      <ContactMailIcon sx={{ mr: 1.5, color: 'primary.dark', fontSize:'1.3rem' }}/> My Advisor
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, ...secondaryTextSx }}>
                        Name: <Typography component="span" sx={boldPrimaryTextSx}>{advisorData.name}</Typography>
                    </Typography>
                    <Typography variant="body2" sx={{ mb: 0.5, display: 'flex', alignItems: 'center', flexWrap: 'wrap', ...secondaryTextSx }}>
                      Email:  {/* Use non-breaking space */}
                      {advisorData.email && advisorData.email !== 'N/A' ? (
                          <Link href={`mailto:${advisorData.email}`} sx={{ wordBreak: 'break-all', color: 'var(--color-text-link)' }}>{advisorData.email}</Link>
                      ) : (
                          <Typography component="span" sx={{ fontWeight: 500 }}>N/A</Typography>
                      )}
                    </Typography>
                     <Typography variant="body2" sx={secondaryTextSx}>
                        Office: <Typography component="span" sx={{ fontWeight: 500 }}>{advisorData.office}</Typography>
                     </Typography>
                  </CardContent>
                  <CardActions sx={{ justifyContent: 'flex-end', px: 2, py: 1.5, borderTop: `1px solid var(--color-border)`, mt: 'auto' }}>
                    <Button component={RouterLink} to="/advising" size="small">Advising Center</Button>
                  </CardActions>
                </Paper>
              </Grid>
             {/* --- END GRID ITEMS --- */}

          </Grid> {/* End Grid Container */}
        </Box>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
            {snackbar.message}
         </Alert>
      </Snackbar>

    </Container> // End Main Container
  );
};

export default Home;