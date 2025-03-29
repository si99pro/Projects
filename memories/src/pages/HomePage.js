// src/pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Container, Typography, Button, Grid } from '@mui/material';

const HomePage = () => {
  return (
    <Container>
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h3" component="h1" gutterBottom>
            Welcome to Memories!
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            A place to store and share memories of your university department batches.
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" component={Link} to="/login">
            Log In
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button variant="outlined" color="primary" component={Link} to="/signup">
            Sign Up
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default HomePage;