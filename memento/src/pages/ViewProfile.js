/* eslint-disable no-unused-vars */
// src/pages/ViewProfile.js

// --- CORE REACT & ROUTING IMPORTS ---
import React, { useState, useEffect } from 'react'; // Import React and Hooks
import { useParams, Link as RouterLink } from 'react-router-dom'; // Import useParams and RouterLink

// --- FIREBASE IMPORTS ---
import { db } from '../firebase'; // Import db (ensure path is correct)
import { doc, getDoc } from 'firebase/firestore'; // Import Firestore functions

// --- MATERIAL UI IMPORTS (Add ALL components used) ---
import {
    Container,
    Typography,
    Avatar,
    Grid,
    Box,
    Tabs,
    Tab,
    Alert,
    CircularProgress, // For loading state
    Paper,          // Base for ProfileCard
    List,           // For work/education lists
    ListItem,       // For work/education lists
    ListItemText,   // For work/education lists
    ListItemIcon,   // For icons in lists/details
    Link as MuiLink, // For clickable links (website, social)
    Divider         // For separators
} from '@mui/material';

// --- MATERIAL UI ICONS IMPORTS (Add ALL icons used) ---
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LinkIcon from '@mui/icons-material/Link';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import EmailIcon from '@mui/icons-material/Email';
import BadgeIcon from '@mui/icons-material/Badge'; // For Student ID
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'; // For Session/Batch
import EventIcon from '@mui/icons-material/Event'; // For Birthdate
import BloodtypeIcon from '@mui/icons-material/Bloodtype'; // For Blood Group
import StarIcon from '@mui/icons-material/Star'; // For Expertise

// --- CUSTOM COMPONENT IMPORTS ---
import Footer from '../components/Footer'; // <<<--- IMPORT ADDED HERE (Assuming path)

// --- STYLING IMPORTS ---
import styled from '@emotion/styled'; // Import styled function

// --- STYLED COMPONENT DEFINITIONS (Ensure these are present and correct) ---
const StyledContainer = styled(Container)`
  margin-top: 20px;
  margin-bottom: 40px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 0 auto;
  margin-bottom: 16px;
  font-size: 60px;
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: #673ab7;
  }
  margin-bottom: 24px;
`;

const StyledTab = styled(Tab)`
  color: #757575;
  &.Mui-selected {
    color: #673ab7;
    font-weight: bold;
  }
`;

// Using Paper as the base, styled for consistency
const ProfileCard = styled(Paper)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const DetailItem = styled(Box)`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  gap: 16px;
`;

const DetailText = styled(Typography)`
  flex-grow: 1;
`;
// --- End Styled Components ---


// --- React Component Function ---
function ViewProfile() {

    // --- Hooks ---
    const { userId } = useParams();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState(0);

    // --- Console Logs for Debugging ---
    console.log(`[ViewProfile] Rendering component for userId: ${userId}`);

    // --- useEffect for Data Fetching ---
    useEffect(() => {
        console.log("[ViewProfile] useEffect triggered. Starting fetch...");
        const fetchProfileData = async () => {
             if (!userId) {
                 console.error("[ViewProfile] No userId provided!");
                 setError("User ID not found in URL.");
                 setLoading(false);
                 return;
             }
             setLoading(true);
             setError('');
             setUserData(null);

             try {
                 const userDocRef = doc(db, 'users', userId);
                 console.log(`[ViewProfile] Attempting to fetch Firestore path: ${userDocRef.path}`);
                 const docSnap = await getDoc(userDocRef);

                 if (docSnap.exists()) {
                     const fetchedData = docSnap.data();
                     console.log("[ViewProfile] Document FOUND. Data:", fetchedData);
                     setUserData(fetchedData);
                     setError('');
                 } else {
                     console.warn(`[ViewProfile] Document NOT FOUND for path: ${userDocRef.path}`);
                     setError('Profile not found for this user.');
                     setUserData(null);
                 }
             } catch (err) {
                 console.error('[ViewProfile] Firestore fetch ERROR:', err);
                 setError(`Failed to load profile data: ${err.message}`);
                 setUserData(null);
             } finally {
                 console.log("[ViewProfile] Fetch finished. Setting loading = false.");
                 setLoading(false);
             }
         };
        fetchProfileData();
    }, [userId]);

    // --- Helper Functions ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const renderDetail = (IconComponent, label, value) => {
        if (!value && value !== 0) return null;
        return (
             <DetailItem>
                <ListItemIcon sx={{ minWidth: 'auto', color: 'action.active' }}>
                    <IconComponent />
                </ListItemIcon>
                <DetailText variant="body1">
                    <strong>{label}:</strong> {value}
                </DetailText>
            </DetailItem>
        );
    };

     const renderLinkDetail = (IconComponent, label, value, prefix = '', isMail = false) => {
        if (!value) return null;
        let href = value.startsWith('http') || value.startsWith('mailto:')
            ? value
            : (isMail ? `mailto:${value}` : (prefix + value));
        let displayValue = value;
        return (
            <DetailItem>
                <ListItemIcon sx={{ minWidth: 'auto', color: 'action.active' }}>
                    <IconComponent />
                 </ListItemIcon>
                <DetailText variant="body1">
                    <strong>{label}:</strong>{' '}
                    <MuiLink href={href} target="_blank" rel="noopener noreferrer" underline="hover">
                        {displayValue}
                    </MuiLink>
                </DetailText>
            </DetailItem>
        );
    };

    // --- Console Log State Before Render ---
    console.log(`[ViewProfile] State before return: loading=${loading}, error='${error}', userData=${userData ? 'Exists' : 'null'}`);

    // --- Render Logic ---
    if (loading) {
        console.log("[ViewProfile] Rendering: Loading spinner");
        return ( <StyledContainer sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></StyledContainer> );
    }
    if (error) {
        console.log(`[ViewProfile] Rendering: Error Alert - ${error}`);
        return ( <StyledContainer><Alert severity="error">{error}</Alert></StyledContainer> );
    }
    if (!userData) {
         console.log("[ViewProfile] Rendering: User data unavailable Alert");
        return ( <StyledContainer><Alert severity="info">User data not available.</Alert></StyledContainer> );
    }

    // --- Prepare data ---
    console.log("[ViewProfile] Rendering: Main profile content");
    const basicInfo = userData.basicInfo || {};
    const contactInfo = userData.contactInfo || {};
    const workInfo = userData.workInfo || {};
    const eduInfo = userData.eduInfo || {};
    const placeInfo = userData.placeInfo || {};
    const detailInfo = userData.detailInfo || {};
    const fullName = basicInfo.fullName || 'N/A';
    const profileBgColor = basicInfo.profilebg;
    const profileImageUrl = userData.profileImageUrl;
    const sortedWorkExperiences = [...(workInfo.workExperience || [])].sort((a, b) => {
        const endA = a.duration?.split(' - ')[1];
        const endB = b.duration?.split(' - ')[1];
        if (endA === 'Present' && endB !== 'Present') return -1;
        if (endA !== 'Present' && endB === 'Present') return 1;
        if (endA === 'Present' && endB === 'Present') return 0;
        return parseInt(endB || '0') - parseInt(endA || '0');
     });
      const sortedEducation = [...(eduInfo.educationDetails || [])].sort((a, b) => {
          return parseInt(b.graduationYear || '0') - parseInt(a.graduationYear || '0');
      });

    // --- Return JSX ---
    return (
        <>
            <StyledContainer maxWidth="md">
                <ProfileCard>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
                        <StyledAvatar
                            alt={fullName}
                            src={profileImageUrl || ''}
                             sx={{
                                bgcolor: !profileImageUrl ? (profileBgColor || 'grey') : undefined,
                            }}
                        >
                            {!profileImageUrl && fullName !== 'N/A' ? fullName.charAt(0).toUpperCase() : null}
                        </StyledAvatar>
                         <Typography variant="h5" component="h1">{fullName}</Typography>
                         <Typography variant="body2" color="text.secondary">{basicInfo.email || 'No email'}</Typography>
                    </Box>

                    <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs" centered variant="scrollable" scrollButtons="auto">
                        <StyledTab label="Basic Info" />
                        <StyledTab label="Work & Edu" />
                        <StyledTab label="Places Lived" />
                        <StyledTab label="Contact" />
                        <StyledTab label="Details" />
                    </StyledTabs>

                    <Box mt={3}>
                        {/* Tab Content */}
                        {activeTab === 0 && (
                            <>
                                <SectionTitle>Basic Information</SectionTitle>
                                {renderDetail(EmailIcon, 'Email', basicInfo.email)}
                                {renderDetail(BadgeIcon, 'Student ID', basicInfo.studentId)}
                                {renderDetail(CalendarMonthIcon, 'Batch', basicInfo.batch)}
                                {renderDetail(CalendarMonthIcon, 'Session', basicInfo.session)}
                            </>
                        )}

                        {activeTab === 1 && (
                           <>
                                <SectionTitle>Work Experience</SectionTitle>
                                {sortedWorkExperiences.length > 0 ? (
                                    <List dense>
                                        {sortedWorkExperiences.map((exp, index) => (
                                            <ListItem key={index} disableGutters>
                                                <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: 'action.active' }}>
                                                    <BusinessIcon />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${exp.position} at ${exp.company} (${exp.city || 'N/A'})`}
                                                    secondary={`Duration: ${exp.duration || 'N/A'}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                    <Typography variant="body2" color="text.secondary">No work experience listed.</Typography>
                                )}


                                <SectionTitle sx={{ mt: 4 }}>Education</SectionTitle>
                                {sortedEducation.length > 0 ? (
                                     <List dense>
                                        {sortedEducation.map((edu, index) => (
                                            <ListItem key={index} disableGutters>
                                                 <ListItemIcon sx={{ minWidth: 'auto', mr: 2, color: 'action.active' }}>
                                                    <SchoolIcon />
                                                </ListItemIcon>
                                                <ListItemText
                                                    primary={`${edu.degree} in ${edu.fieldOfStudy}`}
                                                    secondary={`${edu.institution} - Graduated ${edu.graduationYear || 'N/A'}`}
                                                />
                                            </ListItem>
                                        ))}
                                    </List>
                                ) : (
                                     <Typography variant="body2" color="text.secondary">No education details listed.</Typography>
                                )}
                           </>
                        )}

                        {activeTab === 2 && (
                             <>
                                <SectionTitle>Places Lived</SectionTitle>
                                {renderDetail(HomeIcon, 'Current City', placeInfo.currentCity)}
                                {renderDetail(HomeIcon, 'Hometown', placeInfo.hometown)}
                                {!placeInfo.currentCity && !placeInfo.hometown && (
                                      <Typography variant="body2" color="text.secondary">No places listed.</Typography>
                                )}
                            </>
                        )}

                        {activeTab === 3 && (
                            <>
                                <SectionTitle>Contact Information</SectionTitle>
                                {renderDetail(ContactPhoneIcon, 'Phone', contactInfo.phoneNumber)}
                                {renderLinkDetail(LinkIcon, 'Facebook', contactInfo.facebook, 'https://facebook.com/')}
                                {renderLinkDetail(LinkIcon, 'LinkedIn', contactInfo.linkedin, 'https://linkedin.com/in/')}
                                {renderLinkDetail(LinkIcon, 'Website', contactInfo.website, 'https://')}
                                {!contactInfo.phoneNumber && !contactInfo.facebook && !contactInfo.linkedin && !contactInfo.website && (
                                     <Typography variant="body2" color="text.secondary">No contact information available.</Typography>
                                )}
                            </>
                        )}

                        {activeTab === 4 && (
                            <>
                                <SectionTitle>Details</SectionTitle>
                                {renderDetail(EventIcon, 'Birthdate', detailInfo.birthdate)}
                                {renderDetail(BloodtypeIcon, 'Blood Group', detailInfo.bloodGroup)}
                                {renderDetail(StarIcon, 'Field of Expertise', detailInfo.fieldOfExpertise)}

                                {detailInfo.bio && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        {renderDetail(DescriptionIcon, 'Bio', detailInfo.bio)}
                                    </>
                                )}

                                {detailInfo.aboutYou && (
                                    <>
                                        <Divider sx={{ my: 2 }} />
                                        {renderDetail(InfoIcon, 'About', detailInfo.aboutYou)}
                                    </>
                                )}

                                {!detailInfo.birthdate &&
                                 !detailInfo.bloodGroup &&
                                 !detailInfo.fieldOfExpertise &&
                                 !detailInfo.bio &&
                                 !detailInfo.aboutYou && (
                                    <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                                        No additional details provided.
                                    </Typography>
                                )}
                            </>
                        )}
                     </Box>
                </ProfileCard>
                 {/* Note: The Footer component is imported but not used in the JSX output yet.
                     You would typically add <Footer /> somewhere within the main fragment (<>),
                     usually after the StyledContainer. */}
            </StyledContainer>
        </>
    );

} // <<<--- Function definition ends here

export default ViewProfile; // Export the component