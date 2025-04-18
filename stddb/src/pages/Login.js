// src/pages/Login.js
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
// FormHelperText not needed for field validation display

// MUI Icons
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Shared Component
import Copyright from '../components/Copyright';

// --- Constants ---
const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Login Page Component - Final Version
 * Centered, styled consistently, consistent width, no helper text
 */
const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // --- State ---
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitError, setSubmitError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // --- Validation ---
  const isEmailValid = useMemo(() => EMAIL_REGEX.test(formData.email), [formData.email]);
  const isPasswordValid = useMemo(() => formData.password.length >= MIN_PASSWORD_LENGTH, [formData.password]);
  const emailError = touched.email && !isEmailValid;
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
    setTouched({ email: true, password: true });
    if (!isEmailValid || !isPasswordValid) { return; } // Rely on visual errors
    setSubmitError('');
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      navigate('/');
    } catch (err) {
      console.error("Login Failed:", err);
      setLoading(false);
      if (err.message === "EMAIL_NOT_VERIFIED") {
        navigate('/verify-email', { state: { email: formData.email } });
        return;
      }
      let friendlyError = 'Failed to log in. Please check credentials.';
      if (err.code) {
          switch (err.code) {
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential': friendlyError = 'Incorrect email or password provided.'; break;
            case 'auth/invalid-email': friendlyError = 'The email address format is invalid.'; break;
            case 'auth/too-many-requests': friendlyError = 'Access temporarily disabled due to too many failed attempts.'; break;
            case 'auth/user-disabled': friendlyError = 'This account has been disabled.'; break;
            default: friendlyError = 'An unexpected error occurred. Please try again.'; break;
          }
      }
      setSubmitError(friendlyError);
    }
  }, [formData.email, formData.password, isEmailValid, isPasswordValid, login, navigate]);

  const isButtonDisabled = loading || !isEmailValid || !isPasswordValid;

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
             Log In
          </Typography>
          {submitError && ( <Alert severity="error" variant="outlined" sx={{ width: '100%', mb: 2 }}> {submitError} </Alert> )}
          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 1 }}>
            <TextField
              variant="outlined" margin="normal" required fullWidth id="email" label="Email Address" name="email" type="email"
              autoComplete="email" autoFocus value={formData.email} onChange={handleChange} onBlur={handleBlur} disabled={loading}
              error={emailError} aria-invalid={emailError}
            />
            <FormControl variant="outlined" fullWidth required margin="normal" disabled={loading} error={passwordError}>
              <InputLabel htmlFor="password">Password</InputLabel>
              <OutlinedInput
                id="password" name="password" label="Password" type={showPassword ? 'text' : 'password'}
                value={formData.password} onChange={handleChange} onBlur={handleBlur} autoComplete="current-password"
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
            <Box sx={{ width: '100%', textAlign: 'right', my: 1 }}>
              <Link component={RouterLink} to="/forgot-password" variant="body2" sx={{ color: 'var(--color-primary)' }}> Forgot Password? </Link>
            </Box>
            <LoadingButton type="submit" fullWidth variant="contained" loading={loading} disabled={isButtonDisabled} size="large" sx={{ mt: 2, mb: 2, py: 1.2 }}>
              Log In
            </LoadingButton>
            <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Typography variant="body2" component="span" sx={{ mr: 0.5, color: 'var(--color-text-secondary)' }}> Don't have an account? </Typography>
                <Link component={RouterLink} to="/signup" variant="body2" fontWeight="medium" sx={{ color: 'var(--color-primary)' }}> Sign Up </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
      <Copyright sx={{ py: 2 }} />
    </Box>
  );
};
export default Login;