import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

import ExtensionIcon from '@mui/icons-material/ExtensionOutlined';
import VideogameAssetIcon from '@mui/icons-material/VideogameAssetOutlined';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/PersonOutline';

// Assuming these helpers are defined elsewhere or remove if not used
// const getInitials = (name = '') => { /* ... */ return ''; };
// const stringToColor = (str = '') => { /* ... */ return '#bdbdbd'; };

const RightSidebar = () => {
    const theme = useTheme();

    const challenges = [
        { id: 'c1', name: 'Daily Challenge', icon: <ExtensionIcon />, desc: 'Test your skills', link: '/challenges/daily' },
        { id: 'c2', name: 'Weekly Puzzle', icon: <VideogameAssetIcon />, desc: 'Solve the puzzle', link: '/challenges/weekly' },
    ];
    const suggestions = [
         { id: 'u1', name: 'Alex Johnson', title: 'Frontend Developer @ Acme', avatarUrl: null },
         { id: 'u2', name: 'Samantha Lee', title: 'Product Designer', avatarUrl: 'https://i.pravatar.cc/40?img=5' },
    ];

    // --- Optimized Styles ---
    const cardSx = {
        bgcolor: 'var(--color-surface)',
        border: `1px solid var(--color-border)`,
        borderRadius: 'var(--border-radius-large)',
        overflow: 'hidden',
        // Reduced bottom margin between cards
        mb: theme.spacing(1.5), // Was var(--content-padding) - likely 24px, now 12px
        boxShadow: 'none',
    };
    const cardHeaderSx = {
        // Slightly reduced vertical padding
        p: theme.spacing(1.25, 2), // Was 1.5 (12px), now 10px vertical. Horizontal kept at 16px.
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    };
    const cardFooterSx = {
        // Slightly reduced padding
        p: theme.spacing(0.75, 2), // Was 1 (8px), now 6px vertical. Horizontal kept at 16px.
        borderTop: `1px solid var(--color-border)`,
        textAlign: 'center',
    };
    const listItemSx = {
        // Reduced vertical padding for list items
        py: 1, // Was 1.5 (12px) or 1 (8px), now consistently 8px
        px: 2, // Keep horizontal padding
    };
    const listIconSx = {
        minWidth: 36,
        color: 'var(--color-icon)'
    };
    const listIconAvatarSx = {
        minWidth: 44, // Slightly smaller minWidth for avatar icon
    };
    const listTextPrimarySx = {
        fontWeight: 500,
        fontSize: '0.875rem', // Slightly smaller font if desired, or keep at 0.9rem
        color: 'var(--color-text-primary)'
    };
    const listTextSecondarySx = {
        fontSize: '0.75rem', // Slightly smaller font if desired, or keep at 0.8rem
        color: 'var(--color-text-secondary)'
    };
    // --- End Optimized Styles ---


    const handleFollow = (userId) => console.log('Follow:', userId); // Placeholder function

    // Helper to generate avatar properties (example)
    const getAvatarProps = (user) => {
        if (user.avatarUrl) {
            return { src: user.avatarUrl };
        }
        // Placeholder implementation for initials/color - replace with actual functions if needed
        // return { sx: { bgcolor: stringToColor(user.name) }, children: getInitials(user.name) };
        return { children: <PersonIcon fontSize="small" /> }; // Fallback icon
      };


    return (
        <Box
            component="aside"
            aria-label="Contextual information sidebar"
            sx={{
                // Reduced overall padding for the sidebar container
                p: theme.spacing(1.5), // Was var(--content-padding), now 12px
                height: '100%',
                boxSizing: 'border-box',
                display: 'flex', // Use flexbox to push footer down
                flexDirection: 'column', // Stack children vertically
            }}
        >
            {/* Main Content Area (Scrollable if needed, but usually fits) */}
            <Box sx={{ flexGrow: 1 }}>
                <Paper elevation={0} sx={cardSx}>
                    <Box sx={cardHeaderSx}>
                        <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600 }}>Challenges</Typography>
                    </Box>
                    <Divider sx={{ borderColor: 'var(--color-border)' }} />
                    <List dense disablePadding>
                        {challenges.map((item) => (
                            <ListItemButton key={item.id} component={RouterLink} to={item.link} sx={listItemSx}>
                                <ListItemIcon sx={listIconSx}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={item.name}
                                    secondary={item.desc}
                                    primaryTypographyProps={{ sx: listTextPrimarySx }}
                                    secondaryTypographyProps={{ sx: listTextSecondarySx }}
                                />
                                <ChevronRightIcon sx={{ color: 'var(--color-icon)', fontSize: '1.2rem', ml: 1 }} />
                            </ListItemButton>
                        ))}
                    </List>
                </Paper>

                 <Paper elevation={0} sx={cardSx}>
                    <Box sx={cardHeaderSx}>
                         <Typography variant="subtitle2" component="h3" sx={{ fontWeight: 600 }}>Suggestions</Typography>
                         <Tooltip title="Based on your activity"><InfoOutlinedIcon sx={{ color: 'var(--color-icon)', fontSize: '1rem' }} /></Tooltip>
                     </Box>
                     <Divider sx={{ borderColor: 'var(--color-border)' }} />
                     {/* REMOVED py from List, handled by ListItemButton */}
                     <List dense disablePadding>
                     {suggestions.map((user) => (
                        <ListItemButton key={user.id} sx={listItemSx}>
                            <ListItemIcon sx={listIconAvatarSx}>
                                <Avatar
                                    {...getAvatarProps(user)} // Use helper function
                                    // Slightly smaller avatar
                                    sx={{ width: 30, height: 30 }}
                                />
                            </ListItemIcon>
                            <ListItemText
                                primary={user.name}
                                secondary={user.title}
                                primaryTypographyProps={{ sx: listTextPrimarySx }}
                                secondaryTypographyProps={{ sx: listTextSecondarySx }}
                            />
                            <Button
                                size="small"
                                variant="outlined"
                                startIcon={<AddIcon />}
                                onClick={() => handleFollow(user.id)}
                                sx={{
                                    ml: 1,
                                    textTransform: 'none',
                                    fontSize: '0.75rem',
                                    py: 0.25,
                                    px: 1,
                                    borderColor: 'var(--color-border)',
                                    color: 'var(--color-primary)',
                                    '&:hover': {
                                        bgcolor: 'var(--color-primary-light)',
                                        borderColor: 'var(--color-primary)'
                                    }
                                }}
                            >
                                Follow
                            </Button>
                        </ListItemButton>
                        ))}
                     </List>
                     <Box sx={cardFooterSx}>
                        <Button
                            component={RouterLink}
                            to="/suggestions"
                            size="small"
                            endIcon={<ChevronRightIcon />}
                            sx={{ textTransform: 'none', color: 'var(--color-primary)', fontWeight: 500 }}
                        >
                            View All
                        </Button>
                     </Box>
                 </Paper>
             </Box>

             {/* Footer Links Area */}
             <Box sx={{ mt: 1, pt: 1, textAlign: 'center', borderTop: `1px solid var(--color-border)` }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing(0.5, 1.5), fontSize: '0.75rem' }}>
                      <RouterLink to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About</RouterLink>
                      <RouterLink to="/help" style={{ color: 'inherit', textDecoration: 'none' }}>Help</RouterLink>
                      <RouterLink to="/privacy" style={{ color: 'inherit', textDecoration: 'none' }}>Privacy</RouterLink>
                      <RouterLink to="/terms" style={{ color: 'inherit', textDecoration: 'none' }}>Terms</RouterLink>
                      <span>© {new Date().getFullYear()} stdDB</span>
                  </Typography>
             </Box>

        </Box>
    );
};

export default RightSidebar;