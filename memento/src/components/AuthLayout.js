// src/components/AuthLayout.js (Optional)
import React from 'react';
import { Outlet } from 'react-router-dom';
import { Container } from '@mui/material'; // Example: Use Container for centering

function AuthLayout() {
  return (
    // Example: Center content for Login/Signup
    <Container component="main" maxWidth="xs" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <Outlet /> {/* Login or Signup component renders here */}
    </Container>
    // Or simply:
    // <>
    //   <Outlet />
    // </>
  );
}

export default AuthLayout;