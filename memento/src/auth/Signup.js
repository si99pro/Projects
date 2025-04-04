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
import {
    TextField, Button, Container, Typography, Alert, Box, Select, MenuItem, InputLabel, FormControl,
    Paper, Stack, CircularProgress, IconButton, InputAdornment, Avatar, Link,
} from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// Constants
const MIN_PASSWORD_LENGTH = 6;
const STUDENT_ID_LENGTH = 7; // Define length as a constant

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

    // *** handleSubmit with CONSOLE LOGS for debugging ***
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("handleSubmit triggered"); // Log start
        setError('');
        setSuccess('');
        console.log("Setting isSubmitting to true");
        setIsSubmitting(true); // Start loading

        try { // Wrap validation potentially throwing parsing errors
            // --- Student ID Validation ---
            if (studentId.length !== STUDENT_ID_LENGTH) {
                console.log("Validation Fail: Student ID Length");
                setError(`Student ID must be exactly ${STUDENT_ID_LENGTH} digits.`);
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
                setError('Invalid Student ID format. Middle section must be "074".');
                setIsSubmitting(false);
                return;
            }

            if (isNaN(prefixYearNum) || prefixYearNum < 16 || prefixYearNum > currentYearLastTwoDigits) {
                console.log("Validation Fail: Invalid Prefix Year", prefixYearNum);
                setError(`Invalid Student ID. Year prefix must be between 16 and ${currentYearLastTwoDigits}.`);
                setIsSubmitting(false);
                return;
            }

            if (isNaN(suffixNum) || suffixNum < 1 || suffixNum > 99) {
                console.log("Validation Fail: Invalid Suffix Number", suffixNum);
                setError('Invalid Student ID. Serial number (last 2 digits) must be between 01 and 99.');
                setIsSubmitting(false);
                return;
            }

            const batch = getBatchFromStudentIdPrefix(prefixStr);
            if (!batch) {
                console.log("Validation Fail: Batch derivation failed unexpectedly for prefix:", prefixStr);
                setError("Internal error deriving batch year. Please check ID prefix.");
                setIsSubmitting(false);
                return;
            }
             console.log("Validation Passed: Batch derived:", batch);

            // --- Other Validations ---
            if (password.length < MIN_PASSWORD_LENGTH) {
                console.log("Validation Fail: Password Length");
                setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
                setIsSubmitting(false);
                return;
            }
            if (!session) {
                console.log("Validation Fail: Session not selected");
                setError('Please select your session.');
                setIsSubmitting(false);
                return;
            }

            // Validate Session Start Year against Derived Batch Year
            const sessionStartYear = parseInt(session.substring(0, 4), 10);
            const batchYearNum = parseInt(batch, 10);
            if (isNaN(sessionStartYear) || isNaN(batchYearNum)) {
                 console.log("Validation Fail: Error parsing session/batch years");
                 setError('Error parsing session/batch year. Please check selection.');
                 setIsSubmitting(false);
                 return;
            }
            if (batchYearNum !== sessionStartYear) {
                console.log("Validation Fail: Batch/Session Mismatch", { batchYearNum, sessionStartYear });
                setError(`The derived batch year (${batch}) does not match the selected session start year (${sessionStartYear}).`);
                setIsSubmitting(false);
                return;
            }
            console.log("Validation Passed: All checks complete.");

            // --- Firebase Interaction ---
            console.log("Attempting Firebase operations...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase Auth user created:", user.uid);

            await sendEmailVerification(user);
            console.log("Verification email sent.");

            const basicInfo = {
                fullName: fullName.trim(), email: user.email, studentId, batch, session,
                profilebg: generateRandomColor(), emailStatus: false, createdAt: new Date(),
            };
            const userData = { basicInfo, roles: ['user'] };

            await setDoc(doc(db, 'users', user.uid), userData);
            console.log("Firestore document written for user:", user.uid);

            setSuccess('Account created! Check your email inbox (and spam folder) to verify your address before logging in.');
            console.log("Success state set.");

        } catch (err) {
            // Log the raw error and the specific message shown to user
            console.error("SIGNUP ERROR CAUGHT:", err);
            let specificError = 'Failed to create account. Please try again.';
            switch (err.code) {
                case 'auth/email-already-in-use': specificError = 'This email address is already registered. Try logging in.'; break;
                case 'auth/invalid-email': specificError = 'Please enter a valid email address.'; break;
                case 'auth/weak-password': specificError = `Password is too weak. It must be at least ${MIN_PASSWORD_LENGTH} characters.`; break;
                case 'auth/operation-not-allowed': specificError = 'Email/password sign up is currently disabled.'; break;
                default: specificError = `An error occurred: ${err.message}`;
            }
            setError(specificError);
             console.log("Error state set:", specificError);

        } finally {
            console.log("Finally block: Setting isSubmitting to false");
            setIsSubmitting(false); // Stop loading regardless of success/error
        }
    };


    // --- Render ---
    return (
        <Container component="main" maxWidth="xs" sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
            </Avatar>
            <Typography component="h1" variant="h5">
                Create Account
            </Typography>

            <Box sx={{ width: '100%', mt: 1, minHeight: '60px' }}>
                {error && <Alert severity="error" sx={{ width: '100%' }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ width: '100%' }}>{success}</Alert>}
            </Box>

            {!success && (
                <Paper elevation={3} sx={{ p: 4, mt: 1, width: '100%' }}>
                    <Box component="form" onSubmit={handleSubmit} noValidate>
                        <Stack spacing={2}>
                            <TextField
                                required
                                fullWidth
                                id="fullName"
                                label="Full Name"
                                name="fullName"
                                autoComplete="name"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <TextField
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={isSubmitting}
                            />
                            <Stack direction="row" spacing={2}>
                                <TextField
                                    required
                                    fullWidth
                                    id="studentId"
                                    label="Student ID (YY074XX)"
                                    name="studentId"
                                    value={studentId}
                                    onChange={handleStudentIdChange} // Use custom handler
                                    disabled={isSubmitting}
                                    type="tel" // Use tel type
                                    error={!!error && error.toLowerCase().includes('student id')}
                                    inputProps={{
                                        maxLength: STUDENT_ID_LENGTH,
                                        inputMode: 'numeric',
                                        pattern: '[0-9]*'
                                    }}
                                />
                                <FormControl fullWidth required disabled={isSubmitting} error={!!error && error.toLowerCase().includes('session')}>
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
                                required
                                fullWidth
                                name="password"
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                id="password"
                                autoComplete="new-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
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
                                sx={{ mt: 2, mb: 1, height: 40 }}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                            </Button>
                        </Stack>
                    </Box>
                </Paper>
             )}

            <Link component={RouterLink} to="/login" variant="body2" sx={{ mt: 3 }}>
                Already have an account? Sign in
            </Link>
        </Container>
    );
}

export default Signup;