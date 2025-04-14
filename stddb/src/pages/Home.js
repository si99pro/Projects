/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */
// src/pages/Home.js
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase'; // Assuming firebase is configured
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper'; // Single Paper for content
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton'; // For clickable list items
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import { useTheme } from '@mui/material/styles';
import Link from '@mui/material/Link'; // If needed for external links

// MUI Icons - Choose icons relevant to dashboard sections
import SpeedIcon from '@mui/icons-material/Speed'; // For Overview/Stats
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone'; // Alerts
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn'; // Tasks
import EventAvailableIcon from '@mui/icons-material/EventAvailable'; // Events/Calendar
import SchoolIcon from '@mui/icons-material/School'; // Courses/Grades
import PaymentIcon from '@mui/icons-material/Payment'; // Billing
import LinkIcon from '@mui/icons-material/Link'; // Quick Links
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'; // Indicate navigation
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import PendingIcon from '@mui/icons-material/Pending';


/**
 * Home Dashboard Component - Redesigned to match Profile.js structure
 */
const Home = () => {
  const theme = useTheme();
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  // --- State Management ---
  const [basicInfo, setBasicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- Placeholder Dashboard Data ---
  // Simplified data structure suitable for List display
  const [dashboardData, setDashboardData] = useState({
    alertsCount: 2,
    pendingTasksCount: 1,
    nextEvent: { title: 'Project Deadline - CS301', date: 'Oct 28' },
    quickStats: [
        { label: 'Active Courses', value: 3, icon: <SchoolIcon fontSize="small"/>, path: '/courses' },
        { label: 'Account Balance', value: '$150.75', icon: <PaymentIcon fontSize="small"/>, path: '/billing' },
        // Add more stats if needed
    ],
     tasksPreview: [ // Show only 1-2 important tasks
        { id: 't1', title: 'Submit Project Proposal', status: 'pending', path: '/tasks/t1' },
        { id: 't3', title: 'Register for Spring Semester', status: 'overdue', path: '/registration' },
    ],
    quickLinks: [ // Key navigation points
        { id: 'ql1', label: 'My Grades', path: '/grades' },
        { id: 'ql2', label: 'My Schedule', path: '/schedule' },
        { id: 'ql4', label: 'Full Calendar', path: '/calendar' },
        { id: 'ql5', label: 'View All Tasks', path: '/tasks' },
    ]
  });

  // --- Handlers ---
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
  };

  // --- Data Fetching Effect (Similar to Profile.js) ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (!currentUser?.uid) {
        if (isMounted) { setError("Not logged in."); setLoading(false); setBasicInfo(null); } return;
      }
      if (contextUserData?.basicInfo && loading) {
          setBasicInfo(contextUserData.basicInfo);
          // TODO: Fetch/set dashboard data
          if (isMounted) setLoading(false);
          return;
      }
      if (loading) {
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (isMounted) {
            if (docSnap.exists()) {
              const fetchedData = docSnap.data();
              setBasicInfo(fetchedData.basicInfo || { email: currentUser.email, fullName: 'User' });
              // TODO: Fetch/set actual dashboard data
            } else {
              setError('User profile not found. Using default view.');
              setBasicInfo({ email: currentUser.email, fullName: 'User' });
              // TODO: Set default dashboard data
            }
            setLoading(false);
          }
        } catch (err) {
          console.error("Error fetching user info:", err);
          if (isMounted) { setError('Failed to load user data.'); setLoading(false); setBasicInfo({ email: currentUser.email, fullName: 'User' }); }
        }
      }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [currentUser, contextUserData, loading]);

  // --- Dynamic Display Name ---
  const displayName = basicInfo?.fullName || 'User';

  // --- Reusable Styling (Adopted from Profile.js) ---
  const primaryTextSx = { color: 'var(--color-text-primary)' };
  const secondaryTextSx = { color: 'var(--color-text-secondary)' };

  // Helper to render task status icons (same as before)
  const renderTaskStatusIcon = (status) => {
    switch (status) {
        case 'completed': return <CheckCircleOutlineIcon color="success" sx={{ fontSize: '1.1rem' }} />;
        case 'pending': return <PendingIcon color="warning" sx={{ fontSize: '1.1rem' }} />;
        case 'overdue': return <ErrorOutlineIcon color="error" sx={{ fontSize: '1.1rem' }} />;
        default: return null;
    }
  }

  // --- Render Logic ---
  return (
    <Container
      component="main"
      maxWidth="lg"
      disableGutters={true} // Container provides no gutters/padding
      sx={{
          flexGrow: 1,
          // Container has no explicit padding or margin
      }}
    >
      {/* --- PAGE TITLE (Outside Paper) --- */}
      <Typography
        variant="h4"
        component="h1"
        sx={{
          fontWeight: 500, // Match Profile.js title weight
          ...primaryTextSx,
          mb: 2, // Margin below title before the main Paper
          // Add padding if needed, e.g., px: { xs: 2, sm: 3 }, pt: { xs: 2, sm: 3 }
          // Or handle padding in Layout.css
        }}
      >
        Dashboard
      </Typography>

      {/* --- CONDITIONAL CONTENT AREA --- */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '50vh', p: 3 }}>
            <CircularProgress size={50} />
        </Box>
      ) : error ? (
        // Add margin/padding if needed as Paper is removed for error state
        <Alert severity="error" sx={{ width: 'auto', mx: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }, borderRadius: 'var(--border-radius, 6px)' }}>{error}</Alert>
      ) : (
        // --- Main Content Paper (Single Paper like Profile.js) ---
        <Paper
          elevation={0}
          variant="outlined"
          sx={{
            p: 0, // Padding handled by inner Boxes
            width: '100%', // Takes full width of container
            bgcolor: 'var(--color-bg-card)',
            borderColor: 'divider',
            borderRadius: 'var(--border-radius, 6px)', // Consistent corner radius
            overflow: 'hidden',
            // Add margin if needed (e.g., mx, mb) if container/layout doesn't provide spacing
            // mx: { xs: 2, sm: 3 }, mb: { xs: 2, sm: 3 }
          }}
        >
            {/* Optional: Header Section (Similar to Profile Header but for Dashboard) */}
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: { xs: 2, sm: 3 }, borderBottom: 1, borderColor: 'divider' }}>
                <Box>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 600, ...primaryTextSx }}>
                        Welcome, {displayName}!
                    </Typography>
                    <Typography variant="body2" sx={secondaryTextSx}>
                        Here's your quick overview for today.
                    </Typography>
                </Box>
                {/* Optional: Add a primary action button here if needed */}
                {/* <Button size="small" variant="contained">Action</Button> */}
            </Box>

            {/* --- Main Dashboard Content Sections within Paper --- */}
            <Box sx={{ p: { xs: 2, sm: 3 } }}> {/* Padding for content sections */}
                <List disablePadding>

                    {/* Section 1: Quick Stats */}
                    <ListItem disablePadding sx={{ display: 'block', mb: 2 }}> {/* Block display for section title */}
                       <Typography variant="overline" sx={{...secondaryTextSx, display:'flex', alignItems: 'center', mb: 1}}>
                            <SpeedIcon fontSize="inherit" sx={{ mr: 1 }}/> Quick Stats
                       </Typography>
                        <List dense disablePadding>
                            {dashboardData.quickStats.map((stat) => (
                                <ListItemButton key={stat.label} component={RouterLink} to={stat.path} sx={{ py: 0.75, px: 1, borderRadius: 1 }}>
                                    <ListItemIcon sx={{ minWidth: 36, color: 'action.active' }}>{stat.icon}</ListItemIcon>
                                    <ListItemText
                                        primary={stat.label}
                                        secondary={stat.value}
                                        primaryTypographyProps={{ variant: 'body2', sx: primaryTextSx }}
                                        secondaryTypographyProps={{ variant: 'body1', sx: {...primaryTextSx, fontWeight: 500} }}
                                    />
                                    <ArrowForwardIosIcon sx={{ fontSize: '0.8rem', color: 'action.disabled' }}/>
                                </ListItemButton>
                            ))}
                        </List>
                    </ListItem>

                    <Divider sx={{ my: 2 }} />

                    {/* Section 2: Important Tasks Preview */}
                    <ListItem disablePadding sx={{ display: 'block', mb: 2 }}>
                       <Typography variant="overline" sx={{...secondaryTextSx, display:'flex', alignItems: 'center', mb: 1}}>
                            <AssignmentTurnedInIcon fontSize="inherit" sx={{ mr: 1 }}/> Important Tasks ({dashboardData.pendingTasksCount} Pending)
                       </Typography>
                       <List dense disablePadding>
                           {dashboardData.tasksPreview.map(task => (
                               <ListItemButton key={task.id} component={RouterLink} to={task.path} sx={{ py: 0.75, px: 1, borderRadius: 1 }}>
                                   <ListItemIcon sx={{ minWidth: 36 }}>{renderTaskStatusIcon(task.status)}</ListItemIcon>
                                   <ListItemText
                                       primary={task.title}
                                       primaryTypographyProps={{ variant: 'body2', sx: primaryTextSx }}
                                    />
                                   <Chip
                                        label={task.status}
                                        size="small"
                                        color={task.status === 'pending' ? 'warning' : 'error'}
                                        variant="outlined"
                                        sx={{ ml: 1, textTransform: 'capitalize', height: 'auto', lineHeight: 1.5 }}
                                    />
                               </ListItemButton>
                           ))}
                       </List>
                    </ListItem>

                    <Divider sx={{ my: 2 }} />

                    {/* Section 3: Alerts & Upcoming Event */}
                     <ListItem disablePadding sx={{ display: 'block', mb: 2 }}>
                       <Typography variant="overline" sx={{...secondaryTextSx, display:'flex', alignItems: 'center', mb: 1}}>
                            <NotificationsNoneIcon fontSize="inherit" sx={{ mr: 1 }}/> Alerts & Events
                       </Typography>
                       <List dense disablePadding>
                           {/* Alerts */}
                            <ListItemButton component={RouterLink} to="/notifications" sx={{ py: 0.75, px: 1, borderRadius: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36, color: 'action.active' }}><NotificationsNoneIcon fontSize="small"/></ListItemIcon>
                                <ListItemText
                                    primary={`${dashboardData.alertsCount} New Alerts`}
                                    primaryTypographyProps={{ variant: 'body2', sx: primaryTextSx }}
                                />
                                <ArrowForwardIosIcon sx={{ fontSize: '0.8rem', color: 'action.disabled' }}/>
                           </ListItemButton>
                           {/* Next Event */}
                            <ListItemButton component={RouterLink} to="/calendar" sx={{ py: 0.75, px: 1, borderRadius: 1 }}>
                                <ListItemIcon sx={{ minWidth: 36, color: 'action.active' }}><EventAvailableIcon fontSize="small"/></ListItemIcon>
                                <ListItemText
                                    primary={dashboardData.nextEvent.title}
                                    secondary={`Next Event: ${dashboardData.nextEvent.date}`}
                                    primaryTypographyProps={{ variant: 'body2', sx: primaryTextSx }}
                                    secondaryTypographyProps={{ variant: 'caption', sx: secondaryTextSx }}
                                />
                               <ArrowForwardIosIcon sx={{ fontSize: '0.8rem', color: 'action.disabled' }}/>
                           </ListItemButton>
                       </List>
                    </ListItem>

                    <Divider sx={{ my: 2 }} />

                     {/* Section 4: Quick Links */}
                     <ListItem disablePadding sx={{ display: 'block' }}>
                       <Typography variant="overline" sx={{...secondaryTextSx, display:'flex', alignItems: 'center', mb: 1}}>
                            <LinkIcon fontSize="inherit" sx={{ mr: 1 }}/> Quick Links
                       </Typography>
                       <List dense disablePadding>
                           {dashboardData.quickLinks.map(link => (
                               <ListItemButton key={link.id} component={RouterLink} to={link.path} sx={{ py: 1, px: 1, borderRadius: 1 }}> {/* Slightly more padding for links */}
                                   <ListItemText
                                        primary={link.label}
                                        primaryTypographyProps={{ variant: 'body2', sx: primaryTextSx }}
                                   />
                                   <ArrowForwardIosIcon sx={{ fontSize: '0.8rem', color: 'action.disabled' }}/>
                               </ListItemButton>
                           ))}
                       </List>
                    </ListItem>

                </List>
            </Box>

        </Paper>
      )}

      {/* --- SNACKBAR --- */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled">
            {snackbar.message}
         </Alert>
      </Snackbar>
    </Container>
  );
};

export default Home;