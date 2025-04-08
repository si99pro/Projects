/* eslint-disable no-dupe-keys */
/* eslint-disable no-unused-vars */
// src/pages/Dashboard.js (REDESIGNED V6 - Fixed Chat - Corrected Imports)
import React, { useState, useEffect } from 'react';
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
    CardHeader,
    IconButton,
    Alert,
    useTheme, // Keep if used for theme.spacing, etc.
    Divider,
    TextField
    // REMOVED: Skeleton, List, ListItem, ListItemText, ListItemAvatar, MuiLink, useMediaQuery, alpha
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import NotesIcon from '@mui/icons-material/Notes';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

// --- Constants ---
const APP_BAR_HEIGHT = 64;
const CHAT_WIDTH = 320;

// --- Styled Components ---
const DashboardContainer = styled(Container)(({ theme }) => ({
    paddingTop: theme.spacing(2), paddingBottom: theme.spacing(2), paddingLeft: theme.spacing(1.5), paddingRight: theme.spacing(1.5), [theme.breakpoints.up('sm')]: { paddingLeft: theme.spacing(2), paddingRight: theme.spacing(2), }, [theme.breakpoints.up('md')]: { paddingTop: theme.spacing(3), paddingBottom: theme.spacing(3), paddingLeft: theme.spacing(3), paddingRight: theme.spacing(3), }, flexGrow: 1, height: '100%', overflowY: 'auto', width: '100%',
}));
const DashboardRoot = styled(Box)(({ theme }) => ({ display: 'flex', width: '100%', minHeight: `calc(100vh - ${APP_BAR_HEIGHT}px)`, position: 'relative', }));
const StyledInfoCard = styled(Card)(({ theme }) => ({ borderRadius: theme.shape.borderRadius, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', border: `1px solid ${theme.palette.divider}`, boxShadow: 'none', width: '100%', }));
const FixedChatContainer = styled(Paper)(({ theme }) => ({ position: 'fixed', top: APP_BAR_HEIGHT + theme.spacing(2), right: theme.spacing(2), width: CHAT_WIDTH, zIndex: theme.zIndex.drawer, border: `1px solid ${theme.palette.divider}`, boxShadow: theme.shadows[3], borderRadius: theme.shape.borderRadius, backgroundColor: theme.palette.background.paper, display: 'flex', flexDirection: 'column', maxHeight: `calc(100vh - ${APP_BAR_HEIGHT}px - ${theme.spacing(4)})`, overflow: 'hidden', display: 'none', [theme.breakpoints.up('lg')]: { display: 'flex', } }));
const ProfileAvatar = styled(Avatar)(({ theme, profilebg }) => ({ position: 'relative', backgroundColor: profilebg || theme.palette.primary.main, color: theme.palette.common.white, cursor: 'pointer', boxShadow: 'none', flexShrink: 0, overflow: 'visible', border: `2px solid ${theme.palette.divider}`}));
const EditIconContainer = styled(IconButton)(({ theme }) => ({ position: 'absolute', bottom: -5, right: -5, backgroundColor: theme.palette.background.paper, padding: theme.spacing(0.5), border: `1px solid ${theme.palette.divider}`, borderRadius: '50%', transition: theme.transitions.create(['background-color', 'transform']), zIndex: 1, boxShadow: `0 1px 3px ${alpha(theme.palette.common.black, 0.1)}`, '&:hover': { backgroundColor: theme.palette.action.hover, transform: 'scale(1.1)', }, '& .MuiSvgIcon-root': { fontSize: '0.9rem', color: theme.palette.primary.main, }, }));
const WelcomeContainer = styled(Box)({ display: 'flex', alignItems: 'center', textAlign: 'left', width: '100%', });
const UserInfoDetails = styled(Box)({ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0, });
const modalStyle = (theme) => ({ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 450 }, bgcolor: 'background.paper', border: `1px solid ${theme.palette.divider}`, borderRadius: theme.shape.borderRadius, boxShadow: 'none', p: { xs: 2, sm: 3 }, });

// --- Dashboard Component ---
function Dashboard() {
    const theme = useTheme();
    // State variables...
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const [editProfileModalOpen, setEditProfileModalOpen] = useState(false);

    // useEffect for fetching data...
    useEffect(() => {
        let isMounted = true; setLoading(true); setError(null); const currentUser = auth.currentUser; if (!currentUser) { if (isMounted) { setError("User not authenticated. Please log in."); setLoading(false); } return; } async function fetchUserData() { try { const userDocRef = doc(db, 'users', currentUser.uid); const docSnap = await getDoc(userDocRef); if (isMounted) { if (docSnap.exists()) { setUser(docSnap.data()); setCurrentStatus(docSnap.data().basicInfo?.currentStatus || ''); } else { console.warn('No user document found for UID:', currentUser.uid); setUser({}); } } } catch (err) { console.error('Error fetching user data:', err); if (isMounted) { setError("Failed to load dashboard data."); } } finally { if (isMounted) { setLoading(false); } } } fetchUserData(); return () => { isMounted = false; };
    }, []);

    // Handlers...
    const handleStatusChange = (event) => setCurrentStatus(event.target.value);
    const handleCloseStatusModal = () => setOpenStatusModal(false);
    const handleOpenStatusModal = () => { setCurrentStatus(user?.basicInfo?.currentStatus || ''); setOpenStatusModal(true); };
    const handleCloseEditProfileModal = () => setEditProfileModalOpen(false);
    const handleOpenEditProfileModal = () => setEditProfileModalOpen(true);
    const handleStatusSubmit = async () => { const currentUser = auth.currentUser; if (!currentUser || !user) { setError("Authentication error."); setOpenStatusModal(false); return; } const originalStatus = user?.basicInfo?.currentStatus || ''; setUser((prev) => ({ ...prev, basicInfo: { ...(prev?.basicInfo || {}), currentStatus: currentStatus }, })); setOpenStatusModal(false); try { const userDocRef = doc(db, 'users', currentUser.uid); await updateDoc(userDocRef, { 'basicInfo.currentStatus': currentStatus }); } catch (error) { console.error('Error updating status:', error); setError("Failed to update status."); setUser((prev) => ({ ...prev, basicInfo: { ...(prev?.basicInfo || {}), currentStatus: originalStatus }, })); } };

    // Derived state...
    const basicInfo = user?.basicInfo || {};
    const profileIncomplete = !loading && !error?.includes("Failed") && user && (!basicInfo || Object.keys(basicInfo).length === 0 || !basicInfo.fullName);
    const userDisplayName = basicInfo.fullName || 'User';
    const userGreeting = profileIncomplete ? "Welcome!" : `Welcome back, ${userDisplayName}!`;

    // renderMainContent function...
    const renderMainContent = () => (
         <Grid container spacing={{ xs: 1.5, md: 2 }} sx={{ flexGrow: 1 }}>
            <Grid item xs={12}>
                 <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
                    {error && ( <Alert severity="error" icon={<ErrorOutlineIcon fontSize="inherit" />} sx={{ width: '100%' }} > {error} </Alert> )}
                    {profileIncomplete && ( <Alert severity="info" icon={<InfoOutlinedIcon fontSize="inherit" />} action={ <Button color="inherit" size="small" onClick={handleOpenEditProfileModal}> SET UP </Button> } sx={{ width: '100%' }} > Profile incomplete. </Alert> )}
                     <StyledInfoCard>
                         <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                             <WelcomeContainer sx={{ gap: { xs: 1.5, sm: 2 } }}>
                                 <ProfileAvatar profilebg={profileIncomplete ? theme.palette.grey[500] : (basicInfo.profilebg || theme.palette.primary.dark)} onClick={handleOpenEditProfileModal} aria-label={profileIncomplete ? "Complete your profile" : `Edit profile for ${userDisplayName}`} sx={{ width: { xs: 50, sm: 60 }, height: { xs: 50, sm: 60 }, fontSize: { xs: '1.5rem', sm: '1.8rem' } }} >
                                     {!profileIncomplete && <EditIconContainer aria-hidden="true"> <EditIcon /> </EditIconContainer>}
                                     {profileIncomplete ? '?' : (basicInfo.fullName?.charAt(0).toUpperCase() || '?')}
                                 </ProfileAvatar>
                                 <UserInfoDetails sx={{ gap: 0.25 }}>
                                     <Typography variant="h6" component="h1" fontWeight={600} sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' }, wordBreak: 'break-word' }}>{userGreeting}</Typography>
                                     {profileIncomplete ? ( <Typography variant="body2" color="text.secondary"> Click the avatar to set up profile. </Typography> ) : (
                                         <>
                                            <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word', fontSize: { xs: '0.8rem', sm: '0.875rem'} }}>{basicInfo.email || 'No email provided'}</Typography>
                                            {(basicInfo.studentId || basicInfo.session) && ( <Typography variant="caption" color="text.secondary" sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem'}, display: 'flex', flexWrap: 'wrap', gap: theme.spacing(0.25, 1) }}> {basicInfo.studentId && <Box component="span"><strong>ID:</strong> {basicInfo.studentId}</Box>} {basicInfo.session && <Box component="span"><strong>Session:</strong> {basicInfo.session}</Box>} </Typography> )}
                                            <Button size="small" color="secondary" onClick={handleOpenStatusModal} sx={{ mt: 1, p: 0.5, alignSelf: 'flex-start' }} > {basicInfo.currentStatus ? `Status: ${basicInfo.currentStatus}` : 'Update Status'} </Button>
                                         </>
                                     )}
                                 </UserInfoDetails>
                             </WelcomeContainer>
                         </CardContent>
                     </StyledInfoCard>
                 </Box>
            </Grid>
         </Grid>
    );

    // renderFixedChatContent function...
    const renderFixedChatContent = () => (
        <>
            <CardHeader avatar={<ChatBubbleOutlineIcon />} title="Public Chat" titleTypographyProps={{ variant: 'h6', fontWeight: 500 }} sx={{ pb: 0, pt: 1.5, px: 1.5, flexShrink: 0 }} />
            <Divider sx={{ mx: 1.5 }} />
            <CardContent sx={{ flexGrow: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'text.secondary', p: 1.5 }}>
                <NotesIcon sx={{ fontSize: { xs: 32, sm: 48 }, mb: 1 }} />
                <Typography variant="body1" sx={{ mb: 0.5 }}> Public Chat Area </Typography>
                <Typography variant="body2" sx={{ px: 1 }}> Placeholder content. Actual chat messages would scroll here. </Typography>
            </CardContent>
            <Box sx={{ p: 1.5, borderTop: `1px solid ${theme.palette.divider}`, flexShrink: 0 }}>
                <TextField fullWidth placeholder="Type your message..." size="small" variant="outlined" />
            </Box>
        </>
    );


    // Main return...
    return (
        <>
            <DashboardRoot>
                <DashboardContainer maxWidth={false} disableGutters>
                    {!loading && (user || error) && renderMainContent()}
                    {loading && null}
                    {!loading && !user && !error && ( <Alert severity="warning" sx={{ mt: 2, width: '100%' }}> Could not retrieve user data or user not found. </Alert> )}
                 </DashboardContainer>
                 {!loading && user && ( <FixedChatContainer elevation={3}> {renderFixedChatContent()} </FixedChatContainer> )}
            </DashboardRoot>

            {/* Modals... */}
            <Modal open={editProfileModalOpen} onClose={handleCloseEditProfileModal} aria-labelledby="edit-profile-modal-title">
                <Box sx={modalStyle(theme)}> <Typography id="edit-profile-modal-title" variant="h6" component="h2" gutterBottom> {profileIncomplete ? "Set Up Your Profile" : "Edit Profile"} </Typography> <Typography sx={{ mt: 2 }}> Profile editing form fields will go here. </Typography> <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}> <Button onClick={handleCloseEditProfileModal}>Cancel</Button> <Button variant="contained" color="primary" disabled>Save Changes</Button> </Box> </Box>
            </Modal>
            <Modal open={openStatusModal} onClose={handleCloseStatusModal} aria-labelledby="current-status-modal-title">
                 <Box sx={modalStyle(theme)}> <Typography id="current-status-modal-title" variant="h6" component="h2" gutterBottom> Update Your Status </Typography> <FormControl fullWidth margin="normal"> <InputLabel id="current-status-label">Current Status</InputLabel> <Select labelId="current-status-label" value={currentStatus} label="Current Status" onChange={handleStatusChange} size="small" > <MenuItem value=""><em>None</em></MenuItem> <MenuItem value="Studying">Studying</MenuItem> <MenuItem value="On Break">On Break</MenuItem> <MenuItem value="Internship">Internship</MenuItem> <MenuItem value="Looking for Opportunities">Looking for Opportunities</MenuItem> <MenuItem value="Working on Project">Working on Project</MenuItem> <MenuItem value="Graduated">Graduated</MenuItem> </Select> </FormControl> <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 3 }}> <Button onClick={handleCloseStatusModal}>Cancel</Button> <Button variant="contained" color="primary" onClick={handleStatusSubmit}> Submit </Button> </Box> </Box>
            </Modal>
        </>
    );
}

export default Dashboard;