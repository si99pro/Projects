// src/components/Copyright.js (Create this file if it doesn't exist)
import React from 'react';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link'; // MUI Link

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'Copyright © '}
      <Link color="inherit" href="#"> {/* Optional link target */}
        stdDB
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

export default Copyright;