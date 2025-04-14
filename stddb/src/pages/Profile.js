 /* eslint-disable no-unused-vars */
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
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BadgeIcon from '@mui/icons-material/Badge';
import SchoolIcon from '@mui/icons-material/School';
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
            const profileData = {
                ...fetchedData.basicInfo,
                email: fetchedData.basicInfo?.email || currentUser?.email,
                emailVerified: currentUser?.emailVerified,
                createdAt: fetchedData.metadata?.createdAt || fetchedData.basicInfo?.createdAt,
            };
            setBasicInfo(profileData);
          } else {
            console.log("No such user document!");
            setError('User profile not found. Please complete setup.');
            setBasicInfo({
                 email: currentUser?.email,
                 emailVerified: currentUser?.emailVerified,
            });
          }
          setLoading(false);
        }
      } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load user data.'); setLoading(false); } }
    };

    if (contextUserData?.basicInfo && loading) {
        const profileData = {
            ...contextUserData.basicInfo,
            emailVerified: currentUser?.emailVerified,
            createdAt: contextUserData.metadata?.createdAt || contextUserData.basicInfo?.createdAt,
        };
        setBasicInfo(profileData);
        if (isMounted) setLoading(false);
    }
    else if (!currentUser && loading) {
        if (isMounted) { setLoading(false); setError("Please log in to view your profile."); }
    }
    else if (currentUser && loading) {
        fetchUserInfo();
    }
    else if (!currentUser && !loading) {
        if (isMounted) { setError("Not logged in."); setBasicInfo(null); }
    }
    else if (currentUser && basicInfo && basicInfo.emailVerified !== currentUser.emailVerified) {
       if (isMounted) setBasicInfo(prev => ({...prev, emailVerified: currentUser.emailVerified}));
    }

    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading, navigate]);

  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)' };

  return (
    <Container
      component="main"
      maxWidth="lg"
      disableGutters={true} // Container provides no gutters/padding
      sx={{
          flexGrow: 1,
          // Container has no explicit padding or margin
      }}
    >
      {/* --- PAGE TITLE --- */}
      {/* ADDED: margin-bottom (mb) to create space below the title */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 500,
          ...primaryTextSx,
          // No padding here
          mb: 2, // Add margin-bottom (adjust value 2, 3, etc. as needed)
        }}
      >
        User Profile
      </Typography>

      {/* --- CONDITIONAL CONTENT AREA --- */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: 'calc(50vh - 64px)' }}>
            <CircularProgress size={50} />
        </Box>
      ) : error ? (
        // Using width: '100%' might make Alert touch edges, consider adding mx if needed back
        <Alert severity="error" sx={{ width: '100%', borderRadius: 'var(--border-radius, 6px)' }}>{error}</Alert>
      ) : !basicInfo ? (
        // Using width: '100%' might make Alert touch edges, consider adding mx if needed back
        <Alert severity="warning" sx={{ width: '100%', borderRadius: 'var(--border-radius, 6px)' }}>No profile data available. Please log in or complete setup.</Alert>
      ): (
        // --- Profile Content within a single Paper/Card ---
        // RE-ADDED: borderRadius using CSS variable
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 0, // Inner content padding handled below
            width: '100%', // Takes full width of container
            bgcolor: 'var(--color-bg-card)',
            borderColor: 'divider',
            borderRadius: 'var(--border-radius, 6px)', // Restore border radius
            overflow: 'hidden',
            // No margin here
          }}
        >
           {/* --- Profile Header Section --- */}
           {/* Padding inside Paper remains */}
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
                   alt={`${basicInfo.fullName || 'User'}'s Avatar`}
               >
                  {!basicInfo.profileImageUrl ? userInitials() : null}
               </Avatar>
               <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="h6" component="h2" sx={{ fontWeight: 600, ...primaryTextSx }}>
                            {basicInfo.fullName || 'User Profile'}
                        </Typography>
                        <Tooltip title={basicInfo.emailVerified ? "Verified Account" : "Email Not Verified"} arrow>
                            <span>
                              <IconButton size="small" sx={{ p: 0.25, cursor: 'default' }} disableRipple disabled={loading}>
                                  {basicInfo.emailVerified
                                      ? <VerifiedUserIcon color="success" sx={{ fontSize: '1.1rem' }} />
                                      : <ErrorOutlineIcon color="warning" sx={{ fontSize: '1.1rem' }} />
                                  }
                              </IconButton>
                            </span>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" sx={{ wordBreak: 'break-all', ...secondaryTextSx }}>
                        {basicInfo.email || 'No email provided'}
                    </Typography>
               </Box>
               <Tooltip title="Edit Profile">
                    <span>
                      <IconButton component={RouterLink} to="/profile/edit" size="medium" aria-label="Edit profile" sx={{ ml: 1, color: 'action.active' }} disabled={loading}>
                          <EditIcon />
                      </IconButton>
                    </span>
               </Tooltip>
           </Box>

          {/* --- Display User Information using List --- */}
          {/* Padding inside Paper remains */}
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <List disablePadding>
                 {/* ListItems remain unchanged */}
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.fullName)}
                        secondary="Full Name"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                 </ListItem>
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><BadgeIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.studentId)}
                        secondary="Student ID"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                 </ListItem>
                 <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><SchoolIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.session)}
                        secondary="Session"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: primaryTextSx }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                 </ListItem>

                 <Divider sx={{ my: 1.5, borderColor: 'divider' }} />

                  <ListItem disablePadding sx={{ py: 1.5 }}>
                    <ListItemIcon sx={{ minWidth: 40, color: 'action.active' }}><EmailIcon fontSize="small"/></ListItemIcon>
                    <ListItemText
                        primary={formatDisplayValue(basicInfo.email)}
                        secondary="Email Address"
                        primaryTypographyProps={{ variant: 'body1', fontWeight: 500, sx: { ...primaryTextSx, overflowWrap: 'break-word' } }}
                        secondaryTypographyProps={{ variant: 'body2', sx: secondaryTextSx }}
                    />
                  </ListItem>
                 {basicInfo.createdAt && basicInfo.createdAt instanceof Timestamp && (
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

      {/* --- SNACKBAR --- */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
       <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled"> {snackbar.message} </Alert>
      </Snackbar>
    </Container>
  );
};

export default Profile;