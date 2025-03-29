// src/components/Dashboard.js
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Typography, Grid } from '@mui/material';

const Dashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <Container>
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Dashboard
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {currentUser && (
            <Typography variant="body1">
              Logged in as: {currentUser.email}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" onClick={() => navigate('/profile')}>
            View Profile
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="secondary" onClick={() => navigate('/batches')}>
            View Batches
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" color="error" onClick={handleLogout}>
            Log Out
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;