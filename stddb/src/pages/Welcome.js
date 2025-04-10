import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import SchoolIcon from '@mui/icons-material/School'; // Optional: Added an icon for visual appeal

function Welcome() {
  return (
    // Use Container to constrain max width, but allow it to be slightly wider ('sm')
    // Add sx for vertical centering and padding
    <Container
      component="main"
      maxWidth="sm" // Changed from 'xs' to 'sm' for better spacing on larger screens
      sx={{
        display: 'flex', // Enable flexbox
        flexDirection: 'column', // Stack children vertically
        justifyContent: 'center', // Center vertically
        alignItems: 'center', // Center horizontally
        minHeight: 'calc(100vh - 64px)', // Take up viewport height (adjust 64px if you have an AppBar of different height, or use '90vh' for approx)
        textAlign: 'center', // Center text for all children by default
        py: 4, // Add some vertical padding
      }}
    >
      {/* Optional: Icon for visual enhancement */}
      <SchoolIcon sx={{ fontSize: 60, mb: 2, color: 'primary.main' }} />

      {/* Main Heading - Increased size slightly */}
      <Typography
        component="h1"
        variant="h3" // Changed from h4 to h3 for more impact
        gutterBottom // Adds bottom margin
        fontWeight="medium" // Slightly bolder
      >
        Welcome to stddb!
      </Typography>

      {/* Subheading - Adjusted variant for better hierarchy */}
      <Typography
        variant="h6" // Kept h6, but could use subtitle1
        color="text.secondary" // Good for secondary text
        paragraph // Adds bottom margin
        sx={{ mb: 4 }} // Increase bottom margin before buttons
      >
        Your simple student database management system.
      </Typography>

      {/* Button Stack - Made responsive */}
      <Stack
        // Direction changes based on screen size: 'column' on extra-small, 'row' otherwise
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2} // Spacing between buttons (works for row and column)
        justifyContent="center" // Center buttons horizontally when in a row
        sx={{ width: { xs: '100%', sm: 'auto' } }} // Stack takes full width on xs, auto on sm+
      >
        <Button
          component={RouterLink}
          to="/login"
          variant="contained" // Primary action
          color="primary"
          size="large" // Slightly larger buttons
          sx={{ width: { xs: '100%', sm: 'auto' } }} // Button takes full width on xs
        >
          Login
        </Button>
        <Button
          component={RouterLink}
          to="/signup"
          variant="outlined" // Secondary action
          color="primary"
          size="large" // Slightly larger buttons
          sx={{ width: { xs: '100%', sm: 'auto' } }} // Button takes full width on xs
        >
          Sign Up
        </Button>
      </Stack>
    </Container>
  );
}

export default Welcome;