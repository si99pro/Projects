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
import Stack from '@mui/material/Stack';
import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material/styles';
import Button from '@mui/material/Button';

// MUI Icons
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedInOutlined';
import EventAvailableIcon from '@mui/icons-material/EventAvailableOutlined';
import SchoolIcon from '@mui/icons-material/SchoolOutlined';
import PaymentIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import LinkIcon from '@mui/icons-material/LinkOutlined';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const Home = () => {
  const theme = useTheme();
  const { currentUser, userData: contextUserData } = useAuth();
  const navigate = useNavigate();

  const [basicInfo, setBasicInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

  // --- Placeholder Data ---
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

  // --- User Data Fetching (unchanged) ---
   useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      setBasicInfo(prev => prev || { email: currentUser?.email, fullName: currentUser?.displayName || 'User' });
      setLoading(true);
      setError('');
      if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); setBasicInfo(null); } return; }
      if (contextUserData?.basicInfo) { if (!basicInfo || basicInfo.email !== contextUserData.basicInfo.email) { setBasicInfo(contextUserData.basicInfo); } if (isMounted) setLoading(false); return; }
      try { const userDocRef = doc(db, "users", currentUser.uid); const docSnap = await getDoc(userDocRef); if (isMounted) { if (docSnap.exists()) { const fetchedData = docSnap.data(); setBasicInfo(fetchedData.basicInfo || { email: currentUser.email, fullName: currentUser.displayName || 'User' }); } else { setError('Profile not found.'); setBasicInfo({ email: currentUser.email, fullName: currentUser.displayName || 'User' }); } setLoading(false); } } catch (err) { console.error("Error fetching user info:", err); if (isMounted) { setError('Failed to load data.'); setBasicInfo({ email: currentUser.email, fullName: currentUser.displayName || 'User' }); setLoading(false); } }
    };
    fetchUserData();
    return () => { isMounted = false; };
   }, [currentUser, contextUserData]);


  const displayName = basicInfo?.fullName?.split(' ')[0] || 'User';

  // --- Common List Item Styles ---
  const listItemSx = {
     py: 1.25,
     px: { xs: 2, sm: 2 }
  };
  const listIconSx = { minWidth: 36, color: theme.palette.action.active };
  const listTextPrimarySx = { fontWeight: 500, fontSize: '0.9rem', color: theme.palette.text.primary };
  const listTextSecondarySx = { fontSize: '0.75rem', color: theme.palette.text.secondary, mt: 0.25 };
  const chevronIconSx = { fontSize: '1.2rem', color: theme.palette.action.active, opacity: 0.7, ml: 1 };

  // Define the smaller radius value
  const reducedBorderRadius = '8px'; // Or '0' for sharp corners

  // --- Section Container Component ---
  const SectionContainer = ({ title, actionButton, children, sx = {} }) => (
    <Paper
      elevation={0}
      variant="outlined"
      sx={{
        bgcolor: theme.palette.background.paper,
        // Apply reduced border radius
        borderRadius: reducedBorderRadius,
        overflow: 'hidden',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        ...sx
      }}
    >
      {(title || actionButton) && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            px: { xs: 2, sm: 2 },
            py: 1.5,
            borderBottom: `1px solid ${theme.palette.divider}`,
            flexShrink: 0,
          }}
        >
          {title && (
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600, fontSize: '1.0rem' }}>
              {title}
            </Typography>
          )}
          {actionButton}
        </Box>
      )}
      <Box sx={{ flexGrow: 1, overflowY: 'auto'}}>
        {children}
      </Box>
    </Paper>
  );


  // --- RENDER ---
  return (
    <>
      {/* Wrap Title in a Box for the border */}
      <Box sx={{
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: { xs: 1, sm: 2 },
          mb: { xs: 2, sm: 4 },
          px: 0, // Keep container padding 0
      }}>
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 500,
            color: theme.palette.text.primary,
            textAlign: 'left',
            px: 0, // Keep text padding 0
          }}
        >
          Welcome back, {displayName}!
        </Typography>
      </Box>

      {/* Main Content Container */}
      <Box
        sx={{
          maxWidth: '700px',
          mx: 'auto',
          px: { xs: 0, sm: 3 } // No padding on xs, add on sm+
        }}
      >
        {/* Loading State */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', p: 5, gap: 2 }}>
             <CircularProgress />
             <Typography variant="body2" color="text.secondary">Loading dashboard...</Typography>
          </Box>
        )}

        {/* Error State */}
        {!loading && error && (
          <Alert
            severity="error"
            icon={<ErrorOutlineIcon fontSize="inherit" />}
            sx={{ mb: 3, mx: { xs: 2, sm: 0 } }} // Add margin on xs to align with content padding
          >
            {error}
          </Alert>
        )}

        {/* Dashboard Content: Use Grid for layout */}
        {!loading && basicInfo && !error && (
          <Grid container spacing={3}>

            {/* Section 1: Overview (Quick Stats) - Full width */}
            <Grid item xs={12}>
                <Box sx={{ px: { xs: 2, sm: 0 } }}> {/* Padding wrapper for mobile */}
                   <Typography variant="overline" component="h3" sx={{ color: theme.palette.text.secondary, display: 'block', mb: 1.5 }}>
                      Overview
                   </Typography>
                   {/* Quick Stats Scrollable Box */}
                   <Box sx={{
                        display: 'flex',
                        overflowX: 'auto',
                        py: 0.5,
                        gap: 1.5,
                        scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' },
                        px: { xs: 0, sm: 0.25 },
                        mx: { xs: -2, sm: 0 } // Negative margin only for mobile
                    }}
                   >
                      {dashboardData.quickStats.map((stat) => (
                          <Paper key={stat.label} component={RouterLink} to={stat.path} elevation={0} variant="outlined"
                              sx={{
                                  p: 1.75,
                                  minWidth: 160,
                                  // Apply reduced border radius
                                  borderRadius: reducedBorderRadius,
                                  borderColor: theme.palette.divider,
                                  bgcolor: theme.palette.background.paper,
                                  textDecoration: 'none',
                                  flexShrink: 0,
                                  transition: theme.transitions.create(['transform', 'box-shadow', 'border-color'], { duration: theme.transitions.duration.short }),
                                  '&:hover': {
                                    borderColor: stat.color || theme.palette.primary.main,
                                    boxShadow: theme.shadows[2],
                                    transform: 'translateY(-2px)'
                                  },
                                }}
                              >
                              <Stack direction="row" spacing={1.5} alignItems="center" >
                                  <Box sx={{ color: stat.color || theme.palette.action.active, display: 'flex' }}>{stat.icon}</Box>
                                  <Box>
                                      <Typography variant="caption" component="div" sx={{ color: theme.palette.text.secondary, lineHeight: 1.2 }}>{stat.label}</Typography>
                                      <Typography variant="h6" component="div" sx={{ color: theme.palette.text.primary, lineHeight: 1.3, fontSize: '1.0rem' }}>{stat.value}</Typography>
                                  </Box>
                              </Stack>
                          </Paper>
                      ))}
                   </Box>
                </Box>
            </Grid>

            {/* Column for Tasks and Events */}
            <Grid item xs={12} md={6}>
                <Stack spacing={3}> {/* Stack items vertically within this column */}
                    {/* Section 2: Important Tasks */}
                    <SectionContainer
                      title="Important Tasks"
                      actionButton={
                        <Button component={RouterLink} to="/tasks" size="small" sx={{ fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: theme.palette.action.hover } }}>
                            View All
                        </Button>
                      }
                    >
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
                                      {index < dashboardData.tasksPreview.length - 1 && <Divider component="li" sx={{ mx: 2, borderColor: theme.palette.divider }} />}
                                  </React.Fragment>
                              ))
                          ) : ( <Typography variant="body2" sx={{ color: theme.palette.text.secondary, textAlign: 'center', p: 3 }}>No pressing tasks.</Typography> )}
                      </List>
                    </SectionContainer>

                    {/* Section 3: Notifications & Events */}
                    <SectionContainer
                      title="Notifications & Events"
                      actionButton={
                        <Button component={RouterLink} to="/calendar" size="small" sx={{ fontWeight: 500, textTransform: 'none', '&:hover': { bgcolor: theme.palette.action.hover } }}>
                            Calendar
                        </Button>
                      }
                    >
                      <List disablePadding>
                        <ListItemButton component={RouterLink} to="/notifications" sx={listItemSx}>
                            <ListItemIcon sx={listIconSx}> <NotificationsNoneIcon fontSize="small"/> </ListItemIcon>
                            <ListItemText primary={`${dashboardData.alertsCount} New Alert${dashboardData.alertsCount !== 1 ? 's' : ''}`} primaryTypographyProps={{ sx: listTextPrimarySx }} />
                            <ChevronRightIcon sx={chevronIconSx}/>
                        </ListItemButton>
                        <Divider component="li" sx={{ mx: 2, borderColor: theme.palette.divider }}/>
                        <ListItemButton component={RouterLink} to={dashboardData.nextEvent.path} sx={listItemSx}>
                            <ListItemIcon sx={listIconSx}> <EventAvailableIcon fontSize="small"/> </ListItemIcon>
                            <ListItemText primary={dashboardData.nextEvent.title} secondary={`Upcoming: ${dashboardData.nextEvent.date}`} primaryTypographyProps={{ sx: listTextPrimarySx }} secondaryTypographyProps={{ sx: listTextSecondarySx }} />
                            <ChevronRightIcon sx={chevronIconSx}/>
                        </ListItemButton>
                      </List>
                    </SectionContainer>
                </Stack>
            </Grid>

            {/* Column for Quick Links */}
            <Grid item xs={12} md={6}>
                {/* Section 4: Quick Links */}
                <SectionContainer title="Quick Links">
                   <List disablePadding>
                       {dashboardData.quickLinks.map((link, index) => (
                            <React.Fragment key={link.id}>
                                <ListItemButton component={RouterLink} to={link.path} sx={listItemSx}>
                                    <ListItemIcon sx={listIconSx}> {link.icon || <LinkIcon fontSize="small"/>} </ListItemIcon>
                                   <ListItemText primary={link.label} primaryTypographyProps={{ sx: listTextPrimarySx }} />
                                   <ChevronRightIcon sx={chevronIconSx}/>
                               </ListItemButton>
                               {index < dashboardData.quickLinks.length - 1 && <Divider component="li" sx={{ mx: 2, borderColor: theme.palette.divider }} />}
                           </React.Fragment>
                       ))}
                   </List>
                </SectionContainer>
            </Grid>

          </Grid> // End Main Grid Container
        )}
         {!loading && !error && !basicInfo && (
             <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 3 }}>
                 Could not load user information.
             </Typography>
         )}

      </Box> {/* End Max Width Container */}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }} >
         <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled" elevation={6}> {snackbar.message} </Alert>
      </Snackbar>
    </>
  );
};

export default Home;