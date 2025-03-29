// src/components/Auth/VerifyEmail.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Container, Typography, Button, Alert, Grid } from '@mui/material';

const VerifyEmail = () => {
    const { currentUser, logout, sendVerificationMail, loading, setLoading } = useAuth();
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [resendDisabled, setResendDisabled] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        let intervalId;

        if (resendTimer > 0 && resendDisabled) {
            intervalId = setInterval(() => {
                setResendTimer(prevTimer => prevTimer - 1);
            }, 1000);
        } else {
            clearInterval(intervalId);
            setResendDisabled(false);
        }
        const checkEmailVerification = async () => {
            // After the component mounts, check if the current user is defined
            if (currentUser) {
                // Force a refresh of the user object to ensure emailVerified is up-to-date
                try {
                    await currentUser.reload();
                    if (currentUser.emailVerified) {
                        // User is now verified, redirect to the dashboard
                        navigate('/dashboard');
                    }
                } catch (reloadError) {
                    console.error("Error during user reload:", reloadError);
                    setError("Failed to refresh user info. Please try again.");
                }

            }
        };

        //if user loged out, redirect to login page
        if (!currentUser && !loading) {
            navigate('/login'); // Redirect to login if no user.
        }
        else if (currentUser && currentUser.emailVerified) {
            navigate('/dashboard'); // Redirect if already verified.
        }
        // Start the check email verification immediately with interval
        intervalId = setInterval(checkEmailVerification, 3000);
        return () => {
            clearInterval(intervalId);
        };
    }, [currentUser, navigate, resendTimer, resendDisabled, logout, loading]);

    const handleResendVerification = async () => {
        setLoading(true);
        setError('');
        try {
            // Resend verification email using Firebase
            if (currentUser) {
                await sendVerificationMail(currentUser);
                setResendTimer(60);
                setResendDisabled(true);
                console.log("resent");
            }
        } catch (error) {
            setError('Failed to resend verification email: ' + error.message);
            console.error('Resend verification error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        setError('');
        try {
            await logout();
            navigate('/'); // Or navigate to login page if you prefer
        } catch (error) {
            setError('Failed to log out: ' + error.message);
            console.error('Logout error:', error);
        }
    };


    // Check loading state before rendering content.
    if (loading) {
        return (
            <Container maxWidth="sm">
                <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '90vh' }}>
                    <Grid item xs={12}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Loading...
                        </Typography>
                    </Grid>
                </Grid>
            </Container>
        );
    }

    // If no user, go back to login.
    if (!currentUser) {
        return (
            <Container maxWidth="sm">
                <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '90vh' }}>
                    <Grid item xs={12}>
                        <Typography variant="h4" component="h1" gutterBottom>
                            Please Log In
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Typography>
                            You need to be logged in to view this page.
                        </Typography>
                    </Grid>
                    <Grid item xs={12}>
                        <Button component={Link} to="/login" variant="contained" color="primary">
                            Log In
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        );
    }


    return (
        <Container maxWidth="sm">
            <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '90vh' }}>
                <Grid item xs={12}>
                    <Typography variant="h4" component="h1" gutterBottom>
                        Verify Your Email
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    {error && <Alert severity="error">{error}</Alert>}
                </Grid>
                <Grid item xs={12}>
                    <Typography>
                        A verification email has been sent to <b>{currentUser.email}</b>. Please check your inbox (and spam folder!) and click on the link to verify your account.
                    </Typography>
                    <Typography>
                        Once verified, you will be redirected to the dashboard.
                    </Typography>
                </Grid>
                <Grid item xs={12}>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleResendVerification}
                        disabled={loading || resendDisabled}
                    >
                        {loading ? 'Resending...' : `Resend Email (${resendDisabled ? resendTimer : 'Resend'})`}
                    </Button>
                </Grid>
                <Grid item xs={12}>
                    <Typography variant="body2">
                        <Button color="inherit" onClick={handleLogout}>Logout</Button>
                        |
                        <Link to="/help" style={{ marginLeft: '5px' }}>Help</Link>
                    </Typography>
                </Grid>
            </Grid>
        </Container>
    );
};

export default VerifyEmail;