// src/pages/Home.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Assuming db is exported correctly from firebase.js
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
import CssBaseline from '@mui/material/CssBaseline';
import { ThemeProvider, createTheme } from '@mui/material/styles';

// MUI Icons (If needed for content, otherwise remove)
// Removed: AccountCircle, LogoutIcon, PersonOutlineIcon

const defaultTheme = createTheme(); // Use your app's theme if available

const Home = () => {
  // Auth context and navigation
  const { currentUser, userData: contextUserData } = useAuth(); // Get userData from context
  const navigate = useNavigate();

  // State for user data and loading/error handling
  const [basicInfo, setBasicInfo] = useState(contextUserData?.basicInfo || null);
  const [loading, setLoading] = useState(!contextUserData); // Only load if context didn't provide data initially
  const [error, setError] = useState(''); // For data loading errors
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'error' }); // Keep snackbar for other potential messages

  // --- Snackbar Handler ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect ---
  useEffect(() => {
    // Use context data if available and loading state is appropriate
    if (contextUserData && !loading) {
        if(contextUserData.basicInfo) {
            setBasicInfo(contextUserData.basicInfo);
        } else {
             console.warn("User data from context missing basicInfo structure.");
             setError("User data structure invalid.");
             setBasicInfo({ email: currentUser?.email }); // Fallback using auth email
        }
        setLoading(false); // Ensure loading is false if context data was used
        return; // Exit effect
    }

    // If loading was true (context didn't provide data), proceed to fetch
    if (loading && currentUser) {
        const fetchUserInfo = async () => {
            setError('');
            const userDocRef = doc(db, 'users', currentUser.uid);
            try {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists() && docSnap.data().basicInfo) {
                    setBasicInfo(docSnap.data().basicInfo);
                } else {
                    console.error("basicInfo structure not found in Firestore for user:", currentUser.uid);
                    setError('Essential user data could not be loaded.');
                    setBasicInfo({ email: currentUser.email }); // Fallback
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError('Failed to load user data due to an error.');
                setBasicInfo({ email: currentUser.email }); // Fallback
            } finally {
                setLoading(false);
            }
        };
        fetchUserInfo();
    } else if (!currentUser) {
        // Handle case where component mounts without a user (should be handled by ProtectedRoute, but good practice)
        setLoading(false);
        // Optional: navigate('/login'); - ProtectedRoute should handle this already
    }
  }, [currentUser, contextUserData, loading, navigate]); // Dependencies

  // --- Display Name ---
  // Prioritize fetched/context basicInfo, fallback to auth email
  const displayName = basicInfo?.fullName || basicInfo?.email || currentUser?.email || 'User';

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Use Box for full height and flex column layout if needed, e.g., for a footer later */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)' /* Adjust 64px based on your actual Header height */ }}>
        <CssBaseline />

        {/* --- Main Content Area --- */}
        <Container
          component="main"
          maxWidth="md" // Adjust max width as needed
          sx={{
            flexGrow: 1,      // Allow content area to grow and push footer down (if any)
            py: { xs: 3, sm: 4 }, // Responsive vertical padding
            display: 'flex',     // Use flex to center content easily
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center', // Center content vertically and horizontally
          }}
        >
          {loading ? (
            <CircularProgress />
          ) : error ? (
            <Alert severity="error" sx={{ width: '100%', maxWidth: 'sm', textAlign: 'center' }}>{error}</Alert>
          ) : (
            // --- Logged-in Content ---
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h4" component="h1" gutterBottom>
                Welcome, {displayName}!
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                This is your personalized dashboard content area.
                {/* Add more relevant home page content here */}
              </Typography>
              {/* Example link (Profile link is likely in the main Header now) */}
              {/* You might add other specific actions/links relevant to the Home page */}
               <Button component={RouterLink} to="/some-feature" variant="contained" >
                   Go to Feature X
               </Button>
            </Box>
          )}
        </Container>

        {/* --- Snackbar for Notifications --- */}
        {/* Still useful for potential future notifications on this page */}
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

         {/* Optional: Add a Footer specific to this page or rely on a global one */}
         {/* <Box component="footer" sx={{ py: 2, textAlign: 'center', bgcolor: 'grey.200' }}>Footer Content</Box> */}
      </Box>
    </ThemeProvider>
  );
};

export default Home;