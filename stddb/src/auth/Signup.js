/* eslint-disable no-unused-vars */
// src/auth/Signup.js
import React, { useState, useMemo } from 'react';
import { auth, db } from '../firebase'; // Ensure db is correctly exported from your firebase config
import {
    createUserWithEmailAndPassword,
    sendEmailVerification,
} from 'firebase/auth';
import {
    doc,
    setDoc,
    collection, // Added for querying
    query,      // Added for querying
    where,      // Added for querying
    getDocs,    // Added for executing query
    limit       // Added for query efficiency
} from 'firebase/firestore';
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
        // Allow current year + 1 as prefix to handle admissions starting before the year officially begins
        if (isNaN(prefixYear) || prefixYear < 16 || prefixYear > currentYearLastTwoDigits + 1) {
             return null;
        }
        return (2000 + prefixYear).toString();
    };

    const generateSessionOptions = useMemo(() => {
        const startYear = 2016;
        // Allow sessions up to current year + 3 (for a 3-year course duration possibility)
        const endYear = currentYear + 3;
        const options = [];
        for (let i = startYear; i <= endYear; i++) {
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
        // Allow only digits and enforce max length
        if (/^[0-9]*$/.test(value) && value.length <= STUDENT_ID_LENGTH) {
            setStudentId(value);
        }
    };

    // --- handleSubmit (Includes Student ID Uniqueness Check) ---
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
                setIsSubmitting(false); return;
            }

            // --- 2. Email Validation (Basic Check) ---
            if (!email.trim()) {
                console.log("Validation Fail: Email empty");
                setError('Please enter your email address.');
                setIsSubmitting(false); return;
            }
            // More complex format checked by Firebase later

            // --- 3. Student ID Validations (Local Format Checks) ---
            if (studentId.length !== STUDENT_ID_LENGTH) {
                console.log("Validation Fail: Student ID Length");
                setError(`Invalid student id. It must be exactly ${STUDENT_ID_LENGTH} digits.`);
                setIsSubmitting(false); return;
            }

            const prefixStr = studentId.substring(0, 2);
            const middleStr = studentId.substring(2, 5);
            const suffixStr = studentId.substring(5, 7);

            const prefixYearNum = parseInt(prefixStr, 10);
            const suffixNum = parseInt(suffixStr, 10);

            if (middleStr !== '074') {
                console.log("Validation Fail: Middle Section is not 074");
                setError('Invalid student id. Middle section must be "074".');
                setIsSubmitting(false); return;
            }

             const maxAllowedPrefix = currentYearLastTwoDigits + 1; // Allow next year's prefix
            if (isNaN(prefixYearNum) || prefixYearNum < 16 || prefixYearNum > maxAllowedPrefix) {
                 console.log("Validation Fail: Invalid Prefix Year", prefixYearNum);
                 setError(`Invalid student id. Year prefix must be between 16 and ${maxAllowedPrefix}.`);
                 setIsSubmitting(false); return;
             }

            if (isNaN(suffixNum) || suffixNum < 1 || suffixNum > 99) {
                console.log("Validation Fail: Invalid Suffix Number", suffixNum);
                setError('Invalid student id. Serial number (last 2 digits) must be between 01 and 99.');
                setIsSubmitting(false); return;
            }

            // Attempt to derive batch only after basic format checks pass
            derivedBatch = getBatchFromStudentIdPrefix(prefixStr);
            if (!derivedBatch) {
                // This check should be redundant given the prefix validation above, but keep as a safeguard
                console.log("Validation Fail: Batch derivation failed unexpectedly for prefix:", prefixStr);
                setError("Invalid student id. Cannot derive batch year from prefix.");
                setIsSubmitting(false); return;
            }
            console.log("Validation Passed: Student ID structure and batch derived:", derivedBatch);

            // --- 4. Session Validation ---
            if (!session) {
                console.log("Validation Fail: Session not selected");
                setError('Please select your session.');
                setIsSubmitting(false); return;
            }

            // --- 5. Password Validation ---
            if (password.length < MIN_PASSWORD_LENGTH) {
                console.log("Validation Fail: Password Length");
                setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long.`);
                setIsSubmitting(false); return;
            }

            // --- 6. Batch Year vs Session Start Year Validation ---
            const sessionStartYear = parseInt(session.substring(0, 4), 10);
            const batchYearNum = parseInt(derivedBatch, 10);

            if (isNaN(sessionStartYear) || isNaN(batchYearNum)) {
                 console.log("Validation Fail: Error parsing session/batch years");
                 setError('Error parsing session/batch year. Please check selection and student ID.');
                 setIsSubmitting(false); return;
            }

            // Rule: Batch Year <= Session Start Year
            if (batchYearNum > sessionStartYear) {
                console.log("Validation Fail: Batch/Session Mismatch (Batch > Session Start)", { batchYearNum, sessionStartYear });
                setError(`Student ID batch year (${batchYearNum}) cannot be later than the session start year (${sessionStartYear}). Please check your entries.`);
                setIsSubmitting(false); return;
            }
            console.log("Validation Passed: Batch/Session relationship ok.");
            console.log("Validation Passed: All local checks complete.");


            // --- 7. Check Student ID Uniqueness in Firestore ---
            console.log("Checking Firestore for existing student ID:", studentId);
            const usersRef = collection(db, 'users');
            // Query where the nested field 'basicInfo.studentId' matches
            // **IMPORTANT**: Ensure your Firestore data structure has studentId inside a 'basicInfo' map/object
            const studentIdQuery = query(
                usersRef,
                where('basicInfo.studentId', '==', studentId),
                limit(1) // Only need to know if at least one exists
            );
            const querySnapshot = await getDocs(studentIdQuery);

            if (!querySnapshot.empty) {
                // Student ID already exists
                console.log("Validation Fail: Student ID already exists in Firestore.");
                setError('This Student ID is already registered. Please use a different ID or proceed to login.');
                setIsSubmitting(false);
                return; // Stop the signup process
            }
            console.log("Validation Passed: Student ID is unique in Firestore.");
            // --- End of Uniqueness Check ---


            // --- 8. Firebase Interaction (Only if all checks passed) ---
            console.log("Attempting Firebase Authentication and Data Storage...");
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            console.log("Firebase Auth user created:", user.uid);

            // Send verification email (Doesn't block the rest of the process)
            sendEmailVerification(user)
                .then(() => console.log("Verification email sending initiated."))
                .catch(err => console.error("Error sending verification email:", err));

            // Prepare user data object
            const basicInfo = {
                fullName: fullName.trim(),
                email: user.email,
                studentId: studentId, // Use the validated & unique student ID
                batch: derivedBatch,  // Use the derived batch
                session: session,     // Use the selected session
                profilebg: generateRandomColor(),
                emailVerified: user.emailVerified, // Reflect initial state from auth
                createdAt: new Date().toISOString(), // Use ISO string for consistency
            };
            const userData = {
                 basicInfo: basicInfo,
                 roles: ['user'] // Assign default role
            };

            // Store user data in Firestore
            await setDoc(doc(db, 'users', user.uid), userData);
            console.log("Firestore document written for user:", user.uid);

            setSuccess('Account created successfully! Please check your email inbox (and spam folder) to verify your address before logging in.');
            console.log("Success state set.");
            // Clear form fields after success? Optional, but can be good UX.
            // setFullName(''); setEmail(''); setStudentId(''); setSession(''); setPassword('');

        } catch (err) {
            console.error("SIGNUP PROCESS ERROR:", err); // Log the full error object
            let specificError = 'Failed to create account. Please try again.';

            // Handle Firebase Auth specific errors
            if (err.code) {
                switch (err.code) {
                    case 'auth/email-already-in-use':
                        specificError = 'This email address is already registered. Try logging in instead.';
                        break;
                    case 'auth/invalid-email':
                        specificError = 'The email address is not valid. Please check the format.';
                        break;
                    case 'auth/weak-password':
                        specificError = `Password is too weak. It must be at least ${MIN_PASSWORD_LENGTH} characters long.`;
                        break;
                    case 'auth/operation-not-allowed':
                        specificError = 'Email/password sign up is currently disabled by the administrator.';
                        break;
                    case 'auth/network-request-failed':
                        specificError = 'Network error. Please check your internet connection and try again.';
                         break;
                     // Add more specific Firebase Auth error codes if needed
                    default:
                        // Check if it's possibly a Firestore error (e.g., permission denied during setDoc)
                        if (err.message && (err.message.toLowerCase().includes('firestore') || err.message.toLowerCase().includes('permission'))) {
                             specificError = 'Failed to save user data. Please try again later or contact support.';
                             console.error("Potential Firestore error details:", err); // Log details
                         } else if (!error) { // Only set if no prior *validation* error was already displayed
                             specificError = `An unexpected error occurred: ${err.message || err.code || 'Unknown error'}`;
                         } else {
                             // If a validation error was already set, keep it, but log the backend error.
                             specificError = error; // Keep the specific validation message
                             console.error("Backend error occurred after validation failure:", err);
                         }
                         break; // Added break for default case
                 }
             } else if (error) {
                 // If a validation error was already set before the catch block, keep it.
                 specificError = error;
             }

             // Set the error state only if it hasn't been set by prior validation checks OR if it's a new backend error
            if (!error || (error && specificError !== error)) {
                 setError(specificError);
             }
            console.log("Error state updated to:", specificError);

        } finally {
            console.log("Finally block: Setting isSubmitting to false");
            setIsSubmitting(false); // Ensure loading indicator stops
        }
    };


    // --- Render ---
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

                        {/* Display Error or Success Message */}
                        {error && !success && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ width: '100%', mb: 1 }}>{success}</Alert>}

                        {/* Show Form Fields only if signup is not yet successful */}
                        {!success ? (
                            <>
                                <TextField
                                    required fullWidth id="fullName" label="Full Name" name="fullName"
                                    autoComplete="name" value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    disabled={isSubmitting} autoFocus
                                    error={!!error && error.toLowerCase().includes('full name')}
                                />
                                <TextField
                                    required fullWidth id="email" label="Email Address" name="email"
                                    autoComplete="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    disabled={isSubmitting}
                                    error={!!error && (error.toLowerCase().includes('email') || error.toLowerCase().includes('already registered'))}
                                />
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                                    <TextField
                                        required fullWidth id="studentId"
                                        label="Student ID"
                                        name="studentId"
                                        value={studentId}
                                        onChange={handleStudentIdChange}
                                        disabled={isSubmitting}
                                        type="tel" // Use tel for numeric keyboard on mobile
                                        error={!!error && (error.toLowerCase().includes('student id') || error.toLowerCase().includes('already registered'))}
                                        inputProps={{
                                            maxLength: STUDENT_ID_LENGTH,
                                            inputMode: 'numeric', // Hint for numeric input
                                            pattern: '[0-9]*'     // Pattern validation (optional fallback)
                                        }}
                                        // helperText prop removed
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
                                            label="Session" // Required for the label to float correctly
                                        >
                                            <MenuItem value="" disabled><em>Select Session</em></MenuItem>
                                            {generateSessionOptions}
                                        </Select>
                                    </FormControl>
                                </Stack>
                                <TextField
                                    required fullWidth name="password" label="Password"
                                    type={showPassword ? 'text' : 'password'} id="password"
                                    autoComplete="new-password" // Hint for password managers
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    disabled={isSubmitting}
                                    error={!!error && error.toLowerCase().includes('password')}
                                    // helperText prop removed
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
                                    sx={{ mt: 2, mb: 1, height: 40 }} // Consistent height
                                    disabled={isSubmitting || !fullName || !email || studentId.length !== STUDENT_ID_LENGTH || !session || password.length < MIN_PASSWORD_LENGTH } // Basic client-side disable
                                >
                                    {isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                                </Button>
                            </>
                        ) : (
                           // Show Button to navigate to Login page after success
                           <Button
                               variant="outlined"
                               fullWidth
                               onClick={() => navigate('/login')} // Navigate using hook
                               sx={{ mt: 2 }}
                           >
                               Proceed to Login Page
                           </Button>
                       )}

                        {/* Link to Login Page (Hidden on Success) */}
                        <Grid container justifyContent="flex-end">
                          <Grid item>
                            <Link
                                component={RouterLink} // Use React Router Link for navigation
                                to="/login"
                                variant="body2"
                                sx={{ visibility: success ? 'hidden' : 'visible' }} // Hide when success message shown
                                style={{ pointerEvents: isSubmitting ? 'none' : 'auto', opacity: isSubmitting ? 0.5 : 1 }} // Disable during submission
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