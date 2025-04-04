/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
// src/pages/Dashboard.js (REDESIGNED with Chat Bubble)
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { auth, db } from '../firebase'; // Adjust path if needed
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
    CardHeader,
    IconButton,
    Skeleton,
    Alert,
    Link as MuiLink,
    useTheme,
    useMediaQuery, // <-- Import useMediaQuery
    Divider,
    alpha,
    Fab,      // <-- Import Fab
    Tooltip   // <-- Import Tooltip
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ChatIcon from '@mui/icons-material/Chat';
import CloseIcon from '@mui/icons-material/Close'; // <-- Import CloseIcon if needed elsewhere

// Lazy load components
const AllMomentList = lazy(() => import('../components/AllMomentList'));
const PublicChat = lazy(() => import('../components/PublicChat').then(module => ({ default: module.default })));

// --- Constants ---
const APP_BAR_HEIGHT = 64;
const CHAT_SIDEBAR_WIDTH = 300;

// --- Styled Components ---
// ... (DashboardRoot, DashboardContentArea, StyledChatSidebar, StyledCard, SectionTitle, QuickLinksScroll, QuickLinkButton, ProfileAvatar, WelcomeContainer, EditIconContainer, UserInfoDetails, modalStyle remain the same) ...
const DashboardRoot = styled(Box)(({ theme }) => ({ display: 'flex', width: '100%', height: '100%', position: 'relative', }));
const DashboardContentArea = styled(Box)(({ theme }) => ({ flexGrow: 1, height: '100%', overflowY: 'auto', padding: theme.spacing(3), paddingRight: `calc(${theme.spacing(3)} + 10px)`, [theme.breakpoints.down('lg')]: { paddingRight: theme.spacing(3), }, }));
const StyledChatSidebar = styled(Paper)(({ theme }) => ({ width: CHAT_SIDEBAR_WIDTH, height: `calc(100vh - ${APP_BAR_HEIGHT}px)`, position: 'fixed', top: APP_BAR_HEIGHT, right: 0, zIndex: theme.zIndex.drawer, /* Increased zIndex slightly */ borderLeft: `1px solid ${theme.palette.divider}`, borderRadius: 0, boxShadow: theme.shadows[3], display: 'flex', flexDirection: 'column', overflow: 'hidden', [theme.breakpoints.down('lg')]: { display: 'none', }, }));
const StyledCard = styled(Card)(({ theme }) => ({ borderRadius: theme.shape.borderRadius * 2, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', backgroundColor: theme.palette.background.paper, transition: theme.transitions.create(['box-shadow']), height: '100%', display: 'flex', flexDirection: 'column', '&:hover': { boxShadow: '0 6px 16px rgba(0,0,0,0.08)', }, }));
const SectionTitle = styled(Typography)(({ theme }) => ({ fontWeight: 600, color: theme.palette.text.primary, marginBottom: theme.spacing(2), }));
const QuickLinksScroll = styled(Box)(({ theme }) => ({ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: theme.spacing(1.5), marginLeft: theme.spacing(-1), marginRight: theme.spacing(-1), paddingLeft: theme.spacing(1), paddingRight: theme.spacing(1), '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-track': { background: 'transparent' }, '&::-webkit-scrollbar-thumb': { background: theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400], borderRadius: '3px', }, '&::-webkit-scrollbar-thumb:hover': { background: theme.palette.mode === 'dark' ? theme.palette.grey[500] : theme.palette.grey[500], }, scrollbarWidth: 'thin', scrollbarColor: `${theme.palette.mode === 'dark' ? theme.palette.grey[600] : theme.palette.grey[400]} transparent`, }));
const QuickLinkButton = styled(Button)(({ theme }) => ({ marginRight: theme.spacing(1), marginBottom: theme.spacing(0.5), textTransform: 'none', borderRadius: '20px', fontWeight: 500, whiteSpace: 'nowrap', '&:last-child': { marginRight: 0, }, }));
const ProfileAvatar = styled(Avatar)(({ theme, profilebg }) => ({ position: 'relative', backgroundColor: profilebg || theme.palette.primary.main, color: theme.palette.common.white, cursor: 'pointer', boxShadow: theme.shadows[3], flexShrink: 0, overflow: 'visible', border: `3px solid ${theme.palette.background.paper}` }));
const WelcomeContainer = styled(Box)({ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%', });
const EditIconContainer = styled(IconButton)(({ theme }) => ({ position: 'absolute', bottom: -5, right: -5, backgroundColor: theme.palette.background.paper, padding: theme.spacing(0.75), border: `1px solid ${theme.palette.divider}`, borderRadius: '50%', transition: theme.transitions.create(['background-color', 'transform']), zIndex: 1, '&:hover': { backgroundColor: theme.palette.grey[100], transform: 'scale(1.15)', }, '& .MuiSvgIcon-root': { fontSize: '1rem', color: theme.palette.primary.main, }, }));
const UserInfoDetails = styled(Box)({ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, });
const modalStyle = (theme) => ({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 450 }, bgcolor: 'background.paper', border: 'none', borderRadius: theme.shape.borderRadius * 2, boxShadow: theme.shadows[24], p: { xs: 2, sm: 3, md: 4 }, });

// Skeletons (ChatSkeleton, AllMomentListSkeleton remain the same)
const ChatSkeleton = () => ( <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', p: 2 }}><Skeleton variant="text" height={40} width="60%" sx={{ mb: 2 }} /><Divider sx={{ mb: 2 }} /><Box sx={{ flexGrow: 1 }}>{[...Array(5)].map((_, i) => ( <Box key={i} sx={{ display: 'flex', mb: 2, alignItems: 'center' }}><Skeleton variant="circular" width={32} height={32} sx={{ mr: 1.5 }}/><Box sx={{ flexGrow: 1 }}><Skeleton variant="text" height={20} width="40%"/><Skeleton variant="text" height={18} width="80%"/></Box></Box> ))}</Box><Divider sx={{ mt: 2 }}/><Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pt: 2}}><Skeleton variant="rounded" height={40} sx={{ flexGrow: 1 }}/><Skeleton variant="circular" width={40} height={40} /></Box></Box> );
const AllMomentListSkeleton = ({ count = 3 }) => ( <Box>{[...Array(count)].map((_, index)=>(<Box key={index} sx={{mb:2}}><Skeleton variant="text" animation="wave" height={25} width="70%" sx={{mb:.5}}/><Skeleton variant="text" animation="wave" height={20} width="90%"/><Skeleton variant="text" animation="wave" height={18} width="50%" sx={{mt:.5}}/></Box>))}</Box> );


// --- Dashboard Component ---
function Dashboard() {
    const theme = useTheme();
    const isDesktopLg = useMediaQuery(theme.breakpoints.up('lg')); // Check for large screens

    // --- State Variables ---
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);
    const [isChatExpanded, setIsChatExpanded] = useState(false); // <-- State for chat expansion

    // --- Fetch User Data Effect ---
    useEffect(() => {
        // ... (fetch logic remains the same) ...
        let isMounted = true; setLoading(true); setError(null); const currentUser = auth.currentUser; if (!currentUser) { if (isMounted) { setError("User not authenticated. Please log in."); setLoading(false); } return; } async function fetchUserData() { try { const userDocRef = doc(db, 'users', currentUser.uid); const docSnap = await getDoc(userDocRef); if (isMounted) { if (docSnap.exists()) { const userData = docSnap.data(); setUser(userData); setCurrentStatus(userData.basicInfo?.currentStatus || ''); } else { console.warn('No user document found for UID:', currentUser.uid); setUser({}); } } } catch (err) { console.error('Error fetching user data:', err); if (isMounted) { setError("Failed to load dashboard data. Please check connection or try again later."); } } finally { if (isMounted) { setLoading(false); } } } fetchUserData(); return () => { isMounted = false; };
    }, []);

    // --- Handlers ---
    // ... (handleStatusChange, handleCloseStatusModal, handleOpenStatusModal, handleCloseEditProfileModal, handleOpenEditProfileModal, handleStatusSubmit remain the same) ...
    const handleStatusChange = (event) => setCurrentStatus(event.target.value);
    const handleCloseStatusModal = () => setOpenStatusModal(false);
    const handleOpenStatusModal = () => { setCurrentStatus(user?.basicInfo?.currentStatus || ''); setOpenStatusModal(true); };
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false);
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true);
    const handleStatusSubmit = async () => { const currentUser = auth.currentUser; if (!currentUser || !user) { setError("Authentication error. Please refresh."); setOpenStatusModal(false); return; } const originalStatus = user?.basicInfo?.currentStatus || ''; setUser((prev) => ({ ...prev, basicInfo: { ...(prev?.basicInfo || {}), currentStatus: currentStatus }, })); setOpenStatusModal(false); try { const userDocRef = doc(db, 'users', currentUser.uid); await updateDoc(userDocRef, { 'basicInfo.currentStatus': currentStatus }); console.log("Status updated"); /* TODO: Snackbar success */ } catch (error) { console.error('Error updating status:', error); setError("Failed to update status."); setUser((prev) => ({ ...prev, basicInfo: { ...(prev?.basicInfo || {}), currentStatus: originalStatus }, })); /* TODO: Snackbar error */ } };

    // --- Derived State / Helper Variables ---
    // ... (basicInfo, profileIncomplete, userDisplayName, userGreeting remain the same) ...
    const basicInfo = user?.basicInfo || {};
    const profileIncomplete = !loading && !error?.includes("Failed") && user && (!basicInfo || Object.keys(basicInfo).length === 0 || !basicInfo.fullName);
    const userDisplayName = basicInfo.fullName || 'User';
    const userGreeting = profileIncomplete ? "Welcome!" : `Welcome back, ${userDisplayName}!`;

    // --- Render Logic ---

    // Skeleton Loader Structure
    const renderSkeletons = () => (
        // Only renders content area skeleton, chat skeleton is separate
        <DashboardContentArea>
             <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} lg={8}> {/* Adjusted grid size if chat might appear */}
                     {/* ... User Info Skeleton ... */}
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}> <StyledCard> <CardContent sx={{ p: { xs: 2, sm: 3 } }}><WelcomeContainer sx={{ gap: { xs: 2, sm: 3 } }}><Skeleton variant="circular" animation="wave" sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, flexShrink: 0 }} /><UserInfoDetails sx={{ flexGrow: 1, minWidth: 0, gap: 0.5 }}><Skeleton animation="wave" height={40} width="60%" sx={{ mb: 1 }}/><Skeleton animation="wave" height={20} width="80%" /><Skeleton animation="wave" height={20} width="90%" /></UserInfoDetails></WelcomeContainer> </CardContent> </StyledCard> <StyledCard> <CardContent sx={{ p: { xs: 2, sm: 3 } }}><Skeleton animation="wave" height={30} width={120} sx={{ mb: { xs: 1.5, sm: 2 } }}/><QuickLinksScroll><Skeleton variant="rounded" animation="wave" width={140} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} /><Skeleton variant="rounded" animation="wave" width={120} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} /><Skeleton variant="rounded" animation="wave" width={90} height={36} sx={{ mr: 1, display: 'inline-block', borderRadius: '20px' }} /><Skeleton variant="rounded" animation="wave" width={160} height={36} sx={{ display: 'inline-block', borderRadius: '20px' }} /></QuickLinksScroll></CardContent> </StyledCard> </Box>
                </Grid>
                <Grid item xs={12} lg={4}> {/* Adjusted grid size */}
                    {/* ... Discussions Skeleton ... */}
                    <StyledCard sx={{ display: 'flex', flexDirection: 'column' }}> <CardHeader title={<Skeleton animation="wave" height={30} width="60%" />} sx={{ pb: 0 }}/><CardContent sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, p: { xs: 2, sm: 3 } }}><AllMomentListSkeleton /></CardContent> </StyledCard>
                </Grid>
            </Grid>
        </DashboardContentArea>
    );

    // Actual Content Renderer
    const renderContent = () => (
         <DashboardContentArea>
            {/* ... (Alerts remain the same) ... */}
            {error && ( <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ mb: { xs: 2, md: 3 } }} > {error} </Alert> )}
            {!loading && !error && profileIncomplete && ( <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />} action={ <Button color="inherit" size="small" onClick={handleOpenEditProfileModal}> SET UP PROFILE </Button> } sx={{ mb: { xs: 2, md: 3 } }} > Your profile seems incomplete. Please set it up for the best experience. </Alert> )}

            <Grid container spacing={{ xs: 2, md: 3 }}>
                <Grid item xs={12} lg={8}> {/* Adjust grid size */}
                     {/* ... (User Info Card, Quick Links Card remain the same) ... */}
                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, md: 3 } }}> <StyledCard variant="outlined"> <CardContent sx={{ p: { xs: 2, sm: 3 } }}><WelcomeContainer sx={{ gap: { xs: 2, sm: 3 } }}><ProfileAvatar profilebg={profileIncomplete ? theme.palette.grey[500] : (basicInfo.profilebg || theme.palette.primary.dark)} onClick={handleOpenEditProfileModal} aria-label={profileIncomplete ? "Complete your profile" : `Edit profile for ${userDisplayName}`} sx={{ width: { xs: 60, sm: 80 }, height: { xs: 60, sm: 80 }, fontSize: { xs: '1.8rem', sm: '2.5rem' } }}>{!profileIncomplete && <EditIconContainer aria-hidden="true"> <EditIcon /> </EditIconContainer>}{profileIncomplete ? '?' : (basicInfo.fullName?.charAt(0).toUpperCase() || '?')}</ProfileAvatar><UserInfoDetails sx={{ gap: 0.5 }}><Typography variant="h5" component="h1" fontWeight={700} sx={{ fontSize: { xs: '1.3rem', sm: '1.6rem' }, wordBreak: 'break-word' }}> {userGreeting} </Typography>{profileIncomplete ? ( <Typography variant="body1" color="text.secondary"> Click the avatar to set up your profile. </Typography> ) : ( <> <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-word', fontSize: { xs: '0.875rem', sm: '1rem'} }}> {basicInfo.email || 'No email'} </Typography> <Typography variant="body2" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem'}, display: 'flex', flexWrap: 'wrap', gap: theme.spacing(0.5, 1.5) }}><Box component="span"><strong>ID:</strong> {basicInfo.studentId || 'N/A'}</Box><Box component="span"><strong>Session:</strong> {basicInfo.session || 'N/A'}</Box> </Typography> {basicInfo.currentStatus && ( <Typography variant="caption" sx={{ fontStyle: 'italic', mt: 0.5, display: 'inline-block', bgcolor: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.dark, px: 1, py: 0.25, borderRadius: '4px' }} > {basicInfo.currentStatus} </Typography> )} </> )}</UserInfoDetails></WelcomeContainer> </CardContent> </StyledCard> <StyledCard variant="outlined"> <CardContent sx={{ p: { xs: 2, sm: 3 } }}><SectionTitle variant="h6"> Quick Links </SectionTitle><QuickLinksScroll><QuickLinkButton variant="contained" disableElevation color="primary" component={MuiLink} href="#">Course Catalog</QuickLinkButton><QuickLinkButton variant="contained" disableElevation color="primary" component={MuiLink} href="#">Assignments</QuickLinkButton><QuickLinkButton variant="contained" disableElevation color="primary" component={MuiLink} href="#">Grades</QuickLinkButton><QuickLinkButton variant="contained" disableElevation color="primary" component={MuiLink} href="#">Campus Map</QuickLinkButton><QuickLinkButton variant="outlined" color="secondary" onClick={handleOpenStatusModal}> Update Status </QuickLinkButton></QuickLinksScroll></CardContent> </StyledCard> </Box>
                </Grid>
                <Grid item xs={12} lg={4}> {/* Adjust grid size */}
                    {/* ... (Discussions Card remains the same) ... */}
                    <StyledCard variant="outlined" sx={{ display: 'flex', flexDirection: 'column' }}> <CardHeader title="Latest Discussions" titleTypographyProps={{ variant: 'h6', fontWeight: 500 }} sx={{ pb: 0 }}/> <CardContent sx={{ flexGrow: 1, overflowY: 'auto', minHeight: 0, p: { xs: 2, sm: 3 } }}><Suspense fallback={<AllMomentListSkeleton />}><AllMomentList /></Suspense></CardContent> </StyledCard>
                </Grid>
            </Grid>
         </DashboardContentArea>
    );

    // --- Main Return ---
    return (
        <> {/* Use Fragment to hold main content and potentially fixed elements like FAB */}
            <DashboardRoot>
                {/* Render Skeletons or Content */}
                {loading && renderSkeletons()}
                {!loading && user && !error?.includes("Failed") && renderContent()}
                {!loading && !user && !error && (
                     <DashboardContentArea>
                        <Alert severity="warning" sx={{ mt: 3 }}> Could not retrieve user data. Please try logging in again. </Alert>
                     </DashboardContentArea>
                 )}

                 {/* Fixed Chat Sidebar (Conditional Rendering) */}
                 {/* Only render if user loaded, on large screens, AND chat is expanded */}
                 {!loading && user && isDesktopLg && isChatExpanded && (
                     <StyledChatSidebar elevation={0} variant="outlined">
                         <Suspense fallback={<ChatSkeleton />}>
                              {/* Pass the minimize handler */}
                             <PublicChat onClose={() => setIsChatExpanded(false)} />
                         </Suspense>
                     </StyledChatSidebar>
                 )}
            </DashboardRoot> {/* End DashboardRoot */}

             {/* Floating Action Button (Chat Bubble) */}
             {/* Only render if user loaded, on large screens, AND chat is NOT expanded */}
             {!loading && user && isDesktopLg && !isChatExpanded && (
                 <Tooltip title="Open Public Chat">
                    <Fab
                        color="primary"
                        aria-label="open chat"
                        onClick={() => setIsChatExpanded(true)}
                        sx={{
                            position: 'fixed',
                            bottom: theme.spacing(3),
                            right: theme.spacing(3),
                            zIndex: theme.zIndex.speedDial // Ensure it's above most content
                        }}
                    >
                        <ChatIcon />
                    </Fab>
                 </Tooltip>
             )}


            {/* --- Modals --- (Remain outside the main flex layout) */}
            {/* ... (Edit Profile Modal and Update Status Modal remain the same) ... */}
            <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title"><Box sx={modalStyle(theme)}><Typography id="edit-profile-modal-title" variant="h6" component="h2" gutterBottom> {profileIncomplete ? "Set Up Your Profile" : "Edit Profile"} </Typography><Typography sx={{ mt: 2 }}> Profile editing form fields go here... </Typography><Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: { xs: 3, sm: 4 } }}><Button onClick={handleCloseEditProfileModal}>Cancel</Button><Button variant="contained" color="primary" disabled>Save</Button></Box></Box></Modal>
            <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal-title"><Box sx={modalStyle(theme)}><Typography id="current-status-modal-title" variant="h6" component="h2" gutterBottom>Update Your Status</Typography><FormControl fullWidth margin="normal"><InputLabel id="current-status-label">Current Status</InputLabel><Select labelId="current-status-label" value={currentStatus} label="Current Status" onChange={handleStatusChange}><MenuItem value=""><em>None</em></MenuItem><MenuItem value="Studying">Studying</MenuItem><MenuItem value="On Break">On Break</MenuItem><MenuItem value="Internship">Internship</MenuItem><MenuItem value="Freelancing">Freelancing</MenuItem><MenuItem value="Seeking Opportunity">Seeking Opportunity</MenuItem><MenuItem value="Employed">Employed</MenuItem><MenuItem value="Further Studies">Further Studies</MenuItem><MenuItem value="Graduated">Graduated</MenuItem></Select></FormControl><Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: { xs: 3, sm: 4 } }}><Button onClick={handleCloseStatusModal}>Cancel</Button><Button variant="contained" color="primary" onClick={handleStatusSubmit}>Submit</Button></Box></Box></Modal>
        </>
    );
}

export default Dashboard;