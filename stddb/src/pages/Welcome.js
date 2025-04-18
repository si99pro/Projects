// src/pages/Welcome.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // Use Paper as the card
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import CssBaseline from '@mui/material/CssBaseline'; // Ensure baseline styles
// Removed ThemeProvider, createTheme, useTheme, Container

// MUI Icons
import SchoolIcon from '@mui/icons-material/School'; // Or SchoolOutlinedIcon

/**
 * Welcome Page Component - Final Version Matching Auth Pages Style
 */
function Welcome() {
  return (
    // Outermost Box: Full viewport height, flex column layout
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'var(--color-background, #f4f6f8)', // Use CSS Variable
    }}>
      <CssBaseline />

      {/* Centering Wrapper */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center', // Vertically center
          p: 2, // Padding around card area
          overflowY: 'auto', // Allow scroll if content ever overflows (unlikely here)
        }}
      >
        {/* Welcome Card - Styled like other auth pages */}
        <Paper
          elevation={0} // Flat design
          sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center', // Center items inside paper
              textAlign: 'center',
              p: { xs: 3, sm: 5 }, // Generous padding for a welcome page
              width: '100%',
              maxWidth: '550px', // Max width for welcome message (adjust as needed)
              bgcolor: 'var(--color-surface)', // Use CSS Variable
              borderRadius: 'var(--border-radius-large)', // Use CSS Variable
              border: `1px solid var(--color-border)`,    // Use CSS Variable
          }}
        >
          {/* Icon */}
          <SchoolIcon sx={{ fontSize: 64, mb: 2, color: 'var(--color-primary)' }} />

          {/* Main Heading */}
          <Typography
            component="h1"
            variant="h4" // Use h4 for consistency with other page titles
            gutterBottom
            sx={{ fontWeight: 500, color: 'var(--color-text-primary)' }} // Use variable
          >
            Welcome to stdDB!
          </Typography>

          {/* Subheading */}
          <Typography
            variant="body1" // Use body1 for main paragraph text
            color="var(--color-text-secondary)" // Use variable
            paragraph // Adds bottom margin
            sx={{ mb: 4 }} // Explicit margin bottom
          >
            Your simple student database management system. Get started by logging in or creating an account.
          </Typography>

          {/* Button Stack */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2} // Standard spacing
            justifyContent="center"
            sx={{ width: { xs: '100%', sm: 'auto' } }} // Responsive width for buttons
          >
            <Button
              component={RouterLink}
              to="/login"
              variant="contained"
              size="large"
              sx={{
                  width: { xs: '100%', sm: 'auto' }, // Ensure buttons don't force full width on small screens
                  minWidth: '120px' // Give buttons a minimum width
              }}
            >
              Login
            </Button>
            <Button
              component={RouterLink}
              to="/signup"
              variant="outlined"
              size="large"
              sx={{
                  width: { xs: '100%', sm: 'auto' },
                  minWidth: '120px',
                  // Ensure outlined button uses primary color from variables if theme doesn't
                  // borderColor: 'var(--color-primary)',
                  // color: 'var(--color-primary)',
              }}
            >
              Sign Up
            </Button>
          </Stack>
        </Paper> {/* End Card */}
      </Box> {/* End Centering Wrapper */}

       {/* Footer - Optional: Add if needed on this page */}
       {/* <Copyright sx={{ py: 2 }} /> */}

    </Box> // End Outermost Box
  );
}

export default Welcome;