/* eslint-disable no-unused-vars */
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
    Skeleton,
    Alert,
    Link as MuiLink,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const AllMomentList = lazy(() => import('../components/AllMomentList'));

// --- Styled Components ---
const primaryColor = '#3f51b5';
const secondaryColor = '#7986cb';
const textColor = '#212121';
const subtleBgColor = '#ffffff';

const StyledContainer = styled(Container)`
    margin-top: 20px;
    margin-bottom: 40px;
    padding-left: 16px;
    padding-right: 16px;
    color: ${textColor};
    font-family: 'Roboto', sans-serif;
    min-height: 70vh;
    background-color: ${subtleBgColor};
    width: 100%;
    display: block;
`;

const StyledPaperBase = styled(Paper)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    background-color: #fff;
    transition: box-shadow 0.3s ease-in-out;
    &:hover {
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.12);
    }
`;

const UserInfoContainer = styled(StyledPaperBase)`
    padding: 24px;
`;

const QuickLinksContainer = styled(StyledPaperBase)`
    padding: 18px 24px;
`;

const WidgetCard = styled(Card)`
    border-radius: 12px;
    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.08);
    height: 100%;
    display: flex;
    flex-direction: column;
    transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
    &:hover {
       transform: translateY(-4px);
       box-shadow: 0 6px 12px rgba(0,0,0,0.1);
    }
    width: 100%;
    box-sizing: border-box;
`;

const WidgetCardHeader = styled(CardContent)`
    border-bottom: 1px solid #e0e0e0;
    padding: 16px 20px;
    background-color: #fafafa;
    flex-shrink: 0;
`;

const WidgetCardContent = styled(CardContent)(({ theme }) => ({
    paddingLeft: theme.spacing(2.5),
    paddingRight: theme.spacing(2.5),
    paddingTop: theme.spacing(2.5),
    paddingBottom: theme.spacing(2.5),
    flexGrow: 1,
    '&:last-child': {
         paddingBottom: theme.spacing(2.5),
    },
    overflowY: 'auto',
    minHeight: 0,
}));

const SectionTitle = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 600;
    margin-bottom: 16px;
    color: ${primaryColor};
`;

const QuickLinksScroll = styled(Box)`
    overflow-x: auto;
    white-space: nowrap;
    padding-bottom: 10px;
    margin-left: -8px;
    margin-right: -8px;
    &::-webkit-scrollbar { height: 6px; }
    &::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
    &::-webkit-scrollbar-thumb:hover { background: #aaa; }
    scrollbar-width: thin;
    scrollbar-color: #ccc transparent;
`;

const QuickLinkButton = styled(Button)`
    margin: 0 8px;
    text-transform: none;
    border-radius: 16px;
    font-weight: 500;
`;

const ProfileAvatar = styled(Avatar)`
    width: 80px;
    height: 80px;
    margin-right: 24px;
    position: relative;
    background-color: ${props => props.profilebg || primaryColor};
    color: white;
    font-size: 2.5rem;
    cursor: pointer;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    flex-shrink: 0;
    overflow: visible; // Allow absolutely positioned children to overflow
`;

const WelcomeContainer = styled(Box)`
  display: flex;
  align-items: center;
  text-align: left;
  width: 100%;
`;

const EditIconContainer = styled(IconButton)`
    position: absolute;
    bottom: 0px;
    right: 0px;
    background-color: rgba(255, 255, 255, 0.95);
    padding: 5px;
    border: 1px solid rgba(0,0,0,0.1);
    border-radius: 50%;
    transition: background-color 0.2s ease, transform 0.2s ease;
    z-index: 1; // Ensure it's on top
    &:hover {
        background-color: white;
        transform: scale(1.15);
    }
    svg {
        font-size: 16px;
        color: ${primaryColor};
    }
`;

const UserInfoDetails = styled(Box)`
    display: flex;
    flex-direction: column;
    gap: 4px;
    flex-grow: 1;
    min-width: 0;
`;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 400 },
    bgcolor: 'background.paper',
    border: 'none',
    borderRadius: '12px',
    boxShadow: 24,
    p: 4,
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
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

    // --- Fetch User Data Effect ---
    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        setError(null);
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
                        setUser({});
                        setError("Welcome! Please complete your profile information.");
                    }
                }
            } catch (err) {
                console.error('Error fetching user data:', err);
                if (isMounted) {
                    setError("Failed to load dashboard data. Please check connection.");
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

    // --- Handlers ---
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
        if (!currentUser) {
            setError("Authentication error. Please log in again.");
            return;
        }
        const originalStatus = user?.basicInfo?.currentStatus || '';
        try {
            setOpenStatusModal(false);
            setUser((prevState) => ({
                ...prevState,
                basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: currentStatus },
            }));
            const userDocRef = doc(db, 'users', currentUser.uid);
            await updateDoc(userDocRef, { 'basicInfo.currentStatus': currentStatus });
            console.log("Status updated successfully");
        } catch (error) {
            console.error('Error updating current status:', error);
            setError("Failed to update status. Please try again.");
            setUser((prevState) => ({
                ...prevState,
                basicInfo: { ...(prevState?.basicInfo || {}), currentStatus: originalStatus },
            }));
        }
    };

    // --- Derived State / Helper Variables ---
    const basicInfo = user?.basicInfo || {};
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
                        <AllMomentListSkeleton />
                    </WidgetCardContent>
                </WidgetCard>
            </Grid>
        </Grid>
    );

    // Actual Content Renderer
    const renderContent = () => (
        <Grid
            container
            spacing={3}
            sx={{ display: 'flex', flexWrap: 'wrap', width: '100%' }}
        >
            {/* --- Left Column (Main) --- */}
            <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, flexGrow: 1 }}>
                    {profileIncomplete ? (
                        <UserInfoContainer>
                            <WelcomeContainer>
                                <ProfileAvatar onClick={handleOpenEditProfileModal} aria-label="Complete your profile">
                                     {/* Edit icon container first */}
                                     <EditIconContainer
                                        size="small"
                                        aria-label="Open edit profile modal"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                     >
                                         <EditIcon />
                                     </EditIconContainer>
                                     {/* Avatar Text second */}
                                     ?
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
                                    {/* Edit icon container first */}
                                    <EditIconContainer
                                        size="small"
                                        aria-label="Open edit profile modal"
                                        onClick={(e) => { e.stopPropagation(); handleOpenEditProfileModal(); }}
                                    >
                                        <EditIcon />
                                    </EditIconContainer>
                                    {/* Avatar Text second */}
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
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="/courses">Course Catalog</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="/assignments" >Assignments</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="/grades" >Grades</QuickLinkButton>
                            <QuickLinkButton variant="outlined" color="primary" component={MuiLink} href="/map" >Campus Map</QuickLinkButton>
                            <QuickLinkButton variant="contained" color="secondary" onClick={handleOpenStatusModal} sx={{ borderRadius: '16px' }}>
                                Update Status
                            </QuickLinkButton>
                        </QuickLinksScroll>
                    </QuickLinksContainer>
                 </Box> {/* End of inner Box for left column */}
            </Grid> {/* End of Left Column Grid item */}

            {/* --- Right Column (Discussions) --- */}
            <Grid item xs={12} md={4} sx={{ display: 'flex' }}>
                <WidgetCard sx={{ flexGrow: 1 }}>
                    <WidgetCardHeader>
                        <Typography variant="h6" component="div" fontWeight={500}>Latest Discussions</Typography>
                    </WidgetCardHeader>
                    <WidgetCardContent>
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
        <>
            <StyledContainer maxWidth="lg">

                {!loading && error && (
                    <Alert
                        severity={profileIncomplete ? "info" : "error"}
                        icon={profileIncomplete ? <EditIcon fontSize="inherit" /> : <ErrorOutlineIcon fontSize="inherit" />}
                        sx={{ mb: 3 }}
                    >
                        {error}
                    </Alert>
                )}

                {loading && renderSkeletons()}
                {!loading && user && renderContent()}
                {!loading && !user && !error && (
                    <Alert severity="warning" sx={{ mt: 3 }}>Could not retrieve user session. Please try logging in again.</Alert>
                )}

            </StyledContainer>

            {/* --- Modals --- */}
            <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title">
                <Box sx={modalStyle}>
                    <Typography id="edit-profile-modal-title" variant="h6" component="h2" gutterBottom>Edit Profile</Typography>
                    {/* highlight-start */}
                    <Typography sx={{ mt: 2 }}>
                        Upload a new profile picture or change avatar settings here.
                    </Typography>
                    {/* highlight-end */}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}>
                        <Button onClick={handleCloseEditProfileModal}>Cancel</Button>
                        {/* Add functionality to this button later */}
                        <Button variant="contained" color="primary" disabled>Save Changes</Button>
                    </Box>
                </Box>
            </Modal>

            <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal-title">
                <Box sx={modalStyle}>
                    <Typography id="current-status-modal-title" variant="h6" component="h2" gutterBottom>Update Current Status</Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="current-status-label">Current Status</InputLabel>
                        <Select labelId="current-status-label" value={currentStatus} label="Current Status" onChange={handleStatusChange}>
                            <MenuItem value=""><em>None</em></MenuItem>
                            <MenuItem value="Studying">Studying</MenuItem>
                            <MenuItem value="Graduated">Graduated</MenuItem>
                            <MenuItem value="Employed">Employed</MenuItem>
                            <MenuItem value="Seeking Opportunity">Seeking Opportunity</MenuItem>
                            <MenuItem value="Overseas">Overseas</MenuItem>
                            <MenuItem value="Unemployed">Unemployed</MenuItem>
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