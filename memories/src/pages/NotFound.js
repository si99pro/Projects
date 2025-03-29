// src/pages/NotFound.js
import React from 'react';
import { Container, Typography, Grid } from '@mui/material';

const NotFound = () => {
  return (
    <Container>
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            404 - Not Found
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body1">
            The page you are looking for does not exist.
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default NotFound;