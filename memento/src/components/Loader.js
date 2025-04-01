// src/components/Loader.js
import React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes for prop validation
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Backdrop from '@mui/material/Backdrop';
import { useTheme } from '@mui/material/styles';

/**
 * Versatile Loader component.
 * Renders either a full-screen Backdrop loader or an inline loader.
 * Best Practice: Conditionally render this component in the parent,
 * instead of relying on an internal `isLoading` prop.
 * e.g., {loading && <Loader type="backdrop" />}
 *      {sectionLoading && <Loader type="inline" />}
 */
function Loader({
  type = 'backdrop', // 'backdrop' or 'inline'
  message = "Loading...",
  size = type === 'backdrop' ? 60 : 30, // Default smaller size for inline
  color = 'primary',
  'aria-label': ariaLabel = message || 'loading content', // For accessibility
  ...boxProps // Allow passing props like sx to the container Box for inline
}) {
  const theme = useTheme();

  // --- Inline Loader ---
  if (type === 'inline') {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        // Allow parent to control margins, padding etc. via sx in boxProps
        {...boxProps}
        // Accessibility: Announce loading state change
        role="status" // Indicates content is advisory, not critical (use alertdialog for critical)
        aria-live="polite" // Announces changes when user is idle
        aria-busy="true"
      >
        <CircularProgress size={size} color={color} aria-label={ariaLabel} />
        {message && (
          <Typography
            variant="caption" // Smaller text for inline typically
            sx={{
              mt: 1,
              color: theme.palette.text.secondary // More subtle color usually
            }}
            aria-hidden="true" // Message is visually redundant with aria-label/role
          >
            {message}
          </Typography>
        )}
      </Box>
    );
  }

  // --- Backdrop Loader (Default) ---
  // Note: Backdrop already handles focus trapping which is good UX
  return (
    <Backdrop
      // Use `open={true}` as it's expected to be conditionally rendered
      // If you MUST pass isLoading, change to `open={isLoading}`
      open={true}
      sx={{
        color: '#fff', // Keep white for high contrast on dark overlay
        // Ensure it's above most standard UI elements
        zIndex: (theme) => theme.zIndex.modal + 1, // Use modal zIndex for consistency
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Slightly darker overlay often preferred
        position: 'fixed', // Ensure full-screen coverage
      }}
      // Accessibility: Announce loading state change
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <CircularProgress
           size={size}
           color={color}
           // Provide accessible label
           aria-label={ariaLabel}
        />
        {message && (
          <Typography
             variant="h6" // Slightly larger text for backdrop might be okay
             sx={{ mt: 2, color: 'white' }}
             aria-hidden="true" // Message is visually redundant with aria-label/role
          >
            {message}
          </Typography>
        )}
      </Box>
    </Backdrop>
  );
}

// --- PropTypes for better development experience ---
Loader.propTypes = {
  /** Specifies the type of loader: full-screen overlay or inline */
  type: PropTypes.oneOf(['backdrop', 'inline']),
  /** The message displayed below the spinner */
  message: PropTypes.string,
  /** The size of the CircularProgress spinner */
  size: PropTypes.number,
  /** The color of the CircularProgress spinner */
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'error',
    'info',
    'success',
    'warning',
    'inherit',
  ]),
   /** Accessible label for the loading indicator, defaults to message or 'loading content' */
  'aria-label': PropTypes.string,
  // We don't explicitly define sx here, but allow it via ...boxProps for inline type
};

export default Loader;