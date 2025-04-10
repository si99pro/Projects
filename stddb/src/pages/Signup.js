// src/pages/Signup.js
import React, { useState, useMemo } from 'react';
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
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

// Shared Component
import Copyright from '../components/Copyright'; // Assuming this path is correct

// ---> ADD THIS IMPORT <---
import { getRandomMaterialColor } from '../utils/colors'; // Adjust path if needed

const defaultTheme = createTheme();

// --- Constants ---
const sessionOptions = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021", "2019-2020", "2018-2019"];
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Signup = () => {
  // --- State and Hooks ---
  const [formData, setFormData] = useState({ fullName: '', email: '', studentId: '', session: '', password: '' });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // --- Handlers ---
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    // Clear specific field error on change
    if (errors[name]) setErrors(prev => { const newState = {...prev}; delete newState[name]; return newState; });
    // Clear general submit error on any change
    if (submitError) setSubmitError('');
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  // --- Validation Memo ---
  const validationStatus = useMemo(() => {
    const isFullNameValid = formData.fullName.trim() !== '';
    const isEmailFormatValid = EMAIL_REGEX.test(formData.email);
    const isStudentIdValid = formData.studentId.trim() !== '';
    const isSessionValid = !!formData.session; // Checks if session is selected (not empty string)
    const isPasswordLengthValid = formData.password.length >= MIN_PASSWORD_LENGTH;
    const allFieldsValid = isFullNameValid && isEmailFormatValid && isStudentIdValid && isSessionValid && isPasswordLengthValid;
    return { allFieldsValid };
  }, [formData]);

  const isButtonDisabled = loading || !validationStatus.allFieldsValid;

  // --- handleSubmit (UPDATED) ---
  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitError('');
    setErrors({}); // Reset errors on new submission

    // --- Frontend Validation ---
    let tempErrors = {};
    let isValid = true;
    if (!formData.fullName.trim()) { tempErrors.fullName = "Full Name is required."; isValid = false; }
    if (!formData.email.trim()) { tempErrors.email = "Email is required."; isValid = false; }
    else if (!EMAIL_REGEX.test(formData.email)) { tempErrors.email = "Please enter a valid email format."; isValid = false; }
    if (!formData.studentId.trim()) { tempErrors.studentId = "Student ID is required."; isValid = false; }
    if (!formData.session) { tempErrors.session = "Please select your session."; isValid = false; }
    if (!formData.password) { tempErrors.password = "Password is required."; isValid = false; }
    else if (formData.password.length < MIN_PASSWORD_LENGTH) { tempErrors.password = `Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`; isValid = false; }

    if (!isValid) {
      setErrors(tempErrors);
      return; // Stop submission if frontend validation fails
    }
    // --- End Frontend Validation ---

    setLoading(true); // Start loading indicator

    try {
      // ---> 1. Generate the random color <---
      const profileBgColor = getRandomMaterialColor();

      // ---> 2. Create the additional data object INCLUDING the color <---
      const additionalData = {
          fullName: formData.fullName.trim(), // Trim whitespace
          studentId: formData.studentId.trim(),
          session: formData.session,
          profileBgColor: profileBgColor // Add the generated color
      };

      console.log("Attempting signup with data:", { email: formData.email, additionalData }); // Log before calling signup

      // ---> 3. Pass the enhanced additionalData to your context signup function <---
      await signup(formData.email, formData.password, additionalData);

      console.log("Signup successful, navigating to verify email.");
      // Navigate after successful signup and data save in AuthContext
      navigate('/verify-email', { state: { email: formData.email } }); // Pass email for the verify page

    } catch (err) {
      console.error("Signup Failed:", err);
      // Handle specific Firebase errors
      if (err.code === 'auth/email-already-in-use') {
        setErrors(prev => ({ ...prev, email: 'This email address is already registered.' }));
      } else if (err.code === 'auth/invalid-email') {
        setErrors(prev => ({ ...prev, email: 'The email address is not valid.' }));
      } else if (err.code === 'auth/weak-password') {
        setErrors(prev => ({ ...prev, password: 'Password is too weak. Please choose a stronger one.' }));
      } else {
        // Generic error for other issues
        setSubmitError('Failed to create account. Please check your details and try again.');
      }
    } finally {
      // ---> Use finally to ensure loading is always set to false <---
      setLoading(false); // Stop loading indicator regardless of success or failure
    }
  };
  // --- End handleSubmit ---

  // --- Render Logic (No changes needed below) ---
  return (
    <ThemeProvider theme={defaultTheme}>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'grey.100' }}>
        <CssBaseline />
        <Container component="main" maxWidth="xs" sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', flexGrow: 1, py: { xs: 3, sm: 4 } }}>
          <Paper elevation={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', p: { xs: 3, sm: 4 }, borderRadius: 2, width: '100%' }}>
            {/* ... rest of the JSX remains the same ... */}
            <Typography component="h1" variant="h5" sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
              <PersonAddIcon sx={{ mr: 1, color: 'primary.main' }} /> Create Your Account
            </Typography>
            <Typography component="p" color="text.secondary" sx={{ mb: 3, textAlign: 'center' }}>
              Fill in the details below to get started.
            </Typography>

            {submitError && ( <Alert severity="error" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}

            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>

              {/* Full Name */}
              <TextField
                margin="normal" autoComplete="name" name="fullName" required fullWidth id="fullName" label="Full Name" autoFocus
                value={formData.fullName} onChange={handleChange} disabled={loading}
                error={!!errors.fullName} helperText={errors.fullName} // Display helper text for error
              />
              {/* Email Address */}
              <TextField
                margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email"
                value={formData.email} onChange={handleChange} disabled={loading}
                error={!!errors.email} helperText={errors.email} // Display helper text
              />

              {/* Student ID and Session Flex Container */}
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2, mb: 1 }} >
                 {/* Student ID */}
                 <TextField
                    required fullWidth id="studentId" label="Student ID" name="studentId" autoComplete="off"
                    value={formData.studentId} onChange={handleChange} disabled={loading}
                    error={!!errors.studentId} helperText={errors.studentId} // Display helper text
                    sx={{ flex: { sm: 1 } }}
                 />
                 {/* Session Dropdown */}
                 <FormControl fullWidth required error={!!errors.session} disabled={loading} sx={{ flex: { sm: 1 } }} >
                   <InputLabel id="session-select-label">Session</InputLabel>
                   <Select
                      labelId="session-select-label" id="session" name="session" value={formData.session}
                      label="Session" onChange={handleChange}
                   >
                     {sessionOptions.map((option) => ( <MenuItem key={option} value={option}> {option} </MenuItem> ))}
                   </Select>
                   {/* Display helper text for session error below the FormControl */}
                   {errors.session && <Typography variant="caption" color="error" sx={{ pl: '14px', pt: '3px' }}>{errors.session}</Typography>}
                 </FormControl>
              </Box>

              {/* Password */}
              <FormControl margin="normal" variant="outlined" fullWidth required disabled={loading} error={!!errors.password} >
                <InputLabel htmlFor="password">Password</InputLabel>
                <OutlinedInput
                  id="password" name="password" type={showPassword ? 'text' : 'password'} value={formData.password}
                  onChange={handleChange} autoComplete="new-password" label="Password"
                  endAdornment={
                    <InputAdornment position="end">
                      <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={loading}>
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  }
                />
                 {/* Display helper text for password error below the FormControl */}
                 {errors.password && <Typography variant="caption" color="error" sx={{ pl: '14px', pt: '3px' }}>{errors.password}</Typography>}
              </FormControl>

              {/* Submit Button */}
              <LoadingButton
                type="submit" fullWidth variant="contained" loading={loading}
                disabled={isButtonDisabled} // Use calculated disabled state
                sx={{ mt: 3, mb: 2, py: 1.2 }} size="large"
              >
                Sign Up
              </LoadingButton>

              {/* Link to Login */}
              <Grid container justifyContent="flex-end">
                <Grid item>
                  <Typography variant="body2" component="span" sx={{ mr: 0.5 }}> Already have an account? </Typography>
                  <Link component={RouterLink} to="/login" variant="body2"> Sign in </Link>
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