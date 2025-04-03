// src/pages/Admin.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
// --- CORRECTED IMPORT PATH FOR useAuth ---
import { useAuth } from '../auth/AuthContext';
// --- END CORRECTION ---
import NotificationForm from '../components/NotificationForm'; // Assuming this will be updated separately

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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Icon for visual cue

function Admin() {
    // Use the correctly imported useAuth hook
    const { user, roles, authLoading } = useAuth(); // Destructure 'authLoading' as provided by context
    const navigate = useNavigate();
    const [isCheckingRoles, setIsCheckingRoles] = useState(true); // Separate state for role check completion
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Redirect if not logged in (and auth state is determined)
        if (!authLoading && !user) {
            console.log("Admin Page: No user found, navigating to login.");
            navigate('/login');
            return; // Stop further execution in this effect run
        }

        // Once auth loading is done and user exists, check roles
        if (!authLoading && user) {
            console.log("Admin Page: User found, checking roles:", roles);
            // The roles variable from useAuth now directly reflects userProfile.roles
            // It could be undefined initially, null if profile doesn't exist, or an array.
            if (roles === undefined && authLoading) { // Check if still waiting on initial load
                console.log("Admin Page: Auth/Roles still loading...");
                setIsCheckingRoles(true); // Keep checking
            } else {
                 // Roles *should* be available now (even if null or empty array)
                const hasAdminRole = Array.isArray(roles) && roles.includes('admin');
                console.log("Admin Page: Has admin role?", hasAdminRole);
                setIsAdmin(hasAdminRole);
                setIsCheckingRoles(false); // Role check is complete
            }
        } else {
            // Still loading auth or no user yet
            setIsCheckingRoles(true);
        }

    }, [user, roles, authLoading, navigate]);

    // --- Loading State ---
    // Show loading indicator while auth is loading OR roles are being definitively checked
    if (authLoading || isCheckingRoles) {
        return (
            <Container maxWidth="sm" sx={{ mt: 4, textAlign: 'center' }}>
                <CircularProgress />
                <Typography sx={{ mt: 2 }}>Loading Admin Panel...</Typography>
            </Container>
        );
    }

    // --- Render based on Admin status ---
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

                {isAdmin ? (
                    <>
                        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
                            Use the form below to send notifications to users. Select the target audience and category appropriately.
                        </Typography>
                        {/* The NotificationForm will contain the new dropdowns */}
                        <NotificationForm />
                    </>
                ) : (
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