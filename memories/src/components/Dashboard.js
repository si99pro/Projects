// src/components/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import {
    Container,
    Typography,
    Grid,
    Avatar,
    Button,
    CircularProgress,
    Box,
} from '@mui/material';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import { styled } from '@mui/system';

// Custom styled components (Material UI)
const StyledContainer = styled(Container)(({ theme }) => ({
    backgroundColor: '#f4f6f9',
    minHeight: '100vh',
    padding: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
}));

const StyledCard = styled(Box)(({ theme }) => ({
    backgroundColor: theme.palette.background.paper,
    boxShadow: theme.shadows[3],
    borderRadius: theme.spacing(2),
    padding: theme.spacing(3),
    textAlign: 'center',
    marginBottom: theme.spacing(3),
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: theme.spacing(15),
    height: theme.spacing(15),
    margin: theme.spacing(0, 'auto', 2),
    fontSize: '3rem',
}));

const Dashboard = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                if (currentUser) {
                    const db = getFirestore();
                    const userDocRef = doc(db, 'users', currentUser.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        setProfileData(docSnap.data());
                    } else {
                        console.log("No such document!");
                        setProfileData({ fullName: 'User', profileBackgroundColor: '#90caf9' });
                    }
                }
            } catch (error) {
                console.error("Error fetching profile data:", error);
                setProfileData({ fullName: 'User', profileBackgroundColor: '#f44336' });
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [currentUser]);

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/login');
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    const getInitials = (fullName) => {
        if (!fullName) return '';
        return fullName.charAt(0).toUpperCase();
    };

    return (
        <StyledContainer maxWidth="md">
            <div className="container"> {/* Bootstrap container */}
                <div className="row justify-content-center"> {/* Bootstrap row */}
                    <div className="col-md-8"> {/* Bootstrap column */}
                        <StyledCard>
                            {loading ? (
                                <div className="text-center"> {/* Bootstrap text alignment */}
                                    <CircularProgress />
                                    <Typography variant="body1">Loading profile...</Typography>
                                </div>
                            ) : (
                                <Box>
                                    <StyledAvatar
                                        style={{ backgroundColor: profileData?.profileBackgroundColor }}
                                    >
                                        {getInitials(profileData?.fullName)}
                                    </StyledAvatar>
                                    <Typography variant="h5" component="h2" gutterBottom className="text-center"> {/* Bootstrap text alignment */}
                                        Welcome, {profileData?.fullName || 'User'}!
                                    </Typography>
                                    <Typography variant="body1" className="text-center">
                                        Logged in as: {currentUser?.email || 'N/A'}
                                    </Typography>
                                    {/* Display more info */}
                                    <Typography variant="body1" className="text-center">
                                        Student ID: {profileData?.studentId || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" className="text-center">
                                        Batch: {profileData?.batch || 'N/A'}
                                    </Typography>
                                    <Typography variant="body1" className="text-center">
                                        Session: {profileData?.session || 'N/A'}
                                    </Typography>

                                    <Box mt={3} display="flex" justifyContent="space-around"> {/* Material UI Box for spacing */}
                                        <Button variant="contained" color="primary" onClick={() => navigate('/profile')}>
                                            View Profile
                                        </Button>
                                        <Button variant="contained" color="secondary" onClick={() => navigate('/batches')}>
                                            View Batches
                                        </Button>
                                        <Button variant="outlined" color="error" onClick={handleLogout}>
                                            Log Out
                                        </Button>
                                    </Box>
                                </Box>
                            )}
                        </StyledCard>
                    </div>
                </div>
            </div>
        </StyledContainer>
    );
};

export default Dashboard;