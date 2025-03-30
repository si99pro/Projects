// src/components/MomentForm.js
import React, { useState } from 'react';
import {
  TextField,
  Button,
  Container,
  Typography,
  Box,
  Alert,
} from '@mui/material';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid'; // Import UUID
import Navbar from '../components/Navbar'; // Import Navbar Component

const StyledContainer = styled(Container)`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh; /* Adjusted for smaller height */
  padding: 20px;
`;

const StyledForm = styled.form`
  width: 100%;
  max-width: 400px;
  padding: 32px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const StyledButton = styled(Button)`
  margin-top: 16px;
`;

function MomentForm() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const user = auth.currentUser;
      if (!user) {
        setError('You must be logged in to create a moment.');
        return;
      }

      const momentData = {
        id: uuidv4(), // Generate a unique ID
        title: title,
        description: description,
        createdAt: new Date(), // Add a timestamp
      };

      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        moments: arrayUnion(momentData), // Changed to "moments"
      });

      console.log('Moment saved successfully!');
      navigate('/dashboard'); // Redirect to dashboard after saving
    } catch (err) {
      console.error('Error saving moment:', err);
      setError(err.message);
    }
  };

  return (
    <>  {/* Use a fragment to wrap both the Navbar and the form content */}
      <Navbar /> {/* Include the Navbar component */}
      <StyledContainer maxWidth="sm">
        <Typography variant="h5" align="center" gutterBottom>
          Create New Moment
        </Typography>
        {error && <Alert severity="error">{error}</Alert>}
        <StyledForm onSubmit={handleSubmit}>
          <TextField
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            fullWidth
          />
          <TextField
            label="Description"
            multiline
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
          />
          <StyledButton variant="contained" color="primary" type="submit">
            Share Moment
          </StyledButton>
        </StyledForm>
      </StyledContainer>
    </>
  );
}

export default MomentForm;