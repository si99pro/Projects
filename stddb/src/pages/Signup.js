// src/pages/Signup.js
import React, { useState, useMemo, useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import LoadingButton from '@mui/lab/LoadingButton';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
// FormHelperText not needed
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
// import PersonAddOutlinedIcon from '@mui/icons-material/PersonAddOutlined';

// Shared Component
import Copyright from '../components/Copyright';

// Utility
import { getRandomMaterialColor } from '../utils/colors'; // Ensure path is correct

// --- Constants ---
const sessionOptions = ["2024-2025", "2023-2024", "2022-2023", "2021-2022", "2020-2021", "2019-2020", "2018-2019"];
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Signup Page Component - Final Version
 * Centered, styled consistently, consistent width, no helper text
 */
const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [formData, setFormData] = useState({ fullName: '', email: '', studentId: '', session: '', password: '' });
  const [touched, setTouched] = useState({ fullName: false, email: false, studentId: false, session: false, password: false });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Validation ---
  const isFullNameValid = useMemo(() => formData.fullName.trim() !== '', [formData.fullName]);
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const isStudentIdValid = useMemo(() => formData.studentId.trim() !== '', [formData.studentId]);
  const isSessionValid = useMemo(() => !!formData.session && formData.session !== '', [formData.session]);
  const isPasswordValid = useMemo(() => formData.password.length >= MIN_PASSWORD_LENGTH, [formData.password]);
  const isFormValid = isFullNameValid && isEmailValid && isStudentIdValid && isSessionValid && isPasswordValid;

  // --- Error States ---
  const fullNameError = touched.fullName && !isFullNameValid;
  const emailError = touched.email && !isEmailValid;
  const studentIdError = touched.studentId && !isStudentIdValid;
  const sessionError = touched.session && !isSessionValid;
  const passwordError = touched.password && !isPasswordValid;

  // --- Handlers ---
  const handleChange = useCallback((event) => {
    const { name, value } = event.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
    if (submitError) setSubmitError('');
  }, [submitError]);

  const handleBlur = useCallback((event) => {
    const { name } = event.target;
    setTouched(prevTouched => ({ ...prevTouched, [name]: true }));
  }, []);

  const handleClickShowPassword = useCallback(() => setShowPassword((show) => !show), []);
  const handleMouseDownPassword = useCallback((event) => event.preventDefault(), []);

  const handleSubmit = useCallback(async (event) => {
    event.preventDefault();
    setTouched({ fullName: true, email: true, studentId: true, session: true, password: true });
    setSubmitError('');
    if (!isFormValid) { return; } // Rely on visual errors

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
      navigate('/verify-email', { state: { email: formData.email } });
    } catch (err) {
      console.error("Signup Failed:", err);
      setLoading(false);
      if (err.code === 'auth/email-already-in-use') {
        setSubmitError('This email address is already registered.');
        setTouched(prev => ({ ...prev, email: true }));
      } else if (err.code === 'auth/invalid-email') {
        setSubmitError('The email address format is invalid.');
        setTouched(prev => ({ ...prev, email: true }));
      } else if (err.code === 'auth/weak-password') {
        setSubmitError('Password is too weak (at least 6 characters).');
        setTouched(prev => ({ ...prev, password: true }));
      } else {
        setSubmitError('Failed to create account. An unexpected error occurred.');
      }
    }
  }, [formData, isFormValid, signup, navigate]);

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'var(--color-background, #f4f6f8)' }}>
      <CssBaseline />
      <Box
        component="main"
        sx={{
          flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', p: 2, overflowY: 'auto'
        }}
      >
        <Paper
          elevation={0}
          sx={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              p: { xs: 2.5, sm: 3 }, width: '100%', maxWidth: '400px',
              bgcolor: 'var(--color-surface)', borderRadius: 'var(--border-radius-large)', border: `1px solid var(--color-border)`,
          }}
        >
          <Typography component="h1" variant="h5" sx={{ mb: 3, fontWeight: 500, textAlign: 'center', color: 'var(--color-text-primary)' }}>
             Create Account
          </Typography>
          {submitError && ( <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            <TextField
              variant="outlined" margin="normal" required fullWidth id="fullName" label="Full Name" name="fullName" autoComplete="name" autoFocus
              value={formData.fullName} onChange={handleChange} onBlur={handleBlur} disabled={loading} error={fullNameError} aria-invalid={fullNameError}
            />
            <TextField
              variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email" autoComplete="email"
              value={formData.email} onChange={handleChange} onBlur={handleBlur} disabled={loading} error={emailError} aria-invalid={emailError}
            />
            {/* Student ID and Session Row - ALWAYS side-by-side */}
            <Box sx={{ display: 'flex', flexDirection: 'row', gap: 2, width: '100%' }} >
               <TextField
                  variant="outlined" margin="normal" required fullWidth id="studentId" label="Student ID" name="studentId" autoComplete="off"
                  value={formData.studentId} onChange={handleChange} onBlur={handleBlur} disabled={loading} error={studentIdError} aria-invalid={studentIdError}
               />
               <FormControl variant="outlined" margin="normal" fullWidth required error={sessionError} disabled={loading} >
                 <InputLabel id="session-select-label">Session</InputLabel>
                 <Select labelId="session-select-label" id="session" name="session" value={formData.session} label="Session" onChange={handleChange} onBlur={handleBlur} >
                   <MenuItem value="" disabled><em>Select Session</em></MenuItem>
                   {sessionOptions.map((option) => ( <MenuItem key={option} value={option}> {option} </MenuItem> ))}
                 </Select>
               </FormControl>
            </Box>
            <FormControl variant="outlined" fullWidth required margin="normal" disabled={loading} error={passwordError} >
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password" name="password" type={showPassword ? 'text' : 'password'} label="Password"
                value={formData.password} onChange={handleChange} onBlur={handleBlur} autoComplete="new-password"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton aria-label="toggle password visibility" onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end" disabled={loading}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                }
                aria-invalid={passwordError}
              />
            </FormControl>
            <LoadingButton type="submit" fullWidth variant="contained" loading={loading} disabled={loading || !isFormValid} size="large" sx={{ mt: 3, mb: 2, py: 1.2 }} >
              Sign Up
            </LoadingButton>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" component="span" sx={{ mr: 0.5, color: 'var(--color-text-secondary)' }}> Already have an account? </Typography>
                <Link component={RouterLink} to="/login" variant="body2" fontWeight="medium" sx={{ color: 'var(--color-primary)' }}> Log In </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Copyright sx={{ py: 2 }} />
    </Box>
  );
};
export default Signup;