// src/components/Auth/Login.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Grid, Container, Typography } from '@mui/material';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, currentUser, sendVerificationMail } = useAuth();
    const navigate = useNavigate();

    const handleResendVerification = async () => {
        setError('');
        setLoading(true);
        try {
            if (currentUser) {
                await sendVerificationMail(currentUser);
                navigate('/verify-email');
            }
        } catch (err) {
            setError("Failed to resend verification email. Please try again later.");
        }
        finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError('');
            setLoading(true);
            const user = await login(email, password);
            // After login success, *wait* for currentUser to be updated
            // In this case, you do not need to get current user and just navigate

            // Now that you already get it from useAuth, check and navigate.

              navigate('/dashboard');


        } catch (err) {
            // Check specific error for unverified email
            if (err.message === 'Please verify your email before logging in.') {
                setError(
                    <>
                        Failed to sign in: Please verify your email before logging in.
                        <Link to="#" onClick={handleResendVerification} style={{marginLeft: '5px'}}>
                            Resend Verification Email
                        </Link>
                    </>
                );
                navigate('/verify-email');
            }
            else {
                setError('Failed to sign in: ' + err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Log In
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {error && <Alert severity="error">{error}</Alert>}
                </Grid>
                <Grid item xs={12}>
                    <form onSubmit={handleSubmit}>
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
                            Log In
                        </Button>
                    </form>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        Need an account? <Link to="/signup">Sign Up</Link>
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Login;