// src/pages/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// MUI Icons - Choosing simpler, less "error-focused" icons
import SearchOffIcon from '@mui/icons-material/SearchOff'; // Icon implying something wasn't found
// Alt: import LinkOffIcon from '@mui/icons-material/LinkOff';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'; // Outlined version for button

// Use your app's theme or a default one
const defaultTheme = createTheme({
  // Optional: Define specific minimal theme overrides here if needed
  // typography: {
  //   fontFamily: 'Inter, sans-serif', // Example of a clean font
  // },
});

function NotFound() {
  return (
    <ThemeProvider theme={defaultTheme}>
      {/* Wrapper for full height centering */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default', // Use theme's default background
          justifyContent: 'center',
          alignItems: 'center',
          px: 2, // Horizontal padding
          py: 4, // Vertical padding
          textAlign: 'center', // Center text for all children by default
        }}
      >
        <CssBaseline />
        {/* Container for content max-width */}
        <Container component="main" maxWidth="xs"> {/* Use 'xs' for a tighter minimal feel */}

            {/* Subtle Icon */}
            <SearchOffIcon
              sx={{
                fontSize: { xs: '3.5rem', sm: '4.5rem' }, // Slightly smaller icon
                color: 'grey.500', // Neutral grey color
                mb: 3, // More space below icon
              }}
            />

            {/* 404 Code (Clear, less emphasis) */}
            <Typography
              component="h1"
              variant="h3" // Reduced size from previous examples
              gutterBottom
              sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }} // Less bold
            >
              404
            </Typography>

            {/* Page Not Found Title (Simple) */}
            <Typography
              variant="h6" // Smaller heading
              component="h2"
              sx={{ fontWeight: 400, color: 'text.primary', mb: 2 }} // Regular weight
            >
              Page Not Found
            </Typography>

            {/* Description (Concise) */}
            <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
              Sorry, the page you requested could not be located.
            </Typography>

            {/* Back Home Button (Clean) */}
            <Button
              component={RouterLink}
              to="/" // Link back to the root/home page
              variant="outlined" // Use outlined for minimal style
              color="primary"
              startIcon={<HomeOutlinedIcon />}
              sx={{
                 mt: 1, // Reduced margin top
                 py: 1,
                 px: 3,
                 borderRadius: '8px', // Slightly rounded
                 textTransform: 'none', // Keep text case
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