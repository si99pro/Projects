// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { Card, Button, Alert, Container, Grid, Box, Avatar, Typography, List, ListItem, ListItemIcon, ListItemText } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from "react-router-dom";
import { db } from '../firebase'; // Import db from firebase
import { doc, getDoc } from "firebase/firestore"; // Import Firestore functions
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
// Material UI Icons
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import DashboardIcon from '@mui/icons-material/Dashboard';

// Default profile photo URL (replace with your image)
const DEFAULT_PROFILE_PHOTO = "https://via.placeholder.com/150";

export default function Dashboard() {
    const [error, setError] = useState("");
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);

    useEffect(() => {
        async function fetchUserData() {
            try {
                if (currentUser) {
                    const userRef = doc(db, "users", currentUser.uid);
                    const docSnap = await getDoc(userRef);

                    if (docSnap.exists()) {
                        setUserData(docSnap.data());
                    } else {
                        setError("Could not load user data.");
                        console.log("No such document!");
                    }
                }
            } catch (e) {
                setError("Error fetching user data: " + e.message);
            }
        }

        fetchUserData();
    }, [currentUser]);

    async function handleLogout() {
        setError("");

        try {
            await logout();
            navigate('/login');
        } catch {
            setError("Failed to log out");
        }
    }

    return (
        <Container maxWidth="md">
            <Grid container spacing={3}>
                {/* Sidebar */}
                <Grid item xs={12} md={3}>
                    <Box sx={{
                        bgcolor: 'background.paper',
                        boxShadow: 1,
                        borderRadius: 2,
                        p: 2,
                    }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                            <Avatar alt="Profile" src={DEFAULT_PROFILE_PHOTO} sx={{ width: 80, height: 80, mb: 1 }} />
                            <Typography variant="h6">
                                {userData ? userData.fullName : "Loading..."}
                            </Typography>
                        </Box>
                        <List>
                            <ListItem button component={Link} to="/" key="dashboard">
                                <ListItemIcon><DashboardIcon /></ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListItem button component={Link} to="/update-profile" key="update">
                                <ListItemIcon><SettingsIcon /></ListItemIcon>
                                <ListItemText primary="Update Profile" />
                            </ListItem>
                            <ListItem button onClick={handleLogout} key="logout">
                                <ListItemIcon><ExitToAppIcon /></ListItemIcon>
                                <ListItemText primary="Log Out" />
                            </ListItem>
                        </List>
                    </Box>
                </Grid>

                {/* Content */}
                <Grid item xs={12} md={9}>
                    <Card>
                        <Card.Body>
                            <Typography variant="h4" className="text-center mb-4">
                                Profile
                            </Typography>
                            {error && <Alert variant="danger">{error}</Alert>}

                            {userData ? (
                                <>
                                    <Typography><strong>Full Name:</strong> {userData.fullName}</Typography>
                                    <Typography><strong>Email:</strong> {userData.email}</Typography>
                                    <Typography><strong>Student ID:</strong> {userData.studentId}</Typography>
                                    <Typography><strong>Session:</strong> {userData.session}</Typography>
                                </>
                            ) : (
                                <Typography>Loading user data...</Typography>
                            )}
                        </Card.Body>
                    </Card>
                </Grid>
            </Grid>
        </Container>
    );
}