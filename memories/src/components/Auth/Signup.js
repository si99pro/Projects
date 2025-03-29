// src/components/Auth/Signup.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
    TextField,
    Button,
    Alert,
    Grid,
    Container,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';

// Styled Select Component
const StyledSelect = styled(Select)(({ theme }) => ({
    width: '100%', // important
    minWidth: '120px',// to ensure it does not collapse
}));

const Signup = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [studentId, setStudentId] = useState('');
    const [session, setSession] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signup, currentUser, logout } = useAuth(); // use user here
    const navigate = useNavigate();

    useEffect(() => {
        // Check if user is verified and redirect if necessary
        const handleVerificationStatus = () => {
            if (currentUser) {
                if (currentUser.emailVerified) {
                    navigate('/dashboard'); // Redirect to dashboard if verified
                } else {
                   navigate('/verify-email'); // Redirect to verification page
                }
            }
        };

        handleVerificationStatus(); // Call the function on initial load

    }, [currentUser, navigate, logout]); // Add logout to dependencies


    const getBatchFromStudentId = (studentId) => {
        if (studentId.length === 7 && studentId.startsWith('16')) {
            return '2016';
        } else if (studentId.length === 7 && studentId.startsWith('17')) {
            return '2017';
        } else if (studentId.length === 7 && studentId.startsWith('18')) {
            return '2018';
        } else if (studentId.length === 7 && studentId.startsWith('19')) {
            return '2019';
        } else if (studentId.length === 7 && studentId.startsWith('20')) {
            return '2020';
        }
        else if (studentId.length === 7 && studentId.startsWith('21')) {
            return '2021';
        }
        else if (studentId.length === 7 && studentId.startsWith('22')) {
            return '2022';
        }
        else if (studentId.length === 7 && studentId.startsWith('23')) {
            return '2023';
        }
        else if (studentId.length === 7 && studentId.startsWith('24')) {
            return '2024';
        }
        else if (studentId.length === 7 && studentId.startsWith('25')) {
            return '2025';
        } else {
            return null;
        }
    };


    const handleSubmit = async (e) => {
        e.preventDefault();

        if (studentId.length !== 7) {
            return setError("Student ID must be 7 digits.");
        }

        const batch = getBatchFromStudentId(studentId);

        if (!batch) {
            return setError("Could not determine batch from Student ID.  ID must start with 16, 17, 18, 19, 20, 21, 22, 23, 24, or 25");
        }
        const studentIdPrefix = parseInt(studentId.substring(0, 2));
        // const sessionSuffix = parseInt(session.substring(2, 4));
        const sessionStartYear = parseInt(session); // Get starting year

        if (studentIdPrefix > parseInt(session.substring(2,4))) {
            return setError("Make sure that you have type correct ID and Session.");
        }

        try {
            setError('');
            setLoading(true);

            const basicInfo = {
                fullName,
                studentId,
                session, // Store as "2016 - 2019"
                batch,
                email,
            };
            // We no longer need to store displayYear here

            await signup(email, password, basicInfo)
            navigate('/verify-email'); // Redirect to verification page

        } catch (err) {
            setError('Failed to create an account: ' + err.message);
        } finally {
            setLoading(false);
        }
    };


    return (
        <Container maxWidth="sm">
            <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '90vh' }}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Sign Up
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {error && <Alert severity="error">{error}</Alert>}
                </Grid>
                <Grid item xs={12}>
                    <form onSubmit={handleSubmit}>
                        <TextField
                            label="Full Name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />

                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Student ID"
                                    value={studentId}
                                    onChange={(e) => setStudentId(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="normal" required>
                                    <InputLabel id="session-label">Session</InputLabel>
                                    <StyledSelect // using styled select
                                        labelId="session-label"
                                        id="session"
                                        value={session}
                                        label="Session"
                                        onChange={(e) => setSession(e.target.value)}
                                        fullWidth

                                    >
                                        {Array.from({ length: 10 }, (_, i) => 2016 + i).map((year) => {
                                            const displayYear = `${year} - ${year + 3}`;
                                            return (
                                                <MenuItem key={year} value={displayYear}>
                                                    {displayYear}
                                                </MenuItem>
                                            );
                                        })}
                                    </StyledSelect>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <TextField
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />
                        <TextField
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            fullWidth
                            margin="normal"
                            required
                        />

                        <Button
                            variant="contained"
                            color="primary"
                            type="submit"
                            fullWidth
                            disabled={loading}
                        >
                            Sign Up
                        </Button>
                    </form>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        Already have an account? <Link to="/login">Log In</Link>
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Signup;