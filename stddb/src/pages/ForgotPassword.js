/* eslint-disable no-unused-vars */
// src/pages/ForgotPassword.js
import React, { useState, useMemo, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase'; // Ensure this path is correct

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // MUI Link
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'; // Added useTheme

// MUI Icons
import LockResetIcon from '@mui/icons-material/LockReset';

// Shared Component
import Copyright from '../components/Copyright'; // Ensure path is correct

// Use your app's theme or create a default one
const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email format check

/**
 * ForgotPassword Page Component
 * Allows users to request a password reset email.
 */
const ForgotPassword = () => {
  const theme = useTheme(); // Access theme for spacing/palette
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false); // Track if email field was interacted with
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [loading, setLoading] = useState(false);
  // const navigate = useNavigate(); // Keep if needed for redirect after success
  const auth = getAuth(app);

  // --- Memoized Validation ---
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const emailError = touched && !isEmailValid; // Show error only if touched and invalid

  // --- Handlers ---
  const handleChange = useCallback((event) => {
    setEmail(event.target.value);
    setTouched(true); // Mark as touched on change
    // Clear status messages when user types
    if (error) setError('');
    if (message) setMessage('');
  }, [error, message]); // Dependencies to allow clearing

   const handleBlur = useCallback(() => {
    setTouched(true); // Mark as touched on blur too
   }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setTouched(true); // Ensure validation shows on submit attempt
    setError('');
    setMessage('');

    if (!isEmailValid) {
      // No need for a general error, field validation will show
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
      // setEmail(''); // Keep email in field for reference, but disable button
    } catch (err) {
      console.error("Password Reset Failed:", err);
      if (err.code === 'auth/user-not-found') {
        // Avoid confirming if an email exists for security, show generic message
        setError('If an account exists for this email, a reset link has been sent.');
        setMessage(''); // Ensure only one message type shows
      } else if (err.code === 'auth/invalid-email') {
         // This case should be caught by frontend validation, but good to handle
         setError('The email address format is invalid.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  }, [auth, email, isEmailValid]); // Add dependencies

  // Disable button if loading OR email is invalid OR success message shown
  const isButtonDisabled = loading || !isEmailValid || !!message;

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          <Paper
             elevation={3}
             sx={{
               display: 'flex', flexDirection: 'column', alignItems: 'center',
               p: theme.spacing(4),
               borderRadius: theme.shape.borderRadius * 1.5,
               width: '100%', textAlign: 'center',
               transition: theme.transitions.create('box-shadow'),
               '&:hover': { boxShadow: theme.shadows[6] }
             }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LockResetIcon sx={{ mr: 1, color: 'primary.main' }} /> Reset Your Password
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: theme.spacing(3) }}>
              Enter your email address and we'll send a reset link.
            </Typography>

            {/* Display Success OR Error Message */}
            {message && ( <Alert severity="success" variant="outlined" sx={{ width: '100%', mb: 2 }}> {message} </Alert> )}
            {error && !message && ( <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2 }}> {error} </Alert> )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
              <TextField
                margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email" autoFocus
                value={email} onChange={handleChange} onBlur={handleBlur} disabled={loading || !!message} // Disable field after success too
                error={emailError} // Use derived error state
                helperText={emailError ? "Please enter a valid email address." : " "} // Validation helper text
                aria-invalid={emailError}
              />

              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={isButtonDisabled}
                sx={{ mt: theme.spacing(3), mb: theme.spacing(2), py: 1.2 }} size="large"
              >
                Send Reset Link
              </LoadingButton>

              <Grid container justifyContent="center">
                <Grid item>
                  <Link component={RouterLink} to="/login" variant="body2">
                    Back to Login
                  </Link>
                </Grid>
              </Grid>
            </Box> {/* End Form */}
          </Paper> {/* End Card */}
        </Container> {/* End Content Wrapper */}
        <Copyright sx={{ mt: 'auto', py: 2 }} /> {/* Footer */}
      </Box> {/* End Page Wrapper */}
    </ThemeProvider>
  );
};

export default ForgotPassword;