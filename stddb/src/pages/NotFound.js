// src/pages/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'; // Added useTheme

// MUI Icons
import SearchOffIcon from '@mui/icons-material/SearchOff';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';

// Use your app's theme or a default one
const defaultTheme = createTheme({
  // Optional: Define specific minimal theme overrides here if needed
});

/**
 * NotFound Page Component (404 Error)
 * Displays a user-friendly message when a requested route does not exist.
 */
function NotFound() {
  const theme = useTheme(); // Access theme for consistent spacing/palette

  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Wrapper for full height centering and theme background */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default', // Use theme background
          justifyContent: 'center',
          alignItems: 'center',
          px: theme.spacing(2), // Use theme spacing
          py: theme.spacing(4), // Use theme spacing
          textAlign: 'center',
        }}
      >
        <CssBaseline /> {/* Ensure consistent baseline */}
        <Container component="main" maxWidth="xs"> {/* Keep 'xs' for compact feel */}

            {/* Subtle Icon */}
            <SearchOffIcon
              sx={{
                fontSize: { xs: '3.5rem', sm: '4.5rem' },
                color: 'text.disabled', // Use text.disabled for very subtle grey
                mb: theme.spacing(3), // Use theme spacing
              }}
            />

            {/* 404 Code */}
            <Typography
              component="h1"
              variant="h3"
              gutterBottom // Keeps standard bottom margin
              sx={{ fontWeight: 600, color: 'text.primary', mb: theme.spacing(1) }} // Use theme spacing
            >
              404
            </Typography>

            {/* Page Not Found Title */}
            <Typography
              variant="h6"
              component="h2"
              sx={{ fontWeight: 'normal', color: 'text.primary', mb: theme.spacing(2) }} // Use normal weight, theme spacing
            >
              Page Not Found
            </Typography>

            {/* Description */}
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: theme.spacing(4) }}> {/* Use theme spacing */}
              Sorry, the page you requested could not be located.
            </Typography>

            {/* Back Home Button */}
            <Button
              component={RouterLink}
              to="/"
              variant="outlined"
              color="primary"
              startIcon={<HomeOutlinedIcon />}
              sx={{
                 mt: theme.spacing(1), // Use theme spacing
                 py: 1,
                 px: 3,
                 borderRadius: theme.shape.borderRadius, // Use theme border radius
                 textTransform: 'none',
              }}
            >
              Go Back Home
            </Button>
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default NotFound;