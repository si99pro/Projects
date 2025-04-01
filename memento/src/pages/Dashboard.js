/* eslint-disable no-unused-vars */ // Keep if some vars are intentionally unused for now
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { auth, db } from '../firebase';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Modal,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Card,
    CardContent,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    LinearProgress, // Keep for Suspense fallback
    Skeleton,       // Import Skeleton
    Alert,          // For error messages
    Link,           // Import Link for functional quick links (if using react-router)
} from '@mui/material';
// REMOVED: ChartJS imports as charts are removed
// import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import styled from '@emotion/styled'; // Moved UP
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Moved UP
import EditIcon from '@mui/icons-material/Edit'; // Moved UP
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // Moved UP

// --- Lazy Loaded Components ---
// Keep lazy imports *after* all standard imports
// REMOVED: Chart lazy imports
// const Bar = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Bar })));
// const Doughnut = lazy(() => import('react-chartjs-2').then(module => ({ default: module.Doughnut })));
// Lazy load custom heavy component
const AllMomentList = lazy(() => import('../components/AllMomentList')); // Keep this lazy import here


// --- Register ChartJS Modules ---
// REMOVED: ChartJS registration as charts are removed
/*
ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);
*/

// --- Styled Components ---
// (Keep all styled components as they might be used by remaining elements or future additions)
const primaryColor = '#3f51b5';
const secondaryColor = '#7986cb';
const textColor = '#212121';

const StyledContainer = styled(Container)`
    margin-top: 20px;
    padding: 20px;
    color: ${textColor};
    font-family: 'Roboto', sans-serif;
    min-height: 90vh;
`;

const StyledPaper = styled(Paper)`
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`;

const SectionTitle = styled(Typography)`
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 15px;
    color: ${primaryColor};
`;

const WidgetCard = styled(Card)`
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
    height: 100%; // Ensure cards in the same row have equal height if needed
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    &:hover {
       transform: translateY(-3px);
       box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
`;

const WidgetCardHeader = styled(CardContent)`
    border-bottom: 1px solid #eee;
    padding: 15px;
    background-color: #fafafa;
`;

const WidgetCardContent = styled(CardContent)`
    padding: 15px;
    flex-grow: 1; // Allow content to expand
`;

// REMOVED: DataCard components as the Overview section using them is removed
/*
const DataCard = styled(Card)`
    background: linear-gradient(45deg, ${primaryColor} 30%, ${secondaryColor} 90%);
    color: white;
    border-radius: 8px;
    box-shadow: 0 3px 5px 2px rgba(63, 81, 181, .3);
    margin-bottom: 15px;
    text-align: center;
     transition: transform 0.2s ease-in-out;
     &:hover {
       transform: scale(1.03);
    }
`;

const DataCardContent = styled(CardContent)`
    padding: 20px; // Slightly more padding
`;

const DataCardTitle = styled(Typography)`
    font-size: 1.1rem; // Adjusted size
    font-weight: 400;
    margin-bottom: 8px; // Adjusted spacing
    opacity: 0.9;
`;

const DataCardValue = styled(Typography)`
    font-size: 2.2rem; // Adjusted size
    font-weight: 600;
`;
*/

// REMOVED: ActivityItem styling as the demo activity list is removed
/*
const ActivityItem = styled(ListItem)`
    padding: 10px 15px; // Adjusted padding
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
    &:last-child {
        border-bottom: none;
    }
     &:hover {
        background-color: #f9f9f9;
    }
`;
*/

// REMOVED: NotificationItem styling as the demo notification list is removed
/*
const NotificationItem = styled(ListItem)`
    padding: 10px 15px; // Adjusted padding
    border-bottom: 1px solid #eee;
    transition: background-color 0.2s ease;
    &:last-child {
        border-bottom: none;
    }
    &:hover {
        background-color: #f0f0f0; // Already had hover, ensure consistency
    }
`;
*/

// REMOVED: CourseProgressContainer styling as charts are removed
/*
const CourseProgressContainer = styled(Paper)`
    padding: 20px; // Consistent padding
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
    height: 100%; // Match height with sibling grid items
    display: flex;
    flex-direction: column;
`;
*/

const UserInfoContainer = styled(Paper)`
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    margin-bottom: 20px;
    transition: box-shadow 0.3s ease-in-out;
     &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`;

const QuickLinksContainer = styled(Paper)`
    padding: 15px 20px; // Adjusted padding
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fcfcff; // Slightly different bg
    margin-bottom: 20px;
     transition: box-shadow 0.3s ease-in-out;
     &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
`;

const QuickLinksScroll = styled(Box)`
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
    margin-left: -5px; // Counteract button margin
    margin-right: -5px;

    &::-webkit-scrollbar {
        height: 6px; // Make scrollbar visible but subtle
    }
    &::-webkit-scrollbar-thumb {
        background: #ccc;
        border-radius: 3px;
    }
     &::-webkit-scrollbar-thumb:hover {
        background: #aaa;
    }
    scrollbar-width: thin; /* Firefox */
    scrollbar-color: #ccc transparent; /* Firefox */
`;

const QuickLinkButton = styled(Button)`
    margin: 0 5px; // Use margin for spacing
`;

const ProfileAvatar = styled(Avatar)`
    width: 80px;
    height: 80px;
    margin-right: 20px;
    position: relative;
    background-color: ${props => props.profilebg || primaryColor};
    color: white;
    font-size: 2.5rem;
    cursor: pointer; // Indicate it's interactive
`;

const WelcomeContainer = styled(Box)`
  display: flex;
  align-items: center;
  text-align: left;
  margin-bottom: 15px;
`;

const EditIconContainer = styled(IconButton)`
    position: absolute;
    bottom: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    padding: 3px; // Slightly larger padding
    border: 1px solid rgba(0,0,0,0.1); // Subtle border
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    &:hover {
        background-color: rgba(255, 255, 255, 1);
        transform: scale(1.1);
    }
    // Adjust icon size if needed via sx prop on the icon itself
`;

const UserInfoDetails = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 4px; // Add small gap between lines
`;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 }, // Responsive width
    bgcolor: 'background.paper',
    border: '1px solid #ccc', // Softer border
    borderRadius: '10px', // Consistent border radius
    boxShadow: 24,
    p: 4,
};

// --- Chart Data ---
// REMOVED: All chart data generation and options
/*
const generateChartData = () => { ... };
const generateAssignmentData = () => { ... };
const useDashboardData = () => { ... };
const chartOptions = { ... };
const assignmentOptions = { ... };
*/

// --- Static Data ---
// REMOVED: Static demo data arrays
/*
const trendingUsers = [ ... ];
const notifications = [ ... ];
*/

// --- Component ---

function Dashboard() {
    const [user, setUser] = useState(null);
    // profileBg state can be removed if only used for the Avatar's prop
    // const [profileBg, setProfileBg] = useState('');
    const [loading, setLoading] = useState(true); // Added loading state
    const [error, setError] = useState(null);     // Added error state
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

    // REMOVED: useDashboardData hook call
    // const { chartData, assignmentData } = useDashboardData();
    const dashboardContentRef = useRef(null); // Keep ref if needed for other purposes

    useEffect(() => {
        let isMounted = true;
        setLoading(true); // Start loading
        setError(null);   // Reset error on new fetch attempt

        async function fetchData() {
            if (!auth.currentUser) {
                 if (isMounted) {
                    setError("User not authenticated. Please log in."); // More specific message
                    setLoading(false);
                 }
                return; // Exit if no user is logged in
            }
            try {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (isMounted) {
                        setUser(userData);
                        // Directly use userData.basicInfo?.profilebg where needed
                        setCurrentStatus(userData.basicInfo?.currentStatus || ''); // Pre-fill status modal
                    }
                } else {
                    console.log('No user document found!');
                    if (isMounted) setError("User profile data not found. Please complete your profile or contact support."); // More specific message
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                 if (isMounted) setError("Failed to load user data due to a network or server issue. Please try again later."); // More specific message
            } finally {
                if (isMounted) setLoading(false); // Stop loading regardless of outcome
            }
        }

        fetchData();

        return () => {
            isMounted = false; // Cleanup function to prevent state updates on unmounted component
        };
    }, []); // Empty dependency array ensures this runs once on mount

    // Handlers (Keep handlers as they are for user interaction)
    const handleStatusChange = (event) => setCurrentStatus(event.target.value);
    const handleCloseStatusModal = () => setOpenStatusModal(false);
    const handleOpenStatusModal = () => setOpenStatusModal(true);
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false);
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true);

    const handleStatusSubmit = async () => {
        if (!auth.currentUser) return; // Guard clause
        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
                'basicInfo.currentStatus': currentStatus,
            });
            // Optimistic UI update
            setUser((prevState) => ({
                ...prevState,
                basicInfo: {
                    ...prevState.basicInfo,
                    currentStatus: currentStatus,
                },
            }));
            setOpenStatusModal(false);
            // Optional: Add success feedback (Snackbar)
        } catch (error) {
            console.error('Error updating current status:', error);
            // TODO: Show user feedback (e.g., snackbar) for the error
        }
    };

    // Derive basicInfo safely
    const basicInfo = user?.basicInfo;

    // --- Render Logic ---
    return (
        <>
            {/* Note: AppBar/Toolbar removed as requested */}

            <StyledContainer maxWidth="lg" ref={dashboardContentRef}>
                {/* Loading State */}
                {loading && (
                    <>
                        {/* Skeleton for User Info */}
                        <UserInfoContainer>
                            <WelcomeContainer>
                                <Skeleton variant="circular" width={80} height={80} sx={{ marginRight: '20px' }} />
                                <UserInfoDetails>
                                    <Skeleton variant="text" width={200} height={40} />
                                    <Skeleton variant="text" width={250} />
                                    <Skeleton variant="text" width={280} />
                                </UserInfoDetails>
                            </WelcomeContainer>
                        </UserInfoContainer>
                        {/* Skeleton for Quick Links */}
                        <QuickLinksContainer>
                            <SectionTitle variant="h6">
                                <Skeleton variant="text" width={120} />
                            </SectionTitle>
                            <QuickLinksScroll>
                                <Skeleton variant="rounded" width={140} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                                <Skeleton variant="rounded" width={180} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                                <Skeleton variant="rounded" width={100} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                                <Skeleton variant="rounded" width={150} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                            </QuickLinksScroll>
                        </QuickLinksContainer>
                        {/* Optional: Skeleton for the grid content as well */}
                        <Grid container spacing={3}>
                            {/* Skeletons for removed blocks */}
                            {/* <Grid item xs={12}><Skeleton variant="rounded" height={150} /></Grid> */}
                            {/* <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} /></Grid> */}
                            {/* <Grid item xs={12} md={6}><Skeleton variant="rounded" height={300} /></Grid> */}
                            {/* <Grid item xs={12} md={6}><Skeleton variant="rounded" height={250} /></Grid> */}
                            {/* <Grid item xs={12} md={6}><Skeleton variant="rounded" height={250} /></Grid> */}
                            <Grid item xs={12}><Skeleton variant="rounded" height={200} /></Grid> {/* Skeleton for Discussion block */}
                        </Grid>
                    </>
                )}

                 {/* Error State */}
                 {!loading && error && (
                    <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                    // Optionally render parts of the dashboard that don't depend on user data
                 )}


                {/* Loaded State */}
                {!loading && !error && (
                    <>
                       {/* User Info & Quick Links (Render only if basicInfo exists) */}
                       {basicInfo && (
                            <>
                                <UserInfoContainer>
                                    <WelcomeContainer>
                                        <ProfileAvatar
                                            // Use optional chaining and provide a default
                                            profilebg={basicInfo.profilebg || primaryColor}
                                            onClick={handleOpenEditProfileModal}
                                        >
                                            {basicInfo.fullName?.charAt(0).toUpperCase() || '?'}
                                            <EditIconContainer
                                                aria-label="edit profile"
                                                size="small"
                                                onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }} // Prevent avatar click handler
                                            >
                                                <EditIcon sx={{ fontSize: '14px' }} /> {/* Adjust icon size */}
                                            </EditIconContainer>
                                        </ProfileAvatar>
                                        <UserInfoDetails>
                                            <Typography variant="h5" component="h2" gutterBottom>
                                                Welcome, {basicInfo.fullName}!
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                <strong>Email:</strong> {basicInfo.email}
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary">
                                                <strong>Student ID:</strong> {basicInfo.studentId} | <strong>Session:</strong> {basicInfo.session}
                                            </Typography>
                                        </UserInfoDetails>
                                    </WelcomeContainer>
                                </UserInfoContainer>

                                <QuickLinksContainer>
                                    <SectionTitle variant="h6">Quick Links</SectionTitle>
                                    <QuickLinksScroll>
                                        {/* Replace with Link component if using react-router */}
                                        <QuickLinkButton variant="outlined" color="primary" /* component={Link} to="/courses" */ >
                                            Course Catalog
                                        </QuickLinkButton>
                                        <QuickLinkButton variant="outlined" color="primary" /* component={Link} to="/assignments" */ >
                                            Assignments
                                        </QuickLinkButton>
                                        <QuickLinkButton variant="outlined" color="primary" /* component={Link} to="/grades" */ >
                                            Grades
                                        </QuickLinkButton>
                                        <QuickLinkButton variant="outlined" color="primary" /* component={Link} to="/forums" */ >
                                            Discussion Forums
                                        </QuickLinkButton>
                                        <QuickLinkButton variant="outlined" color="secondary" onClick={handleOpenStatusModal}>
                                            Update Status
                                        </QuickLinkButton>
                                        {/* Add more functional links */}
                                    </QuickLinksScroll>
                                </QuickLinksContainer>
                            </>
                        )}
                        {/* End of conditional basicInfo rendering */}

                        {/* Dashboard Grid - Render main structure */}
                        <Grid container spacing={3}>
                            {/* REMOVED: Overview Section */}
                            {/*
                            <Grid item xs={12}>
                                <StyledPaper>
                                    <SectionTitle variant="h5">Overview</SectionTitle>
                                    <Grid container spacing={3}>
                                        <Grid item xs={12} sm={6} md={4}><DataCard>...</DataCard></Grid>
                                        <Grid item xs={12} sm={6} md={4}><DataCard>...</DataCard></Grid>
                                        <Grid item xs={12} sm={6} md={4}><DataCard>...</DataCard></Grid>
                                    </Grid>
                                </StyledPaper>
                            </Grid>
                            */}

                            {/* REMOVED: Chart Section */}
                            {/*
                            <Grid item xs={12} md={6}>
                                <CourseProgressContainer sx={{ minHeight: 300 }}>
                                    <SectionTitle variant="h6">Course Progress</SectionTitle>
                                    <Suspense fallback={...}>
                                        <Box sx={{ flexGrow: 1, position: 'relative', height: '250px' }}>
                                            <Bar data={chartData} options={chartOptions} />
                                        </Box>
                                    </Suspense>
                                </CourseProgressContainer>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <CourseProgressContainer sx={{ minHeight: 300 }}>
                                    <SectionTitle variant="h6">Assignment Overview</SectionTitle>
                                    <Suspense fallback={...}>
                                        <Box sx={{ flexGrow: 1, position: 'relative', height: '250px' }}>
                                            <Doughnut data={assignmentData} options={assignmentOptions} />
                                        </Box>
                                    </Suspense>
                                </CourseProgressContainer>
                            </Grid>
                            */}

                            {/* REMOVED: Activities & Notifications Sections */}
                            {/*
                            <Grid item xs={12} md={6}>
                                <WidgetCard>
                                    <WidgetCardHeader><Typography variant="h6">Latest Activities</Typography></WidgetCardHeader>
                                    <WidgetCardContent>
                                        <List disablePadding>
                                            {trendingUsers.map((u) => ( ... ))}
                                        </List>
                                    </WidgetCardContent>
                                </WidgetCard>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <WidgetCard>
                                    <WidgetCardHeader><Typography variant="h6">Notifications</Typography></WidgetCardHeader>
                                    <WidgetCardContent>
                                        <List disablePadding>
                                            {notifications.map((n) => ( ... ))}
                                        </List>
                                    </WidgetCardContent>
                                </WidgetCard>
                            </Grid>
                            */}

                            {/* Discussions Section - Kept */}
                            <Grid item xs={12}>
                                <WidgetCard>
                                    <WidgetCardHeader><Typography variant="h6">Latest Discussions</Typography></WidgetCardHeader>
                                    <WidgetCardContent>
                                        <Suspense fallback={<LinearProgress sx={{ my: 2 }} />}>
                                            <AllMomentList />
                                        </Suspense>
                                    </WidgetCardContent>
                                </WidgetCard>
                            </Grid>
                        </Grid>
                    </>
                )} {/* End of Loaded State */}


                {/* Modals (Kept - These are functional parts, not demo) */}
                <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title">
                    <Box sx={modalStyle}>
                        <Typography id="edit-profile-modal-title" variant="h6" component="h2">Edit Profile</Typography>
                        <Typography sx={{ mt: 2 }}>Profile editing form goes here. (Implement actual form fields)</Typography>
                        {/* Example: Add form fields here */}
                        {/* <TextField label="Full Name" fullWidth margin="normal" defaultValue={basicInfo?.fullName} /> */}
                        {/* <TextField label="Email" fullWidth margin="normal" defaultValue={basicInfo?.email} disabled /> */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                             <Button onClick={handleCloseEditProfileModal} color="inherit">Cancel</Button>
                             <Button variant="contained" color="primary" /* onClick={handleProfileUpdateSubmit} */ >Save</Button>
                         </Box>
                    </Box>
                </Modal>

                <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal">
                    <Box sx={modalStyle}>
                        <Typography id="current-status-modal" variant="h6" component="h2">Update Current Status</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="current-status-label">Current Status</InputLabel>
                            <Select labelId="current-status-label" value={currentStatus} label="Current Status" onChange={handleStatusChange}>
                                <MenuItem value="Studying">Studying</MenuItem>
                                <MenuItem value="Graduated">Graduated</MenuItem>
                                <MenuItem value="Employed">Employed</MenuItem>
                                <MenuItem value="Seeking Opportunity">Seeking Opportunity</MenuItem>
                                <MenuItem value="Overseas">Overseas</MenuItem>
                                <MenuItem value="Unemployed">Unemployed</MenuItem>
                                {/* Add more relevant statuses */}
                            </Select>
                        </FormControl>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                             <Button onClick={handleCloseStatusModal} color="inherit">Cancel</Button>
                             <Button variant="contained" color="primary" onClick={handleStatusSubmit}>Submit</Button>
                        </Box>
                    </Box>
                </Modal>

            </StyledContainer>
        </>
    );
}

export default Dashboard;