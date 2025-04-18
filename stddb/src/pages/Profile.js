 /* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, Timestamp } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
// Container might be handled by a parent layout, consider removing if parent provides padding
// import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Avatar from '@mui/material/Avatar';
import Snackbar from '@mui/material/Snackbar';
import Tooltip from '@mui/material/Tooltip';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem'; // Use ListItem as these are not buttons
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Grid from '@mui/material/Grid'; // Added for consistency if needed, but maybe not for single card

// MUI Icons
// Keep existing icons: PersonIcon, BadgeIcon, SchoolIcon, EmailIcon, CalendarMonthIcon
import EditIcon from '@mui/icons-material/EditOutlined'; // Use Outlined version for consistency if preferred
import VerifiedUserIcon from '@mui/icons-material/VerifiedUserOutlined'; // Use Outlined version
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import BadgeIcon from '@mui/icons-material/BadgeOutlined'; // Use Outlined version
import SchoolIcon from '@mui/icons-material/SchoolOutlined'; // Use Outlined version
import EmailIcon from '@mui/icons-material/EmailOutlined'; // Use Outlined version
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined'; // Use Outlined version

/**
 * Helper to format optional values or display placeholder text.
 * (No changes needed here)
 */
const formatDisplayValue = (value, isDate = false) => {
    if (value === undefined || value === null || value === '') {
      return <Typography variant="body1" color="text.secondary" component="span" sx={{ fontStyle: 'italic' }}>Not Set</Typography>;
    }
    if (isDate && value instanceof Timestamp) {
      try {
           return value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
       } catch (e) {
           console.error("Error converting timestamp:", e);
           return <Typography variant="body1" color="error" component="span">Invalid Date</Typography>;
       }
    }
    // Return directly for non-empty, non-date values to use ListItemText styling
    return value;
};

/**
 * Helper for Avatar Initials
 * (No changes needed here)
 */
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '?';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '?';
};

/**
 * Profile Page Component - Redesigned
 */
const Profile = () => {
  const theme = useTheme(); // Keep theme for Avatar color potentially
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- Fetching Logic (Keep as is, minor adjustments if needed based on context) ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserInfo = async () => {
      // ... (existing fetch logic remains largely the same)
      if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); } return; }
      if (contextUserData?.basicInfo && loading) {
          const profileData = {
              ...contextUserData.basicInfo,
              emailVerified: currentUser?.emailVerified,
              createdAt: contextUserData.metadata?.createdAt || contextUserData.basicInfo?.createdAt,
          };
          setBasicInfo(profileData);
          if (isMounted) setLoading(false);
          return;
      }
      if (loading) {
          setLoading(true); // Ensure loading is true
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
                  setBasicInfo({ // Provide minimal info even if profile doc missing
                       email: currentUser?.email,
                       emailVerified: currentUser?.emailVerified,
                       fullName: 'User', // Placeholder
                  });
                }
                setLoading(false);
              }
          } catch (err) {
             console.error("Error fetching user info:", err);
             if (isMounted) { setError('Failed to load user data.'); setLoading(false); }
          }
      } else if (!currentUser) {
          if (isMounted) { setError("Not logged in."); setBasicInfo(null); setLoading(false); }
      } else if (basicInfo && basicInfo.emailVerified !== currentUser?.emailVerified) {
          if (isMounted) setBasicInfo(prev => ({...prev, emailVerified: currentUser.emailVerified}));
      }
    };

    fetchUserInfo();

    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading]); // Removed navigate from deps unless used in fetch

  // --- Snackbar Handler (Keep as is) ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Avatar Initials (Keep as is) ---
  const userInitials = useCallback(() => getInitials(basicInfo?.fullName), [basicInfo?.fullName]);

  // --- Define Consistent List Item Styles (from Home.js) ---
  const listItemSx = { py: 1.25, px: 2 }; // Padding inside the item
  const listIconSx = { minWidth: 40, /* Adjusted from 36 for slightly more space */ color: 'var(--color-icon)' };
  const listTextPrimarySx = { fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' };
  const listTextSecondarySx = { fontSize: '0.75rem', color: 'var(--color-text-secondary)', mt: 0.25 };
  // No chevron needed for profile display items

  return (
    // Use Box instead of Container if parent layout handles max-width and padding
    <Box sx={{ width: '100%' /* Optional: Add padding here if needed e.g., p: { xs: 2, md: 3 } */ }}>

      {/* --- PAGE TITLE --- */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 500,
          mb: { xs: 2, sm: 3 }, // Match Home.js margin bottom
          fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.125rem' }, // Match Home.js font size
          color: 'var(--color-text-primary)' // Use variable
        }}
      >
        User Profile
      </Typography>

      {/* --- CONDITIONAL CONTENT AREA --- */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 5, gap: 2 }}>
           <CircularProgress />
           <Typography variant="body2" color="text.secondary">Loading profile...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert> // Margin added for spacing
      ) : !basicInfo ? (
        <Alert severity="warning" sx={{ m: 2 }}>No profile data available.</Alert> // Margin added
      ) : (
        // --- Profile Content Card (Mimicking DashboardCard) ---
        <Paper
          elevation={0}
          sx={{
            bgcolor: 'var(--color-surface)',
            borderRadius: 'var(--border-radius-large)', // Use variable
            border: `1px solid var(--color-border)`,    // Use variable
            overflow: 'hidden', // Keep overflow hidden
            // No height: '100%' needed as it's the main content block
            // No margin needed if Grid/Box parent handles spacing
          }}
        >
           {/* --- Profile Header Section --- */}
           {/* Use consistent padding like DashboardCard header */}
           <Box sx={{ display: 'flex', alignItems: 'center', p: 2, borderBottom: `1px solid var(--color-border)` }}>
               <Avatar
                   sx={{
                       bgcolor: theme.palette.primary.main, // Or use a specific var(--color-...) if defined
                       width: { xs: 48, sm: 56 }, // Slightly adjusted size example
                       height: { xs: 48, sm: 56 },
                       mr: 2,
                       fontSize: { xs: '1.1rem', sm: '1.3rem' },
                       color: theme.palette.getContrastText(theme.palette.primary.main)
                   }}
                   src={basicInfo.profileImageUrl || undefined}
                   alt={`${basicInfo.fullName || 'User'}'s Avatar`}
               >
                  {!basicInfo.profileImageUrl ? userInitials() : null}
               </Avatar>
               <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                    {/* Combine Name and Verification Icon */}
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.25, flexWrap: 'wrap', gap: 0.5 }}>
                        <Typography variant="h6" component="h2" noWrap sx={{ fontWeight: 600, color: 'var(--color-text-primary)', lineHeight: 1.3 }}>
                            {basicInfo.fullName || 'User Profile'}
                        </Typography>
                        <Tooltip title={basicInfo.emailVerified ? "Verified Account" : "Email Not Verified"} arrow>
                           {/* Wrap IconButton in span for Tooltip when disabled */}
                           <span>
                              <IconButton size="small" sx={{ p: 0.25, color: basicInfo.emailVerified ? 'var(--color-success, green)' : 'var(--color-warning, orange)' }} disableRipple>
                                  {basicInfo.emailVerified
                                      ? <VerifiedUserIcon sx={{ fontSize: '1.1rem' }} />
                                      : <ErrorOutlineIcon sx={{ fontSize: '1.1rem' }} />
                                  }
                              </IconButton>
                           </span>
                        </Tooltip>
                    </Box>
                    <Typography variant="body2" noWrap sx={{ color: 'var(--color-text-secondary)', wordBreak: 'break-all' }}>
                        {basicInfo.email || 'No email provided'}
                    </Typography>
               </Box>
               {/* Edit Button - Styled like Home.js card actions */}
               <Tooltip title="Edit Profile">
                    <IconButton component={RouterLink} to="/profile/edit" size="medium" aria-label="Edit profile" sx={{ ml: 1, color: 'var(--color-icon)', '&:hover': { bgcolor: 'action.hover' } }}>
                        <EditIcon fontSize='small' />
                    </IconButton>
               </Tooltip>
           </Box>

          {/* --- Display User Information using List --- */}
          {/* No extra Box needed, List goes directly inside Paper */}
          <List disablePadding>
              {/* Use consistent styles for ListItems */}
               <ListItem sx={listItemSx}>
                  <ListItemIcon sx={listIconSx}><BadgeIcon fontSize="small"/></ListItemIcon>
                  <ListItemText
                      primary={formatDisplayValue(basicInfo.fullName)}
                      secondary="Full Name"
                      primaryTypographyProps={{ sx: listTextPrimarySx }}
                      secondaryTypographyProps={{ sx: listTextSecondarySx }}
                  />
               </ListItem>
               <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} /> {/* Divider between items */}

               <ListItem sx={listItemSx}>
                  <ListItemIcon sx={listIconSx}><SchoolIcon fontSize="small"/></ListItemIcon>
                  <ListItemText
                      primary={formatDisplayValue(basicInfo.studentId)}
                      secondary="Student ID"
                      primaryTypographyProps={{ sx: listTextPrimarySx }}
                      secondaryTypographyProps={{ sx: listTextSecondarySx }}
                  />
               </ListItem>
               <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} />

               <ListItem sx={listItemSx}>
                  <ListItemIcon sx={listIconSx}><SchoolIcon fontSize="small"/></ListItemIcon>
                  <ListItemText
                      primary={formatDisplayValue(basicInfo.session)}
                      secondary="Session"
                      primaryTypographyProps={{ sx: listTextPrimarySx }}
                      secondaryTypographyProps={{ sx: listTextSecondarySx }}
                  />
               </ListItem>
               <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} />

                <ListItem sx={listItemSx}>
                  <ListItemIcon sx={listIconSx}><EmailIcon fontSize="small"/></ListItemIcon>
                  <ListItemText
                      primary={formatDisplayValue(basicInfo.email)}
                      secondary="Email Address"
                      primaryTypographyProps={{ sx: { ...listTextPrimarySx, overflowWrap: 'break-word' } }} // Allow wrapping
                      secondaryTypographyProps={{ sx: listTextSecondarySx }}
                  />
                </ListItem>
                <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} />

               {/* Conditional Rendering for Member Since */}
               {basicInfo.createdAt && (
                   <>
                     <ListItem sx={listItemSx}>
                        <ListItemIcon sx={listIconSx}><CalendarMonthIcon fontSize="small"/></ListItemIcon>
                        <ListItemText
                            primary={formatDisplayValue(basicInfo.createdAt, true)}
                            secondary="Member Since"
                            primaryTypographyProps={{ sx: listTextPrimarySx }}
                            secondaryTypographyProps={{ sx: listTextSecondarySx }}
                        />
                     </ListItem>
                     {/* Optional: Add a final divider if more items could follow */}
                     {/* <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} /> */}
                   </>
               )}
            </List>
        </Paper>
      )}

      {/* --- SNACKBAR (Keep as is) --- */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
       <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled" elevation={6}> {snackbar.message} </Alert>
      </Snackbar>
    </Box> // End of main Box wrapper
  );
};

export default Profile;