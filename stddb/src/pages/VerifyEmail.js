// src/pages/VerifyEmail.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'; // Import RouterLink
import { useAuth } from '../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link'; // MUI Link
import LoadingButton from '@mui/lab/LoadingButton';
import CircularProgress from '@mui/material/CircularProgress'; // For initial loading
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Icons (using MailOutline as an alternative)
import MailOutlineIcon from '@mui/icons-material/MailOutline';

// Shared Component (Make sure the path is correct)
import Copyright from '../components/Copyright';

// Use your app's theme or create a default one
const defaultTheme = createTheme();


const VerifyEmail = () => {
  // --- Hooks and State (remain the same) ---
  const location = useLocation();
  const navigate = useNavigate();
  const { resendVerificationEmail, currentUser, loading: authLoading } = useAuth();
  const emailFromState = location.state?.email; // Email passed from previous route
  const [displayEmail, setDisplayEmail] = useState(emailFromState || '');
  const [loadingResend, setLoadingResend] = useState(false);
  const [resendError, setResendError] = useState('');
  const [resendSuccess, setResendSuccess] = useState('');
  const [canResend, setCanResend] = useState(false); // Start false until auth loads
  const [countdown, setCountdown] = useState(60); // Cooldown timer

  // --- useEffects and useCallback (logic remains the same) ---

  // Effect to set display email, check verification status, enable resend button
  useEffect(() => {
    // Set email from currentUser if not passed via state and auth loaded
    if (!authLoading && !displayEmail && currentUser?.email) {
      setDisplayEmail(currentUser.email);
    }
    // Redirect if user is already verified (and auth check is done)
    if (!authLoading && currentUser?.emailVerified) {
      console.log("VerifyEmail: User already verified, redirecting...");
      navigate('/home', { replace: true }); // Redirect to home/dashboard
    }
    // Enable resend button only if auth loaded and user exists
    if (!authLoading && currentUser) {
      setCanResend(true);
      // Clear any 'no session' error if user is now found
      if(resendError.includes("No active user session")) setResendError('');
    } else if (!authLoading && !currentUser && !resendSuccess) {
      // If auth loaded but no user, show specific message (unless cooldown active)
      setResendError("Cannot resend: No active user session found.");
      setCanResend(false);
    }
  }, [currentUser, authLoading, displayEmail, navigate, resendSuccess, resendError]); // Added resendError dependency

  // Effect for the resend cooldown timer
  useEffect(() => {
    let interval = null;
    // Timer runs only when resend is blocked due to success cooldown
    if (!canResend && countdown > 0 && resendSuccess) {
      interval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      // Timer finished, allow resend if user still exists
      if (currentUser) {
        setCanResend(true);
      }
      setCountdown(60); // Reset timer duration
      setResendSuccess(''); // Clear success message
    }
    // Cleanup interval on unmount or when dependencies change
    return () => { if(interval) clearInterval(interval); };
  }, [canResend, countdown, resendSuccess, currentUser]);

  // Callback function to handle the resend button click
  const handleResendEmail = useCallback(async () => {
    // Prevent action if not allowed, already loading, or no user
    if (!canResend || loadingResend || authLoading || !currentUser) {
         console.warn("Resend blocked by condition:", { canResend, loadingResend, authLoading, currentUser: !!currentUser });
         return;
    }
    setLoadingResend(true); // Show resend loading state
    setResendError('');
    setResendSuccess('');

    try {
      await resendVerificationEmail(); // Call function from auth context
      // Use the most reliable email source available
      const emailUsed = displayEmail || currentUser.email;
      setResendSuccess(`Verification email sent successfully to ${emailUsed}!`);
      setCanResend(false); // Disable button, start cooldown
      setCountdown(60);    // Reset countdown
    } catch (error) {
      console.error("Resend failed:", error);
      if (error.code === 'auth/too-many-requests') {
          setResendError("Too many requests sent recently. Please wait before trying again.");
          // Keep canResend false to enforce waiting
      } else {
          setResendError('Failed to resend verification email. Please try again later.');
           // Allow retry only if it wasn't a rate limit error
           setCanResend(true);
      }
    } finally {
      setLoadingResend(false); // Stop resend loading state
    }
  }, [canResend, loadingResend, authLoading, currentUser, resendVerificationEmail, displayEmail]);


  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Page Wrapper */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
        <CssBaseline />
        {/* Content Wrapper - Centering */}
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          {/* Verification Card */}
          <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 3, sm: 4 }, borderRadius: 2, width: '100%', textAlign: 'center' }}>
            {/* Icon */}
            <MailOutlineIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />

            <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
              Check Your Inbox!
            </Typography>

            {/* Initial Auth Loading Indicator */}
            {authLoading && <CircularProgress sx={{ my: 2 }} />}

            {/* --- Informational Text (Conditional) --- */}
            {!authLoading && ( // Only show text after initial auth check
                <>
                    {displayEmail ? (
                      <Typography variant="body1" sx={{ mb: 1 }}>
                        We've sent a verification link to <Typography component="strong" sx={{ fontWeight: 'bold' }}>{displayEmail}</Typography>.
                      </Typography>
                    ) : !currentUser ? (
                      // If no user found after loading
                      <Typography variant="body1" color="text.secondary" sx={{ mb: 1 }}>
                        Please log in or sign up to manage email verification.
                      </Typography>
                    ) : (
                       // Fallback if user exists but email somehow isn't displayed
                       <Typography variant="body1" sx={{ mb: 1 }}>
                         We need to send a verification link to your email address.
                       </Typography>
                    )}

                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                        Click the link in that email to activate your account. Remember to check your <Typography component="strong" sx={{ fontWeight: 'medium' }}>spam or junk folder</Typography>.
                    </Typography>
                </>
            )}


            {/* --- Resend Section --- */}
            <Box sx={{ width: '100%', mt: 2, mb: 3 }}>
              {/* Display Success or Error Messages */}
              {resendSuccess && <Alert severity="success" sx={{ mb: 2 }}>{resendSuccess}</Alert>}
              {resendError && <Alert severity="error" sx={{ mb: 2 }}>{resendError}</Alert>}

              {/* Resend Button */}
              <LoadingButton
                onClick={handleResendEmail}
                // Button disabled if cannot resend, or resend loading, or initial auth loading
                disabled={!canResend || loadingResend || authLoading}
                loading={loadingResend} // Controls spinner within the button
                variant="contained"
                fullWidth
                sx={{ py: 1.2 }}
                size="large"
              >
                {/* Conditional Button Text */}
                {authLoading
                  ? 'Verifying Session...'
                  : !canResend && resendSuccess // Only show countdown after a successful send
                  ? `Resend in ${countdown}s`
                  : 'Resend Verification Email'}
              </LoadingButton>
            </Box>

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