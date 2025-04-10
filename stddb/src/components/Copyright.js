// src/components/Copyright.js
import React from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import Box from '@mui/material/Box'; // Good practice to allow easy container styling

/**
 * Displays a standard copyright notice.
 * Leverages MUI components for consistency.
 *
 * @param {object} props - Component props.
 * @param {string} [props.appName="stdDB"] - The name of the app or company.
 * @param {string} [props.linkHref="/"] - The target URL for the app name link (defaults to home).
 * @param {object} [props.sx] - Custom MUI sx styling for the Typography component.
 * @param {string} [props.align="center"] - Text alignment ('left', 'center', 'right').
 * @param {any} ...otherProps - Any other props are passed down to the MUI Typography component.
 */
function Copyright({ appName = "stdDB", linkHref = "/", sx, align = "center", ...otherProps }) {
  const currentYear = new Date().getFullYear();

  return (
    // Using Box allows easier application of margins/padding if needed by parent
    <Box component="div" sx={{ width: '100%', ...sx }}>
        <Typography
            variant="body2" // 'body2' is standard, 'caption' could be used for smaller text
            color="text.secondary"
            align={align}
            {...otherProps} // Pass down other props like 'component', etc.
        >
            {'Copyright © '}
            <Link
                color="inherit" // Inherit color from Typography
                href={linkHref}
                underline="hover" // Add subtle underline on hover for better affordance
                // Optional: Add target blank for external links if linkHref changes
                target={linkHref.startsWith('http') ? '_blank' : undefined}
                rel={linkHref.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
                {appName}
            </Link>
            {` ${currentYear}.`} {/* Using template literal */}
        </Typography>
    </Box>
  );
}

export default Copyright;