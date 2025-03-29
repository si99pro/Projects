// src/components/Auth/ForgotPassword.js
import React, { useState } from 'react';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Link } from 'react-router-dom';
import { TextField, Button, Alert, Grid, Container, Typography } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage('');
      setError('');
      setLoading(true);
      const auth = getAuth();
      await sendPasswordResetEmail(auth, email);
      setMessage('Check your inbox for further instructions');
    } catch (err) {
      setError('Failed to reset password: ' + err.message);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Reset Password
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {error && <Alert severity="error">{error}</Alert>}
          {message && <Alert severity="success">{message}</Alert>}
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
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
            >
              Reset Password
            </Button>
          </form>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            <Link to="/login">Log In</Link>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default ForgotPassword;