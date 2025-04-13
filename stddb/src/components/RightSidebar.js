// src/components/RightSidebar.js
import React from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper'; // Keep Paper for card structure if desired
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
import Divider from '@mui/material/Divider';
import { useTheme } from '@mui/material/styles';
import { Link as RouterLink } from 'react-router-dom';

// --- Icons ---
import ExtensionIcon from '@mui/icons-material/ExtensionOutlined'; // Use outlined versions for consistency
import VideogameAssetIcon from '@mui/icons-material/VideogameAssetOutlined';
// Removed unused icons: Leaderboard, EmojiEvents
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import AddIcon from '@mui/icons-material/Add';
import PersonIcon from '@mui/icons-material/PersonOutline'; // Fallback for Avatar

// --- CSS ---
// Removed import './RightSidebar.css'; - Styles moved to sx or Layout.css

// --- Helper Functions ---
// Keep if needed, ensure they are robust
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '';
    const nameParts = name.trim().split(' ').filter(Boolean);
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    return '';
};

const stringToColor = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xFF;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};
// --- End Helper Functions ---


const RightSidebar = () => {
    const theme = useTheme();

    // --- Placeholder Data ---
    const puzzleGames = [
        { id: 'zip', name: 'Zip Connections', icon: <ExtensionIcon />, description: 'Daily word puzzle' },
        { id: 'tango', name: 'Tango Trivia', icon: <VideogameAssetIcon />, description: 'Test your knowledge' },
    ];
    const feedSuggestions = [
         { id: 'user1', name: 'Maroof Sheikh Mohammad', title: 'Managing Director & CEO Dhaka Bank PLC', avatarUrl: null },
         { id: 'user2', name: 'Tasnim Khiria Aurpa', title: 'Software Engineer at Optimizely', avatarUrl: null },
         { id: 'user3', name: 'John Doe', title: 'UX Designer at Creative Inc.', avatarUrl: 'https://via.placeholder.com/40' }, // Example with image
    ];
    // --- End Placeholder Data ---

    // Common styles for sidebar cards
    const cardSx = {
        bgcolor: 'var(--color-bg-card)',
        // Use subtle border instead of elevation for a flatter look
        border: `1px solid ${theme.palette.divider}`,
        borderRadius: 'var(--border-radius-lg, 12px)', // Slightly larger radius for cards
        overflow: 'hidden', // Ensures content respects border radius
        mb: theme.spacing(2), // Spacing between cards
    };

    // Common styles for card headers
    const cardHeaderSx = {
        p: theme.spacing(1.5, 2), // Consistent padding
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        // borderBottom: `1px solid ${theme.palette.divider}`, // Optional: divider below header
    };

    // Common styles for "View All" type footers
    const cardFooterSx = {
        p: theme.spacing(1, 2), // Reduced padding for footer actions
        borderTop: `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
    };

    const handleFollow = (userId) => {
        console.log('Follow action triggered for user:', userId);
        // Add API call logic here
    };

    return (
        // Container: Position managed by Layout.css (right-sidebar-wrapper)
        <Box component="aside" aria-label="Information and suggestions sidebar">

            {/* ----- Puzzles Card ----- */}
            <Paper elevation={0} sx={cardSx}>
                 <Box sx={cardHeaderSx}>
                     <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                         Today's Challenges
                     </Typography>
                     {/* Optional: Add an icon or action here if needed */}
                 </Box>
                 <Divider />
                 <List dense disablePadding>
                     {puzzleGames.map((game) => (
                         <ListItemButton
                             key={game.id}
                             component={RouterLink}
                             to={`/games/${game.id}`}
                             sx={{
                                py: 1, px: 2, // Adjusted padding
                                '&:hover': { bgcolor: 'var(--color-bg-hover)' },
                             }}
                          >
                             <ListItemIcon sx={{ minWidth: 40, mr: 1, color: 'var(--color-icon)' }}>
                                 {game.icon}
                             </ListItemIcon>
                             <ListItemText
                                 primary={game.name}
                                 secondary={game.description}
                                 primaryTypographyProps={{ sx: { fontWeight: 500, fontSize: '0.875rem', color: 'var(--color-text-primary)' } }}
                                 secondaryTypographyProps={{ sx: { fontSize: '0.75rem', color: 'var(--color-text-secondary)' } }}
                              />
                             <ChevronRightIcon sx={{ color: 'var(--color-icon)', fontSize: '1.1rem', ml: 1, opacity: 0.7 }}/>
                         </ListItemButton>
                     ))}
                 </List>
            </Paper>

             {/* ----- Add to Feed Card ----- */}
             <Paper elevation={0} sx={cardSx}>
                 <Box sx={cardHeaderSx}>
                     <Typography variant="subtitle1" component="h3" sx={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
                         People You May Know
                     </Typography>
                     <Tooltip title="Based on your profile and network">
                         <InfoOutlinedIcon sx={{ color: 'var(--color-icon)', fontSize: '1rem', opacity: 0.8 }} />
                     </Tooltip>
                 </Box>
                  <Divider />
                 <List dense disablePadding sx={{ p: theme.spacing(0.5, 0) }}> {/* Add slight vertical padding for list items */}
                     {feedSuggestions.map((user) => (
                         <ListItem
                            key={user.id}
                            sx={{ py: 1.25, px: 2, alignItems: 'center' }} // Center align items vertically
                            secondaryAction={
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<AddIcon sx={{ fontSize: '1rem' }}/>}
                                    onClick={() => handleFollow(user.id)}
                                    sx={{
                                        ml: 1,
                                        borderRadius: '16px',
                                        textTransform: 'none',
                                        fontWeight: 600,
                                        fontSize: '0.75rem',
                                        borderColor: 'var(--color-border-secondary, #ccc)',
                                        color: 'var(--color-text-secondary)',
                                        whiteSpace: 'nowrap', // Prevent wrapping
                                        px: 1.5, // Adjust padding
                                        '&:hover': {
                                            bgcolor: 'var(--color-bg-hover-strong)',
                                            borderColor: 'var(--color-text-primary)',
                                            color: 'var(--color-text-primary)',
                                        }
                                     }}
                                 >
                                     Follow
                                 </Button>
                            }
                         >
                              <ListItemAvatar sx={{ minWidth: 48 }}> {/* Adjust spacing */}
                                  <Avatar
                                      alt={user.name}
                                      src={user.avatarUrl || undefined}
                                      sx={{
                                          width: 40, height: 40,
                                          bgcolor: user.avatarUrl ? undefined : stringToColor(user.name),
                                          fontSize: '0.875rem' // Adjust initials size if needed
                                      }}
                                   >
                                       {!user.avatarUrl ? getInitials(user.name) : <PersonIcon />}
                                   </Avatar>
                               </ListItemAvatar>
                               <ListItemText
                                   primary={user.name}
                                   secondary={user.title}
                                   primaryTypographyProps={{
                                       sx: { fontWeight: 500, fontSize: '0.875rem', mb: 0.2, color: 'var(--color-text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }
                                   }}
                                   secondaryTypographyProps={{
                                       sx: { fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' } // Ensure secondary also truncates
                                   }}
                                   sx={{ mr: 1 }} // Add margin before the button
                               />
                          </ListItem>
                      ))}
                  </List>
                  {/* Optional Divider before footer */}
                  {/* <Divider sx={{ mx: 2 }}/> */}
                  <Box sx={cardFooterSx}>
                      <Button
                          component={RouterLink}
                          to="/people/recommendations"
                          fullWidth
                          size="small"
                          endIcon={<ChevronRightIcon sx={{ fontSize: '1rem' }} />}
                          sx={{
                              color: 'var(--color-text-secondary)',
                              fontWeight: 500,
                              textTransform: 'none',
                              fontSize: '0.8rem',
                              '&:hover': { bgcolor: 'var(--color-bg-hover)' }
                          }}
                       >
                          View all recommendations
                       </Button>
                   </Box>
             </Paper>

             {/* ----- Potential Ads or Footer Links Card ----- */}
             {/* Example: */}
             {/*
             <Paper elevation={0} sx={{ ...cardSx, p: 2, textAlign: 'center' }}>
                 <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)' }}>
                     Advertisement
                 </Typography>
                 <Box sx={{ my: 1, height: '100px', bgcolor: 'var(--color-bg-search)', borderRadius: 'var(--border-radius)' }} />
                 <Button size="small" variant="text" href="#" target="_blank">Learn More</Button>
             </Paper>
             */}

              {/* ----- Footer Links (Alternative placement) ----- */}
              <Box sx={{ mt: 2, px: 1, textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: 'var(--color-text-secondary)', display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: theme.spacing(0.5, 1.5) }}>
                      <RouterLink to="/about" className="footer-link">About</RouterLink>
                      <RouterLink to="/help" className="footer-link">Help</RouterLink>
                      <RouterLink to="/privacy" className="footer-link">Privacy</RouterLink>
                      <RouterLink to="/terms" className="footer-link">Terms</RouterLink>
                       <span>© {new Date().getFullYear()} stdDB</span>
                  </Typography>
                  {/* Add simple CSS for .footer-link if needed (color, text-decoration) */}
                  <style>{`
                      .footer-link {
                          color: var(--color-text-secondary);
                          text-decoration: none;
                          font-size: 0.75rem;
                      }
                      .footer-link:hover {
                          text-decoration: underline;
                          color: var(--color-text-primary);
                      }
                  `}</style>
              </Box>

        </Box> // End of root aside Box
    );
};

export default RightSidebar;