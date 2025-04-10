/* eslint-disable no-unused-vars */
// src/pages/Signup.js
import React, { useState, useMemo, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming this path is correct

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
import FormHelperText from '@mui/material/FormHelperText'; // Import for validation text
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'; // Added useTheme

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Shared Component
import Copyright from '../components/Copyright'; // Assuming this path is correct

// Utility (Make sure the path is correct for your project)
import { getRandomMaterialColor } from '../utils/colors';

// Use your app's theme or create a default one
const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

// --- Constants ---
const sessionOptions = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021", "2019-2020", "2018-2019"];
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Signup Page Component
 * Handles new user registration.
 */
const Signup = () => {
  const theme = useTheme(); // Access theme for spacing/palette
  const { signup } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [formData, setFormData] = useState({ fullName: '', email: '', studentId: '', session: '', password: '' });
  const [touched, setTouched] = useState({ fullName: false, email: false, studentId: false, session: false, password: false });
  const [submitError, setSubmitError] = useState(''); // For general submit errors (e.g., network)
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Memoized Validation ---
  const isFullNameValid = useMemo(() => formData.fullName.trim() !== '', [formData.fullName]);
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const isStudentIdValid = useMemo(() => formData.studentId.trim() !== '', [formData.studentId]);
  const isSessionValid = useMemo(() => !!formData.session, [formData.session]);
  const isPasswordValid = useMemo(() => formData.password.length >= MIN_PASSWORD_LENGTH, [formData.password]);

  // --- Derived Error States (based on touched + validation) ---
  const fullNameError = touched.fullName && !isFullNameValid;
  const emailError = touched.email && !isEmailValid;
  const studentIdError = touched.studentId && !isStudentIdValid;
  const sessionError = touched.session && !isSessionValid;
  const passwordError = touched.password && !isPasswordValid;

  // Check if the overall form is valid (used for enabling submit)
  const isFormValid = isFullNameValid && isEmailValid && isStudentIdValid && isSessionValid && isPasswordValid;

  // --- Handlers ---
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setTouched(prevTouched => ({ ...prevTouched, [name]: true })); // Mark as touched on change
    if (submitError) setSubmitError('');
  }, [submitError]);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prevTouched => ({ ...prevTouched, [name]: true })); // Mark as touched on blur
  }, []);

  const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), []);
  const handleMouseDownPassword = useCallback((event) => event.preventDefault(), []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    // Mark all fields as touched on submit attempt to show all errors
    setTouched({ fullName: true, email: true, studentId: true, session: true, password: true });
    setSubmitError(''); // Clear previous general errors

    if (!isFormValid) {
      setSubmitError('Please correct the errors highlighted below.'); // Generic prompt
      return; // Stop if form isn't valid based on computed states
    }

    setLoading(true);

    try {
      const profileBgColor = getRandomMaterialColor();
      const additionalData = {
          fullName: formData.fullName.trim(),
          studentId: formData.studentId.trim(),
          session: formData.session,
          profileBgColor: profileBgColor
      };

      await signup(formData.email, formData.password, additionalData);

      console.log("Signup successful, navigating to verify email.");
      navigate('/verify-email', { state: { email: formData.email } });

    } catch (err) {
      console.error("Signup Failed:", err);
      let specificFieldError = false;
      // Handle specific Firebase errors by setting a general submit error
      // (Field-level errors are now handled by derived state + helperText)
      if (err.code === 'auth/email-already-in-use') {
        setSubmitError('This email address is already registered. Please log in or use a different email.');
         setTouched(prev => ({ ...prev, email: true })); // Ensure email field shows error state visually
         specificFieldError = true;
      } else if (err.code === 'auth/invalid-email') {
        setSubmitError('The email address format is invalid.');
         setTouched(prev => ({ ...prev, email: true }));
         specificFieldError = true;
      } else if (err.code === 'auth/weak-password') {
        setSubmitError('Password is too weak. Please choose a stronger one (at least 6 characters).');
        setTouched(prev => ({ ...prev, password: true }));
         specificFieldError = true;
      } else {
        setSubmitError('Failed to create account. An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  }, [formData, isFormValid, signup, navigate]); // Add all dependencies used

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
                 width: '100%',
                 transition: theme.transitions.create('box-shadow'),
                  '&:hover': { boxShadow: theme.shadows[6] }
             }}
          >
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} /> Create Your Account
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: theme.spacing(3), textAlign: 'center' }}>
              Fill in the details below to get started.
            </Typography>

            {/* Display GENERAL submit errors here */}
            {submitError && ( <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>

              {/* Full Name */}
              <TextField
                margin="normal" autoComplete="name" name="fullName" required fullWidth id="fullName" label="Full Name" autoFocus
                value={formData.fullName} onChange={handleChange} onBlur={handleBlur} disabled={loading}
                error={fullNameError} // Use derived error state
                helperText={fullNameError ? "Full Name is required." : " "} // Conditional helper text
                aria-invalid={fullNameError}
              />
              {/* Email Address */}
              <TextField
                margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email"
                value={formData.email} onChange={handleChange} onBlur={handleBlur} disabled={loading}
                error={emailError}
                helperText={emailError ? "Please enter a valid email format." : " "}
                aria-invalid={emailError}
              />

              {/* Student ID and Session Row */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: theme.spacing(2), mt: 2, mb: 1 }} >
                 {/* Student ID */}
                 <TextField
                    required fullWidth id="studentId" label="Student ID" name="studentId" autoComplete="off"
                    value={formData.studentId} onChange={handleChange} onBlur={handleBlur} disabled={loading}
                    error={studentIdError}
                    helperText={studentIdError ? "Student ID is required." : " "}
                    aria-invalid={studentIdError}
                    sx={{ flex: { sm: 1 } }}
                 />
                 {/* Session Dropdown */}
                 <FormControl fullWidth required error={sessionError} disabled={loading} sx={{ flex: { sm: 1 } }} >
                   <InputLabel id="session-select-label">Session</InputLabel>
                   <Select
                      labelId="session-select-label" id="session" name="session" value={formData.session}
                      label="Session" onChange={handleChange} onBlur={handleBlur} // Add onBlur
                   >
                     {/* Add a placeholder/disabled option */}
                     <MenuItem value="" disabled><em>Select Session</em></MenuItem>
                     {sessionOptions.map((option) => ( <MenuItem key={option} value={option}> {option} </MenuItem> ))}
                   </Select>
                   <FormHelperText error={sessionError}>
                       {sessionError ? "Please select your session." : " "}
                   </FormHelperText>
                 </FormControl>
              </Box>

              {/* Password */}
              <FormControl margin="normal" variant="outlined" fullWidth required disabled={loading} error={passwordError} >
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange} onBlur={handleBlur} autoComplete="new-password" label="Password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                  aria-invalid={passwordError}
                />
                <FormHelperText error={passwordError}>
                    {passwordError ? `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` : " "}
                </FormHelperText>
              </FormControl>

              {/* Submit Button */}
              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={loading || !isFormValid} // Disable if loading OR form is invalid based on computed value
                sx={{ mt: theme.spacing(3), mb: theme.spacing(2), py: 1.2 }} size="large"
              >
                Sign Up
              </LoadingButton>

              {/* Link to Login */}
              <Grid container justifyContent="center">
                <Grid item>
                  <Typography variant="body2" component="span" sx={{ mr: 0.5 }}> Already have an account? </Typography>
                  <Link component={RouterLink} to="/login" variant="body2" fontWeight="medium"> Sign in </Link>
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

export default Signup;