// src/theme.js
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        primary: {
            main: '#2196f3', // Blue
        },
        secondary: {
            main: '#f44336', // Red
        },
        background: {
            default: '#fafafa', // Light grey
            paper: '#ffffff', // White
        },
    },
    typography: {
        fontFamily: 'Roboto, sans-serif',
    },
    spacing: 8, // Default spacing unit
});

export default theme;