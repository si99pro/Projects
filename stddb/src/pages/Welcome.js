// src/pages/Welcome.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CssBaseline from '@mui/material/CssBaseline'; // Ensure baseline styles
import { ThemeProvider, createTheme, useTheme } from '@mui/material/styles'; // Import ThemeProvider & useTheme

// MUI Icons
import SchoolIcon from '@mui/icons-material/School';

// Use your app's theme or create a default one
const defaultTheme = createTheme({
    // palette: { mode: 'light' }
});

/**
 * Welcome Page Component
 * The initial landing page for unauthenticated users, prompting login or signup.
 */
function Welcome() {
  const theme = useTheme(); // Access theme for spacing/palette

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Apply CssBaseline for consistent base styling */}
      <CssBaseline />
      {/* Use Box for full height control if needed, Container handles centering */}
      <Box
        sx={{
          display: 'flex', // Use Flexbox on the outer box too
          minHeight: '100vh', // Ensure it takes at least full viewport height
          alignItems: 'center', // Center the container vertically
          justifyContent: 'center', // Center the container horizontally
          bgcolor: 'background.default', // Use theme background
        }}
      >
        <Container
          component="main"
          maxWidth="sm"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center', // Center items inside container
            textAlign: 'center',
            py: theme.spacing(4), // Use theme spacing for vertical padding
          }}
        >
          {/* Icon */}
          <SchoolIcon sx={{ fontSize: 64, mb: theme.spacing(2), color: 'primary.main' }} />

          {/* Main Heading */}
          <Typography
            component="h1"
            variant="h3" // Keep h3 for impact
            gutterBottom
            sx={{ fontWeight: 'medium' }} // Use sx for fontWeight shorthand
          >
            Welcome to stdDB!
          </Typography>

          {/* Subheading */}
          <Typography
            variant="subtitle1" // Use subtitle1 for a slightly smaller, standard subheading
            color="text.secondary"
            paragraph // Adds bottom margin automatically
            sx={{ mb: theme.spacing(4) }} // Use theme spacing for bottom margin
          >
            Your simple student database management system.
          </Typography>

          {/* Button Stack */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={theme.spacing(2)} // Use theme spacing
            justifyContent="center"
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              color="primary"
              size="large"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="outlined"
              color="primary"
              size="large"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              Sign Up
            </Button>
          </Stack>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default Welcome;