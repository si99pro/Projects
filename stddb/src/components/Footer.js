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
    alpha,
    Stack,
    Divider,
} from '@mui/material';
import {
    Facebook as FacebookIcon,
    Twitter as TwitterIcon,
    Instagram as InstagramIcon,
    LinkedIn as LinkedInIcon,
    MailOutline as MailOutlineIcon,
} from '@mui/icons-material';
import LaunchIcon from '@mui/icons-material/Launch'; // Consider replacing with a real logo component if available

const Footer = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isDarkMode = theme.palette.mode === 'dark';

    // Define link items for easier management
    const quickLinks = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Departments', href: '/dept/overview' },
        { label: 'My Profile', href: '/profile' },
        { label: 'Admin Panel', href: '/admin' }, // Conditionally render based on user role if needed
    ];

    const legalLinks = [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
    ];

    const socialLinks = [
        { label: 'Facebook', icon: <FacebookIcon fontSize="small" />, href: '#' }, // Slightly smaller icons
        { label: 'Twitter', icon: <TwitterIcon fontSize="small" />, href: '#' },
        { label: 'Instagram', icon: <InstagramIcon fontSize="small" />, href: '#' },
        { label: 'LinkedIn', icon: <LinkedInIcon fontSize="small" />, href: '#' },
    ];

    // Define base text color based on theme mode for better contrast
    const baseTextColor = isDarkMode ? theme.palette.grey[400] : theme.palette.text.secondary;
    const headingColor = isDarkMode ? theme.palette.grey[500] : theme.palette.text.secondary;
    const linkColor = isDarkMode ? theme.palette.grey[300] : theme.palette.text.primary; // Primary text for links in light mode
    const linkHoverColor = theme.palette.primary.main; // Use main primary for hover in both modes

    return (
        <Box
            component="footer"
            sx={{
                // Lighter background colors
                backgroundColor: isDarkMode ? theme.palette.grey[800] : theme.palette.grey[100],
                color: baseTextColor, // Set base text color for the footer
                py: theme.spacing(isMobile ? 4 : 6), // Use theme spacing
                mt: 'auto', // Push footer to bottom
                borderTop: `1px solid ${theme.palette.divider}`, // Use theme divider color
                // Optional: keep blur for dark mode if desired
                // backdropFilter: isDarkMode ? 'blur(6px)' : 'none',
            }}
        >
            <Container maxWidth="lg">
                <Grid container spacing={isMobile ? 4 : 5} justifyContent="space-between">

                    {/* Column 1: Brand & Description */}
                    <Grid item xs={12} md={5} lg={4}>
                        <Stack spacing={2} alignItems={{ xs: 'center', md: 'flex-start' }} textAlign={{ xs: 'center', md: 'left' }}>
                            {/* Brand Name/Logo */}
                            <Stack
                                direction="row"
                                spacing={1.5}
                                alignItems="center"
                                onClick={() => window.scrollTo(0, 0)}
                                sx={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                                component={Link} // Make it a link semantically
                                href="/" // Link to home or top
                            >
                                <LaunchIcon sx={{ color: 'primary.main', fontSize: '1.8rem' }} /> {/* Slightly adjusted size */}
                                <Typography variant="h6" sx={{
                                    fontWeight: 700,
                                    // Ensure brand name stands out
                                    color: isDarkMode ? 'grey.100' : 'text.primary'
                                }}>
                                    stdDB
                                </Typography>
                            </Stack>
                            <Typography variant="body2" sx={{ color: baseTextColor, maxWidth: 400 }}>
                                Student database for the ME department at HSTU. Connecting students and faculty with information and updates.
                            </Typography>
                        </Stack>
                    </Grid>

                    {/* Column 2: Navigate Links */}
                    <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="overline" display="block" gutterBottom sx={{ fontWeight: 'bold', color: headingColor, fontSize: '0.75rem' }}>
                            Navigate
                        </Typography>
                        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                            {quickLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        color={linkColor} // Use defined link color
                                        underline="hover"
                                        variant="body2"
                                        sx={{
                                            transition: 'color 0.2s ease',
                                            '&:hover': { color: linkHoverColor }, // Use defined hover color
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Column 3: Legal Links */}
                    <Grid item xs={6} sm={4} md={2}>
                         <Typography variant="overline" display="block" gutterBottom sx={{ fontWeight: 'bold', color: headingColor, fontSize: '0.75rem' }}>
                            Legal
                        </Typography>
                        <Stack component="ul" spacing={1} sx={{ listStyle: 'none', p: 0, m: 0 }}>
                            {legalLinks.map((link) => (
                                <li key={link.label}>
                                     <Link
                                        href={link.href}
                                        color={linkColor} // Use defined link color
                                        underline="hover"
                                        variant="body2"
                                        sx={{
                                            transition: 'color 0.2s ease',
                                            '&:hover': { color: linkHoverColor }, // Use defined hover color
                                        }}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </Stack>
                    </Grid>

                    {/* Column 4: Contact/Social */}
                    <Grid item xs={12} sm={4} md={3} sx={{ textAlign: { xs: 'center', sm: 'left'} }}> {/* Center align text on xs */}
                         <Typography variant="overline" display="block" gutterBottom sx={{ fontWeight: 'bold', color: headingColor, fontSize: '0.75rem' }}>
                            Connect
                        </Typography>
                        {/* Contact */}
                         <Link
                            href="mailto:info@si99.pro" // Replace with actual email
                            color={linkColor} // Use defined link color
                            underline="hover"
                            variant="body2"
                            sx={{
                                display: 'inline-flex', // Use inline-flex for better alignment control
                                alignItems: 'center',
                                gap: 0.5, // Reduced gap
                                mb: 2,
                                transition: 'color 0.2s ease',
                                '&:hover': { color: linkHoverColor } // Use defined hover color
                            }}
                         >
                            <MailOutlineIcon sx={{ fontSize: '1rem' }}/> info@si99.pro {/* Smaller icon */}
                         </Link>
                        {/* Social Icons */}
                        <Stack direction="row" spacing={1} justifyContent={{ xs: 'center', sm: 'flex-start' }}> {/* Center icons on xs */}
                            {socialLinks.map((social) => (
                                <IconButton
                                    key={social.label}
                                    color="inherit" // Inherit base text color
                                    href={social.href}
                                    aria-label={social.label}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    sx={{
                                        color: baseTextColor, // Explicitly set base color
                                        transition: 'color 0.2s ease, background-color 0.2s ease',
                                        '&:hover': {
                                            color: linkHoverColor, // Use primary for icon hover
                                            bgcolor: alpha(theme.palette.primary.main, 0.1), // Subtle background highlight
                                        },
                                    }}
                                >
                                    {social.icon}
                                </IconButton>
                            ))}
                        </Stack>
                    </Grid>
                </Grid>

                {/* Bottom Bar: Copyright */}
                <Divider sx={{ mt: theme.spacing(isMobile ? 4 : 6), mb: theme.spacing(3), borderColor: theme.palette.divider }} />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" sx={{ color: baseTextColor }}> {/* Use base text color */}
                        © {new Date().getFullYear()} stdDB • Department of ME, HSTU. All rights reserved.
                    </Typography>
                </Box>
            </Container>
        </Box>
    );
};

export default Footer;