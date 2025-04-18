/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate, Link as RouterLink } from 'react-router-dom';

// MUI Components
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Snackbar from '@mui/material/Snackbar';
import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListItemButton from '@mui/material/ListItemButton';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip'; // Added for potential future use

// MUI Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import PaymentIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight'; // Keep Chevron
import TaskAltIcon from '@mui/icons-material/TaskAlt'; // Example icon
import AssignmentIcon from '@mui/icons-material/Assignment'; // Example icon

const Home = () => {
  const theme = useTheme();
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- Placeholder Data --- (Ensure consistent icon usage)
  const [dashboardData, setDashboardData] = useState({
    alertsCount: 2,
    pendingTasksCount: 1,
    nextEvent: { title: 'Midterm Exam - MATH201', date: 'Nov 05', path: '/calendar/event/e1' },
    quickStats: [
       { label: 'Active Courses', value: 3, icon: <SchoolIcon />, path: '/courses', color: theme.palette.primary.main },
       { label: 'Credits Earned', value: '45', icon: <CheckCircleOutlineIcon />, path: '/transcript', color: theme.palette.success.main },
       { label: 'Account Balance', value: '$150.75', icon: <PaymentIcon />, path: '/billing', color: theme.palette.warning.dark },
    ],
    tasksPreview: [
      { id: 't1', title: 'Submit Project Proposal', status: 'pending', path: '/tasks/t1', subject: 'CS450', icon: <AssignmentIcon fontSize="small"/> },
      { id: 't3', title: 'Register for Spring Semester', status: 'overdue', path: '/registration', subject: 'Admin', icon: <TaskAltIcon fontSize="small"/> },
    ],
    quickLinks: [
      { id: 'ql1', label: 'My Grades', path: '/grades', icon: <SchoolIcon fontSize="small"/> },
      { id: 'ql2', label: 'Class Schedule', path: '/schedule', icon: <EventAvailableIcon fontSize="small"/> },
      { id: 'ql4', label: 'Full Calendar', path: '/calendar', icon: <EventAvailableIcon fontSize="small"/> },
      { id: 'ql5', label: 'All Tasks', path: '/tasks', icon: <AssignmentTurnedInIcon fontSize="small"/> },
      { id: 'ql6', label: 'University News', path: '/news', icon: <NotificationsNoneIcon fontSize="small"/> },
    ]
  });

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbar({ ...snackbar, open: false });
   };

  // --- User Data Fetching (Keep existing logic) ---
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); setBasicInfo(null); } return; }
      if (contextUserData?.basicInfo && loading) {
          setBasicInfo(contextUserData.basicInfo);
          if (isMounted) setLoading(false);
          return;
      }
      if (loading) {
        setLoading(true);
        try {
          const userDocRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (isMounted) {
            if (docSnap.exists()) {
              const fetchedData = docSnap.data();
              setBasicInfo(fetchedData.basicInfo || { email: currentUser.email, fullName: 'User' });
            } else { setError('User profile not found.'); setBasicInfo({ email: currentUser.email, fullName: 'User' }); }
            setLoading(false);
          }
        } catch (err) {
             console.error("Error fetching user info:", err);
             if (isMounted) { setError('Failed to load user data.'); setLoading(false); setBasicInfo({ email: currentUser.email, fullName: 'User' }); }
        }
      } else if (!basicInfo) { setLoading(true); }
    };
    fetchUserData();
    return () => { isMounted = false; };
  }, [currentUser, contextUserData, basicInfo, loading]); // Added loading to dependencies


  const displayName = basicInfo?.fullName?.split(' ')[0] || 'User';

  // --- Reusable Card Component (Optimized) ---
  const DashboardCard = ({ title, icon, children, action, sx = {}, ...props }) => (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'var(--color-surface)',
        borderRadius: 'var(--border-radius-large)',
        border: `1px solid var(--color-border)`, // Add subtle border like sidebar
        height: '100%', // Ensure card takes full height of grid item
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden', // Prevents potential overflow issues
        ...sx
      }}
      {...props}
    >
      {/* Card Header with Padding */}
      {(title || action) && (
        <Box sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: 2, // Horizontal padding
            py: 1.25, // Vertical padding (reduced slightly)
        }}>
          {title && (
            <Typography variant="subtitle2" // Changed from subtitle1 for slightly smaller header
                component="h3"
                sx={{
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.75, // Reduced gap
                    color: 'var(--color-text-primary)'
                }}>
              {icon} {title}
            </Typography>
          )}
          {action}
        </Box>
      )}
      {/* Divider (Optional based on whether header exists) */}
      {(title || action) && <Divider sx={{ borderColor: 'var(--color-border)' }} />}

      {/* Card Content Area (No padding here, ListItems have padding) */}
      <Box sx={{ flexGrow: 1, overflowY: 'auto' /* Allow scrolling if content exceeds height */ }}>
        {children}
      </Box>
    </Paper>
  );

  // --- Common List Item Styles ---
  const listItemSx = {
    py: 1.25, // Reduced padding slightly from 1.5
    px: 2
  };
  const listIconSx = {
    minWidth: 36,
    color: 'var(--color-icon)'
  };
  const listTextPrimarySx = {
    fontWeight: 500,
    fontSize: '0.875rem', // Standard body2 size
    color: 'var(--color-text-primary)'
  };
  const listTextSecondarySx = {
    fontSize: '0.75rem', // Standard caption size
    color: 'var(--color-text-secondary)',
    mt: 0.25 // Small margin-top for secondary text
  };
  const chevronIconSx = {
    fontSize: '1.2rem',
    color: 'var(--color-icon)',
    opacity: 0.7,
    ml: 1 // Add margin-left to separate from text
  };


  // --- RENDER ---
  return (
    // Assuming parent provides necessary structure (e.g., padding handled by .content-padding-wrapper)
    <>
      <Typography
        variant="h4"
        component="h1"
        sx={{ fontWeight: 500, mb: { xs: 2, sm: 3 }, fontSize: { xs: '1.6rem', sm: '1.8rem', md: '2.125rem' }, color: 'var(--color-text-primary)'}}
      >
        Welcome back, {displayName}!
      </Typography>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 5, gap: 2 }}>
           <CircularProgress />
           <Typography variant="body2" color="text.secondary">Loading dashboard...</Typography>
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ m: 2 }}>{error}</Alert>
      ) : (
        // Main Grid for dashboard sections
        <Grid container spacing={2.5}> {/* Slightly reduced spacing */}

          {/* Section 1: Quick Stats (Keep as is, already compact) */}
          <Grid item xs={12}>
             <Typography variant="overline" component="h3" sx={{ color: 'var(--color-text-secondary)', display: 'block', mb: 1 }}> {/* Reduced margin */}
                Overview
             </Typography>
             <Box sx={{ display: 'flex', overflowX: 'auto', py: 0.5, gap: 1.5, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}> {/* Reduced gap/padding */}
                {dashboardData.quickStats.map((stat) => (
                    <Paper key={stat.label} component={RouterLink} to={stat.path} elevation={0} variant="outlined"
                        sx={{ p: 1.75, minWidth: 170, borderRadius: 'var(--border-radius-medium)', borderColor: 'var(--color-border)', bgcolor: 'var(--color-surface)', textDecoration: 'none', flexShrink: 0, transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out', '&:hover': { borderColor: stat.color || 'var(--color-primary)', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', transform: 'translateY(-2px)' } }}> {/* Reduced padding/minWidth */}
                        <Stack direction="row" spacing={1.5} alignItems="center" >
                            <Box sx={{ color: stat.color || 'var(--color-icon)', display: 'flex' }}>{stat.icon}</Box>
                            <Box>
                                <Typography variant="caption" component="div" sx={{ color: 'var(--color-text-secondary)', lineHeight: 1.2 }}>{stat.label}</Typography>
                                <Typography variant="h6" component="div" sx={{ color: 'var(--color-text-primary)', lineHeight: 1.3, fontSize: '1.1rem' }}>{stat.value}</Typography> {/* Slightly smaller h6 */}
                            </Box>
                        </Stack>
                    </Paper>
                ))}
             </Box>
          </Grid>

          {/* Section 2: Tasks (REDESIGNED) */}
          <Grid item xs={12} md={6} lg={4}> {/* Adjusted grid size */}
            <DashboardCard
                title="Important Tasks"
                // icon={<AssignmentTurnedInIcon fontSize="small"/>} // Optional: Add icon to title
                 action={
                    <Button component={RouterLink} to="/tasks" size="small" sx={{ color: 'var(--color-primary)', fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: 'var(--color-primary-light)' } }}>
                        View All
                    </Button>
                } >
                <List disablePadding>
                    {dashboardData.tasksPreview.length > 0 ? (
                        dashboardData.tasksPreview.map((task, index) => (
                            <React.Fragment key={task.id}>
                                <ListItemButton component={RouterLink} to={task.path} sx={listItemSx}>
                                    <ListItemIcon sx={listIconSx}>
                                        {task.icon || <AssignmentIcon fontSize="small"/>}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={task.title}
                                        secondary={task.subject || null}
                                        primaryTypographyProps={{ sx: listTextPrimarySx }}
                                        secondaryTypographyProps={{ sx: listTextSecondarySx }}
                                    />
                                    <ChevronRightIcon sx={chevronIconSx}/>
                                </ListItemButton>
                                {index < dashboardData.tasksPreview.length - 1 && <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} />}
                            </React.Fragment>
                        ))
                    ) : ( <Typography variant="body2" sx={{ color: 'var(--color-text-secondary)', textAlign: 'center', p: 3 }}>No pressing tasks.</Typography> )}
                </List>
            </DashboardCard>
          </Grid>

          {/* Section 3: Alerts & Events (REDESIGNED) */}
          <Grid item xs={12} md={6} lg={4}> {/* Adjusted grid size */}
            <DashboardCard
                title="Notifications & Events"
                // icon={<NotificationsNoneIcon fontSize="small"/>} // Optional: Add icon to title
                 action={
                    <Button component={RouterLink} to="/calendar" size="small" sx={{ color: 'var(--color-primary)', fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: 'var(--color-primary-light)' } }}>
                        Calendar
                    </Button>
                } >
                <List disablePadding>
                     {/* Item 1: Alerts */}
                     <ListItemButton component={RouterLink} to="/notifications" sx={listItemSx}>
                        <ListItemIcon sx={listIconSx}>
                            <NotificationsNoneIcon fontSize="small"/>
                        </ListItemIcon>
                        <ListItemText
                            primary={`${dashboardData.alertsCount} New Alert${dashboardData.alertsCount !== 1 ? 's' : ''}`} // Pluralize correctly
                            primaryTypographyProps={{ sx: listTextPrimarySx }}
                        />
                        <ChevronRightIcon sx={chevronIconSx}/>
                    </ListItemButton>

                    <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }}/>

                    {/* Item 2: Next Event */}
                     <ListItemButton component={RouterLink} to={dashboardData.nextEvent.path} sx={listItemSx}>
                         <ListItemIcon sx={listIconSx}>
                            <EventAvailableIcon fontSize="small"/>
                         </ListItemIcon>
                         <ListItemText
                            primary={dashboardData.nextEvent.title}
                            secondary={`Upcoming: ${dashboardData.nextEvent.date}`}
                            primaryTypographyProps={{ sx: listTextPrimarySx }}
                            secondaryTypographyProps={{ sx: listTextSecondarySx }}
                         />
                        <ChevronRightIcon sx={chevronIconSx}/>
                    </ListItemButton>
                 </List>
            </DashboardCard>
          </Grid>

           {/* Section 4: Quick Links (REDESIGNED) */}
           <Grid item xs={12} md={6} lg={4}> {/* Adjusted grid size */}
                <DashboardCard
                    title="Quick Links"
                    // icon={<LinkIcon fontSize="small"/>} // Optional: Add icon to title
                >
                   <List disablePadding>
                       {dashboardData.quickLinks.map((link, index) => (
                            <React.Fragment key={link.id}>
                                <ListItemButton component={RouterLink} to={link.path} sx={listItemSx}>
                                    <ListItemIcon sx={listIconSx}>
                                        {link.icon || <LinkIcon fontSize="small"/>}
                                    </ListItemIcon>
                                   <ListItemText
                                        primary={link.label}
                                        primaryTypographyProps={{ sx: listTextPrimarySx }}
                                    />
                                   <ChevronRightIcon sx={chevronIconSx}/>
                               </ListItemButton>
                               {index < dashboardData.quickLinks.length - 1 && <Divider component="li" sx={{ mx: 2, borderColor: 'var(--color-border)' }} />}
                           </React.Fragment>
                       ))}
                   </List>
                </DashboardCard>
            </Grid>

        </Grid> // End Main Grid
      )}

      {/* Snackbar remains the same */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled" elevation={6}> {snackbar.message} </Alert>
      </Snackbar>

    </> // Using Fragment as outer element since parent div is handled by Layout.js
  );
};

export default Home;