// src/pages/NotFound.js
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
// Removed Container
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
// Removed ThemeProvider, createTheme, useTheme

// MUI Icons
import SearchOffIcon from '@mui/icons-material/SearchOff'; // Icon for Not Found
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'; // Icon for Home button

/**
 * NotFound Page Component (404 Error) - Responsive Final Version
 */
function NotFound() {
  return (
    // Outermost Box: Full viewport height, flex column layout
    <Box sx={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        bgcolor: 'var(--color-background, #f4f6f8)', // Use CSS Variable
    }}>
      <CssBaseline />

      {/* Centering Wrapper - Responsive Padding */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column', // Stack items vertically within center area
          justifyContent: 'center', // Center vertically
          alignItems: 'center',    // Center horizontally
          textAlign: 'center',     // Center text within this Box
          // Responsive Padding: Less padding on smaller screens
          px: { xs: 2, sm: 3 }, // Horizontal padding
          py: 4, // Keep consistent vertical padding or adjust if needed { xs: 3, sm: 4 }
          overflowY: 'auto', // Allow scrolling just in case
        }}
      >
          {/* Icon - Responsive Size */}
          <SearchOffIcon
            sx={{
              fontSize: { xs: '4rem', sm: '5rem' }, // Already responsive
              color: 'var(--color-text-secondary)',
              mb: 2,
            }}
          />

          {/* Page Not Found Title - Responsive Variant */}
          <Typography
            component="h1"
            // Use smaller variant on xs, larger on sm+
            variant={ { xs: 'h5', sm: 'h4' } }
            gutterBottom
            sx={{ fontWeight: 500, color: 'var(--color-text-primary)', mb: 1 }}
          >
            Page Not Found
          </Typography>

          {/* Description - variant="body1" is generally okay across sizes */}
          <Typography variant="body1" color="var(--color-text-secondary)" sx={{ mb: 4 }}>
            Sorry, the page you requested could not be located or doesn't exist.
          </Typography>

          {/* Back Home Button - Responsive Size (Optional) */}
          <Button
            component={RouterLink}
            to="/" // Link to home page
            variant="contained"
            startIcon={<HomeOutlinedIcon />}
            // Optional: Adjust size based on screen width
            size={ "large" } // Keeping large for consistency, but could use { xs: 'medium', sm: 'large' }
            sx={{
               mt: 1,
               textTransform: 'none',
               // Ensure button uses theme/variables
               // bgcolor: 'var(--color-primary)',
               // '&:hover': { bgcolor: 'var(--color-primary-hover)' },
            }}
          >
            Go to Homepage
          </Button>

      </Box> {/* End Centering Wrapper */}

       {/* Optional Footer - Add if you want the copyright on the 404 page */}
       {/* <Copyright sx={{ py: 2 }} /> */}

    </Box> // End Outermost Box
  );
}

export default NotFound;