// src/components/Footer.js
import React from 'react';
import {
  Box,
  Container,
  Grid,
  Typography,
  Link,
  IconButton,
  useTheme,
  useMediaQuery,
  alpha, // <<<--- ADD THIS IMPORT
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Use 'sm' breakpoint for mobile footer changes

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.dark', // Use a theme color for consistency
        color: 'white', // Ensure text is readable
        py: isMobile ? 4 : 6, // Adjust vertical padding based on screen size
        mt: 'auto', // Push footer to bottom if MainLayout uses flex column
      }}
    >
      <Container maxWidth="lg"> {/* Constrain content width */}
        <Grid container spacing={isMobile ? 3 : 4} justifyContent="space-between">

          {/* Column 1: Brand Info */}
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5"
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              MEmento
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}> {/* Slightly larger body text */}
            MEmento is a database website for students of the ME department at HSTU. It keeps track of student information, academic progress, and status updates, making it easier for students and faculty to stay connected and organized.
            </Typography>
          </Grid>

          {/* Column 2: Quick Links */}
          <Grid item xs={6} sm={4} md={2}> {/* Adjusted breakpoints for better spacing */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}> {/* Use flex for spacing */}
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Home</Link></li>
              <li><Link href="#" color="inherit" underline="hover" variant="body2">About Us</Link></li>
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Services</Link></li>
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Contact</Link></li>
            </Box>
          </Grid>

          {/* Column 3: Legal Links */}
          <Grid item xs={6} sm={4} md={2}> {/* Adjusted breakpoints */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}> {/* Use flex for spacing */}
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Privacy Policy</Link></li>
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Terms of Service</Link></li>
              <li><Link href="#" color="inherit" underline="hover" variant="body2">Cookie Policy</Link></li>
            </Box>
          </Grid>

          {/* Column 4: Social Media */}
          <Grid item xs={12} sm={4} md={4} sx={{ textAlign: { xs: 'left', sm: 'right' } }}> {/* Align right from 'sm' up */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Follow Us
            </Typography>
            <Box>
              {/* Remember to replace # with actual URLs */}
              <IconButton color="inherit" href="#" aria-label="Facebook" sx={{ '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}> {/* Uses alpha */}
                <FacebookIcon fontSize="large" />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Twitter" sx={{ '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}> {/* Uses alpha */}
                <TwitterIcon fontSize="large" />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Instagram" sx={{ '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}> {/* Uses alpha */}
                <InstagramIcon fontSize="large" />
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="LinkedIn" sx={{ '&:hover': { bgcolor: alpha(theme.palette.common.white, 0.1) } }}> {/* Uses alpha */}
                <LinkedInIcon fontSize="large" />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        {/* Copyright Line */}
        <Box mt={5} pt={3} textAlign="center" sx={{ borderTop: `1px solid ${alpha(theme.palette.common.white, 0.2)}` }}> {/* Uses alpha */}
          <Typography variant="body2" sx={{ opacity: 0.7 }}>
            © {new Date().getFullYear()} MEmento. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;