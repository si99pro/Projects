// src/pages/VerifyEmail.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link'; // MUI Link
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'; // Added useTheme
import Divider from '@mui/material/Divider'; // For visual separation

// MUI Icons
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead'; // Icon for success state

// Shared Component
import Copyright from '../components/Copyright'; // Ensure path is correct

// Use your app's theme or create a default one
const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

/**
 * VerifyEmail Page Component
 * Instructs users to check their email for a verification link and allows resending.
 */
const VerifyEmail = () => {
  const theme = useTheme(); // Access theme for spacing/palette
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail, currentUser, loading: authLoading } = useAuth();

  // State
  const emailFromState = location.state?.email;
  const [displayEmail, setDisplayEmail] = useState(emailFromState || '');
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [countdown, setCountdown] = useState(60);

  // --- Effects (Logic remains the same, slight adjustments for clarity) ---

  useEffect(() => {
    // Determine display email once auth is loaded
    if (!authLoading && !displayEmail && currentUser?.email) {
      setDisplayEmail(currentUser.email);
    }
    // Redirect immediately if verified
    if (!authLoading && currentUser?.emailVerified) {
      console.log("VerifyEmail: User already verified, redirecting...");
      navigate('/home', { replace: true });
      return; // Prevent further state updates after redirect
    }
    // Enable resend only if auth loaded, user exists, and not in cooldown
    if (!authLoading && currentUser && !resendSuccess) {
      setCanResend(true);
      if(resendError.includes("No active user session")) setResendError('');
    } else if (!authLoading && !currentUser && !resendSuccess) {
      setResendError("Login session not found. Please log in again to resend verification.");
      setCanResend(false);
    }
  }, [currentUser, authLoading, displayEmail, navigate, resendSuccess, resendError]);

  useEffect(() => {
    let interval = null;
    if (!canResend && countdown > 0 && resendSuccess) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => (prevCountdown > 0 ? prevCountdown - 1 : 0));
      }, 1000);
    } else if (countdown === 0 && resendSuccess) { // Only re-enable if cooldown finished
      if (currentUser) { setCanResend(true); }
      setCountdown(60);
      setResendSuccess(''); // Clear success message to reset state
    }
    return () => { if(interval) clearInterval(interval); };
  }, [canResend, countdown, resendSuccess, currentUser]);

  const handleResendEmail = useCallback(async () => {
    if (!canResend || loadingResend || authLoading || !currentUser) return;
    setLoadingResend(true);
    setResendError('');
    setResendSuccess('');

    try {
      await resendVerificationEmail();
      const emailUsed = displayEmail || currentUser.email;
      setResendSuccess(`Verification email sent successfully to ${emailUsed}!`);
      setCanResend(false);
      setCountdown(60);
    } catch (error) {
      console.error("Resend failed:", error);
      if (error.code === 'auth/too-many-requests') {
          setResendError("Too many requests. Please wait a minute before trying again.");
      } else {
          setResendError('Failed to resend verification email. Please try again later.');
      }
       // Only allow retry immediately if it wasn't a rate limit error
       if (error.code !== 'auth/too-many-requests') setCanResend(true);
    } finally {
      setLoadingResend(false);
    }
  }, [canResend, loadingResend, authLoading, currentUser, resendVerificationEmail, displayEmail]);


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
               p: theme.spacing(4), // Use theme spacing
               borderRadius: theme.shape.borderRadius * 1.5,
               width: '100%', textAlign: 'center',
               transition: theme.transitions.create('box-shadow'),
               '&:hover': { boxShadow: theme.shadows[6] }
             }}
          >
            {/* Use different icon based on success state */}
            {resendSuccess ? (
                <MarkEmailReadIcon sx={{ fontSize: 54, color: 'success.main', mb: 2 }} />
            ) : (
                <MailOutlineIcon sx={{ fontSize: 54, color: 'primary.main', mb: 2 }} />
            )}

            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              {resendSuccess ? 'Email Sent!' : 'Verify Your Email'}
            </Typography>

            {/* Show loading spinner only during initial auth check */}
            {authLoading && (
                <Box sx={{ my: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <CircularProgress size={30} sx={{ mb: 1 }} />
                    <Typography variant="caption" color="text.secondary">Checking status...</Typography>
                </Box>
            )}

            {/* Instructions and Info */}
            {!authLoading && (
                <Box sx={{ width: '100%', my: 2 }}>
                    {displayEmail && !resendSuccess && (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        A verification link has been sent to:
                      </Typography>
                    )}
                     {displayEmail && (
                       <Typography variant="body1" component="div" sx={{ fontWeight: 'medium', mb: theme.spacing(2), wordBreak: 'break-all' }}>
                         {displayEmail}
                       </Typography>
                     )}
                     {!displayEmail && !currentUser && (
                        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                            Please log in to manage email verification.
                        </Typography>
                     )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        Click the link in the email to activate your account. If you don't see it, please check your <b>spam</b> or <b>junk</b> folder.
                    </Typography>
                </Box>
            )}

            {/* Resend Section (only if user session exists after loading) */}
            {!authLoading && currentUser && (
                 <Box sx={{ width: '100%', mt: 1, mb: 3 }}>
                   <Divider sx={{ mb: 2 }} light/>
                   {/* Display Success or Error Messages */}
                   {resendSuccess && <Alert severity="success" variant="outlined" sx={{ mb: 2 }}>{resendSuccess}</Alert>}
                   {resendError && <Alert severity="error" variant="outlined" sx={{ mb: 2 }}>{resendError}</Alert>}

                   {/* Resend Button */}
                   <LoadingButton
                     onClick={handleResendEmail}
                     disabled={!canResend || loadingResend} // Simplified disabled logic
                     loading={loadingResend}
                     variant="contained"
                     fullWidth
                     sx={{ py: 1.2 }}
                     size="large"
                   >
                     {!canResend && resendSuccess // Only show countdown after success
                       ? `Resend in ${countdown}s`
                       : 'Resend Verification Email'}
                   </LoadingButton>
                 </Box>
            )}

            {/* Link back to Login */}
            <Link component={RouterLink} to="/login" variant="body2">
              Return to Login
            </Link>

          </Paper> {/* End Card */}
        </Container> {/* End Content Wrapper */}
        <Copyright sx={{ mt: 'auto', py: 2 }} /> {/* Footer */}
      </Box> {/* End Page Wrapper */}
    </ThemeProvider>
  );
};

export default VerifyEmail;