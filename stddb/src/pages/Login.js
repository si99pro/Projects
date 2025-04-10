// src/pages/Login.js
import React, { useState, useMemo, useCallback } from 'react'; // Added useCallback
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import FormHelperText from '@mui/material/FormHelperText'; // Added for validation feedback
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'; // Added useTheme

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login';

// Shared Component
import Copyright from '../components/Copyright'; // Ensure path is correct

// Use your app's theme or create a default one
const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

// --- Constants for Validation ---
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Basic email format

/**
 * Login Page Component
 * Handles user authentication via email and password.
 */
const Login = () => {
  const theme = useTheme(); // Access theme for spacing/palette
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- State Variables ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false }); // Track field interaction
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Memoized Validation ---
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const isPasswordValid = useMemo(() => formData.password.length >= MIN_PASSWORD_LENGTH, [formData.password]);

  // --- Derived Error States for Fields ---
  const emailError = touched.email && !isEmailValid;
  const passwordError = touched.password && !isPasswordValid;

  // --- Event Handlers ---
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    // Mark field as touched on change
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
    if (submitError) setSubmitError(''); // Clear submit error on input change
  }, [submitError]); // Dependency on submitError ensures it gets cleared

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    // Mark field as touched on blur (useful if user tabs away)
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
  }, []);

  const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), []);
  const handleMouseDownPassword = useCallback((event) => event.preventDefault(), []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    // Mark all fields touched on submit attempt
    setTouched({ email: true, password: true });

    // Check pre-submit validation state
    if (!isEmailValid || !isPasswordValid) {
      setSubmitError('Please correct the errors before submitting.'); // General pre-submit error
      return;
    }
    setSubmitError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/home'); // Or wherever logged-in users should go
    } catch (err) {
      console.error("Login Failed:", err);
      setLoading(false);

      if (err.message === "EMAIL_NOT_VERIFIED") {
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }

      // Map Firebase errors to user-friendly messages
      let friendlyError = 'Failed to log in. Please check credentials.';
      // (Firebase error mapping logic remains the same)
        if (err.code) {
            switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                friendlyError = 'Incorrect email or password provided.'; break;
            case 'auth/invalid-email':
                friendlyError = 'Please enter a valid email address format.'; break;
            case 'auth/too-many-requests':
                friendlyError = 'Access temporarily disabled due to too many failed attempts.'; break;
            case 'auth/user-disabled':
                friendlyError = 'This account has been disabled.'; break;
            default:
                friendlyError = 'An unexpected error occurred during login.'; break;
            }
        }
      setSubmitError(friendlyError);
    }
  }, [formData.email, formData.password, isEmailValid, isPasswordValid, login, navigate]); // Dependencies for submit

  // Button is disabled if loading OR if either field is invalid (even if not touched yet)
  const isButtonDisabled = loading || !isEmailValid || !isPasswordValid;

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          <Paper
            elevation={3} // Slightly more elevation for focus
            sx={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                p: theme.spacing(4), // Use theme spacing
                borderRadius: theme.shape.borderRadius * 1.5, // Slightly more rounded
                width: '100%',
                transition: theme.transitions.create('box-shadow'), // Transition for hover
                 '&:hover': { // Subtle hover effect
                   boxShadow: theme.shadows[6]
                 }
            }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
               <LoginIcon sx={{ mr: 1, color: 'primary.main' }} /> Log In
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: theme.spacing(3), textAlign: 'center' }}>
              Welcome back! Please enter your credentials.
            </Typography>

            {/* Server/Submit Error Alert */}
            {submitError && ( <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
              {/* Email Field */}
              <TextField
                variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email"
                autoComplete="email" autoFocus value={formData.email} onChange={handleChange} onBlur={handleBlur} disabled={loading}
                error={emailError || (!!submitError && (submitError.includes('email') || submitError.includes('Incorrect')))} // Show error if invalid and touched OR specific submit error
                helperText={emailError ? "Please enter a valid email address." : " "} // Show validation helper text; " " keeps space
                aria-invalid={emailError || !!submitError}
                aria-describedby={emailError ? "email-error-text" : undefined}
              />
              {/* Hidden span for accessibility description if needed */}
              {emailError && <span id="email-error-text" style={{ display: 'none' }}>Invalid email format</span>}

              {/* Password Field */}
              <FormControl variant="outlined" fullWidth required margin="normal" disabled={loading} error={passwordError || (!!submitError && (submitError.includes('password') || submitError.includes('Incorrect')))}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange} onBlur={handleBlur} autoComplete="current-password" label="Password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  aria-invalid={passwordError || !!submitError}
                  aria-describedby={passwordError ? "password-error-text" : undefined}
                />
                 {/* Show validation helper text; " " keeps space */}
                <FormHelperText error={passwordError} id="password-error-text">
                    {passwordError ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` : " "}
                </FormHelperText>
              </FormControl>

              {/* Forgot Password Link */}
              <Box sx={{ width: '100%', textAlign: 'right', my: theme.spacing(1) }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2"> Forgot Password? </Link>
              </Box>

              {/* Submit Button */}
              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={isButtonDisabled} // Disable if loading or fields invalid
                sx={{ mt: theme.spacing(2), mb: theme.spacing(2), py: 1.2 }} size="large"
              >
                Log In
              </LoadingButton>

              {/* Link to Signup */}
              <Grid container justifyContent="center"> {/* Center align */}
                <Grid item>
                  <Typography variant="body2" component="span" sx={{ mr: 0.5 }}>
                     Don't have an account?
                  </Typography>
                  <Link component={RouterLink} to="/signup" variant="body2" fontWeight="medium"> {/* Make link slightly bolder */}
                    Sign Up
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

export default Login;