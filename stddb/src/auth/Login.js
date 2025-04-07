/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase'; // Assuming firebase.js is configured correctly
import {
  signInWithEmailAndPassword,
  sendEmailVerification,
  onAuthStateChanged,
} from 'firebase/auth';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
  Paper,
  Stack,
  CircularProgress,
  Link,
  Avatar,
  Divider,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState('');
  const [authStatus, setAuthStatus] = useState({
    loading: true,
    isLoggedIn: false,
  });
  const navigate = useNavigate();

  // This listener handles scenario 2: Detecting users already logged in when they visit /login
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log("Auth state changed:", user); // Debug log
      if (user && user.emailVerified) {
        setAuthStatus({ loading: false, isLoggedIn: true });
      } else {
        setAuthStatus({ loading: false, isLoggedIn: false });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleResendVerification = async () => {
    // ... (Resend verification logic remains the same)
    setError('');
    setResendStatus('Sending...');
    if (auth.currentUser) {
      try {
        await sendEmailVerification(auth.currentUser);
        setResendStatus('Verification email resent. Check your inbox.');
      } catch (err) {
        console.error("Resend Error:", err);
        setResendStatus(`Error resending: ${err.message}`);
      }
    } else {
      setResendStatus('Error: No user context found to resend email.');
    }
  };

  // This function handles scenario 1: Logging in via the form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendStatus('');
    setLoading(true);

    // Optional double-check, though the form shouldn't be visible if logged in
    if (authStatus.isLoggedIn) {
        setLoading(false);
        navigate('/dashboard'); // Redirect if somehow submitted while logged in
        return;
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(
          'Please verify your email before logging in. Check your inbox/spam folder.'
        );
        setLoading(false);
        // Do NOT navigate - user needs to verify first.
        return;
      }

      // *** SUCCESS & VERIFIED ***
      // User successfully logged in via the form and IS verified.
      // Navigate them directly to the dashboard.
      console.log("Login successful and verified via form, navigating..."); // Debug log
      // Setting loading false isn't strictly necessary as navigation will unmount,
      // but it doesn't hurt.
      setLoading(false);
      navigate('/dashboard'); // <<< Direct navigation on successful login + verification

    } catch (err) {
      console.error("Login Error:", err);
      let friendlyError = 'Login failed. Please check your credentials.';
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        friendlyError = 'Invalid email or password.';
      } else if (err.code === 'auth/too-many-requests') {
        friendlyError = 'Too many login attempts. Please try again later.';
      } else if (err.code === 'auth/network-request-failed') {
          friendlyError = 'Network error. Please check your connection.';
      }
      setError(friendlyError);
      setLoading(false);
    }
  };

  const showResendButton = error && error.startsWith('Please verify your email');

  // --- Render Logic ---

  // 1. Show loading indicator while checking initial auth state
  if (authStatus.loading) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ /* ... loading styles ... */ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // 2. If initial check reveals user IS logged in, show the "Already Logged In" message
  if (authStatus.isLoggedIn) {
    return (
      <Container component="main" maxWidth="xs">
        <Box sx={{ /* ... centered box styles ... */ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
           <Paper elevation={3} sx={{ /* ... paper styles ... */ p: { xs: 3, sm: 4 }, mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
              <Avatar sx={{ m: 1, bgcolor: 'success.main' }}>
                <CheckCircleOutlineIcon />
              </Avatar>
              <Typography component="h1" variant="h5" gutterBottom>
                Already Logged In
              </Typography>
              <Typography variant="body1" sx={{ mb: 3 }}>
                You are already logged in.
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </Button>
           </Paper>
        </Box>
      </Container>
    );
  }

  // 3. If initial check reveals user IS NOT logged in, show the Login Form
  return (
    <Container component="main" maxWidth="xs">
      <Box sx={{ /* ... centered box styles ... */ marginTop: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5" gutterBottom>
            Login
          </Typography>

          <Paper elevation={3} sx={{ /* ... paper styles ... */ p: { xs: 2, sm: 4 }, mt: 3, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              <Stack spacing={2}>
                {/* Error Alert Area */}
                {error && (
                  <Alert
                    severity="error"
                    action={
                      showResendButton ? (
                        <Button
                          color="inherit"
                          size="small"
                          onClick={handleResendVerification}
                          disabled={resendStatus === 'Sending...'}
                        >
                          Resend Email
                        </Button>
                      ) : null
                    }
                  >
                    {error}
                  </Alert>
                )}
                {resendStatus && !error && (
                  <Alert severity={resendStatus.startsWith('Error:') ? "warning" : "info"}>
                    {resendStatus}
                  </Alert>
                )}

                {/* TextFields, Button, Links... */}
                <TextField
                  label="Email Address" /* ... props ... */
                  value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} fullWidth required autoFocus autoComplete="email"
                 />
                <TextField
                   label="Password" /* ... props ... */ type="password"
                   value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} fullWidth required autoComplete="current-password"
                 />
                <Box sx={{ position: 'relative', mt: 1 }}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    disabled={loading}
                    sx={{ mt: 1, mb: 2 }}
                  >
                    {loading ? 'Logging in...' : 'Login'}
                  </Button>
                  {loading && (
                    <CircularProgress size={24} sx={{ /* ... progress styles ... */ color: 'primary.main', position: 'absolute', top: '50%', left: '50%', marginTop: '-12px', marginLeft: '-12px' }} />
                  )}
                </Box>

                <Link component={RouterLink} to="/signup" variant="body2" align="center" sx={{ display: 'block' }}>
                  {"Don't have an account? Sign Up"}
                </Link>
              </Stack>
            </Box>
          </Paper>
      </Box>
    </Container>
  );
}

export default Login;