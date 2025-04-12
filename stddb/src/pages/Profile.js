/* eslint-disable no-unused-vars */
// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Ensure db is exported correctly
import { doc, getDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Corrected RouterLink import

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
// import Grid from '@mui/material/Grid'; // Removed if not used
import Divider from '@mui/material/Divider';
import Button from '@mui/material/Button'; // Keep Button import
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton'; // Added IconButton import

// MUI Icons
import PersonIcon from '@mui/icons-material/Person'; // Fallback Avatar
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser'; // Verified badge
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Added ErrorOutlineIcon import
import BadgeIcon from '@mui/icons-material/Badge'; // Placeholder for ID
import SchoolIcon from '@mui/icons-material/School'; // Placeholder for Name/Session
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Helper to format optional values or display placeholder text.
 */
const formatDisplayValue = (value, isDate = false) => {
    if (value === undefined || value === null || value === '') {
      // Use slightly different styling for "Not Set" to make it less prominent
      return <Typography variant="body2" color="text.disabled" component="span" sx={{ fontStyle: 'italic' }}>Not Set</Typography>;
    }
    // Format Firestore Timestamp to readable date string
    if (isDate && value instanceof Timestamp) {
      try {
           return value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
       } catch (e) {
           console.error("Error converting timestamp:", e);
           return <Typography variant="body2" color="error" component="span">Invalid Date</Typography>;
       }
    }
    // Return the value directly if not empty/null/undefined or a date
    return value;
};

/**
 * Helper for Avatar Initials
 */
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '?';
    const nameParts = name.trim().split(' ').filter(Boolean);
    // Get first letter of first and last part (if available)
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '?';
};


/**
 * Profile Page Component
 */
const Profile = () => {
  const theme = useTheme();
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

  // Data Fetching Effect
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
            else { console.warn("Profile: Fetched user data missing basicInfo structure."); setError("User data structure invalid."); setBasicInfo({ email: currentUser?.email }); }
          } else { console.log("No such user document!"); setError('User profile not found. Please complete setup.'); setBasicInfo({ email: currentUser?.email }); }
          setLoading(false);
        }
      } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load user data.'); setLoading(false); } }
    };

    if (contextUserData?.basicInfo && !loading) { setBasicInfo(contextUserData.basicInfo); setLoading(false); }
    else if (!currentUser && loading) { setLoading(false); setError("Please log in to view your profile."); }
    else if (currentUser && loading) { fetchUserInfo(); }
    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading, navigate]);


  // --- Render Logic ---
  return (
    <Container
      component="main"
      maxWidth="lg"
      disableGutters
      sx={{
          flexGrow: 1,
          // --- Top Padding Removed ---
          pt: 0,
          // ------------------------
          pb: { xs: 3, sm: 4 } // Keep bottom padding
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '50vh' }}><CircularProgress size={50} /></Box>
      ) : error ? (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 'md', mt: 2, mx: 'auto' }}>{error}</Alert>
      ) : !basicInfo ? (
         <Alert severity="warning" sx={{ width: '100%', maxWidth: 'md', mt: 2, mx: 'auto' }}>No profile data available.</Alert>
      ): (
        // --- Profile Content within a single Paper/Card ---
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 0, // Padding handled by inner Boxes
            width: '100%',
            bgcolor: 'var(--color-bg-card)',
            borderColor: 'var(--color-border)',
            borderRadius: 2,
            overflow: 'hidden',
          }}
        >
           {/* --- Profile Header Section --- */}
           <Box sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
               <Avatar
                   sx={{
                       bgcolor: theme.palette.primary.main,
                       width: { xs: 48, sm: 64 },
                       height: { xs: 48, sm: 64 },
                       mr: { xs: 2, sm: 3 },
                       fontSize: { xs: '1.2rem', sm: '1.5rem' },
                       color: theme.palette.getContrastText(theme.palette.primary.main)
                   }}
                   src={basicInfo.profileImageUrl || undefined}
                   alt={basicInfo.fullName || 'User Avatar'}
               >
                  {!basicInfo.profileImageUrl ? getInitials(basicInfo.fullName) : null}
               </Avatar>
               <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 600 }}>
                            {basicInfo.fullName || 'User Profile'}
                        </Typography>
                        <Tooltip title={basicInfo.emailVerified ? "Verified Account" : "Email Not Verified"} arrow>
                            {basicInfo.emailVerified
                                ? <VerifiedUserIcon color="success" sx={{ ml: 1, fontSize: '1.1rem', verticalAlign: 'middle' }} />
                                : <ErrorOutlineIcon color="warning" sx={{ ml: 1, fontSize: '1.1rem', verticalAlign: 'middle' }} />
                            }
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-all' }}>
                        {basicInfo.email || 'No email provided'}
                    </Typography>
               </Box>
               <Tooltip title="Edit Profile">
                    <IconButton component={RouterLink} to="/profile/edit" size="medium" sx={{ ml: 1, color: 'action.active' }}>
                        <EditIcon />
                    </IconButton>
               </Tooltip>
           </Box>

          {/* --- Display User Information using List --- */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <List disablePadding>
                 {/* Full Name */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                        primary="Full Name"
                        secondary={formatDisplayValue(basicInfo.fullName)}
                    />
                 </ListItem>
                 {/* Student ID */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><BadgeIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                        primary="Student ID"
                        secondary={formatDisplayValue(basicInfo.studentId)}
                    />
                 </ListItem>
                 {/* Session */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                        primary="Session"
                        secondary={formatDisplayValue(basicInfo.session)}
                    />
                 </ListItem>

                 <Divider sx={{ my: 1.5 }} light />

                 {/* Email Address */}
                  <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><EmailIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                        secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500, overflowWrap: 'break-word' }}
                        primary="Email Address"
                        secondary={formatDisplayValue(basicInfo.email)}
                    />
                  </ListItem>
                 {/* Member Since */}
                 {basicInfo.createdAt && (
                     <ListItem disablePadding sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><CalendarMonthIcon fontSize="small"/></ListItemIcon>
                        <ListItemText
                            primaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                            secondaryTypographyProps={{ variant: 'body1', color: 'text.primary', fontWeight: 500 }}
                            primary="Member Since"
                            secondary={formatDisplayValue(basicInfo.createdAt, true)}
                        />
                     </ListItem>
                 )}
              </List>
          </Box>

        </Paper>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
       <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled"> {snackbar.message} </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;