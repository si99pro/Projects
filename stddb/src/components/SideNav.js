import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Assuming context provides necessary data

// MUI Components
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import BookmarkIcon from '@mui/icons-material/Bookmark';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person'; // Fallback icon

// Import the corresponding CSS file
import './SideNav.css';

// Helper function for Avatar initials
const getInitials = (name) => {
    if (!name || typeof name !== 'string' || name.trim() === "") return '?';
    // Filter(Boolean) removes empty strings resulting from multiple spaces
    const nameParts = name.trim().split(' ').filter(Boolean);
    // Use first letter of first and last part if available
    if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
    // Use first letter if only one part
    if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase();
    // Fallback
    return '?';
};

/**
 * SideNav Component - Renders the sticky left sidebar content.
 * Assumes it's primarily for desktop view due to CSS hiding it on mobile.
 */
const SideNav = () => {
  // Fetch user data from context
  const { contextUserData } = useAuth();

  // Provide placeholder data if context data is not available (for loading/logged out states)
  const placeholderUser = {
      basicInfo: { fullName: 'User Name', headline: 'User Headline', profileImageUrl: null },
      stats: { profileViewers: 0, postImpressions: 0 }
  };
  // Use context data if available, otherwise use placeholder
  const userData = contextUserData || placeholderUser;
  const basicInfo = userData.basicInfo;
  const stats = userData.stats;

  // Placeholder background URL - can be replaced with dynamic data or CSS background
  const profileBgUrl = 'https://via.placeholder.com/240x60/cccccc/888888?text=Cover';

  return (
    // Root element: An aside with the class for CSS targeting and sticky behavior
    <Box
        component="aside"
        className="sticky-sidebar" // This class is styled in SideNav.css
        aria-label="User profile and options sidebar"
    >

      {/* ----- Profile Summary Card ----- */}
      <Paper elevation={0} className="sidebar-card profile-card">
        {/* Profile Background */}
        <Box
            className="profile-bg"
            // Background image applied via sx for simplicity, could be moved to CSS
            sx={{ backgroundImage: `url(${profileBgUrl})` }}
        />
        {/* User Avatar */}
        <Avatar
          className="profile-avatar" // Class for CSS styling (size, margin, border)
          src={basicInfo?.profileImageUrl || undefined} // Use optional chaining
          alt={basicInfo?.fullName || 'User Profile'}
        >
           {/* Display initials if no image and name exists, otherwise fallback icon */}
           {!basicInfo?.profileImageUrl && basicInfo?.fullName
            ? getInitials(basicInfo.fullName)
            : !basicInfo?.profileImageUrl ? <PersonIcon/> : null
           }
        </Avatar>
         {/* User Text Info */}
         <Box className="profile-info">
            <Typography variant="h6" component={Link} to="/profile" className="profile-name-link">
                {basicInfo?.fullName || 'Your Name'}
            </Typography>
            <Typography variant="body2" className="profile-headline">
                {basicInfo?.headline || 'Your Headline Here'}
            </Typography>
         </Box>
         {/* Divider */}
         <Divider aria-hidden="true" sx={{ my: 1.5, borderColor: 'var(--color-border)' }}/>
         {/* Profile Stats */}
         <Box className="profile-stats">
            <Box className="stat-item">
                <Typography variant="caption" className="stat-label">Profile viewers</Typography>
                <Typography variant="body2" className="stat-value">{stats?.profileViewers ?? 0}</Typography>
            </Box>
             <Box className="stat-item">
                <Typography variant="caption" className="stat-label">Post impressions</Typography>
                <Typography variant="body2" className="stat-value">{stats?.postImpressions ?? 0}</Typography>
            </Box>
         </Box>
      </Paper>

       {/* ----- Premium Promo Card ----- */}
       <Paper elevation={0} className="sidebar-card premium-promo-card">
            <Typography variant="body2" sx={{ mb: 0.5, color: 'var(--color-text-secondary)' }}> {/* Ensure text color */}
                Grow your career with Premium
            </Typography>
            <Button
                variant="outlined"
                size="small"
                // Premium Icon Box styled inline for background
                startIcon={<Box sx={{ width: 16, height: 16, bgcolor: 'var(--color-premium-icon-bg, #f8c77e)', mr: 0.5, borderRadius: '2px' }} />}
                className="premium-button" // Class for border, text color, etc.
            >
                Try Premium for BDT0 {/* Example Text */}
            </Button>
       </Paper>

       {/* ----- Saved Items Card/Button ----- */}
       <Paper elevation={0} className="sidebar-card saved-items-card">
           <Button
              component={Link} // Use React Router Link
              to="/saved" // Example target route
              fullWidth // Make button fill the card width
              startIcon={<BookmarkIcon />} // Icon provided
              className="saved-items-button" // Class for styling
           >
                Saved Items
            </Button>
       </Paper>

        {/* ----- Groups Card/Button ----- */}
        <Paper elevation={0} className="sidebar-card groups-card">
           <Button
              component={Link} // Use React Router Link
              to="/groups" // Example target route
              fullWidth // Make button fill the card width
              startIcon={<GroupIcon />} // Icon provided
              className="groups-button" // Class for styling
           >
                Groups
            </Button>
       </Paper>

      {/* Add more sidebar cards/sections here */}

    </Box>
  );
};

export default SideNav;