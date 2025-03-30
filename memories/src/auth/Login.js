// src/auth/Login.js
import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { useNavigate, Link } from 'react-router-dom';
import {
  TextField,
  Button,
  Container,
  Typography,
  Alert,
  Box,
  AlertTitle
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

const SignupLink = styled(Link)`
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
  min-height: 53px; /* Increased min-height for more spacing */
  margin-bottom: 8px;
`;

const ResendLink = styled(Button)`
    color: #1976d2;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    padding: 0; /* Remove default button padding */
    margin-left: 8px; /* Add spacing between text and link */
    text-transform: none; /* Prevent uppercase text */
    font-size: inherit; /* Inherit font size from parent */

    &:hover {
        text-decoration: underline;
    }
`;

const StyledAlert = styled(Alert)`
    display: flex;
    align-items: center;
    justify-content: space-between; /* Align items on the same line */
`;


function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleResendVerification = async () => {
    try {
      await sendEmailVerification(auth.currentUser);
      setError('Verification email resent. Check your inbox.');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError(
            <>
                Please verify your email before logging in.
                <ResendLink onClick={handleResendVerification}>
                    Resend Code
                </ResendLink>
            </>
        );
        return;
      }

      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <StyledContainer maxWidth="sm">
      <Typography variant="h4" align="center" gutterBottom>
        Login
      </Typography>
      <ErrorMessageSpace>
        {error && (
           <StyledAlert severity="error">
              Please verify your email before logging in.
              <ResendLink onClick={handleResendVerification}>
                   Resend Code
              </ResendLink>
          </StyledAlert>
        )}
      </ErrorMessageSpace>
      <StyledForm onSubmit={handleSubmit}>
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
        <StyledButton variant="contained" color="primary" type="submit">
          Login
        </StyledButton>
        <SignupLink to="/signup">Don't have an account? Sign up</SignupLink>
      </StyledForm>
    </StyledContainer>
  );
}

export default Login;