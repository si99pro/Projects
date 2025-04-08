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
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';
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

  // Auth state listener (no changes needed)
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

  // Error message helper (Adjusted messages slightly)
  const getFirebaseAuthErrorMessage = (errorCode) => {
      switch (errorCode) {
        case 'auth/user-not-found': // Now less likely if we find by student ID first
        case 'auth/wrong-password':
        case 'auth/invalid-credential': // Most common error now for bad identifier/pass combo
          return 'Invalid credentials. Please check your Email/Student ID and password.';
        case 'auth/invalid-email': // Will only trigger if user explicitly enters badly formatted email
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


  // Resend verification email handler (no changes needed)
  const handleResendVerification = async () => {
    setError('');
    setResendStatus('Sending...');
    setLoading(true);

    const userToVerify = auth.currentUser; // This still relies on the *last* user context

    if (userToVerify) {
      try {
        await sendEmailVerification(userToVerify);
        setResendStatus('Verification email resent. Check your inbox/spam folder.');
        setError(''); // Clear the verification error
      } catch (err) {
        console.error("Resend Error:", err);
        let resendError = `Error resending: ${err.message}`;
        if (err.code === 'auth/too-many-requests') {
            resendError = 'Too many requests to send verification email. Please try again later.'
        }
        setResendStatus(resendError);
      } finally {
         setLoading(false);
      }
    } else {
      // We might not have user context if login failed before verification check
      console.warn("Resend Error: No user context found. Could not automatically resend.");
      // Provide guidance if email needs verification but user context is lost
      setResendStatus('Could not automatically resend. Please try logging in again to trigger the prompt if needed, or contact support.');
       setError(''); // Clear the main error perhaps? Or leave it? Let's clear resend status instead.
      // setResendStatus(''); // Clear resend status to avoid confusion
      // setError('Login first to resend verification email.'); // More direct error
      setLoading(false);
    }
  };


  // Handle form submission (Major changes here)
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

    if (!identifier || !finalPassword) {
        setError('Please enter both your Email/Student ID and password.');
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
            // Query where basicInfo.studentId matches the identifier
            const q = query(usersRef, where('basicInfo.studentId', '==', identifier));

            const querySnapshot = await getDocs(q);

            if (querySnapshot.empty) {
                console.log("No user found with Student ID:", identifier);
                setError('Invalid credentials. Please check your Email/Student ID and password.'); // Generic error
                setLoading(false);
                return;
            } else if (querySnapshot.size > 1) {
                // Should not happen with unique student IDs, but handle defensively
                console.error("Multiple users found with the same Student ID:", identifier);
                setError('An error occurred. Multiple accounts found for this ID.');
                setLoading(false);
                return;
            } else {
                // Found exactly one user
                const userDoc = querySnapshot.docs[0];
                const userData = userDoc.data();
                if (userData.basicInfo && userData.basicInfo.email) {
                    emailToSignIn = userData.basicInfo.email; // Get the actual email associated with the student ID
                    console.log("Found user via Student ID, using email:", emailToSignIn);
                } else {
                    console.error("User document found but missing email for Student ID:", identifier, userDoc.id);
                    setError('An error occurred. User data is incomplete.');
                    setLoading(false);
                    return;
                }
            }
        } else {
             console.log("Identifier looks like an email:", identifier);
             // It's an email, use it directly (emailToSignIn already holds the identifier)
        }

        // Now attempt sign-in using the determined email and the provided password
        console.log(`Attempting sign in with email: ${emailToSignIn}`);
        const userCredential = await signInWithEmailAndPassword(auth, emailToSignIn, finalPassword);
        const user = userCredential.user;

        // Check email verification AFTER successful login attempt
        if (!user.emailVerified) {
            console.warn("Login attempt successful but email not verified.", user.email);
            setError(
            'Please verify your email before logging in. Check your inbox/spam folder.' // Keep verification error specific
            );
            // Keep user context in auth.currentUser for potential resend
            setLoading(false);
            return;
        }

        // Login successful and verified
        console.log("Login successful and verified, navigating...");
        setLoading(false);
        navigate('/dashboard');

    } catch (err) {
        console.error("Login Error:", err);
        // Use the helper function for Firebase auth errors
        const friendlyError = getFirebaseAuthErrorMessage(err.code);
        // If the error was specifically "user-not-found" and we tried via Student ID,
        // the generic 'Invalid credentials' is fine. If we tried via email, it's also fine.
        setError(friendlyError);
        setLoading(false);
    }
  };

  // Determine if the resend link should be shown (Logic remains the same)
  const showResendLink = error && error.startsWith('Please verify your email');


  // --- RENDER LOGIC ---

  // 1. Initial Loading State (No change)
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

  // 2. Already Logged In State (No change)
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

  // 3. Login Form (Update identifier field)
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <Box sx={{ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }} >
         <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}> <LockOutlinedIcon /> </Avatar>
         <Typography component="h1" variant="h5" gutterBottom> Login </Typography>

         <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 3 }} >
             <Stack spacing={2}>
                 {/* Error Alert Area - Modified for inline link (No change here) */}
                 {error && (
                   <Alert severity="error" sx={{ width: '100%' }} >
                      {error}
                      {showResendLink && (
                          <>
                              {' '}
                              <Link
                                component="button"
                                onClick={handleResendVerification}
                                disabled={loading || resendStatus === 'Sending...'}
                                sx={{
                                    fontWeight: 'normal',
                                    color: 'inherit',
                                    cursor: 'pointer',
                                    verticalAlign: 'baseline',
                                    fontSize: 'inherit',
                                    textDecoration: 'underline',
                                    '&.Mui-disabled': {
                                        opacity: 0.6,
                                        textDecoration: 'none'
                                    },
                                }}
                              >
                                Resend Email
                              </Link>
                          </>
                      )}
                   </Alert>
                 )}

                 {/* Resend Status Alert Area (No change here) */}
                 {resendStatus && !error && (
                   <Alert severity={resendStatus.startsWith('Error:') || resendStatus.startsWith('Could not') ? "warning" : "info"} sx={{ width: '100%' }} >
                     {resendStatus}
                   </Alert>
                 )}

                 {/* Form Fields - Updated Email field */}
                 <TextField
                    id="loginIdentifier" // Changed ID
                    label="Email or Student ID" // Changed Label
                    name="loginIdentifier" // Changed Name
                    // type="email" // REMOVED type="email"
                    value={loginIdentifier} // Use new state variable
                    onChange={(e) => setLoginIdentifier(e.target.value)} // Use new setter
                    disabled={loading}
                    required
                    fullWidth
                    autoFocus
                    autoComplete="username" // Changed autocomplete suggestion
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
                 />

                 {/* Submit Button (No change) */}
                 <Button type="submit" fullWidth variant="contained" disabled={loading} sx={{ mt: 2, mb: 1 }} >
                    {loading ? <CircularProgress size={24} color="inherit" /> : 'Login'}
                 </Button>

                 {/* Links (No change) */}
                 <Grid container justifyContent="space-between">
                     <Grid item> <Link href="#" variant="body2"> Forgot password? </Link> </Grid>
                     <Grid item> <Link component={RouterLink} to="/signup" variant="body2" disabled={loading}> {"Don't have an account? Sign Up"} </Link> </Grid>
                 </Grid>
             </Stack> {/* End of Stack */}
         </Box> {/* End of Form Box */}
      </Box> {/* End of Main Centering Box */}
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}

export default Login;