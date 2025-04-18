// src/pages/ForgotPassword.js
import React, { useState, useMemo, useCallback } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { app } from '../firebase';

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
// FormHelperText not needed

// MUI Icons
import LockResetOutlinedIcon from '@mui/icons-material/LockResetOutlined';

// Shared Component
import Copyright from '../components/Copyright';

// --- Constants ---
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * ForgotPassword Page Component - Final Version
 * Centered, styled consistently, consistent width, no helper text
 */
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', severity: 'info' });
  const [loading, setLoading] = useState(false);
  const auth = getAuth(app);

  // --- Validation ---
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(email), [email]);
  const emailError = touched && !isEmailValid;

  // --- Handlers ---
  const handleChange = useCallback((event) => {
    setEmail(event.target.value);
    setTouched(true);
    if (submitStatus.message) setSubmitStatus({ message: '', severity: 'info' });
  }, [submitStatus.message]);

   const handleBlur = useCallback(() => {
    setTouched(true);
   }, []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setTouched(true);
    setSubmitStatus({ message: '', severity: 'info' });
    if (!isEmailValid) { return; } // Rely on visual errors

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSubmitStatus({ message: 'Password reset link sent! Please check your email (including spam folder).', severity: 'success' });
    } catch (err) {
      console.error("Password Reset Failed:", err);
      setLoading(false);
      let friendlyError = 'Failed to send password reset email. Please try again.';
      if (err.code === 'auth/user-not-found') {
        setSubmitStatus({ message: 'If an account exists for this email, a reset link has been sent.', severity: 'success' }); // Treat as success for security
      } else if (err.code === 'auth/invalid-email') {
         friendlyError = 'The email address format is invalid.';
         setSubmitStatus({ message: friendlyError, severity: 'error' });
      } else if (err.code === 'auth/too-many-requests') {
          friendlyError = 'Too many requests. Please wait before trying again.';
          setSubmitStatus({ message: friendlyError, severity: 'error' });
      } else {
         setSubmitStatus({ message: friendlyError, severity: 'error' });
      }
    } finally {
       if (submitStatus.severity !== 'success') { setLoading(false); } // Keep loading false unless successful
    }
  }, [auth, email, isEmailValid, submitStatus.severity]);

  const isButtonDisabled = loading || !isEmailValid || submitStatus.severity === 'success';

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--color-background, #f4f6f8)' }}>
      <CssBaseline />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, overflowY: 'auto' }} >
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2.5, sm: 3 }, width: '100%', maxWidth: '400px', bgcolor: 'var(--color-surface)', borderRadius: 'var(--border-radius-large)', border: `1px solid var(--color-border)` }} >
          <LockResetOutlinedIcon sx={{ fontSize: 36, color: 'var(--color-primary)', mb: 2 }} />
          <Typography component="h1" variant="h5" sx={{ mb: 1, fontWeight: 500, textAlign: 'center', color: 'var(--color-text-primary)' }}> Reset Password </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}> Enter your email to receive a reset link. </Typography>
          {submitStatus.message && ( <Alert severity={submitStatus.severity} variant="outlined" sx={{ width: '100%', mb: 2 }}> {submitStatus.message} </Alert> )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
            <TextField
              variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email"
              autoComplete="email" autoFocus value={email} onChange={handleChange} onBlur={handleBlur} disabled={loading || submitStatus.severity === 'success'}
              error={emailError} aria-invalid={emailError}
            />
            <LoadingButton type="submit" fullWidth variant="contained" loading={loading} disabled={isButtonDisabled} size="large" sx={{ mt: 3, mb: 2, py: 1.2 }} >
              Send Reset Link
            </LoadingButton>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Link component={RouterLink} to="/login" variant="body2" fontWeight="medium" sx={{ color: 'var(--color-primary)' }}> Back to Log In </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Copyright sx={{ py: 2 }} />
    </Box>
  );
};
export default ForgotPassword;