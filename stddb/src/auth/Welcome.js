// src/auth/WelcomePage.js (or src/components/WelcomePage.js)

import React from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom'; // Added RouterLink for potential future links

// MUI Components (aligned with Signup page imports)
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CssBaseline from '@mui/material/CssBaseline';
import Link from '@mui/material/Link'; // MUI Link

// MUI Icons (aligned with Signup page imports)
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
// Choose a relevant icon - sticking with SchoolIcon for consistency example
import SchoolIcon from '@mui/icons-material/School';

// Re-using the Copyright component structure from Signup
function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#"> {/* You might want to update this href */}
        Stddb
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}


export default function WelcomePage() {
  const navigate = useNavigate();

  const handleNavigateToLogin = () => {
    navigate('/login');
  };

  const handleNavigateToSignup = () => {
    navigate('/signup');
  };

  return (
    <Container component="main" maxWidth="sm"> {/* Using 'sm' for a bit more space than 'xs' */}
      <CssBaseline />
      <Box
        sx={{
          marginTop: 8, // Similar vertical positioning to Signup
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center', // Ensure text alignment for Typography
          minHeight: 'calc(100vh - 64px - 72px)', // Adjust height considering header and footer/copyright
          justifyContent: 'center', // Center content vertically in the available space
        }}
      >
        {/* Avatar + Icon: Similar pattern to Signup */}
        <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 56, height: 56 }}> {/* Primary color more welcoming */}
          <SchoolIcon fontSize="large"/>
        </Avatar>

        {/* Main Heading */}
        <Typography component="h1" variant="h4" sx={{ mt: 2, fontWeight: 600 }}>
          Welcome to
        </Typography>
        <Typography component="span" variant="h4" sx={{ mb: 2, fontWeight: 600, color: 'primary.main' }}>
          HSTU Students Database! {/* Or HSTU Students Database */}
        </Typography>

        {/* Sub-heading / Description */}
        <Typography
          variant="body1" // Standard body text
          color="text.secondary" // Secondary color like form labels/helper text
          sx={{
            maxWidth: '90%', // Limit width for readability
            lineHeight: 1.6,
            mb: 4, // Space before buttons
          }}
        >
          Access profiles, connect with peers, and stay updated.
          Login to continue or sign up if you're new.
        </Typography>

        {/* Action Buttons Stack - Standard MUI Buttons */}
        <Stack
          direction={{ xs: 'column', sm: 'row' }} // Responsive direction
          spacing={2} // Standard spacing
          justifyContent="center"
          alignItems="center"
          sx={{
            width: '100%',
            maxWidth: 400, // Limit button stack width slightly
            mt: 2, // Margin top from description
          }}
        >
          <Button
            variant="contained" // Standard contained button
            color="primary"
            size="large"
            startIcon={<LoginIcon />}
            onClick={handleNavigateToLogin}
            fullWidth // Take full width within the stack constraints on small screens
            sx={{
              py: 1.2, // Adjust padding to look standard
              textTransform: 'none', // Keep text case as is
              fontSize: '1rem',
              fontWeight: 500,
            }}
          >
            Login
          </Button>
          <Button
            variant="outlined" // Standard outlined button
            color="primary"
            size="large"
            startIcon={<PersonAddIcon />}
            onClick={handleNavigateToSignup}
            fullWidth // Take full width within the stack constraints on small screens
            sx={{
               py: 1.2, // Match padding
               textTransform: 'none',
               fontSize: '1rem',
               fontWeight: 500,
               borderWidth: '1px', // Standard outlined border
               '&:hover': { // Standard hover
                   borderWidth: '1px',
                   backgroundColor: 'rgba(25, 118, 210, 0.04)' // Default MUI outlined hover
               },
            }}
          >
            Sign Up
          </Button>
        </Stack>

      </Box>

      {/* Copyright - Positioned like Signup */}
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}