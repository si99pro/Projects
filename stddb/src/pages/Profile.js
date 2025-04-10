/* eslint-disable no-unused-vars */
// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Ensure db is exported correctly
import { doc, getDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { useNavigate } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid'; // Still used within ListItems
import Divider from '@mui/material/Divider';
// Removed Chip import as it wasn't used
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List'; // Added List
import ListItem from '@mui/material/ListItem'; // Added ListItem
import ListItemIcon from '@mui/material/ListItemIcon'; // Added ListItemIcon
import ListItemText from '@mui/material/ListItemText'; // Added ListItemText
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'; // Added useTheme

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// import VpnKeyIcon from '@mui/icons-material/VpnKey';

const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

/**
 * Profile Page Component
 * Displays user information fetched from Firestore or Auth Context.
 */
const Profile = () => {
  const theme = useTheme(); // Access theme for spacing
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect (remains the same logically) ---
  useEffect(() => {
    if (contextUserData && !loading) {
      if(contextUserData.basicInfo) { setBasicInfo(contextUserData.basicInfo); }
      else {
         console.warn("Profile: User data context missing basicInfo structure.");
         setError("User profile data structure invalid.");
         setBasicInfo({ email: currentUser?.email });
      }
      setLoading(false); return;
    }
    if (loading && currentUser) {
      const fetchUserInfo = async () => { /* ... fetch logic ... */ }; // Keep your fetch logic
      fetchUserInfo();
    } else if (!currentUser && loading) {
        setLoading(false);
        setError("Please log in to view your profile.");
    }
  }, [currentUser, contextUserData, loading, navigate]); // Ensure all dependencies used in fetch logic are included

  // --- Helper to format optional values ---
  const formatDisplayValue = (value, isDate = false) => {
    if (value === undefined || value === null || value === '') {
      return <Typography variant="body2" color="text.disabled" component="span" sx={{ fontStyle: 'italic' }}>Not Set</Typography>;
    }
    if (isDate && value instanceof Timestamp) {
      return value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    return value;
  };

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: 'calc(100vh - var(--header-height, 64px))',
            bgcolor: 'background.default' // Use theme background
            }}>
        <CssBaseline />

        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50vh' }}><CircularProgress size={50} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 'sm', mt: 4, mx: 'auto' }}>{error}</Alert>
          ) : !basicInfo ? (
             <Alert severity="warning" sx={{ width: '100%', maxWidth: 'sm', mt: 4, mx: 'auto' }}>No profile data available.</Alert>
          ): (
            // --- Profile Card using Paper ---
            <Paper
              elevation={0} // Keep flat design
              variant="outlined"
              sx={{
                p: theme.spacing(3), // Consistent padding using theme
                width: '100%',
                mt: 2,
                bgcolor: 'background.paper',
                borderRadius: theme.shape.borderRadius * 1.5, // Slightly more rounded corners
                // Optional subtle hover effect:
                // '&:hover': { boxShadow: theme.shadows[2] },
                // transition: theme.transitions.create('box-shadow'),
              }}
            >
               {/* --- Profile Header Section --- */}
               <Box sx={{ display: 'flex', alignItems: 'center', mb: theme.spacing(3), borderBottom: 1, borderColor: 'divider', pb: theme.spacing(2.5) }}>
                   <Avatar
                       sx={{
                           bgcolor: basicInfo.profileBgColor || theme.palette.primary.light, // Use theme color as fallback
                           width: 56, // Standardized size
                           height: 56,
                           mr: theme.spacing(2.5),
                           fontSize: '1.5rem', // Adjusted for smaller avatar
                           color: theme.palette.getContrastText(basicInfo.profileBgColor || theme.palette.primary.light) // Get contrast text color
                       }}
                       src={basicInfo.profileImageUrl || undefined}
                       alt={basicInfo.fullName || 'User Avatar'}
                   >
                      {/* Fallback logic remains the same */}
                       {!basicInfo.profileImageUrl && basicInfo.fullName
                          ? basicInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase()
                          : !basicInfo.profileImageUrl ? <PersonIcon /> : null
                       }
                   </Avatar>
                   <Box sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
                                {basicInfo.fullName || 'User Profile'}
                            </Typography>
                            <Tooltip title={basicInfo.emailVerified ? "Email Verified" : "Email Not Verified"} arrow>
                                {basicInfo.emailVerified
                                    ? <VerifiedUserIcon color="success" sx={{ ml: 1, fontSize: '1.2rem' }} />
                                    : <ErrorOutlineIcon color="warning" sx={{ ml: 1, fontSize: '1.2rem' }} />
                                }
                            </Tooltip>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {basicInfo.email || 'No email provided'}
                        </Typography>
                   </Box>
                   {/* Edit Button - Consider Tooltip if disabled */}
                   <Tooltip title="Edit profile functionality not yet implemented">
                        <span> {/* Tooltip requires wrapper for disabled elements */}
                            <Button
                                variant="outlined"
                                startIcon={<EditIcon />}
                                disabled
                                size="small"
                                sx={{ ml: 2, alignSelf: 'center', flexShrink: 0 }}
                            >
                                Edit
                            </Button>
                        </span>
                   </Tooltip>
               </Box>

              {/* --- Display User Information using List --- */}
              <List disablePadding>
                 {/* Full Name */}
                 <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText primary="Full Name" secondary={formatDisplayValue(basicInfo.fullName)} />
                 </ListItem>
                 {/* Student ID */}
                 <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><BadgeIcon fontSize="small"/></ListItemIcon>
                    <ListItemText primary="Student ID" secondary={formatDisplayValue(basicInfo.studentId)} />
                 </ListItem>
                 {/* Session */}
                 <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText primary="Session" secondary={formatDisplayValue(basicInfo.session)} />
                 </ListItem>

                 <Divider sx={{ my: 1.5 }} light />

                 {/* Email Address */}
                  <ListItem disablePadding sx={{ py: 1 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><EmailIcon fontSize="small"/></ListItemIcon>
                    <ListItemText primary="Email Address" secondary={formatDisplayValue(basicInfo.email)} />
                 </ListItem>
                 {/* Member Since */}
                 {basicInfo.createdAt && (
                     <ListItem disablePadding sx={{ py: 1 }}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><CalendarMonthIcon fontSize="small"/></ListItemIcon>
                        <ListItemText primary="Member Since" secondary={formatDisplayValue(basicInfo.createdAt, true)} />
                     </ListItem>
                 )}
              </List>

            </Paper> // End Profile Card Paper
          )}
        </Container>

         {/* Snackbar remains the same */}
         <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
           <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled"> {snackbar.message} </Alert>
         </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default Profile;