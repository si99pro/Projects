// src/auth/Signup.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase'; // Import Firebase auth and db
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from '@mui/material';
import styled from '@emotion/styled';

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
`;

const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
  width: 100%;
`;

const LoginLink = styled(Link)`
  margin-top: 16px;
  display: block;
  text-align: center;
  text-decoration: none;
  color: #1976d2;

  &:hover {
    text-decoration: underline;
  }
`;

const ErrorMessageSpace = styled(Box)`
  min-height: 53px;
  margin-bottom: 8px;
`;

const StudentSessionRow = styled(Box)`
  display: flex;
  gap: 20px;

  & > div {
    width: 100%;
  }
`;

function Signup() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [session, setSession] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const generateRandomColor = () => {
    // Generate a random hex color code
    return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (studentId.length !== 7) {
      setError('Student ID must be 7 digits.');
      return;
    }

    const batch = getBatchFromStudentId(studentId);
    if (!batch) {
      setError(
        'Could not determine batch from Student ID. ID must start with 16, 17, 18, 19, 20, 21, 22, 23, 24 or 25'
      );
      return;
    }

    const studentIdPrefix = parseInt(studentId.substring(0, 2));
    const sessionStartYear = parseInt(session.substring(0, 4)); //parse the start year to check with the id prefix
    if (studentIdPrefix > sessionStartYear.toString().substring(2, 4)) {
      setError('Make sure that you have typed correct ID and Session.');
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      // Generate profile background color and create basicInfo object
      const profilebg = generateRandomColor();
      const basicInfo = {
        fullName,
        email,
        studentId,
        batch,
        session,
        profilebg,
        emailStatus: false, // Initially set to false (not verified)
      };

      // Store user data in Firestore
      const userData = {
        basicInfo: basicInfo, // Store basicInfo object as an array
      };
      await setDoc(doc(db, 'users', user.uid), userData);

      setSuccess('Check your inbox to verify your email address.');
      navigate('/login');

    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

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
    } else if (studentId.length === 7 && studentId.startsWith('21')) {
      return '2021';
    } else if (studentId.length === 7 && studentId.startsWith('22')) {
      return '2022';
    } else if (studentId.length === 7 && studentId.startsWith('23')) {
      return '2023';
    } else if (studentId.length === 7 && studentId.startsWith('24')) {
      return '2024';
    } else if (studentId.length === 7 && studentId.startsWith('25')) {
      return '2025';
    } else {
      return null; // Or some default value, or handle the error
    }
  };

  const generateSessionOptions = () => {
    const startYear = 2016;
    const currentYear = new Date().getFullYear(); // Get current year
    const options = [];

    for (let i = startYear; i <= currentYear; i++) {
      const sessionValue = `${i} - ${i + 3}`;
      options.push(
        <MenuItem key={i} value={sessionValue}>
          {sessionValue}
        </MenuItem>
      );
    }

    return options;
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Create Account
      </Typography>
      <ErrorMessageSpace>
        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}
      </ErrorMessageSpace>
      <StyledForm onSubmit={handleSubmit}>
        <TextField
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <StudentSessionRow>
          <TextField
            label="Student ID"
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            fullWidth
            margin="normal"
            required
          />
          <FormControl fullWidth margin="normal" required>
            <InputLabel id="session-label">Session</InputLabel>
            <Select
              labelId="session-label"
              id="session"
              value={session}
              onChange={(e) => setSession(e.target.value)}
              label="Session"
            >
              <MenuItem value="">Session</MenuItem>
              {generateSessionOptions()}
            </Select>
          </FormControl>
        </StudentSessionRow>

        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          margin="normal"
          required
        />
        <StyledButton variant="contained" color="primary" type="submit">
          Sign Up
        </StyledButton>
        <LoginLink to="/login">Already have an account? Login</LoginLink>
      </StyledForm>
    </StyledContainer>
  );
}

export default Signup;