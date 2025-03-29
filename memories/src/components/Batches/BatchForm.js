// src/components/Batches/BatchForm.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate, useParams } from 'react-router-dom';
import { TextField, Button, Container, Typography, Grid, Alert } from '@mui/material';

const BatchForm = () => {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { id } = useParams(); // Get batch ID from URL if editing
  const db = getFirestore();

  useEffect(() => {
    if (id) {
      // Load batch data for editing
      const fetchBatch = async () => {
        setLoading(true);
        try {
          const batchDoc = await getDoc(doc(db, 'batches', id));
          if (batchDoc.exists()) {
            const data = batchDoc.data();
            setName(data.name || '');
            setStartDate(data.startDate || '');
            setEndDate(data.endDate || '');
            setDescription(data.description || '');
            setDepartment(data.department || '');
          } else {
            setError('Batch not found');
          }
        } catch (err) {
          setError('Failed to load batch: ' + err.message);
        }
        setLoading(false);
      };
      fetchBatch();
    }
  }, [id, db]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const batchData = {
        name,
        startDate,
        endDate,
        description,
        department
      };

      if (id) {
        // Update existing batch
        await updateDoc(doc(db, 'batches', id), batchData);
      } else {
        // Create new batch
        await addDoc(collection(db, 'batches'), batchData);
      }

      navigate('/batches'); // Redirect to batch list
    } catch (err) {
      setError('Failed to save batch: ' + err.message);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            {id ? 'Edit Batch' : 'Create New Batch'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          {error && <Alert severity="error">{error}</Alert>}
        </Grid>
        <Grid item xs={12}>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              margin="normal"
              required
              InputLabelProps={{ shrink: true }}
              />
            <TextField
              label="Department"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              fullWidth
              margin="normal"
              required
            />
            <TextField
              label="Description"
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              fullWidth
              margin="normal"
            />
            <Button
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
              disabled={loading}
            >
              Save Batch
            </Button>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BatchForm;