// src/components/MainLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Footer from './Footer';
import Navbar from './Navbar';
import { Box } from '@mui/material';

// Removed React.memo wrapper
function MainLayout() {
  // console.log("MainLayout Rendered"); // For debugging

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
      }}
    >
      <Navbar />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflowY: 'auto',
          py: { xs: 2, sm: 3 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Outlet />
      </Box>

      <Footer />
    </Box>
  );
}

export default MainLayout; // Standard function export