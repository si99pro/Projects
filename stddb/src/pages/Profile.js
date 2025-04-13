/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Profile.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

// MUI Icons
import PersonIcon from '@mui/icons-material/Person'; // Fallback Avatar
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BadgeIcon from '@mui/icons-material/Badge'; // ID
import SchoolIcon from '@mui/icons-material/School'; // Name/Session
import EmailIcon from '@mui/icons-material/Email';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

/**
 * Helper to format optional values or display placeholder text.
 */
const formatDisplayValue = (value, isDate = false) => {
    if (value === undefined || value === null || value === '') {
      return <Typography variant="body1" color="text.disabled" component="span" sx={{ fontStyle: 'italic' }}>Not Set</Typography>;
    }
    if (isDate && value instanceof Timestamp) {
      try {
           return value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
       } catch (e) {
           console.error("Error converting timestamp:", e);
           return <Typography variant="body1" color="error" component="span">Invalid Date</Typography>;
       }
    }
    return value;
};

/**
 * Helper for Avatar Initials
 */
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '?';
    const nameParts = name.trim().split(' ').filter(Boolean);
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

  const userInitials = useCallback(() => getInitials(basicInfo?.fullName), [basicInfo?.fullName]);

  // Data Fetching Effect (remains the same)
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

  // --- Define Text Color SX using CSS Variables (like Home.js) ---
  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)' };

  // --- Render Logic ---
  return (
    <Container
      component="main"
      maxWidth="lg" // Use consistent maxWidth or false
      disableGutters={false} // Let Container handle gutters
      sx={{
          flexGrow: 1,
          // --- FIXED PADDING ---
          pt: 0, // Explicitly set top padding to 0
          pb: { xs: 2, sm: 3, md: 4 }, // Keep bottom padding
          // --------------------
      }}
    >
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '50vh' }}>
            <CircularProgress size={50} />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ width: '100%', maxWidth: 'md', mx: 'auto' }}>{error}</Alert>
      ) : !basicInfo ? (
         <Alert severity="warning" sx={{ width: '100%', maxWidth: 'md', mx: 'auto' }}>No profile data available.</Alert>
      ): (
        // --- Profile Content within a single Paper/Card ---
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 0, // Padding handled by inner Boxes
            width: '100%',
            bgcolor: 'var(--color-bg-card)', // Use CSS Variable for background
            borderColor: 'divider', // Keep using theme divider
            borderRadius: theme.shape.borderRadius * 2,
            overflow: 'hidden',
          }}
        >
           {/* --- Profile Header Section --- */}
           <Box sx={{ display: 'flex', alignItems: 'center', p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
               <Avatar
                   sx={{
                       bgcolor: theme.palette.primary.main, // Keep theme color for avatar
                       width: { xs: 48, sm: 64 },
                       height: { xs: 48, sm: 64 },
                       mr: { xs: 2, sm: 3 },
                       fontSize: { xs: '1.2rem', sm: '1.5rem' },
                       color: theme.palette.getContrastText(theme.palette.primary.main) // Keep theme color
                   }}
                   src={basicInfo.profileImageUrl || undefined}
                   alt={`${basicInfo.fullName || 'User'}'s Avatar`}
               >
                  {!basicInfo.profileImageUrl ? userInitials() : null}
               </Avatar>
               <Box sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                        {/* Apply explicit text color */}
                        <Typography variant="h6" component="h1" sx={{ fontWeight: 600, ...primaryTextSx }}>
                            {basicInfo.fullName || 'User Profile'}
                        </Typography>
                        <Tooltip title={basicInfo.emailVerified ? "Verified Account" : "Email Not Verified"} arrow>
                            <IconButton size="small" sx={{ p: 0.25, cursor: 'default' }} disableRipple>
                                {basicInfo.emailVerified
                                    ? <VerifiedUserIcon color="success" sx={{ fontSize: '1.1rem' }} /> // Keep theme color
                                    : <ErrorOutlineIcon color="warning" sx={{ fontSize: '1.1rem' }} /> // Keep theme color
                                }
                            </IconButton>
                        </Tooltip>
                    </Box>
                    {/* Apply explicit text color */}
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', ...secondaryTextSx }}>
                        {basicInfo.email || 'No email provided'}
                    </Typography>
               </Box>
               <Tooltip title="Edit Profile">
                    <IconButton component={RouterLink} to="/profile/edit" size="medium" aria-label="Edit profile" sx={{ ml: 1, color: 'action.active' }}> {/* Keep theme action color */}
                        <EditIcon />
                    </IconButton>
               </Tooltip>
           </Box>

          {/* --- Display User Information using List --- */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <List disablePadding>
                 {/* Full Name */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon> {/* Keep theme action color */}
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.fullName)}
                        secondary="Full Name"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }} // Use explicit color
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }} // Use explicit color
                    />
                 </ListItem>
                 {/* Student ID */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><BadgeIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.studentId)}
                        secondary="Student ID"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                 </ListItem>
                 {/* Session */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.session)}
                        secondary="Session"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                 </ListItem>

                 <Divider sx={{ my: 1.5 }} /> {/* Keep theme divider */}

                 {/* Email Address */}
                  <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><EmailIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.email)}
                        secondary="Email Address"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: { ...primaryTextSx, overflowWrap: 'break-word' } }} // Apply sx here
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                  </ListItem>
                 {/* Member Since */}
                 {basicInfo.createdAt && (
                     <ListItem disablePadding sx={{ py: 1.5 }}>
                        <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><CalendarMonthIcon fontSize="small"/></ListItemIcon>
                        <ListItemText
                            primary={formatDisplayValue(basicInfo.createdAt, true)}
                            secondary="Member Since"
                            primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                            secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                        />
                     </ListItem>
                 )}
              </List>
          </Box>

        </Paper>
      )}

      {/* Snackbar (Keep as is) */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
       <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled"> {snackbar.message} </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;