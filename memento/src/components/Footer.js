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
} from '@mui/material';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon,
} from '@mui/icons-material';

const Footer = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Example responsiveness

  return (
    <Box
      component="footer"
      sx={{
        backgroundColor: 'primary.dark', // Darker primary for footer contrast
        color: 'white',
        py: isMobile ? 4 : 6, // Reduced padding on mobile
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={isMobile ? 2 : 4} justifyContent="space-between">
          <Grid item xs={12} md={4}>
            <Typography
              variant="h5" // Larger heading
              gutterBottom
              sx={{ fontWeight: 'bold' }} // Bold heading
            >
              MEmento
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.8 }}>  {/*  Increased body text size */}
            MEmento is a database website for students of the ME department at HSTU. It keeps track of student information, academic progress, and status updates, making it easier for students and faculty to stay connected and organized.
            </Typography>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}> {/* Bolder less large heading */}
              Quick Links
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Home
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  About Us
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Services
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Contact
                </Link>
              </li>
            </Box>
          </Grid>

          <Grid item xs={6} md={2}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}> {/* Bolder less large heading */}
              Legal
            </Typography>
            <Box component="ul" sx={{ listStyle: 'none', p: 0, m: 0 }}>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="#" color="inherit" underline="hover" variant="body2"> {/*  Increased body text size */}
                  Cookie Policy
                </Link>
              </li>
            </Box>
          </Grid>

          <Grid item xs={12} md={4} sx={{ textAlign: { xs: 'left', md: 'right' } }}> {/* Align right on larger screens */}
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}> {/* Bolder less large heading */}
              Follow Us
            </Typography>
            <Box>
              <IconButton color="inherit" href="#" aria-label="Facebook">
                <FacebookIcon fontSize="large" /> {/* Larger icons */}
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Twitter">
                <TwitterIcon fontSize="large" /> {/* Larger icons */}
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="Instagram">
                <InstagramIcon fontSize="large" /> {/* Larger icons */}
              </IconButton>
              <IconButton color="inherit" href="#" aria-label="LinkedIn">
                <LinkedInIcon fontSize="large" /> {/* Larger icons */}
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" sx={{ opacity: 0.7 }}> {/*  Increased body text size */}
            © {new Date().getFullYear()} MEmento. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;