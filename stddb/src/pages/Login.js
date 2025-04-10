// src/pages/Login.js
import React, { useState, useMemo } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper'; // Use Paper for card effect
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link'; // MUI Link
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput'; // For password adornment
import InputLabel from '@mui/material/InputLabel';     // For password adornment
import FormControl from '@mui/material/FormControl'; // For password adornment
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LoginIcon from '@mui/icons-material/Login'; // Optional: Icon for title

// Shared Component (Make sure the path is correct for your project)
import Copyright from '../components/Copyright';

// Use your app's theme or create a default one
const defaultTheme = createTheme();

// --- Constants for Validation ---
const MIN_PASSWORD_LENGTH = 6;
// Simple regex for basic email format checking
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Login = () => {
  // --- State Variables ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Hooks ---
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- Event Handlers ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    if (submitError) setSubmitError('');
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (event) => {
    event.preventDefault();
    // Final validation before submitting
    if (!isEmailValid || !isPasswordValid) {
      setSubmitError('Please ensure email and password meet the requirements.');
      return;
    }
    setSubmitError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/home'); // Navigate on successful verified login
    } catch (err) {
      console.error("Login Failed:", err);
      setLoading(false); // Stop loading on any error

      if (err.message === "EMAIL_NOT_VERIFIED") {
        navigate('/verify-email', { state: { email: formData.email } });
        return; // Stop processing after navigation
      }

      // Map other Firebase auth errors
      let friendlyError = 'Failed to log in. Please check credentials.';
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
  };

  // --- Derived State & Validation for Button Disablement ---
  // useMemo optimizes these calculations
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const isPasswordValid = useMemo(() => formData.password.length >= MIN_PASSWORD_LENGTH, [formData.password]);

  // Button is disabled if loading OR email is NOT valid OR password is NOT valid
  const isButtonDisabled = loading || !isEmailValid || !isPasswordValid;

  // --- Render Logic ---
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Page Wrapper */}
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
        <CssBaseline />
        {/* Content Wrapper */}
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          {/* Login Card */}
          <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 3, sm: 4 }, borderRadius: 2, width: '100%' }}>
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
               <LoginIcon sx={{ mr: 1, color: 'primary.main' }} /> Log In
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Welcome back! Please enter your credentials.
            </Typography>

            {/* Error Alert */}
            {submitError && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}

            {/* Form */}
            <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
              {/* Email Field */}
              <TextField
                variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email"
                autoComplete="email" autoFocus value={formData.email} onChange={handleChange} disabled={loading}
                error={!!submitError && (submitError.includes('email') || submitError.includes('Incorrect'))}
                aria-invalid={!!submitError || (!isEmailValid && formData.email.length > 0)}
              />

              {/* Password Field */}
              <FormControl variant="outlined" fullWidth required margin="normal" disabled={loading} error={!!submitError && (submitError.includes('password') || submitError.includes('Incorrect'))} aria-invalid={!!submitError || (!isPasswordValid && formData.password.length > 0)}>
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange} autoComplete="current-password" label="Password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
              </FormControl>

              {/* Forgot Password Link */}
              <Box sx={{ width: '100%', textAlign: 'right', my: 1 }}>
                <Link component={RouterLink} to="/forgot-password" variant="body2"> Forgot Password? </Link>
              </Box>

              {/* Submit Button - Disabled logic updated */}
              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={isButtonDisabled} // Use the refined disabled logic
                sx={{ mt: 2, mb: 2, py: 1.2 }} size="large"
              >
                Log In
              </LoadingButton>

              {/* Link to Signup - Minor Text Update Here */}
              <Grid container justifyContent="flex-end">
                <Grid item>
                  {/* Text outside the link */}
                  <Typography variant="body2" component="span" sx={{ mr: 0.5 }}>
                     Don't have an account?
                  </Typography>
                  {/* Only "Sign Up" is the link */}
                  <Link component={RouterLink} to="/signup" variant="body2">
                    Sign Up
                  </Link>
                </Grid>
              </Grid>
              {/* --- End Text Update --- */}

            </Box> {/* End Form */}
          </Paper> {/* End Card */}
        </Container> {/* End Content Wrapper */}
        <Copyright sx={{ mt: 'auto', py: 2 }} /> {/* Footer */}
      </Box> {/* End Page Wrapper */}
    </ThemeProvider>
  );
};

export default Login;