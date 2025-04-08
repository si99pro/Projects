/* eslint-disable no-unused-vars */
// src/auth/Signup.js
import React, { useState, useMemo } from 'react';
import { auth, db } from '../firebase';
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// Material UI Components
import {
    TextField, Button, Container, Typography, Alert, Box, Select, MenuItem, InputLabel, FormControl,
    Stack, CircularProgress, IconButton, InputAdornment, Avatar, Link, // MUI Link
    CssBaseline,
    Grid,
} from '@mui/material';
// Icons
import AppRegistrationIcon from '@mui/icons-material/AppRegistration';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Constants
const MIN_PASSWORD_LENGTH = 6;
const STUDENT_ID_LENGTH = 7; // Define length as a constant

// Copyright component
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#">
        Stddb
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function Signup() {
    // --- State ---
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [session, setSession] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    // --- Derived Data & Memoized Values ---
    const currentYear = new Date().getFullYear();
    const currentYearLastTwoDigits = currentYear % 100;

    // --- Helper Functions ---
    const generateRandomColor = () => `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;

    const getBatchFromStudentIdPrefix = (idPrefix) => {
        const prefixYear = parseInt(idPrefix, 10);
        if (isNaN(prefixYear) || prefixYear < 16 || prefixYear > currentYearLastTwoDigits) {
            return null;
        }
        return (2000 + prefixYear).toString();
    };

    const generateSessionOptions = useMemo(() => {
        const startYear = 2016;
        const options = [];
        for (let i = startYear; i <= currentYear; i++) {
            const sessionValue = `${i}-${i + 3}`;
            options.push(<MenuItem key={sessionValue} value={sessionValue}>{sessionValue}</MenuItem>);
        }
        return options;
    }, [currentYear]);

    // --- Event Handlers ---
    const handleClickShowPassword = () => setShowPassword((show) => !show);
    const handleMouseDownPassword = (event) => event.preventDefault();

    const handleStudentIdChange = (event) => {
        const value = event.target.value;
        if (/^[0-9]*$/.test(value) && value.length <= STUDENT_ID_LENGTH) {
            setStudentId(value);
        }
    };

    // --- handleSubmit (Validation order AND Batch/Session Check corrected) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit triggered");
        setError('');
        setSuccess('');
        console.log("Setting isSubmitting to true");
        setIsSubmitting(true);

        let derivedBatch = null; // Variable to store derived batch for later use

        try {
            // --- 1. Full Name Validation ---
            if (!fullName.trim()) {
                console.log("Validation Fail: Full Name empty");
                setError('Please enter your full name.');
                setIsSubmitting(false);
                return;
            }

            // --- 2. Email Validation (Basic Check) ---
            if (!email.trim()) {
                console.log("Validation Fail: Email empty");
                setError('Please enter your email address.');
                setIsSubmitting(false);
                return;
            }
            // Firebase handles more complex format validation later

            // --- 3. Student ID Validations (Grouped) ---
            if (studentId.length !== STUDENT_ID_LENGTH) {
                console.log("Validation Fail: Student ID Length");
                setError(`Invalid student id. It must be exactly ${STUDENT_ID_LENGTH} digits.`);
                setIsSubmitting(false);
                return;
            }

            const prefixStr = studentId.substring(0, 2);
            const middleStr = studentId.substring(2, 5);
            const suffixStr = studentId.substring(5, 7);

            const prefixYearNum = parseInt(prefixStr, 10);
            const suffixNum = parseInt(suffixStr, 10);

            if (middleStr !== '074') {
                console.log("Validation Fail: Middle Section is not 074");
                setError('Invalid student id. Middle section must be "074".');
                setIsSubmitting(false);
                return;
            }

            if (isNaN(prefixYearNum) || prefixYearNum < 16 || prefixYearNum > currentYearLastTwoDigits) {
                console.log("Validation Fail: Invalid Prefix Year", prefixYearNum);
                setError(`Invalid student id. Year prefix must be between 16 and ${currentYearLastTwoDigits}.`);
                setIsSubmitting(false);
                return;
            }

            if (isNaN(suffixNum) || suffixNum < 1 || suffixNum > 99) {
                console.log("Validation Fail: Invalid Suffix Number", suffixNum);
                setError('Invalid student id. Serial number (last 2 digits) must be between 01 and 99.');
                setIsSubmitting(false);
                return;
            }

            // Attempt to derive batch only after basic format checks pass
            derivedBatch = getBatchFromStudentIdPrefix(prefixStr);
            if (!derivedBatch) {
                console.log("Validation Fail: Batch derivation failed unexpectedly for prefix:", prefixStr);
                setError("Invalid student id. Cannot derive batch year from prefix.");
                setIsSubmitting(false);
                return;
            }
            console.log("Validation Passed: Student ID structure and batch derived:", derivedBatch);


            // --- 4. Session Validation ---
            if (!session) {
                console.log("Validation Fail: Session not selected");
                setError('Please select your session.');
                setIsSubmitting(false);
                return;
            }

            // --- 5. Password Validation ---
            if (password.length < MIN_PASSWORD_LENGTH) {
                console.log("Validation Fail: Password Length");
                setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
                setIsSubmitting(false);
                return;
            }

            // --- 6. Batch Year vs Session Start Year Validation ---
            // **** THIS CHECK IS NOW CORRECTLY PLACED AND IMPLEMENTED ****
            // It runs after Student ID and Session are individually validated & batch derived
            const sessionStartYear = parseInt(session.substring(0, 4), 10);
            const batchYearNum = parseInt(derivedBatch, 10); // Use the derived batch stored earlier

            if (isNaN(sessionStartYear) || isNaN(batchYearNum)) {
                 console.log("Validation Fail: Error parsing session/batch years");
                 // Although batchYearNum should be valid if we reached here, check anyway
                 setError('Error parsing session/batch year. Please check selection and student ID.');
                 setIsSubmitting(false);
                 return;
            }

            // The rule: Batch Year must be <= Session Start Year
            // Therefore, the error condition is Batch Year > Session Start Year
            if (batchYearNum > sessionStartYear) {
                console.log("Validation Fail: Batch/Session Mismatch (Batch > Session Start)", { batchYearNum, sessionStartYear });
                // Use the error message consistent with this rule
                setError(`Invalid student id or session.`);
                setIsSubmitting(false);
                return; // Stop if batch is LATER than session start
            }
            // If the code reaches here, it means batchYearNum <= sessionStartYear, which is the intended logic.
            console.log("Validation Passed: Batch/Session relationship ok.");
            console.log("Validation Passed: All checks complete.");


            // --- Firebase Interaction ---
            console.log("Attempting Firebase operations...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase Auth user created:", user.uid);

            await sendEmailVerification(user);
            console.log("Verification email sent.");

            const basicInfo = {
                fullName: fullName.trim(), email: user.email, studentId, batch: derivedBatch, session,
                profilebg: generateRandomColor(),
                emailVerified: false,
                createdAt: new Date(),
            };
            const userData = { basicInfo, roles: ['user'] };

            await setDoc(doc(db, 'users', user.uid), userData);
            console.log("Firestore document written for user:", user.uid);

            setSuccess('Account created! Check your email inbox (and spam folder) to verify your address before logging in.');
            console.log("Success state set.");

        } catch (err) {
            console.error("SIGNUP ERROR CAUGHT:", err);
            let specificError = 'Failed to create account. Please try again.';
            // Check for Firebase specific auth errors first
            switch (err.code) {
                case 'auth/email-already-in-use': specificError = 'This email address is already registered. Try logging in.'; break;
                case 'auth/invalid-email': specificError = 'Please enter a valid email address.'; break; // This catches format errors from Firebase
                case 'auth/weak-password': specificError = `Password is too weak. It must be at least ${MIN_PASSWORD_LENGTH} characters.`; break;
                case 'auth/operation-not-allowed': specificError = 'Email/password sign up is currently disabled.'; break;
                case 'auth/network-request-failed': specificError = 'Network error. Please check your connection.'; break;
                default:
                    // If it's not a known Firebase auth error, check if our specific error state was already set (shouldn't happen ideally with return statements, but good fallback)
                    if (!error) {
                        specificError = `An unexpected error occurred: ${err.message}`;
                    } else {
                        // If a validation error *was* set but somehow didn't return, keep it.
                        specificError = error;
                    }
            }
             // Set the error state only if it hasn't been set by prior validation checks
             // This prevents overwriting specific validation errors with generic Firebase errors unless necessary
            if (!error) { // Only set if no validation error was already caught and set
                 setError(specificError);
             } else {
                 // If a validation error *was* set, log the Firebase error too for debugging, but keep the specific validation error displayed to the user.
                 console.error("Firebase error occurred after a validation error was already set:", err);
             }
            console.log("Error state set (or kept):", error || specificError);


        } finally {
            console.log("Finally block: Setting isSubmitting to false");
            setIsSubmitting(false); // Stop loading regardless of success/error
        }
    };


    // --- Render (No changes needed from previous step) ---
    return (
        <Container component="main" maxWidth="xs">
            <CssBaseline />
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                    <AppRegistrationIcon />
                </Avatar>
                <Typography component="h1" variant="h5" gutterBottom>
                    Create Account
                </Typography>

                <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%', mt: 3 }}>
                    <Stack spacing={2}>

                        {error && !success && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ width: '100%', mb: 1 }}>{success}</Alert>}

                        {!success ? (
                            <>
                                <TextField
                                    required fullWidth id="fullName" label="Full Name" name="fullName"
                                    autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    disabled={isSubmitting} autoFocus
                                    error={!!error && error.toLowerCase().includes('full name')} // Highlight on error
                                />
                                <TextField
                                    required fullWidth id="email" label="Email Address" name="email"
                                    autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    error={!!error && error.toLowerCase().includes('email')}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        required fullWidth id="studentId"
                                        label="Student ID"
                                        name="studentId"
                                        value={studentId}
                                        onChange={handleStudentIdChange}
                                        disabled={isSubmitting}
                                        type="tel"
                                        error={!!error && error.toLowerCase().includes('student id')}
                                        inputProps={{
                                            maxLength: STUDENT_ID_LENGTH,
                                            inputMode: 'numeric',
                                            pattern: '[0-9]*'
                                        }}
                                        sx={{ flexGrow: 1 }}
                                    />
                                    <FormControl fullWidth required disabled={isSubmitting}
                                        error={!!error && (error.toLowerCase().includes('session') || error.toLowerCase().includes('batch year'))}
                                        sx={{ flexGrow: 1 }}
                                        >
                                        <InputLabel id="session-label">Session</InputLabel>
                                        <Select
                                            labelId="session-label"
                                            id="session"
                                            value={session}
                                            onChange={(e) => setSession(e.target.value)}
                                            label="Session"
                                        >
                                            <MenuItem value="" disabled><em>Select Session</em></MenuItem>
                                            {generateSessionOptions}
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <TextField
                                    required fullWidth name="password" label="Password"
                                    type={showPassword ? 'text' : 'password'} id="password"
                                    autoComplete="new-password"
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    error={!!error && error.toLowerCase().includes('password')}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton
                                                    aria-label="toggle password visibility"
                                                    onClick={handleClickShowPassword}
                                                    onMouseDown={handleMouseDownPassword}
                                                    edge="end"
                                                    disabled={isSubmitting}
                                                >
                                                    {showPassword ? <VisibilityOff /> : <Visibility />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 2, mb: 1 }}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                                </Button>
                            </>
                        ) : (
                           <Button
                               variant="outlined"
                               fullWidth
                               onClick={() => navigate('/login')}
                               sx={{ mt: 2 }}
                           >
                               Proceed to Login Page
                           </Button>
                       )}

                        <Grid container justifyContent="flex-end">
                          <Grid item>
                            <Link
                                component={RouterLink}
                                to="/login"
                                variant="body2"
                                sx={{ visibility: success ? 'hidden' : 'visible' }}
                                style={{ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.5 : 1 }}
                            >
                              {'Already have an account? Sign in'}
                            </Link>
                          </Grid>
                        </Grid>

                    </Stack>
                </Box>

            </Box>
            <Copyright sx={{ mt: 8, mb: 4 }} />
        </Container>
    );
}

export default Signup;