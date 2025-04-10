/* eslint-disable no-unused-vars */
// src/pages/ForgotPassword.js
import React, { useState } from 'react';
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
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Icons (Optional, but nice)
import LockResetIcon from '@mui/icons-material/LockReset';

// Shared Component
import Copyright from '../components/Copyright'; // Ensure this path is correct

const defaultTheme = createTheme();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Simple email format check

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState(''); // For success messages
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const auth = getAuth(app); // Get the auth instance

  const handleChange = (event) => {
    setEmail(event.target.value);
    // Clear errors/messages when user types
    if (error) setError('');
    if (message) setMessage('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    // Basic Frontend Validation
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    try {
      // Use Firebase function to send reset email
      await sendPasswordResetEmail(auth, email);
      setMessage('Password reset email sent! Check your inbox (and spam folder).');
      setEmail(''); // Optionally clear the field on success
      // navigate('/login'); // Or redirect after a delay, or just show message
    } catch (err) {
      console.error("Password Reset Failed:", err);
      // Handle specific Firebase errors
      if (err.code === 'auth/user-not-found') {
        setError('No user found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('The email address is not valid.');
      } else {
        setError('Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 3, sm: 4 }, borderRadius: 2, width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <LockResetIcon sx={{ mr: 1, color: 'primary.main' }} /> Reset Your Password
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Enter your email address below and we'll send you a link to reset your password.
            </Typography>

            {/* Display Success or Error Messages */}
            {message && ( <Alert severity="success" sx={{ width: '100%', mb: 2 }}> {message} </Alert> )}
            {error && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {error} </Alert> )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
              {/* Email Address */}
              <TextField
                margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email" autoFocus
                value={email} onChange={handleChange} disabled={loading}
                error={!!error && !message} // Show error state only if there's an error and no success message
              />

              {/* Submit Button */}
              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={loading || !!message} // Disable if loading or if success message is shown
                sx={{ mt: 3, mb: 2, py: 1.2 }} size="large"
              >
                Send Reset Link
              </LoadingButton>

              {/* Link back to Login */}
              <Grid container justifyContent="center"> {/* Center the link */}
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