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
import Grid from '@mui/material/Grid';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip'; // Still used for the detail item version if kept, but removed for header icon
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip'; // Added for icon hover text
import { ThemeProvider, createTheme } from '@mui/material/styles';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
// Consider VpnKeyIcon if showing UID
// import VpnKeyIcon from '@mui/icons-material/VpnKey';

const defaultTheme = createTheme({
    // You can customize your theme here or rely on the default
    palette: {
        // Example: Define specific shades if needed
        // background: { default: '#f8f9fa' } // Slightly off-white background
    }
});

const Profile = () => {
  // Auth context and navigation
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  // State
  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- Snackbar Handler ---
   const handleSnackbarClose = (event, reason) => {
     if (reason === 'clickaway') return;
     setSnackbar({ ...snackbar, open: false });
   };

  // --- Data Fetching Effect ---
  useEffect(() => {
    // Use context data if available and loading state is appropriate
    if (contextUserData && !loading) {
      if(contextUserData.basicInfo) {
          setBasicInfo(contextUserData.basicInfo);
      } else {
         console.warn("Profile: User data from context missing basicInfo structure.");
         setError("User profile data structure invalid.");
         setBasicInfo({ email: currentUser?.email });
      }
      setLoading(false);
      return;
    }

    // Fetch only if loading is true and currentUser exists
    if (loading && currentUser) {
      const fetchUserInfo = async () => {
        setError('');
        const userDocRef = doc(db, 'users', currentUser.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && docSnap.data().basicInfo) {
            setBasicInfo(docSnap.data().basicInfo);
          } else {
            console.error("Profile: basicInfo structure not found in Firestore for user:", currentUser.uid);
            setError('Essential user profile data could not be loaded.');
            setBasicInfo({ email: currentUser?.email });
          }
        } catch (err) {
          console.error("Profile: Error fetching user data:", err);
          setError('Failed to load profile data due to an error.');
          setBasicInfo({ email: currentUser?.email });
        } finally {
          setLoading(false);
        }
      };
      fetchUserInfo();
    } else if (!currentUser && loading) {
        setLoading(false);
        setError("Please log in to view your profile.");
        // navigate('/login'); // ProtectedRoute should handle redirection
    }
  }, [currentUser, contextUserData, loading, navigate]);

  // --- Helper Function to Render Profile Details using Grid ---
  const renderDetailItem = (icon, label, value) => {
    let displayValue = value;

    if (value === undefined || value === null || value === '') {
      displayValue = <Typography variant="body2" color="text.disabled" sx={{ fontStyle: 'italic' }}>Not Set</Typography>;
    } else if (label === "Member Since" && value instanceof Timestamp) {
      displayValue = value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    }
    // Removed Email Verified Chip logic from here

    return (
        <>
            <Grid item xs={12} sm={4} sx={{ display: 'flex', alignItems: 'center', mb: { xs: 0, sm: 2 } }}>
                {icon && React.cloneElement(icon, { sx: { mr: 1.5, color: 'action.active' }, fontSize: "small" })}
                <Typography variant="body2" color="text.secondary">
                    {label}
                </Typography>
            </Grid>
            <Grid item xs={12} sm={8} sx={{ mb: 2 }}>
                <Typography variant="body1" sx={{ wordBreak: 'break-word', fontWeight: 500 }}>
                    {displayValue}
                </Typography>
            </Grid>
        </>
    );
  };

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Main container with background color */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', bgcolor: 'grey.100' }}>
        <CssBaseline />

        {/* Content Area */}
        <Container component="main" maxWidth="md" sx={{ flexGrow: 1, py: { xs: 3, sm: 4 }, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50vh' }}><CircularProgress size={50} /></Box>
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 'sm', mt: 4 }}>{error}</Alert>
          ) : !basicInfo ? (
             <Alert severity="warning" sx={{ width: '100%', maxWidth: 'sm', mt: 4 }}>No profile data available.</Alert>
          ): (
            // --- Profile Card ---
            <Paper
              elevation={0}
              variant="outlined"
              sx={{
                p: { xs: 2.5, sm: 3, md: 4 }, // Adjusted padding
                width: '100%',
                mt: 2,
                bgcolor: 'background.paper',
                borderRadius: '12px',
              }}
            >
               {/* --- Profile Header Section --- */}
               <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, borderBottom: 1, borderColor: 'divider', pb: 2.5 /* Adjusted padding */ }}>
                   <Avatar
                       sx={{
                           bgcolor: basicInfo.profileBgColor || defaultTheme.palette.primary.light, // Use light variant or fallback
                           width: { xs: 56, sm: 64 },
                           height: { xs: 56, sm: 64 },
                           mr: 2.5, // Adjusted margin
                           fontSize: '1.75rem',
                           color: 'primary.contrastText' // Ensure text is visible on colored background
                       }}
                       // src={basicInfo.profileImageUrl || undefined} // Use undefined if null/empty
                   >
                       {basicInfo.fullName ? basicInfo.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : <PersonIcon />}
                   </Avatar>
                   <Box sx={{ flexGrow: 1 }}> {/* Allow name/email section to grow */}
                        {/* Name and Verification Icon */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                            <Typography variant="h5" component="h1" sx={{ fontWeight: 600, lineHeight: 1.2 /* Adjust line height */ }}>
                                {basicInfo.fullName || 'User Profile'}
                            </Typography>
                            {/* Verification Icon + Tooltip */}
                            <Tooltip title={basicInfo.emailVerified ? "Email Verified" : "Email Not Verified"} arrow>
                                {basicInfo.emailVerified
                                    ? <VerifiedUserIcon color="success" sx={{ ml: 1, fontSize: '1.25rem' }} />
                                    : <ErrorOutlineIcon color="warning" sx={{ ml: 1, fontSize: '1.25rem' }} />
                                }
                            </Tooltip>
                        </Box>
                        {/* Email */}
                        <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                            {basicInfo.email}
                        </Typography>
                   </Box>
                   {/* Edit Button */}
                   <Button
                       variant="outlined"
                       startIcon={<EditIcon />}
                       disabled // Keep disabled for now
                       size="small" // Make button smaller
                       sx={{ ml: 2, alignSelf: 'center', flexShrink: 0 /* Prevent shrinking */ }}
                   >
                       Edit
                   </Button>
               </Box>

              {/* --- Display User Information using Grid --- */}
              <Grid container spacing={0} sx={{ px: { xs: 0, sm: 1 } }}>

                {/* Details Section */}
                {renderDetailItem(<SchoolIcon />, "Full Name", basicInfo.fullName)}
                {renderDetailItem(<BadgeIcon />, "Student ID", basicInfo.studentId)}
                {renderDetailItem(<SchoolIcon />, "Session", basicInfo.session)}
                <Grid item xs={12}><Divider sx={{ my: 1.5 }} light /></Grid> {/* Slightly more margin, light divider */}
                {renderDetailItem(<EmailIcon />, "Email Address", basicInfo.email)}
                {/* Removed Email Verified from here */}
                {/* Optional: Show UID only if needed, maybe for admins? */}
                {/* {renderDetailItem(<VpnKeyIcon />, "User ID", basicInfo.uid)} */}
                 {basicInfo.createdAt && renderDetailItem(<CalendarMonthIcon />, "Member Since", basicInfo.createdAt)}

              </Grid>

            </Paper>
          )}
        </Container>

         {/* --- Snackbar --- */}
         <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
           <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled"> {snackbar.message} </Alert>
         </Snackbar>

      </Box>
    </ThemeProvider>
  );
};

export default Profile;