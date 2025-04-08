/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
// Firestore imports needed for student ID lookup
import { auth, db } from '../firebase'; // Assuming firebase.js exports db
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
// Firestore query functions
import { collection, query, where, getDocs, getFirestore, limit } from 'firebase/firestore'; // limit is imported
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Use RouterLink for navigation

// Material UI Components
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
  Stack,
  CircularProgress,
  Link,
  Avatar,
  CssBaseline,
  Grid,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// **** ADDED CONSTANT ****
const MIN_PASSWORD_LENGTH = 6;

// Copyright component
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#"> {/* You might want to update this href */}
        Stddb
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


function Login() {
  // State: Changed 'email' to 'loginIdentifier'
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    isLoggedIn: false,
  });
  const navigate = useNavigate();

  // --- LOGIC ---

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.emailVerified) {
        setAuthStatus({ loading: false, isLoggedIn: true });
      } else {
        setAuthStatus({ loading: false, isLoggedIn: false });
      }
    });
    return () => unsubscribe();
  }, []);

  // Error message helper
  const getFirebaseAuthErrorMessage = (errorCode) => {
      switch (errorCode) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          return 'Invalid credentials. Please check your Email/Student ID and password.';
        case 'auth/invalid-email':
            return 'Invalid email address format entered.';
        case 'auth/user-disabled':
          return 'This user account has been disabled.';
        case 'auth/too-many-requests':
          return 'Too many login attempts. Please try again later.';
        case 'auth/network-request-failed':
            return 'Network error. Please check your connection.';
        default:
          return 'Login failed. Please try again.';
      }
  };


  // Resend verification email handler
  const handleResendVerification = async () => {
    setError('');
    setResendStatus('Sending...');
    setLoading(true); // Use the main loading state to disable the button during resend too

    const userToVerify = auth.currentUser;

    if (userToVerify) {
      try {
        await sendEmailVerification(userToVerify);
        setResendStatus('Verification email resent. Check your inbox/spam folder.');
        setError('');
      } catch (err) {
        console.error("Resend Error:", err);
        let resendError = `Error resending: ${err.message}`;
        if (err.code === 'auth/too-many-requests') {
            resendError = 'Too many requests to send verification email. Please try again later.'
        }
        setResendStatus(resendError);
      } finally {
         // Don't set loading false here if the main error still requires action
         // Let the user re-attempt login or handle the main error state
         // Only set loading false if resend was the *only* action intended
         if(!error.startsWith('Please verify your email')) {
            setLoading(false);
         }
      }
    } else {
      console.warn("Resend Error: No user context found. Could not automatically resend.");
      setResendStatus('Could not automatically resend. Please try logging in again.');
      setError(''); // Clear main error if resend is attempted
      setLoading(false); // Resend failed, re-enable button
    }
  };


  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendStatus('');
    setLoading(true);

    if (authStatus.isLoggedIn) {
        setLoading(false);
        navigate('/dashboard');
        return;
    }

    // Trim input
    const identifier = loginIdentifier.trim();
    const finalPassword = password; // No trim needed usually

    // **Client-side validation (matches button disabled state)**
    if (!identifier || finalPassword.length < MIN_PASSWORD_LENGTH) {
        // Set a more specific error if needed, or just prevent submission
        // This check is mostly redundant because the button *should* be disabled,
        // but it's a good safeguard against programmatic form submission or race conditions.
        console.warn("Submit called with invalid input (should have been disabled).");
        // Optionally set an error, though usually not needed if button logic is correct.
        // setError('Please ensure all fields are filled correctly.');
        setLoading(false);
        return;
    }

    let emailToSignIn = identifier; // Assume it's an email initially

    try {
        // Check if the identifier looks like an email
        const isEmail = /\S+@\S+\.\S+/.test(identifier);

        if (!isEmail) {
            // If not an email, assume it's a Student ID and query Firestore
            console.log("Identifier is not an email, querying Firestore for Student ID:", identifier);
            const usersRef = collection(db, 'users');
            const q = query(usersRef, where('basicInfo.studentId', '==', identifier), limit(1));

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("No user found with Student ID:", identifier);
                setError(getFirebaseAuthErrorMessage('auth/invalid-credential')); // Use consistent error
                setLoading(false);
                return;
            } else {
                // Found exactly one user (due to limit(1))
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                if (userData?.basicInfo?.email) { // Optional chaining for safety
                    emailToSignIn = userData.basicInfo.email;
                    console.log("Found user via Student ID, using email:", emailToSignIn);
                } else {
                    console.error("User document found but missing email for Student ID:", identifier, userDoc.id);
                    setError('An error occurred retrieving user data.');
                    setLoading(false);
                    return;
                }
            }
        } else {
             console.log("Identifier looks like an email:", identifier);
        }

        // Now attempt sign-in using the determined email and the provided password
        console.log(`Attempting sign in with email: ${emailToSignIn}`);
        const userCredential = await signInWithEmailAndPassword(auth, emailToSignIn, finalPassword);
        const user = userCredential.user;

        // Check email verification AFTER successful login attempt
        if (!user.emailVerified) {
            console.warn("Login attempt successful but email not verified.", user.email);
            setError('Please verify your email before logging in. Check your inbox/spam folder.');
            setLoading(false);
            return;
        }

        // Login successful and verified
        console.log("Login successful and verified, navigating...");
        setLoading(false);
        navigate('/dashboard');

    } catch (err) {
        console.error("Login Error:", err);
        const friendlyError = getFirebaseAuthErrorMessage(err.code);
        setError(friendlyError);
        setLoading(false);
    }
  };

  // Determine if the resend link should be shown
  const showResendLink = error && error.startsWith('Please verify your email');


  // --- RENDER LOGIC ---

  // 1. Initial Loading State
  if (authStatus.loading) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // 2. Already Logged In State
  if (authStatus.isLoggedIn) {
    return (
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
            sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}
        >
           <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
             <CheckCircleOutlineIcon />
           </Avatar>
           <Typography component="h1" variant="h5" gutterBottom> Already Logged In </Typography>
           <Typography variant="body1" sx={{ mb: 3, textAlign: 'center' }}> You are already logged in. </Typography>
           <Button variant="contained" fullWidth onClick={() => navigate('/dashboard')} sx={{ mt: 2, mb: 1 }}> Go to Dashboard </Button>
        </Box>
        <Copyright sx={{ mt: 8, mb: 4 }} />
      </Container>
    );
  }

  // 3. Login Form
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
         <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <LockOutlinedIcon /> </Avatar>
         <Typography component="h1" variant="h5" gutterBottom> Login </Typography>

         <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 3 }} >
             <Stack spacing={2}>
                 {/* Error Alert Area - Modified for inline link */}
                 {error && (
                   <Alert severity="error" sx={{ width: '100%' }} >
                      {error}
                      {showResendLink && (
                          <>
                              {' '}
                              <Link
                                component="button" // Render as button for better semantics/accessibility
                                type="button"      // Explicitly set type to prevent form submission
                                onClick={handleResendVerification}
                                disabled={loading} // Disable if main form is loading (e.g., during resend)
                                sx={{
                                    fontWeight: 'normal',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    verticalAlign: 'baseline',
                                    fontSize: 'inherit',
                                    textDecoration: 'underline',
                                    border: 'none',      // Remove button default border
                                    background: 'none', // Remove button default background
                                    padding: 0,         // Remove button default padding
                                    '&:hover': {
                                        textDecoration: 'underline', // Ensure underline on hover
                                    },
                                    '&.Mui-disabled': {
                                        opacity: 0.6,
                                        textDecoration: 'none',
                                        cursor: 'default',
                                    },
                                }}
                              >
                                Resend Email
                              </Link>
                          </>
                      )}
                   </Alert>
                 )}

                 {/* Resend Status Alert Area */}
                 {resendStatus && !error && (
                   <Alert severity={resendStatus.startsWith('Error:') || resendStatus.startsWith('Could not') ? "warning" : "info"} sx={{ width: '100%' }} >
                     {resendStatus}
                   </Alert>
                 )}

                 {/* Form Fields */}
                 <TextField
                    id="loginIdentifier"
                    label="Email or Student ID"
                    name="loginIdentifier"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    disabled={loading}
                    required
                    fullWidth
                    autoFocus
                    autoComplete="username" // Common suggestion for username/email/ID
                    error={!!error && !showResendLink} // Show error highlight if there's an error *unless* it's the "verify email" error
                 />
                 <TextField
                    id="password"
                    label="Password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    required
                    fullWidth
                    autoComplete="current-password"
                    error={!!error && !showResendLink} // Show error highlight if there's an error *unless* it's the "verify email" error
                    // Optionally add helper text for password length requirement
                    // helperText={`Minimum ${MIN_PASSWORD_LENGTH} characters`}
                 />

                 {/* Submit Button -- UPDATED DISABLED LOGIC -- */}
                 <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    // Disable if loading OR if identifier is empty OR if password length is less than minimum
                    disabled={loading || !loginIdentifier.trim() || password.length < MIN_PASSWORD_LENGTH}
                    sx={{ mt: 2, mb: 1, height: 40 }} // Consistent height
                 >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                 </Button>

                 {/* Links */}
                 <Grid container justifyContent="space-between">
                     {/* Forgot password link - disable during loading */}
                     <Grid item>
                         <Link
                             href="#" // Implement forgot password later
                             variant="body2"
                             sx={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1 }}
                         >
                            Forgot password?
                         </Link>
                     </Grid>
                     {/* Sign up link - disable during loading */}
                     <Grid item>
                         <Link
                             component={RouterLink}
                             to="/signup"
                             variant="body2"
                             sx={{ pointerEvents: loading ? 'none' : 'auto', opacity: loading ? 0.5 : 1 }}
                         >
                            {"Don't have an account? Sign Up"}
                         </Link>
                     </Grid>
                 </Grid>
             </Stack> {/* End of Stack */}
         </Box> {/* End of Form Box */}
      </Box> {/* End of Main Centering Box */}
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}

export default Login;