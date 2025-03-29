// src/components/Batches/BatchList.js
import React, { useState, useEffect } from 'react';
import { getFirestore, collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import {
  Container,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Button,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const BatchList = () => {
  const [batches, setBatches] = useState([]);
  const db = getFirestore();

  useEffect(() => {
    const fetchBatches = async () => {
      const batchesCollection = collection(db, 'batches');
      const batchSnapshot = await getDocs(batchesCollection);
      const batchList = batchSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setBatches(batchList);
    };

    fetchBatches();
  }, [db]);

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'batches', id));
      setBatches(batches.filter(batch => batch.id !== id)); // Optimistically update UI
    } catch (error) {
      console.error("Error deleting batch:", error);
    }
  };

  return (
    <Container>
      <Grid container spacing={2} direction="column" alignItems="center" justifyContent="center" style={{ minHeight: '80vh' }}>
        <Grid item xs={12}>
          <Typography variant="h4" component="h1" gutterBottom>
            Batches
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button variant="contained" color="primary" component={Link} to="/batches/new">
            Create New Batch
          </Button>
        </Grid>
        <Grid item xs={12}>
          <List style={{ width: '100%' }}>
            {batches.map(batch => (
              <ListItem key={batch.id} divider>
                <ListItemText
                  primary={batch.name}
                  secondary={`${batch.startDate} - ${batch.endDate} (${batch.department})`}
                />
                <ListItemSecondaryAction>
                  <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(batch.id)}>
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    </Container>
  );
};

export default BatchList;