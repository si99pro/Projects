/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from '../firebase'; // Make sure path is correct
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
    Card,         // Standard MUI Card
    CardContent,  // Standard MUI CardContent
    IconButton,
    Skeleton,
    Alert,
    Link as MuiLink,
    useTheme, // Import useTheme to access theme spacing and palette
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined'; // Better icon for info alert

// Lazy load the component for better performance
const AllMomentList = lazy(() => import('../components/AllMomentList')); // Make sure path is correct

// --- Styled Components ---
// Use theme for colors where possible

// StyledContainer: Remove fixed margins here, apply them responsively in JSX.
const StyledContainer = styled(Container)(({ theme }) => ({
    // Use theme typography defaults unless specifically overriding
    // fontFamily: theme.typography.fontFamily, // Usually inherited
    color: theme.palette.text.primary,
    // mt/mb applied via sx prop for responsiveness
}));

// Base styling for Paper elements (cards) - Use theme values
const StyledPaperBase = styled(Paper)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius * 1.5, // Slightly more rounded
    boxShadow: theme.shadows[2], // Subtle shadow from theme
    backgroundColor: theme.palette.background.paper,
    transition: theme.transitions.create(['box-shadow', 'transform'], {
        duration: theme.transitions.duration.short,
    }),
    '&:hover': {
        boxShadow: theme.shadows[5], // Slightly elevated shadow on hover
        // transform: 'translateY(-2px)', // Optional subtle lift
    },
    // Padding will be applied via sx prop for responsiveness
    width: '100%', // Ensure papers take full width of their grid item
    boxSizing: 'border-box',
}));

// Specific card styles - Inherit base styles, padding applied via sx
const UserInfoContainer = styled(StyledPaperBase)``;
const QuickLinksContainer = styled(StyledPaperBase)``;

// Removing custom WidgetCard, WidgetCardHeader, WidgetCardContent
// Will use standard MUI Card and CardContent with sx props

// Section title styling - Use theme typography and responsive margin
const SectionTitle = styled(Typography)(({ theme }) => ({
    // Defaults to variant="h6" if used like <SectionTitle variant="h6">
    fontWeight: 600,
    // mb applied via sx prop for responsiveness
    color: theme.palette.primary.main, // Use theme primary color
}));

// Container for horizontally scrollable quick links - Use theme spacing
const QuickLinksScroll = styled(Box)(({ theme }) => ({
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: theme.spacing(1.5), // Space for scrollbar visibility
    marginLeft: theme.spacing(-1), // Offset button margin slightly if needed
    marginRight: theme.spacing(-1),
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
    '&::-webkit-scrollbar': { height: '6px' },
    '&::-webkit-scrollbar-track': { background: 'transparent' },
    '&::-webkit-scrollbar-thumb': {
        background: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400],
        borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
        background: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[500],
    },
    scrollbarWidth: 'thin',
    scrollbarColor: `${theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400]} transparent`,
}));


// Styling for individual quick link buttons - Use theme spacing
const QuickLinkButton = styled(Button)(({ theme }) => ({
    marginRight: theme.spacing(1), // Consistent spacing
    marginBottom: theme.spacing(0.5), // Allow wrapping slightly better if needed
    textTransform: 'none',
    borderRadius: '20px', // More pill-shaped
    fontWeight: 500,
    whiteSpace: 'nowrap', // Prevent button text wrapping
    '&:last-child': {
        marginRight: 0,
    },
}));

// User avatar styling - Make margin responsive via parent gap
const ProfileAvatar = styled(Avatar)(({ theme, profilebg }) => ({
    // Responsive size via sx prop where used
    position: 'relative',
    backgroundColor: profilebg || theme.palette.primary.main,
    color: theme.palette.common.white,
    // Responsive font size via sx prop where used
    cursor: 'pointer',
    boxShadow: theme.shadows[3],
    flexShrink: 0, // Prevent avatar shrinking
    overflow: 'visible', // To show the EditIconContainer correctly
    border: `2px solid ${theme.palette.background.paper}` // Add subtle border
}));

// Flex container for avatar and user details - Make gap responsive via sx
const WelcomeContainer = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  textAlign: 'left',
  width: '100%',
  // Add responsive gap via sx prop where used
});

// Edit icon positioned over the avatar - Use theme colors
const EditIconContainer = styled(IconButton)(({ theme }) => ({
    position: 'absolute',
    bottom: -5, // Adjust positioning slightly
    right: -5,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(0.75), // Use theme spacing
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: '50%',
    transition: theme.transitions.create(['background-color', 'transform']),
    zIndex: 1,
    '&:hover': {
        backgroundColor: theme.palette.grey[100],
        transform: 'scale(1.15)',
    },
    '& .MuiSvgIcon-root': { // Target the icon inside
        fontSize: '1rem', // Smaller icon
        color: theme.palette.primary.main,
    },
}));

// Container for user text details next to avatar - Make gap responsive via sx
const UserInfoDetails = styled(Box)({
    display: 'flex',
    flexDirection: 'column',
    // gap applied via sx prop where used
    flexGrow: 1, // Take remaining space
    minWidth: 0, // Prevent overflow issues with long text
});

// Style for the content area of Modals - Updated to use theme spacing and shape
const modalStyle = (theme) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 450 }, // Slightly wider default
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: theme.shape.borderRadius * 1.5, // Consistent rounding
    boxShadow: theme.shadows[24], // Standard intense shadow for modals
    p: { xs: 2, sm: 3, md: 4 }, // Responsive padding using theme spacing
});

// --- Fallback Skeleton for Lazy Loaded Component --- (Improved structure)
const AllMomentListSkeleton = ({ count = 3 }) => (
    <Box>
        {[...Array(count)].map((_, index) => (
            <Box key={index} sx={{ mb: 2 }}>
                <Skeleton variant="text" animation="wave" height={25} width="70%" sx={{ mb: 0.5 }} />
                <Skeleton variant="text" animation="wave" height={20} width="90%" />
                 <Skeleton variant="text" animation="wave" height={18} width="50%" sx={{ mt: 0.5 }} />
            </Box>
        ))}
    </Box>
);


// --- Dashboard Component ---
function Dashboard() {
    const theme = useTheme(); // Access theme

    // --- State Variables --- (Keep as is)
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

    // --- Fetch User Data Effect --- (Keep as is - error handling is decent)
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null); // Reset error on new fetch attempt
        const currentUser = auth.currentUser;

        if (!currentUser) {
            if (isMounted) {
                setError("User not authenticated. Please log in.");
                setLoading(false);
            }
            return;
        }

        async function fetchUserData() {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDocRef);

                if (isMounted) {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setUser(userData);
                        setCurrentStatus(userData.basicInfo?.currentStatus || '');
                    } else {
                        console.warn('No user document found for UID:', currentUser.uid);
                        setUser({}); // Initialize with an empty object
                        // Set a specific flag/state instead of error for better handling
                        // setError("Welcome! Please complete your profile information.");
                        // Let derived state handle this
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                if (isMounted) {
                    setError("Failed to load dashboard data. Please check connection or try again later.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchUserData();

        return () => { isMounted = false; };
    }, []);

    // --- Handlers --- (Consider adding Snackbar feedback for submit)
    const handleStatusChange = (event) => setCurrentStatus(event.target.value);
    const handleCloseStatusModal = () => setOpenStatusModal(false);
    const handleOpenStatusModal = () => {
        setCurrentStatus(user?.basicInfo?.currentStatus || '');
        setOpenStatusModal(true);
    };
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false);
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true);

    const handleStatusSubmit = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser || !user) {
            setError("Authentication error or user data missing. Please refresh or log in again.");
            setOpenStatusModal(false);
            return;
        }
        const originalStatus = user?.basicInfo?.currentStatus || '';
        setUser((prevState) => ({
            ...prevState,
            basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: currentStatus },
        }));
        setOpenStatusModal(false);

        try {
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { 'basicInfo.currentStatus': currentStatus });
            console.log("Status updated successfully");
            // TODO: Add Snackbar success message (using a Snackbar provider context)
            // showSnackbar('Status updated successfully!', 'success');
        } catch (error) {
            console.error('Error updating current status:', error);
            setError("Failed to update status. Please try again.");
            setUser((prevState) => ({ // Rollback UI
                ...prevState,
                basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: originalStatus },
            }));
             // TODO: Add Snackbar error message
            // showSnackbar('Failed to update status.', 'error');
        }
    };

    // --- Derived State / Helper Variables ---
    const basicInfo = user?.basicInfo || {};
    // Profile is incomplete if user object exists, loading is finished, there's no major fetch error, and basicInfo is empty or lacks a key field like fullName
    const profileIncomplete = !loading && !error?.includes("Failed") && user && (!basicInfo || Object.keys(basicInfo).length === 0 || !basicInfo.fullName);
    const userDisplayName = basicInfo.fullName || 'User';
    const userGreeting = profileIncomplete ? "Welcome!" : `Welcome, ${userDisplayName}!`;

    // --- Render Logic ---

    // Skeleton Loader Structure - Apply similar responsive padding/margins/gaps
    const renderSkeletons = () => (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }} // Responsive spacing
            sx={{ width: '100%' }}
        >
            {/* Left Column Skeleton */}
            <Grid item xs={12} md={8}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
                     <UserInfoContainer sx={{ p: { xs: 2, sm: 3 } }}>
                        <WelcomeContainer sx={{ gap: { xs: 2, sm: 3 } }}>
                            <Skeleton variant="circular" animation="wave" sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, flexShrink: 0 }} />
                            <UserInfoDetails sx={{ flexGrow: 1, minWidth: 0, gap: 0.5 }}>
                                <Skeleton animation="wave" height={40} width="60%" sx={{ mb: 1 }}/>
                                <Skeleton animation="wave" height={20} width="80%" />
                                <Skeleton animation="wave" height={20} width="90%" />
                            </UserInfoDetails>
                        </WelcomeContainer>
                    </UserInfoContainer>
                    <QuickLinksContainer sx={{ p: { xs: 2, sm: 3 } }}>
                        <Skeleton animation="wave" height={30} width={120} sx={{ mb: { xs: 1.5, sm: 2 } }}/>
                        <QuickLinksScroll>
                            <Skeleton variant="rounded" animation="wave" width={140} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} />
                            <Skeleton variant="rounded" animation="wave" width={120} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} />
                            <Skeleton variant="rounded" animation="wave" width={90} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} />
                            <Skeleton variant="rounded" animation="wave" width={160} height={36} sx={{ display: 'inline-block', borderRadius: '20px' }} />
                        </QuickLinksScroll>
                    </QuickLinksContainer>
                 </Box>
            </Grid>
            {/* Right Column Skeleton - USING STANDARD CARD/CARDCONTENT */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: theme.shape.borderRadius * 1.5 }}>
                    <CardContent sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0, py: 1.5 }}> {/* Reduced padding */}
                         <Skeleton animation="wave" height={30} width="60%" />
                    </CardContent>
                    <CardContent sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, p: { xs: 2, sm: 3 } }}>
                        <AllMomentListSkeleton />
                    </CardContent>
                </Card>
            </Grid>
        </Grid>
    );

    // Actual Content Renderer - Apply responsive spacing
    const renderContent = () => (
        <Grid
            container
            spacing={{ xs: 2, md: 3 }} // Responsive spacing
            sx={{ width: '100%' }}
        >
            {/* --- Left Column (Main Content) --- */}
            <Grid item xs={12} md={8}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}>
                    {/* User Info Card */}
                    <UserInfoContainer sx={{ p: { xs: 2, sm: 3 } }}>
                        <WelcomeContainer sx={{ gap: { xs: 2, sm: 3 } }}>
                            <ProfileAvatar
                                profilebg={profileIncomplete ? theme.palette.grey[500] : (basicInfo.profilebg || theme.palette.primary.dark)} // Darker primary default
                                onClick={handleOpenEditProfileModal}
                                aria-label={profileIncomplete ? "Complete your profile" : `Edit profile for ${userDisplayName}`}
                                sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}
                            >
                                {!profileIncomplete && <EditIconContainer aria-hidden="true"> <EditIcon /> </EditIconContainer>}
                                {profileIncomplete ? '?' : (basicInfo.fullName?.charAt(0).toUpperCase() || '?')}
                            </ProfileAvatar>
                            <UserInfoDetails sx={{ gap: 0.5 }}>
                                 <Typography variant="h5" component="h1" fontWeight={600} sx={{ fontSize: { xs: '1.25rem', sm: '1.5rem' }, wordBreak: 'break-word' }}>
                                    {userGreeting}
                                </Typography>
                                {profileIncomplete ? (
                                    <Typography variant="body1" color="text.secondary">
                                        Click the avatar above to set up your profile details.
                                    </Typography>
                                ) : (
                                    <>
                                        <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word', fontSize: { xs: '0.875rem', sm: '1rem'} }}>
                                            {basicInfo.email || 'No email found'}
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem'}, display: 'flex', flexWrap: 'wrap', gap: theme.spacing(0.5) }}>
                                            <Box component="span"><strong>ID:</strong> {basicInfo.studentId || 'N/A'}</Box>
                                            <Box component="span" sx={{ display: { xs:'none', sm: 'inline' } }}>|</Box> {/* Hide separator on xs */}
                                            <Box component="span"><strong>Session:</strong> {basicInfo.session || 'N/A'}</Box>
                                        </Typography>
                                        {basicInfo.currentStatus && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    fontStyle: 'italic',
                                                    mt: 0.5,
                                                    display: 'inline-block', // Allows bg color
                                                    bgcolor: theme.palette.action.hover, // Subtle bg
                                                    px: 1,
                                                    py: 0.25,
                                                    borderRadius: '4px'
                                                }}
                                            >
                                                {basicInfo.currentStatus}
                                            </Typography>
                                        )}
                                    </>
                                )}
                            </UserInfoDetails>
                        </WelcomeContainer>
                    </UserInfoContainer>

                    {/* Quick Links Area */}
                    <QuickLinksContainer sx={{ p: { xs: 2, sm: 3 } }}>
                        <SectionTitle variant="h6" sx={{ mb: { xs: 1.5, sm: 2 } }}>
                            Quick Links
                        </SectionTitle>
                        <QuickLinksScroll>
                            {/* Using MuiLink for potential routing, href="#" placeholder */}
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#">Course Catalog</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#">Assignments</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#">Grades</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="#">Campus Map</QuickLinkButton>
                            <QuickLinkButton variant="contained" color="secondary" onClick={handleOpenStatusModal}>
                                Update Status
                            </QuickLinkButton>
                            {/* Add more relevant links */}
                        </QuickLinksScroll>
                    </QuickLinksContainer>
                 </Box> {/* End of inner Box for left column */}
            </Grid> {/* End of Left Column Grid item */}

            {/* --- Right Column (Discussions Widget) - USING STANDARD CARD/CARDCONTENT --- */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                <Card sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRadius: theme.shape.borderRadius * 1.5 }}>
                    {/* Use standard CardContent for header */}
                    <CardContent sx={{ borderBottom: 1, borderColor: 'divider', flexShrink: 0, py: 1.5 }}> {/* Reduced padding */}
                        <Typography variant="h6" component="div" fontWeight={500}>
                            Latest Discussions
                        </Typography>
                    </CardContent>
                    {/* Use standard CardContent for body */}
                    <CardContent sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, p: { xs: 2, sm: 3 } }}>
                        <Suspense fallback={<AllMomentListSkeleton />}>
                            <AllMomentList />
                        </Suspense>
                    </CardContent>
                </Card>
            </Grid> {/* End of Right Column Grid item */}
        </Grid> // End of Main Grid container
    );

    // --- Main Return ---
    return (
        <>
            {/* Apply responsive margins directly here */}
            <StyledContainer sx={{ mt: { xs: 2, md: 4 }, mb: { xs: 4, md: 6 } }}>

                {/* Display Error Alert - More specific severity/icon */}
                {error && (
                    <Alert
                        severity="error"
                        icon={<ErrorOutlineIcon fontSize="inherit" />}
                        sx={{ mb: { xs: 2, md: 3 } }}
                    >
                        {error}
                    </Alert>
                )}

                 {/* Display Profile Incomplete Info Alert */}
                 {!loading && !error && profileIncomplete && (
                    <Alert
                        severity="info"
                        icon={<InfoOutlinedIcon fontSize="inherit" />}
                        action={
                            <Button color="inherit" size="small" onClick={handleOpenEditProfileModal}>
                                SET UP PROFILE
                            </Button>
                        }
                        sx={{ mb: { xs: 2, md: 3 } }}
                    >
                       Your profile seems incomplete. Please set it up for the best experience.
                    </Alert>
                 )}


                {loading && renderSkeletons()}
                {/* Only render content if not loading AND we have user data (even if incomplete) AND no major error */}
                {!loading && user && !error?.includes("Failed") && renderContent()}

                {/* Fallback message if loading is done, no user, and no specific error */}
                {!loading && !user && !error && (
                    <Alert severity="warning" sx={{ mt: { xs: 2, md: 3 } }}>
                        Could not retrieve user data. Please try logging in again or contact support if the issue persists.
                    </Alert>
                )}

            </StyledContainer>

            {/* --- Modals --- (modalStyle already updated) */}
            {/* Edit Profile Modal */}
            <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title">
                <Box sx={modalStyle(theme)}>
                    <Typography id="edit-profile-modal-title" variant="h6" component="h2" gutterBottom>
                       {profileIncomplete ? "Set Up Your Profile" : "Edit Profile"}
                    </Typography>
                    <Typography sx={{ mt: 2 }}>
                        {/* TODO: Replace with actual form fields */}
                        Profile editing form fields will go here (e.g., Name, Student ID, Session, Profile Background Color Picker, etc.).
                        <br/><br/>(Placeholder content)
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: { xs: 3, sm: 4 } }}>
                        <Button onClick={handleCloseEditProfileModal}>Cancel</Button>
                        <Button variant="contained" color="primary" disabled>Save Changes</Button> {/* TODO: Enable when form is valid */}
                    </Box>
                </Box>
            </Modal>

            {/* Update Status Modal */}
            <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal-title">
                <Box sx={modalStyle(theme)}>
                    <Typography id="current-status-modal-title" variant="h6" component="h2" gutterBottom>Update Your Status</Typography>
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
                            <MenuItem value="On Break">On Break</MenuItem>
                            <MenuItem value="Internship">Internship</MenuItem>
                            <MenuItem value="Freelancing">Freelancing</MenuItem>
                            <MenuItem value="Seeking Opportunity">Seeking Opportunity</MenuItem>
                            <MenuItem value="Employed">Employed</MenuItem>
                             <MenuItem value="Further Studies">Further Studies</MenuItem>
                             <MenuItem value="Graduated">Graduated</MenuItem>
                            {/* Add more relevant options */}
                        </Select>
                    </FormControl>
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: { xs: 3, sm: 4 } }}>
                        <Button onClick={handleCloseStatusModal}>Cancel</Button>
                        <Button variant="contained" color="primary" onClick={handleStatusSubmit}>Submit</Button>
                    </Box>
                </Box>
            </Modal>
        </>
    );
}

export default Dashboard;