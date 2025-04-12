/* eslint-disable no-unused-vars */
// src/components/RightSidebar.js
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// --- Icons ---
import ExtensionIcon from '@mui/icons-material/Extension';
import VideogameAssetIcon from '@mui/icons-material/VideogameAsset';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';

// --- CSS ---
import './RightSidebar.css'; // Make sure this contains the sticky container styles

// --- Helper Functions ---
// Keep these if needed for Avatar colors/initials in this component
const getInitials = (name) => { /* ... implementation ... */ };
const stringToColor = (string) => { /* ... implementation ... */ };
// --- End Helper Functions ---


const RightSidebar = () => {
    const theme = useTheme();

    // --- Placeholder Data ---
    const puzzleGames = [
        { id: 'zip', name: 'Zip', icon: <ExtensionIcon />, description: '5 connections played' },
        { id: 'tango', name: 'Tango', icon: <VideogameAssetIcon />, description: '5 connections played' },
        // ... other games
    ];
    const feedSuggestions = [
         { id: 'user1', name: 'Maroof Sheikh Mohammad', title: 'Managing Director & CEO Dhaka Bank PLC', avatarUrl: null },
         { id: 'user2', name: 'Tasnim Khiria Aurpa', title: 'Software Engineer at Optimizely', avatarUrl: null },
    ];
    // --- End Placeholder Data ---

    return (
        // Container for the sticky column
        <Box component="aside" className="right-sidebar-sticky-container" aria-label="Information and suggestions sidebar">

            {/* ----- Puzzles Card ----- */}
            <Paper elevation={0} className="sidebar-card">
                 <Box sx={{ p: 2 }}>
                     <Typography variant="h6" component="h3" sx={{ mb: 1, fontSize: '1rem', fontWeight: 600 }}>
                         Today's puzzle games
                     </Typography>
                 </Box>
                 <List dense disablePadding>
                     {puzzleGames.map((game) => (
                         <ListItemButton key={game.id} component={RouterLink} to={`/games/${game.id}`} sx={{ py: 0.8, px: 2 }}>
                             <ListItemIcon sx={{ minWidth: 36, color: 'var(--color-icon)' }}>{game.icon}</ListItemIcon>
                             <ListItemText primary={game.name} secondary={game.description} primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: '0.9rem' } }} secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: 'var(--color-text-secondary)' } }} />
                             <ChevronRightIcon sx={{ color: 'var(--color-icon)', fontSize: '1.2rem' }}/>
                         </ListItemButton>
                     ))}
                 </List>
            </Paper>

             {/* ----- Add to Feed Card ----- */}
             <Paper elevation={0} className="sidebar-card">
                 <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                     <Typography variant="h6" component="h3" sx={{ fontSize: '1rem', fontWeight: 600 }}>Add to your feed</Typography>
                     <Tooltip title="Info about feed suggestions"><IconButton size="small" sx={{ color: 'var(--color-icon)' }}><InfoOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                 </Box>
                 <List dense disablePadding>
                     {feedSuggestions.map((user) => (
                         <ListItem key={user.id} sx={{ py: 1, px: 2 }} >
                              <ListItemAvatar sx={{ minWidth: 52 }}><Avatar alt={user.name} src={user.avatarUrl || undefined} sx={{ width: 40, height: 40, bgcolor: stringToColor(user.name) }}>{!user.avatarUrl ? getInitials(user.name) : null}</Avatar></ListItemAvatar>
                              <ListItemText primary={user.name} secondary={user.title} primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: '0.9rem', mb: 0.2 } }} secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', whiteSpace: 'normal' } }} />
                              <Button variant="outlined" size="small" startIcon={<AddIcon />} sx={{ ml: 1, borderRadius: '16px', textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', borderColor: 'var(--color-text-secondary)', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap', '&:hover': { bgcolor: 'var(--color-bg-hover)', borderColor: 'var(--color-text-primary)', color: 'var(--color-text-primary)' } }} onClick={() => console.log('Follow:', user.id)} >Follow</Button>
                          </ListItem>
                      ))}
                  </List>
                  <Box sx={{ p: 2, pt: 0.5 }}><Button component={RouterLink} to="/people/recommendations" fullWidth size="small">View all recommendations <ChevronRightIcon sx={{ fontSize: '1rem', ml: 0.5 }} /></Button></Box>
             </Paper>

             {/* Potential Ads or Footer Links Card */}

        </Box>
    );
};

// Helper function implementations (if needed locally)
// const getInitials = ...
// const stringToColor = ...

export default RightSidebar; // IMPORTANT: Export the component