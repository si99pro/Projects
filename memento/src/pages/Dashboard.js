/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import styled from '@emotion/styled';
import {
    Container, // Keep Container import for the styled component derivation
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
    Skeleton,
    Alert,
    Link as MuiLink,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Lazy load the component for better performance
const AllMomentList = lazy(() => import('../components/AllMomentList'));

// --- Styled Components ---
const primaryColor = '#3f51b5'; // Example primary color
const secondaryColor = '#7986cb'; // Example secondary color
const textColor = '#212121'; // Dark text color
const subtleBgColor = '#ffffff'; // Example background - may need adjustment

// StyledContainer: Derived from Container, applies some default styling.
// We will *not* pass maxWidth to it in the JSX anymore.
const StyledContainer = styled(Container)`
    margin-top: 20px;
    margin-bottom: 40px;
    /* Removed fixed padding-left/right - let MainLayout handle overall padding */
    color: ${textColor};
    font-family: 'Roboto', sans-serif;
    /* Optional: Remove if MainLayout bg is sufficient */
    /* background-color: ${subtleBgColor}; */
    display: block;
`;

// Base styling for Paper elements (cards)
const StyledPaperBase = styled(Paper)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }
`;

// Specific card styles
const UserInfoContainer = styled(StyledPaperBase)`
    padding: 24px;
`;

const QuickLinksContainer = styled(StyledPaperBase)`
    padding: 18px 24px;
`;

// Widget card for sidebar-like elements (e.g., Discussions)
const WidgetCard = styled(Card)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    height: 100%; // Important for Grid layout
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    &:hover {
       transform: translateY(-4px);
       box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
    width: 100%; // Ensure it takes full width of its Grid item
    box-sizing: border-box;
`;

const WidgetCardHeader = styled(CardContent)`
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
    background-color: #fafafa; // Slightly off-white header
    flex-shrink: 0;
`;

const WidgetCardContent = styled(CardContent)(({ theme }) => ({
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    flexGrow: 1, // Allow content to take remaining space
    '&:last-child': { // Remove extra padding from MUI CardContent default
         paddingBottom: theme.spacing(2.5),
    },
    overflowY: 'auto', // Make content scrollable if it overflows
    minHeight: 0, // Necessary for flex-grow in some contexts
}));

// Section title styling
const SectionTitle = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${primaryColor};
`;

// Container for horizontally scrollable quick links
const QuickLinksScroll = styled(Box)`
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px; // Space for scrollbar
    margin-left: -8px; // Compensate for button margin
    margin-right: -8px; // Compensate for button margin
    // Custom scrollbar styles
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: #aaa; }
    scrollbar-width: thin; // Firefox
    scrollbar-color: #ccc transparent; // Firefox
`;

// Styling for individual quick link buttons
const QuickLinkButton = styled(Button)`
    margin: 0 8px; // Space between buttons
    text-transform: none; // Keep original casing
    border-radius: 16px; // Pill shape
    font-weight: 500;
`;

// User avatar styling
const ProfileAvatar = styled(Avatar)`
    width: 80px;
    height: 80px;
    margin-right: 24px;
    position: relative; // Needed for positioning the edit icon
    background-color: ${props => props.profilebg || primaryColor}; // Dynamic background
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    flex-shrink: 0; // Prevent shrinking in flex layout
    overflow: visible; // Allow absolutely positioned children (edit icon) to overflow
`;

// Flex container for avatar and user details
const WelcomeContainer = styled(Box)`
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
`;

// Edit icon positioned over the avatar
const EditIconContainer = styled(IconButton)`
    position: absolute;
    bottom: 0px;
    right: 0px;
    background-color: rgba(255, 255, 255, 0.95); // Semi-transparent white background
    padding: 5px;
    border: 1px solid rgba(0,0,0,0.1); // Subtle border
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    z-index: 1; // Ensure it's on top of the avatar
    &:hover {
        background-color: white;
        transform: scale(1.15); // Slight zoom on hover
    }
    svg { // Style the icon itself
        font-size: 16px;
        color: ${primaryColor};
    }
`;

// Container for user text details next to avatar
const UserInfoDetails = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 4px; // Space between text lines
    flex-grow: 1; // Take remaining horizontal space
    min-width: 0; // Prevent overflow issues in flex layouts
`;

// Style for the content area of Modals
const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 }, // Responsive width
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '12px', // Match card radius
    boxShadow: 24, // MUI shadow depth
    p: 4, // Padding inside modal
};

// --- Fallback Skeleton for Lazy Loaded Component ---
const AllMomentListSkeleton = () => (
    <Box>
        <Skeleton variant="text" height={30} width="80%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }}/>
        <Skeleton variant="text" height={30} width="70%" sx={{ mb: 1 }} />
        <Skeleton variant="rectangular" height={60} sx={{ mb: 2 }}/>
        <Skeleton variant="text" height={20} width="90%" />
    </Box>
);

// --- Dashboard Component ---
function Dashboard() {
    // --- State Variables ---
    const [user, setUser] = useState(null); // Holds fetched user data from Firestore
    const [loading, setLoading] = useState(true); // Tracks loading state
    const [error, setError] = useState(null); // Holds error messages
    const [openStatusModal, setOpenStatusModal] = useState(false); // Controls status update modal
    const [currentStatus, setCurrentStatus] = useState(''); // Temp state for status dropdown
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false); // Controls edit profile modal

    // --- Fetch User Data Effect ---
    useEffect(() => {
        let isMounted = true; // Prevent state updates on unmounted component
        setLoading(true);
        setError(null);
        const currentUser = auth.currentUser; // Get currently logged-in user

        // If no user is logged in, stop loading and show error
        if (!currentUser) {
            if (isMounted) {
                setError("User not authenticated. Please log in.");
                setLoading(false);
            }
            return; // Exit effect early
        }

        // Async function to fetch data from Firestore
        async function fetchUserData() {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid); // Reference to user's document
                const docSnap = await getDoc(userDocRef); // Get the document snapshot

                if (isMounted) { // Only update state if component is still mounted
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser(userData); // Store user data in state
                        // Initialize status dropdown with current value or empty string
                        setCurrentStatus(userData.basicInfo?.currentStatus || '');
                    } else {
                        // Handle case where user is authenticated but has no Firestore doc yet
                        console.warn('No user document found for UID:', currentUser.uid);
                        setUser({}); // Set empty user object to avoid errors accessing properties
                        setError("Welcome! Please complete your profile information.");
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                if (isMounted) {
                    setError("Failed to load dashboard data. Please check connection.");
                }
            } finally {
                // Ensure loading is set to false regardless of success or error
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchUserData();

        // Cleanup function for the effect
        return () => { isMounted = false; };
    }, []); // Run effect only once on component mount (empty dependency array)

    // --- Handlers ---
    const handleStatusChange = (event) => setCurrentStatus(event.target.value); // Update status dropdown state
    const handleCloseStatusModal = () => setOpenStatusModal(false); // Close status modal
    const handleOpenStatusModal = () => { // Open status modal and prefill value
        setCurrentStatus(user?.basicInfo?.currentStatus || '');
        setOpenStatusModal(true);
    };
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false); // Close edit modal
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true); // Open edit modal

    // Handle submitting the new status
    const handleStatusSubmit = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError("Authentication error. Please log in again.");
            return;
        }
        // Store original status for potential rollback on error
        const originalStatus = user?.basicInfo?.currentStatus || '';
        try {
            setOpenStatusModal(false); // Close modal immediately
            // Optimistically update local state for faster UI feedback
            setUser((prevState) => ({
                ...prevState,
                basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: currentStatus },
            }));
            // Update Firestore document
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { 'basicInfo.currentStatus': currentStatus });
            console.log("Status updated successfully");
            // Optionally add a success snackbar here
        } catch (error) {
            console.error('Error updating current status:', error);
            setError("Failed to update status. Please try again.");
            // Rollback local state if Firestore update fails
            setUser((prevState) => ({
                ...prevState,
                basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: originalStatus },
            }));
        }
    };

    // --- Derived State / Helper Variables ---
    const basicInfo = user?.basicInfo || {}; // Safely access basicInfo, default to empty object
    // Check if profile seems incomplete (user object exists but basicInfo is empty, ignore fetch errors)
    const profileIncomplete = user && Object.keys(basicInfo).length === 0 && !error?.includes("Failed");


    // --- Render Logic ---

    // Skeleton Loader Structure
    const renderSkeletons = () => (
        <Grid
            container
            spacing={3}
            sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}
        >
            {/* Left Column Skeleton */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                     <UserInfoContainer>
                        <WelcomeContainer>
                            <Skeleton variant="circular" width={80} height={80} sx={{ mr: '24px', flexShrink: 0, overflow: 'visible' }} />
                            <UserInfoDetails sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Skeleton height={40} width="60%" sx={{ mb: 1}}/>
                                <Skeleton height={20} width="80%" />
                                <Skeleton height={20} width="90%" />
                            </UserInfoDetails>
                        </WelcomeContainer>
                    </UserInfoContainer>
                    <QuickLinksContainer>
                        <Skeleton height={30} width={120} sx={{ mb: 2 }}/>
                        <QuickLinksScroll>
                            <Skeleton variant="rounded" width={140} height={36} sx={{ m: '0 8px', display: 'inline-block', borderRadius: '16px' }} />
                            <Skeleton variant="rounded" width={120} height={36} sx={{ m: '0 8px', display: 'inline-block', borderRadius: '16px' }} />
                            <Skeleton variant="rounded" width={90} height={36} sx={{ m: '0 8px', display: 'inline-block', borderRadius: '16px' }} />
                            <Skeleton variant="rounded" width={160} height={36} sx={{ m: '0 8px', display: 'inline-block', borderRadius: '16px' }} />
                        </QuickLinksScroll>
                    </QuickLinksContainer>
                 </Box>
            </Grid>
            {/* Right Column Skeleton */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                <WidgetCard sx={{ flexGrow: 1 }}>
                    <WidgetCardHeader><Skeleton height={30} width="60%" /></WidgetCardHeader>
                    <WidgetCardContent>
                        <AllMomentListSkeleton /> {/* Use the specific skeleton */}
                    </WidgetCardContent>
                </WidgetCard>
            </Grid>
        </Grid>
    );

    // Actual Content Renderer
    const renderContent = () => (
        <Grid
            container
            spacing={3} // Adds space BETWEEN Grid items
            sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }} // Grid takes full available width
        >
            {/* --- Left Column (Main Content) --- */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
                 {/* Inner Box to manage spacing between cards in this column */}
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                    {/* User Info Card - Conditional rendering */}
                    {profileIncomplete ? (
                        <UserInfoContainer>
                            <WelcomeContainer>
                                <ProfileAvatar onClick={handleOpenEditProfileModal} aria-label="Complete your profile">
                                     <EditIconContainer
                                        size="small"
                                        aria-label="Open edit profile modal"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                     >
                                         <EditIcon />
                                     </EditIconContainer>
                                     ? {/* Placeholder for incomplete profile */}
                                </ProfileAvatar>
                                <UserInfoDetails>
                                    <Typography variant="h5" component="h1" gutterBottom>Welcome!</Typography>
                                    <Typography variant="body1" color="textSecondary">Click the avatar to get started.</Typography>
                                </UserInfoDetails>
                            </WelcomeContainer>
                        </UserInfoContainer>
                    ) : (
                        <UserInfoContainer>
                            <WelcomeContainer>
                                <ProfileAvatar
                                    profilebg={basicInfo.profilebg || primaryColor}
                                    onClick={handleOpenEditProfileModal}
                                    aria-label={`Edit profile for ${basicInfo.fullName || 'User'}`}
                                >
                                    <EditIconContainer
                                        size="small"
                                        aria-label="Open edit profile modal"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                    >
                                        <EditIcon />
                                    </EditIconContainer>
                                    {/* Display first initial or fallback */}
                                    {basicInfo.fullName?.charAt(0).toUpperCase() || '?'}
                                </ProfileAvatar>
                                <UserInfoDetails>
                                    <Typography variant="h5" component="h1" fontWeight={600}>Welcome, {basicInfo.fullName || 'User'}!</Typography>
                                    <Typography variant="body1" color="textSecondary" sx={{ mb: 0.5, overflowWrap: 'break-word' }}>{basicInfo.email || 'No email found'}</Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        <strong>ID:</strong> {basicInfo.studentId || 'N/A'} | <strong>Session:</strong> {basicInfo.session || 'N/A'}
                                    </Typography>
                                    {basicInfo.currentStatus && (
                                        <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                            Status: {basicInfo.currentStatus}
                                        </Typography>
                                    )}
                                </UserInfoDetails>
                            </WelcomeContainer>
                        </UserInfoContainer>
                    )}

                    {/* Quick Links Area */}
                    <QuickLinksContainer>
                        <SectionTitle variant="h6">Quick Links</SectionTitle>
                        <QuickLinksScroll>
                            {/* Example Links - replace href with actual paths or use routing Links */}
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#">Course Catalog</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#" >Assignments</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#" >Grades</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#" >Campus Map</QuickLinkButton>
                            <QuickLinkButton variant="contained" color="secondary" onClick={handleOpenStatusModal} sx={{ borderRadius: '16px' }}>
                                Update Status
                            </QuickLinkButton>
                        </QuickLinksScroll>
                    </QuickLinksContainer>
                 </Box> {/* End of inner Box for left column */}
            </Grid> {/* End of Left Column Grid item */}

            {/* --- Right Column (Discussions Widget) --- */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                {/* WidgetCard fills the height of the Grid item */}
                <WidgetCard sx={{ flexGrow: 1 }}>
                    <WidgetCardHeader>
                        <Typography variant="h6" component="div" fontWeight={500}>Latest Discussions</Typography>
                    </WidgetCardHeader>
                    <WidgetCardContent>
                        {/* Lazy load the discussion list */}
                        <Suspense fallback={<AllMomentListSkeleton />}>
                            <AllMomentList />
                        </Suspense>
                    </WidgetCardContent>
                </WidgetCard>
            </Grid> {/* End of Right Column Grid item */}
        </Grid> // End of Main Grid container
    );


    // --- Main Return ---
    return (
        // Use a React Fragment or simple Box as the top-level element now
        <>
            {/* Removed the `maxWidth` prop that was limiting the container's width */}
            <StyledContainer> {/* You can potentially remove this StyledContainer entirely if not needed */}

                {/* Display Error Alert if there's an error */}
                {!loading && error && (
                    <Alert
                        severity={profileIncomplete ? "info" : "error"} // Show info styling for incomplete profile prompt
                        icon={profileIncomplete ? <EditIcon fontSize="inherit" /> : <ErrorOutlineIcon fontSize="inherit" />}
                        sx={{ mb: 3 }} // Margin bottom for spacing
                    >
                        {error}
                    </Alert>
                )}

                {/* Show Skeletons while loading */}
                {loading && renderSkeletons()}
                {/* Show actual content when loading is done and user data exists */}
                {!loading && user && renderContent()}
                {/* Handle case where loading is done but user data is missing (and no specific error shown) */}
                {!loading && !user && !error && (
                    <Alert severity="warning" sx={{ mt: 3 }}>Could not retrieve user session. Please try logging in again.</Alert>
                )}

            </StyledContainer>

            {/* --- Modals --- */}
            {/* Edit Profile Modal */}
            <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title">
                <Box sx={modalStyle}>
                    <Typography id="edit-profile-modal-title" variant="h6" component="h2" gutterBottom>Edit Profile</Typography>
                    <Typography sx={{ mt: 2 }}>
                        Profile editing functionality (e.g., picture upload) will be implemented here.
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                        <Button onClick={handleCloseEditProfileModal}>Cancel</Button>
                        <Button variant="contained" color="primary" disabled>Save Changes</Button> {/* Placeholder */}
                    </Box>
                </Box>
            </Modal>

            {/* Update Status Modal */}
            <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal-title">
                <Box sx={modalStyle}>
                    <Typography id="current-status-modal-title" variant="h6" component="h2" gutterBottom>Update Current Status</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="current-status-label">Current Status</InputLabel>
                        <Select
                            labelId="current-status-label"
                            value={currentStatus}
                            label="Current Status"
                            onChange={handleStatusChange}
                        >
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="Studying">Studying</MenuItem>
                            <MenuItem value="Graduated">Graduated</MenuItem>
                            <MenuItem value="Employed">Employed</MenuItem>
                            <MenuItem value="Seeking Opportunity">Seeking Opportunity</MenuItem>
                            <MenuItem value="Overseas">Overseas</MenuItem>
                            <MenuItem value="Unemployed">Unemployed</MenuItem>
                            {/* Add other relevant statuses */}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                        <Button onClick={handleCloseStatusModal}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={handleStatusSubmit}>Submit</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

export default Dashboard;