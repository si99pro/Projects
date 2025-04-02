/* eslint-disable no-unused-vars */ // Keep if some vars are intentionally unused for now
import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import { auth, db } from '../firebase'; // Assuming firebase setup is correct
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Firebase v9 imports
import styled from '@emotion/styled';
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
    // List, // Removed as not used after chart/recent activity removal
    // ListItem, // Removed
    // ListItemAvatar, // Removed
    // ListItemText, // Removed
    LinearProgress, // Keep for Suspense fallback
    Skeleton,       // Import Skeleton for loading state
    Alert,          // For error messages
    Link as MuiLink,// Import MUI Link for potential external links, or use react-router Link
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline'; // For error alert icon

// --- Lazy Loaded Components ---
// Ensure the path is correct relative to this file (Dashboard.js)
// Ensure AllMomentList.js has a 'export default AllMomentList;'
const AllMomentList = lazy(() => import('../components/AllMomentList')); // Keep lazy load

// --- Styled Components (Keep all styled components as they define the UI structure) ---
const primaryColor = '#3f51b5';
const secondaryColor = '#7986cb';
const textColor = '#212121';

const StyledContainer = styled(Container)`
    margin-top: 20px;
    padding: 20px;
    color: ${textColor};
    font-family: 'Roboto', sans-serif;
    min-height: 90vh; // Ensure content fills viewport height
`;

// Consolidated Paper styling
const StyledPaperBase = styled(Paper)`
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    margin-bottom: 20px; // Consistent margin
    &:hover {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
`;

const UserInfoContainer = styled(StyledPaperBase)`
    padding: 20px;
`;

const QuickLinksContainer = styled(StyledPaperBase)`
    padding: 15px 20px;
    background-color: #fcfcff; // Slightly different bg
`;

// Keep WidgetCard styles
const WidgetCard = styled(Card)`
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px; // Keep margin consistent or remove if parent Grid handles spacing
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

// Keep other specific styled components
const SectionTitle = styled(Typography)`
    font-size: 1.3rem; // Slightly smaller for better fit
    font-weight: 500;
    margin-bottom: 15px;
    color: ${primaryColor};
`;

const QuickLinksScroll = styled(Box)`
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
    margin-left: -5px; // Counteract button margin
    margin-right: -5px;

    &::-webkit-scrollbar {
        height: 6px;
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
    margin: 0 5px;
    text-transform: none; // More readable quick links
`;

const ProfileAvatar = styled(Avatar)`
    width: 70px; // Slightly smaller avatar
    height: 70px;
    margin-right: 20px;
    position: relative;
    background-color: ${props => props.profilebg || primaryColor};
    color: white;
    font-size: 2.2rem; // Adjust font size accordingly
    cursor: pointer;
`;

const WelcomeContainer = styled(Box)`
  display: flex;
  align-items: center;
  text-align: left;
  margin-bottom: 5px; // Reduced margin as UserInfoContainer has margin-bottom
`;

const EditIconContainer = styled(IconButton)`
    position: absolute;
    bottom: -2px; // Adjust position relative to avatar size
    right: -2px;
    background-color: rgba(255, 255, 255, 0.9); // Slightly more opaque
    padding: 4px;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    &:hover {
        background-color: rgba(255, 255, 255, 1);
        transform: scale(1.1);
    }
`;

const UserInfoDetails = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 2px; // Reduced gap
`;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: 'background.paper',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: 24,
    p: 4,
};

// --- Component ---

function Dashboard() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); // State to track loading status
    const [error, setError] = useState(null);     // State to track errors
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

    // Ref is kept in case it's needed for other interactions later
    const dashboardContentRef = useRef(null);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);

        // Use onAuthStateChanged for better listener management if needed,
        // but for a single load, checking currentUser directly is fine.
        const currentUser = auth.currentUser;

        if (!currentUser) {
            if (isMounted) {
                setError("User not authenticated. Please log in.");
                setLoading(false);
            }
            return; // Exit early if no user
        }

        async function fetchUserData() {
            try {
                const userDocRef = doc(db, 'users', currentUser.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (isMounted) {
                        setUser(userData);
                        // Ensure basicInfo exists before accessing properties
                        setCurrentStatus(userData.basicInfo?.currentStatus || '');
                    }
                } else {
                    console.warn('No user document found for UID:', currentUser.uid);
                    if (isMounted) {
                        // Set user to an empty object or specific state to indicate profile needed
                        setUser({}); // Indicate user exists but profile data is missing
                        setError("User profile data not found. Please complete your profile.");
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                if (isMounted) {
                    setError("Failed to load dashboard data. Please check your connection and try again.");
                }
            } finally {
                if (isMounted) {
                    setLoading(false); // Ensure loading is set to false in all cases
                }
            }
        }

        fetchUserData();

        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, []); // Empty dependency array: run once on mount

    // --- Handlers (Keep as they are functional) ---
    const handleStatusChange = (event) => setCurrentStatus(event.target.value);
    const handleCloseStatusModal = () => setOpenStatusModal(false);
    const handleOpenStatusModal = () => setOpenStatusModal(true);
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false);
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true);

    const handleStatusSubmit = async () => {
        const currentUser = auth.currentUser;
        if (!currentUser) {
            setError("Authentication error. Please log in again.");
            return;
        }
        try {
            setOpenStatusModal(false); // Close modal immediately for better UX
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, {
                'basicInfo.currentStatus': currentStatus,
            });
            // Optimistic UI update
            setUser((prevState) => {
                 // Check if prevState and basicInfo exist before spreading
                const currentBasicInfo = prevState?.basicInfo || {};
                return {
                    ...prevState,
                    basicInfo: {
                        ...currentBasicInfo,
                        currentStatus: currentStatus,
                    },
                };
            });
            // Consider adding a success Snackbar message here
        } catch (error) {
            console.error('Error updating current status:', error);
            setError("Failed to update status. Please try again.");
            // Re-open modal or show error message prominently
            // setOpenStatusModal(true); // Optionally re-open modal on error
        }
    };

    // Safely derive basicInfo, provide default empty object if user or basicInfo is null/undefined
    const basicInfo = user?.basicInfo || {};
    const hasBasicInfo = user && Object.keys(basicInfo).length > 0; // Check if basicInfo has data

    // --- Render Logic ---

    const renderSkeletons = () => (
        <>
            {/* Skeleton for User Info */}
            <UserInfoContainer>
                <WelcomeContainer>
                    <Skeleton variant="circular" width={70} height={70} sx={{ marginRight: '20px' }} />
                    <UserInfoDetails>
                        <Skeleton variant="text" width={180} height={35} />
                        <Skeleton variant="text" width={220} height={20} />
                        <Skeleton variant="text" width={250} height={20} />
                    </UserInfoDetails>
                </WelcomeContainer>
            </UserInfoContainer>

            {/* Skeleton for Quick Links */}
            <QuickLinksContainer>
                <SectionTitle variant="h6">
                    <Skeleton variant="text" width={120} height={30}/>
                </SectionTitle>
                <QuickLinksScroll>
                    <Skeleton variant="rounded" width={140} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                    <Skeleton variant="rounded" width={120} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                    <Skeleton variant="rounded" width={90} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                    <Skeleton variant="rounded" width={160} height={36} sx={{ margin: '0 5px', display: 'inline-block' }} />
                </QuickLinksScroll>
            </QuickLinksContainer>

            {/* Skeleton for the main content grid */}
            <Grid container spacing={3}>
                <Grid item xs={12}>
                    <WidgetCard>
                        <WidgetCardHeader><Skeleton variant="text" width="40%" height={30} /></WidgetCardHeader>
                        <WidgetCardContent>
                            <Skeleton variant="rectangular" height={100} />
                        </WidgetCardContent>
                    </WidgetCard>
                </Grid>
                {/* Add more skeletons for other grid items if they existed */}
            </Grid>
        </>
    );

    const renderContent = () => (
         <>
            {/* User Info & Quick Links - Conditionally render based on data */}
            {hasBasicInfo ? (
                 <>
                     <UserInfoContainer>
                         <WelcomeContainer>
                             <ProfileAvatar
                                 profilebg={basicInfo.profilebg || primaryColor}
                                 onClick={handleOpenEditProfileModal}
                                 aria-label="Open edit profile modal"
                             >
                                 {basicInfo.fullName?.charAt(0).toUpperCase() || '?'}
                                 <EditIconContainer
                                     aria-label="Edit profile"
                                     size="small"
                                     onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                 >
                                     <EditIcon sx={{ fontSize: '14px' }} />
                                 </EditIconContainer>
                             </ProfileAvatar>
                             <UserInfoDetails>
                                 <Typography variant="h5" component="h1" gutterBottom>
                                     Welcome, {basicInfo.fullName}!
                                 </Typography>
                                 <Typography variant="body2" color="textSecondary">
                                     {basicInfo.email}
                                 </Typography>
                                 <Typography variant="body2" color="textSecondary">
                                     <strong>ID:</strong> {basicInfo.studentId || 'N/A'} | <strong>Session:</strong> {basicInfo.session || 'N/A'}
                                 </Typography>
                                  {/* Display Current Status if available */}
                                 {basicInfo.currentStatus && (
                                     <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic', mt: 0.5 }}>
                                         Status: {basicInfo.currentStatus}
                                     </Typography>
                                 )}
                             </UserInfoDetails>
                         </WelcomeContainer>
                     </UserInfoContainer>

                     <QuickLinksContainer>
                         <SectionTitle variant="h6">Quick Links</SectionTitle>
                         <QuickLinksScroll>
                             {/* TODO: Replace # with actual routes or handlers */}
                             {/* If using React Router, use: component={Link} to="/courses" */}
                             <QuickLinkButton variant="outlined" color="primary" href="#">
                                 Course Catalog
                             </QuickLinkButton>
                             <QuickLinkButton variant="outlined" color="primary" href="#">
                                 Assignments
                             </QuickLinkButton>
                             <QuickLinkButton variant="outlined" color="primary" href="#">
                                 Grades
                             </QuickLinkButton>
                             <QuickLinkButton variant="outlined" color="primary" href="#">
                                 Discussion Forums
                             </QuickLinkButton>
                             <QuickLinkButton variant="outlined" color="secondary" onClick={handleOpenStatusModal}>
                                 Update Status
                             </QuickLinkButton>
                         </QuickLinksScroll>
                     </QuickLinksContainer>
                 </>
             ) : (
                 // Render something specific if user exists but basicInfo is missing
                 <Alert severity="info" sx={{ mb: 3 }}>
                     Welcome! Please complete your profile information by clicking the edit icon on the placeholder avatar.
                     {/* Render a simplified UserInfoContainer or just the alert */}
                     <UserInfoContainer>
                          <WelcomeContainer>
                             <ProfileAvatar
                                 onClick={handleOpenEditProfileModal}
                                 aria-label="Open edit profile modal"
                             >
                                 ?
                                  <EditIconContainer
                                     aria-label="Edit profile"
                                     size="small"
                                     onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                 >
                                     <EditIcon sx={{ fontSize: '14px' }} />
                                 </EditIconContainer>
                             </ProfileAvatar>
                              <UserInfoDetails>
                                 <Typography variant="h5" component="h1" gutterBottom>
                                     Welcome!
                                 </Typography>
                                 <Typography variant="body2" color="textSecondary">
                                     Click the icon to complete your profile.
                                 </Typography>
                                </UserInfoDetails>
                          </WelcomeContainer>
                     </UserInfoContainer>
                 </Alert>
             )}

             {/* Main Dashboard Grid Content */}
             <Grid container spacing={3}>
                 {/* Discussions Section - Using Suspense for lazy loading */}
                 <Grid item xs={12}>
                     <WidgetCard>
                         <WidgetCardHeader><Typography variant="h6">Latest Discussions</Typography></WidgetCardHeader>
                         <WidgetCardContent>
                             <Suspense fallback={<LinearProgress sx={{ my: 2 }} />}>
                                 {/* Render the lazy-loaded component */}
                                 <AllMomentList />
                             </Suspense>
                         </WidgetCardContent>
                     </WidgetCard>
                 </Grid>

                 {/* Add other grid items here if needed */}

             </Grid>
         </>
    );


    return (
        <>
            {/* AppBar/Toolbar removed as requested */}

            <StyledContainer maxWidth="lg" ref={dashboardContentRef}>

                {/* Handle Loading State with Skeletons */}
                {loading && renderSkeletons()}

                {/* Handle Error State */}
                {!loading && error && (
                    <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mb: 3 }}>
                        {error}
                        {/* Optionally add a retry button */}
                         {/* <Button color="inherit" size="small" onClick={() => window.location.reload()}>Retry</Button> */}
                    </Alert>
                    // Depending on the error, you might still want to render some parts, like Quick Links if they don't depend on user data
                 )}

                {/* Handle Loaded State (user data might still be partial) */}
                {!loading && !error && user && renderContent()}

                {/* --- Modals --- */}
                {/* Keep modals outside the conditional rendering of main content if they can be opened from error states or skeleton states potentially */}
                <Modal
                    open={editProfileModalOpen}
                    onClose={handleCloseEditProfileModal}
                    aria-labelledby="edit-profile-modal-title"
                >
                    <Box sx={modalStyle}>
                        <Typography id="edit-profile-modal-title" variant="h6" component="h2">Edit Profile</Typography>
                        <Typography sx={{ mt: 2 }}>
                            Implement profile editing form here. Fields should likely pre-fill from `basicInfo`.
                        </Typography>
                        {/* Example fields (implement with state and handlers) */}
                        {/* <TextField label="Full Name" fullWidth margin="normal" defaultValue={basicInfo?.fullName} /> */}
                        {/* <TextField label="Student ID" fullWidth margin="normal" defaultValue={basicInfo?.studentId} /> */}
                        {/* <TextField label="Session" fullWidth margin="normal" defaultValue={basicInfo?.session} /> */}
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                             <Button onClick={handleCloseEditProfileModal} color="inherit">Cancel</Button>
                             {/* TODO: Implement handleProfileUpdateSubmit */}
                             <Button variant="contained" color="primary" /* onClick={handleProfileUpdateSubmit} */ disabled>Save</Button>
                         </Box>
                    </Box>
                </Modal>

                <Modal
                    open={openStatusModal}
                    onClose={handleCloseStatusModal}
                    aria-labelledby="current-status-modal-title"
                >
                    <Box sx={modalStyle}>
                        <Typography id="current-status-modal-title" variant="h6" component="h2">Update Current Status</Typography>
                        <FormControl fullWidth margin="normal">
                            <InputLabel id="current-status-label">Current Status</InputLabel>
                            <Select
                                labelId="current-status-label"
                                value={currentStatus}
                                label="Current Status"
                                onChange={handleStatusChange}
                            >
                                <MenuItem value=""><em>None</em></MenuItem> {/* Allow clearing status */}
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