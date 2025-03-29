// src/components/Auth/Signup.js
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Alert,
  Grid,
  Container,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { styled } from '@mui/system';

// Styled Select Component
const StyledSelect = styled(Select)(({ theme }) => ({
  width: '100%', // important
  // Add any other styles you want to customize
}));


const Signup = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [session, setSession] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth(); // Make sure signup accepts the new parameters
  const navigate = useNavigate();

  const getBatchFromStudentId = (studentId) => {
    if (studentId.length === 7 && studentId.startsWith('16')) {
      return '2016';
    } else if (studentId.length === 7 && studentId.startsWith('17')) {
      return '2017';
    } else if (studentId.length === 7 && studentId.startsWith('18')) {
      return '2018';
    } else if (studentId.length === 7 && studentId.startsWith('19')) {
      return '2019';
    } else if (studentId.length === 7 && studentId.startsWith('20')) {
      return '2020';
    }
     else if (studentId.length === 7 && studentId.startsWith('21')) {
      return '2021';
    }
    else if (studentId.length === 7 && studentId.startsWith('22')) {
      return '2022';
    }
     else if (studentId.length === 7 && studentId.startsWith('23')) {
      return '2023';
    }
      else if (studentId.length === 7 && studentId.startsWith('24')) {
      return '2024';
    }
      else if (studentId.length === 7 && studentId.startsWith('25')) {
      return '2025';
    } else {
      return null;
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (studentId.length !== 7) {
        return setError("Student ID must be 7 digits.");
    }

    const batch = getBatchFromStudentId(studentId);

    if (!batch) {
        return setError("Could not determine batch from Student ID.  ID must start with 16, 17, 18, 19, 20, 21, 22, 23, 24, or 25");
    }
    const studentIdPrefix = parseInt(studentId.substring(0, 2));
    const sessionSuffix = parseInt(session.substring(2, 4));

    if (studentIdPrefix > sessionSuffix) {
        return setError("Make sure that you have type correct ID and Session.");
    }

    try {
      setError('');
      setLoading(true);
      // Call signup with the new parameters.
      await signup(email, password, fullName, studentId, session, batch);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to create an account: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '90vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Sign Up
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {error && <Alert severity="error">{error}</Alert>}
        </Grid>
        <Grid item xs={12}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Student ID"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  fullWidth
                  margin="normal"
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="session-label">Session</InputLabel>
                  <StyledSelect // using styled select
                    labelId="session-label"
                    id="session"
                    value={session}
                    label="Session"
                    onChange={(e) => setSession(e.target.value)}
                    fullWidth
                  >
                    {Array.from({ length: 10 }, (_, i) => 2016 + i).map((year) => {
                      const displayYear = `${year} - ${year + 3}`;
                      return (
                        <MenuItem key={year} value={year.toString()}>
                          {displayYear}
                        </MenuItem>
                      );
                    })}
                  </StyledSelect>
                </FormControl>
              </Grid>
            </Grid>

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
              Sign Up
            </Button>
          </form>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="body2">
            Already have an account? <Link to="/login">Log In</Link>
          </Typography>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Signup;