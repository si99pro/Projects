import React, { useEffect } from 'react'; // Removed useState
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext'; // Correct import path
import NotificationForm from '../components/NotificationForm';

import {
    Container,
    Paper,
    Typography,
    Box,
    CircularProgress,
    Alert,
    AlertTitle,
    Divider,
} from '@mui/material';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';

function Admin() {
    // Destructure 'isAdmin' directly from the context
    const { user, isAdmin, authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        // Redirect if auth check is complete and there's no user
        if (!authLoading && !user) {
            console.log("Admin Page: Auth complete, no user. Navigating to login.");
            navigate('/login');
        } else if (!authLoading && user) {
            // Log status once loading is done and user exists (isAdmin comes from context)
            console.log(`Admin Page: Auth complete. User: ${user.uid}, IsAdmin from Context: ${isAdmin}`);
        } else {
            // Still loading
            // console.log("Admin Page: Auth loading..."); // Optional log
        }
        // Dependency array uses the actual values from the context
    }, [user, isAdmin, authLoading, navigate]);

    // --- Loading State ---
    // Show loading indicator ONLY while AuthContext says it's loading
    if (authLoading) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Admin Panel...</Typography>
            </Container>
        );
    }

    // --- Render based on Admin status (once loading is complete) ---
    // If authLoading is false, 'isAdmin' from the context holds the correct value.
    return (
        <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
            <Paper elevation={3} sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <AdminPanelSettingsIcon color="primary" sx={{ mr: 1.5, fontSize: '2rem' }} />
                    <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 0 }}>
                        Admin Panel
                    </Typography>
                </Box>
                <Divider sx={{ mb: 3 }} />

                {/* Use 'isAdmin' directly from the context */}
                {isAdmin ? (
                    <>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                            Use the form below to send notifications to users. Select the target audience and category appropriately.
                        </Typography>
                        <NotificationForm />
                    </>
                ) : (
                    // This correctly shows if context determines user is not admin OR
                    // if loading is done but user somehow became null before navigation (edge case)
                    <Alert severity="error">
                        <AlertTitle>Access Denied</AlertTitle>
                        You do not have permission to view this page. Please ensure you are logged in with an administrator account.
                    </Alert>
                )}
            </Paper>
        </Container>
    );
}

export default Admin;