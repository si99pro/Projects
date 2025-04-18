// src/pages/VerifyEmail.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadOutlinedIcon from '@mui/icons-material/MarkEmailReadOutlined';

// Shared Component
import Copyright from '../components/Copyright';

/**
 * VerifyEmail Page Component - Final Version
 * Centered, styled consistently, consistent width, no helper text
 */
const VerifyEmail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail, currentUser, loading: authLoading } = useAuth();

  // State
  const emailFromState = location.state?.email;
  const [displayEmail, setDisplayEmail] = useState(emailFromState || '');
  const [loadingResend, setLoadingResend] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ message: '', severity: 'info' });
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // --- Effects ---
  useEffect(() => {
    if (!authLoading && !displayEmail && currentUser?.email) { setDisplayEmail(currentUser.email); }
    if (!authLoading && currentUser?.emailVerified) { navigate('/', { replace: true }); return; }
    if (!authLoading && currentUser && submitStatus.severity !== 'success') {
       setCanResend(true);
       if (submitStatus.message.includes("Login session")) { setSubmitStatus({ message: '', severity: 'info' }); }
    } else if (!authLoading && !currentUser && submitStatus.severity !== 'success') {
      setSubmitStatus({ message: "Login session not found. Please log in again to resend verification.", severity: 'error' });
      setCanResend(false);
    }
  }, [currentUser, authLoading, displayEmail, navigate, submitStatus.severity, submitStatus.message]);

  useEffect(() => {
    let interval = null;
    if (submitStatus.severity === 'success' && countdown > 0) {
        setCanResend(false);
        interval = setInterval(() => { setCountdown((c) => (c > 0 ? c - 1 : 0)); }, 1000);
    } else if (countdown === 0 && submitStatus.severity === 'success') {
        setSubmitStatus({ message: '', severity: 'info' });
        setCountdown(60);
        if (currentUser) { setCanResend(true); }
    }
    return () => { if(interval) clearInterval(interval); };
  }, [countdown, submitStatus.severity, currentUser]);

  // --- Handlers ---
  const handleResendEmail = useCallback(async () => {
    if (!canResend || loadingResend || authLoading || !currentUser) return;
    setLoadingResend(true);
    setSubmitStatus({ message: '', severity: 'info' });
    try {
      await resendVerificationEmail();
      const emailUsed = displayEmail || currentUser.email;
      setSubmitStatus({ message: `Verification email sent successfully to ${emailUsed}!`, severity: 'success' });
    } catch (error) {
      console.error("Resend failed:", error);
      setLoadingResend(false);
      let friendlyError = 'Failed to resend verification email. Please try again later.';
      if (error.code === 'auth/too-many-requests') {
          friendlyError = "Too many requests. Please wait a minute before trying again.";
          setCanResend(false); // Keep disabled
          setCountdown(60); // Start cooldown
          setSubmitStatus({ message: friendlyError, severity: 'error' }); // Set error and trigger cooldown effect
      } else {
          setSubmitStatus({ message: friendlyError, severity: 'error' });
      }
    } // No finally needed here for loading state when success is handled by effect
  }, [canResend, loadingResend, authLoading, currentUser, resendVerificationEmail, displayEmail]);

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--color-background, #f4f6f8)' }}>
      <CssBaseline />
      <Box component="main" sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, overflowY: 'auto' }} >
        <Paper elevation={0} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 2.5, sm: 3 }, width: '100%', maxWidth: '400px', bgcolor: 'var(--color-surface)', borderRadius: 'var(--border-radius-large)', border: `1px solid var(--color-border)`, textAlign: 'center' }} >
          {submitStatus.severity === 'success' ? (
              <MarkEmailReadOutlinedIcon sx={{ fontSize: 48, color: 'var(--color-success, green)', mb: 2 }} />
          ) : (
              <MailOutlineIcon sx={{ fontSize: 48, color: 'var(--color-primary)', mb: 2 }} />
          )}
          <Typography component="h1" variant="h5" sx={{ mb: 2, fontWeight: 500, color: 'var(--color-text-primary)' }}>
            {submitStatus.severity === 'success' ? 'Verification Email Sent!' : 'Verify Your Email'}
          </Typography>
          {authLoading && (
              <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                  <CircularProgress size={24} />
                  <Typography variant="caption" color="text.secondary">Checking status...</Typography>
              </Box>
          )}
          {!authLoading && (
              <Box sx={{ width: '100%', my: 2 }}>
                  {displayEmail && submitStatus.severity !== 'success' && (
                      <Typography variant="body1" color="var(--color-text-secondary)" sx={{ mb: 1 }}> A verification link has been sent to: </Typography>
                  )}
                  {displayEmail && (
                      <Typography variant="body1" component="div" sx={{ fontWeight: 'medium', color: 'var(--color-text-primary)', mb: 2, wordBreak: 'break-all' }}> {displayEmail} </Typography>
                  )}
                  {!displayEmail && !currentUser && submitStatus.severity !== 'success' && (
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}> Please log in to manage email verification. </Typography>
                  )}
                  {submitStatus.severity !== 'success' && (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}> Click the link in the email to activate your account. If you don't see it, check your <b>spam</b> folder. </Typography>
                  )}
                  {submitStatus.message && submitStatus.severity !== 'info' && (
                      <Alert severity={submitStatus.severity} variant="outlined" sx={{ width: '100%', mb: 2, textAlign: 'left' }}> {submitStatus.message} </Alert>
                  )}
              </Box>
          )}
          {!authLoading && currentUser && (
               <Box sx={{ width: '100%', mt: 1, mb: 3 }}>
                 <Divider sx={{ mb: 2 }} light/>
                 <LoadingButton
                   onClick={handleResendEmail} disabled={!canResend || loadingResend} loading={loadingResend}
                   variant="contained" fullWidth size="large" sx={{ py: 1.2 }}
                 >
                   {submitStatus.severity === 'success' && countdown > 0 ? `Resend in ${countdown}s` : 'Resend Verification Email'}
                 </LoadingButton>
               </Box>
          )}
          <Link component={RouterLink} to="/login" variant="body2" fontWeight="medium" sx={{ color: 'var(--color-primary)' }}> Return to Login </Link>
        </Paper>
      </Box>
      <Copyright sx={{ py: 2 }} />
    </Box>
  );
};
export default VerifyEmail;