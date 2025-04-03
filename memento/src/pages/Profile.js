/* eslint-disable no-unused-vars */
// src/pages/Profile.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
    Container, Typography, TextField, Button, Avatar, Grid, Box,
    Tabs, Tab, Alert, Snackbar, Slide, IconButton, InputAdornment,
    Checkbox, FormControlLabel, CircularProgress, Tooltip, Skeleton // <-- Keep Skeleton import
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';
import styled from '@emotion/styled';
// Removed Loader component import as it's no longer used
// import Loader from '../components/Loader';

// --- Styled Components (Minor adjustments for clarity) ---

const StyledContainer = styled(Container)`
  margin-top: 40px; // Increased top margin
  margin-bottom: 40px;
`;

const ProfileHeader = styled(Box)`
    text-align: center;
    margin-bottom: 24px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  font-size: 60px;
  background-color: ${props => props.profilebg || '#673ab7'}; // Use profilebg color
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 24px; // Add space below tabs
  border-bottom: 1px solid #e0e0e0;
  .MuiTabs-indicator {
    background-color: #673ab7;
  }
`;

const StyledTab = styled(Tab)`
  color: #555; // Slightly darker default color
  text-transform: none; // Use normal case
  font-weight: 500;
  &.Mui-selected {
    color: #673ab7;
    font-weight: 700;
  }
`;

const ProfileCard = styled(Box)`
  background-color: #fff;
  border-radius: 12px; // Slightly more rounded
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08); // Softer shadow
  padding: 32px; // Increased padding
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.3rem; // Slightly larger
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee; // Add subtle separator
  padding-bottom: 8px;
`;

const StyledTextField = styled(TextField)`
    margin-bottom: 16px;
    .MuiInputBase-root.Mui-disabled { // Style disabled fields
        color: rgba(0, 0, 0, 0.7); // Make text slightly darker than default disabled
        background-color: #f9f9f9; // Slight background tint
    }
    .MuiInput-underline:before { // Hide underline for standard variant when not focused
        border-bottom: none;
    }
    .MuiInput-underline:hover:not(.Mui-disabled):before { // Show underline on hover for standard
        border-bottom: 1px solid rgba(0, 0, 0, 0.42);
    }
    .MuiInputBase-input:read-only {
      cursor: default; // Change cursor for read-only standard fields
    }
`;

const ButtonContainer = styled(Box)`
  display: flex;
  gap: 8px; // Add space between buttons
`;

const SaveButton = styled(Button)`
  background-color: #673ab7;
  color: #fff;
  &:hover {
    background-color: #512da8;
  }
  &:disabled { // Style disabled save button
    background-color: rgba(0, 0, 0, 0.12);
  }
`;

const CancelButton = styled(Button)`
  color: #757575;
  &:hover {
    background-color: #f5f5f5;
  }
`;

const ItemBox = styled(Box)`
  margin-bottom: 16px;
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  display: flex;
  align-items: center;
  background-color: #fafafa; // Slight background for items
  position: relative; // For positioning buttons if needed
`;

const ItemContent = styled(Box)`
  margin-left: 16px;
  flex-grow: 1;
`;

const ItemActions = styled(Box)`
  margin-left: auto; // Pushes actions to the right
  display: flex;
  gap: 4px;
`;

const FormBox = styled(Box)`
  margin-top: 16px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 24px;
  background-color: #fff; // Clear background for form
`;

// --- Helper: Debounce Function ---
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}


// --- Sub-Components ---

// Generic Editable Field Component
const EditableField = React.memo(({
    label, value, fieldName, onSave, onCancel, onChange,
    IconComponent, multiline = false, rows = 1,
    readOnly = false, // For fields that are never editable
    prefix = null,
    disabled = false, // General disabled state
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        // Update internal state if the external value changes (e.g., after initial load or external update)
        setCurrentValue(value);
    }, [value]);

    const handleEditClick = () => {
        if (readOnly) return;
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (currentValue === value) { // Don't save if value hasn't changed
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            await onSave(fieldName, currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Save failed:", error);
            // Error display is handled by the main component's snackbar
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelClick = () => {
        setCurrentValue(value); // Revert to original value from props
        setIsEditing(false);
        if (onCancel) onCancel(fieldName);
    };

    const handleChange = (e) => {
        setCurrentValue(e.target.value);
        if (onChange) onChange(e.target.value); // Allow parent to react if needed
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(debounce(handleSaveClick, 1000), [currentValue, fieldName, onSave]);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !multiline && isEditing) {
            handleSaveClick();
        } else if (e.key === 'Escape' && isEditing) {
            handleCancelClick();
        }
    };

     // Automatically save on blur for simplicity, except for multiline
     const handleBlur = () => {
        if (isEditing && !multiline && currentValue !== value) {
             handleSaveClick();
        } else if (isEditing && !multiline && currentValue === value) {
            // If blurred without changes, just cancel editing state
            handleCancelClick();
        }
        // For multiline, require explicit save/cancel click
    };

    return (
        <StyledTextField
            label={label}
            value={currentValue ?? ''} // Ensure value is not undefined/null for TextField
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur} // Save on blur for non-multiline
            fullWidth
            multiline={multiline}
            rows={rows}
            variant={isEditing || readOnly ? "outlined" : "standard"}
            disabled={disabled || isSaving || readOnly} // Disable field during save or if permanently read-only
            InputProps={{
                readOnly: !isEditing || readOnly,
                startAdornment: (
                    <>
                        {IconComponent && (
                            <InputAdornment position="start">
                                <IconComponent sx={{ mr: prefix ? 0 : 1, color: 'action.active' }} />
                            </InputAdornment>
                        )}
                         {prefix && !isEditing && <Typography variant="body1" sx={{ mr: 0.5, color: 'text.secondary' }}>{prefix}</Typography>}
                    </>
                ),
                endAdornment: (
                    <InputAdornment position="end">
                        {readOnly ? null : isEditing ? (
                            <ButtonContainer>
                                <Tooltip title="Save">
                                    <IconButton
                                        onClick={handleSaveClick}
                                        aria-label="save"
                                        size="small"
                                        disabled={isSaving || currentValue === value}
                                        color="primary"
                                    >
                                        {isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                                    </IconButton>
                                </Tooltip>
                                <Tooltip title="Cancel">
                                    <IconButton onClick={handleCancelClick} aria-label="cancel" size="small" disabled={isSaving}>
                                        <CancelIcon />
                                    </IconButton>
                                </Tooltip>
                            </ButtonContainer>
                        ) : (
                            <Tooltip title="Edit">
                                <IconButton onClick={handleEditClick} aria-label="edit" size="small" disabled={disabled}>
                                    <EditIcon />
                                </IconButton>
                            </Tooltip>
                        )}
                    </InputAdornment>
                ),
            }}
             // Add sx prop for specific styling like removing underline for read-only standard
             sx={{
                ...( (!isEditing && !readOnly) && { // Style standard variant when not editing
                    '& .MuiInput-underline:before': { borderBottom: '1px dashed rgba(0, 0, 0, 0.2)' }, // Dashed line for view mode
                    '&:hover .MuiInput-underline:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.5) !important' }, // Solid line on hover
                }),
                ...(readOnly && { // Styles for permanently read-only fields
                  '& .MuiInput-underline:before': { borderBottom: 'none' },
                  '& .MuiInput-underline:after': { borderBottom: 'none' },
                  '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none' },
                  '& .MuiInputBase-input': { cursor: 'default' }
                })
            }}
        />
    );
});

// --- Main Profile Component ---

function Profile() {
    // Grouped State - Initialized with null/empty values suitable for Skeleton checks
    const [basicInfo, setBasicInfo] = useState({ fullName: null, email: null, studentId: null, batch: null, session: null, profilebg: null });
    const [contactInfo, setContactInfo] = useState({ phoneNumber: null, facebook: null, linkedin: null, website: null });
    const [eduInfo, setEduInfo] = useState({ educationDetails: null }); // Use null for array initially
    const [workInfo, setWorkInfo] = useState({ workExperience: null }); // Use null for array initially
    const [placeInfo, setPlaceInfo] = useState({ currentCity: null, hometown: null });
    const [detailInfo, setDetailInfo] = useState({ birthdate: null, bloodGroup: null, fieldOfExpertise: null, bio: null, aboutYou: null });

    // Component State
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true); // Start loading
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [basicInfoAlertOpen, setBasicInfoAlertOpen] = useState(false);

    // Fetch Data
    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true); // Ensure loading is true at the start
             // Reset states to initial null/empty for skeleton display if re-fetching
            setBasicInfo({ fullName: null, email: null, studentId: null, batch: null, session: null, profilebg: null });
            setContactInfo({ phoneNumber: null, facebook: null, linkedin: null, website: null });
            setEduInfo({ educationDetails: null });
            setWorkInfo({ workExperience: null });
            setPlaceInfo({ currentCity: null, hometown: null });
            setDetailInfo({ birthdate: null, bloodGroup: null, fieldOfExpertise: null, bio: null, aboutYou: null });

            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        // Set state using || {} or || [] to provide defaults after loading
                        setBasicInfo(data.basicInfo || { fullName: '', email: '', studentId: '', batch: '', session: '', profilebg: '#673ab7' });
                        setContactInfo(data.contactInfo || { phoneNumber: '', facebook: '', linkedin: '', website: '' });
                        setEduInfo(data.eduInfo || { educationDetails: [] });
                        setWorkInfo(data.workInfo || { workExperience: [] });
                        setPlaceInfo(data.placeInfo || { currentCity: '', hometown: '' });
                        setDetailInfo(data.detailInfo || { birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
                    } else {
                        console.log('No profile document found for user:', user.uid);
                        // Set empty defaults if profile doesn't exist, allowing user to fill
                        setBasicInfo({ fullName: user.displayName || '', email: user.email || '', studentId: '', batch: '', session: '', profilebg: '#673ab7' });
                        setContactInfo({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
                        setEduInfo({ educationDetails: [] });
                        setWorkInfo({ workExperience: [] });
                        setPlaceInfo({ currentCity: '', hometown: '' });
                        setDetailInfo({ birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
                        setSnackbar({ open: true, message: 'Profile data not found. Please fill in your details.', severity: 'info' });
                    }
                } else {
                     console.log('User not logged in');
                     // Handle case where user is not logged in (should ideally be handled by routing)
                     // Set defaults or potentially navigate away
                     setSnackbar({ open: true, message: 'Please log in to view your profile.', severity: 'warning' });
                     // Potentially set empty defaults here too if staying on the page
                     setBasicInfo({ fullName: '', email: '', studentId: '', batch: '', session: '', profilebg: '#673ab7' });
                     setContactInfo({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
                     setEduInfo({ educationDetails: [] });
                     setWorkInfo({ workExperience: [] });
                     setPlaceInfo({ currentCity: '', hometown: '' });
                     setDetailInfo({ birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setSnackbar({ open: true, message: `Failed to load profile data: ${error.message}`, severity: 'error' });
                 // Set empty defaults on error to avoid crashing UI components expecting objects/arrays
                 setBasicInfo({ fullName: '', email: '', studentId: '', batch: '', session: '', profilebg: '#673ab7' });
                 setContactInfo({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
                 setEduInfo({ educationDetails: [] });
                 setWorkInfo({ workExperience: [] });
                 setPlaceInfo({ currentCity: '', hometown: '' });
                 setDetailInfo({ birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
            } finally {
                // Add a small delay to prevent flashing if data loads very quickly
                setTimeout(() => setLoading(false), 300);
            }
        };

        fetchProfileData();
    }, []); // Empty dependency array ensures this runs only once on mount


    // --- Generic Save Handler ---
    const handleSaveField = useCallback(async (fieldName, value) => {
        // Clear previous snackbar messages
        setSnackbar(prev => ({ ...prev, open: false }));

        const user = auth.currentUser;
        if (!user) {
            setSnackbar({ open: true, message: 'User not authenticated.', severity: 'error' });
            throw new Error("User not authenticated."); // Throw error to stop EditableField saving state
        }

        const userDocRef = doc(db, 'users', user.uid);
        let updateData = {};
        let newStateUpdater = () => {}; // Function to update local state on success

        // Determine the path and the state update function based on the field name
        // Make sure contactInfo, placeInfo, detailInfo are not null before checking 'in'
        if (contactInfo && fieldName in contactInfo) {
            updateData[`contactInfo.${fieldName}`] = value;
            newStateUpdater = () => setContactInfo(prev => ({ ...prev, [fieldName]: value }));
        } else if (placeInfo && fieldName in placeInfo) {
            updateData[`placeInfo.${fieldName}`] = value;
             newStateUpdater = () => setPlaceInfo(prev => ({ ...prev, [fieldName]: value }));
        } else if (detailInfo && fieldName in detailInfo) {
            updateData[`detailInfo.${fieldName}`] = value;
             newStateUpdater = () => setDetailInfo(prev => ({ ...prev, [fieldName]: value }));
        } else {
            console.error("Unknown field name or state object is null:", fieldName);
            setSnackbar({ open: true, message: `Cannot save unknown field: ${fieldName}`, severity: 'error' });
            throw new Error(`Unknown field: ${fieldName}`);
        }

        try {
            await updateDoc(userDocRef, updateData);
            newStateUpdater(); // Update local state only after successful Firestore update
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
            console.log('Profile updated:', fieldName);
        } catch (err) {
            console.error('Error updating profile field:', fieldName, err);
            setSnackbar({ open: true, message: `Error updating profile: ${err.message}`, severity: 'error' });
            throw err; // Re-throw error so EditableField knows save failed
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contactInfo, placeInfo, detailInfo]); // Dependencies: Ensure the function has access to the latest state


    // --- Save Handlers for Array Data (Work/Edu) ---
    const handleSaveWorkExperience = useCallback(async (updatedWorkExperiences) => {
        setSnackbar(prev => ({ ...prev, open: false }));
        const user = auth.currentUser;
        if (!user) {
            setSnackbar({ open: true, message: 'User not authenticated.', severity: 'error' });
            return false; // Indicate failure
        }
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { 'workInfo.workExperience': updatedWorkExperiences });
            setWorkInfo({ workExperience: updatedWorkExperiences }); // Update local state
            setSnackbar({ open: true, message: 'Work experience updated.', severity: 'success' });
            return true; // Indicate success
        } catch (err) {
            console.error('Error saving work experience:', err);
            setSnackbar({ open: true, message: `Error saving work experience: ${err.message}`, severity: 'error' });
            return false; // Indicate failure
        }
    }, []); // No state dependencies needed here

    const handleSaveEducation = useCallback(async (updatedEducationDetails) => {
         setSnackbar(prev => ({ ...prev, open: false }));
        const user = auth.currentUser;
        if (!user) {
            setSnackbar({ open: true, message: 'User not authenticated.', severity: 'error' });
            return false;
        }
        const userDocRef = doc(db, 'users', user.uid);
        try {
            await updateDoc(userDocRef, { 'eduInfo.educationDetails': updatedEducationDetails });
            setEduInfo({ educationDetails: updatedEducationDetails }); // Update local state
            setSnackbar({ open: true, message: 'Education updated.', severity: 'success' });
             return true;
        } catch (err) {
            console.error('Error saving education:', err);
            setSnackbar({ open: true, message: `Error saving education: ${err.message}`, severity: 'error' });
            return false;
        }
    }, []); // No state dependencies


    // --- Tab Change Handler ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // --- Snackbar Handlers ---
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    const handleEditBasicInfo = () => {
        setBasicInfoAlertOpen(true);
    };

    const handleCloseBasicInfoAlert = () => {
        setBasicInfoAlertOpen(false);
    };

    // --- Memoized Tab Content ---
    // Using useMemo to prevent re-rendering of tabs unless their specific data changes
    // Note: Pass handleSaveField directly, EditableField handles its own state.

    const basicInfoTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Basic Information</SectionTitle>
            {/* Use readOnly prop and disable edit button */}
             <StyledTextField
                label="Full Name"
                value={basicInfo.fullName ?? ''} // Use default empty string if null
                fullWidth
                variant="standard" // Use standard for read-only display
                InputProps={{ readOnly: true, disableUnderline: true }}
                onClick={handleEditBasicInfo} // Show alert on click
                sx={{ cursor: 'not-allowed' }} // Indicate non-editable
            />
            {/* Repeat for other basic info fields */}
             <StyledTextField label="Email" value={basicInfo.email ?? ''} fullWidth variant="standard" InputProps={{ readOnly: true, disableUnderline: true }} onClick={handleEditBasicInfo} sx={{ cursor: 'not-allowed' }} />
             <StyledTextField label="Student ID" value={basicInfo.studentId ?? ''} fullWidth variant="standard" InputProps={{ readOnly: true, disableUnderline: true }} onClick={handleEditBasicInfo} sx={{ cursor: 'not-allowed' }} />
             <StyledTextField label="Batch" value={basicInfo.batch ?? ''} fullWidth variant="standard" InputProps={{ readOnly: true, disableUnderline: true }} onClick={handleEditBasicInfo} sx={{ cursor: 'not-allowed' }} />
             <StyledTextField label="Session" value={basicInfo.session ?? ''} fullWidth variant="standard" InputProps={{ readOnly: true, disableUnderline: true }} onClick={handleEditBasicInfo} sx={{ cursor: 'not-allowed' }} />
             <Alert severity="info" sx={{ mt: 2 }}>
                Basic information cannot be edited directly. Please contact an administrator if changes are needed.
            </Alert>
        </Box>
    ), [basicInfo]);

    const workEduTabContent = useMemo(() => (
        <WorkEduTab
            workInfo={workInfo}
            eduInfo={eduInfo}
            onSaveWork={handleSaveWorkExperience}
            onSaveEdu={handleSaveEducation}
            isLoading={loading} // Pass loading state to handle internal skeletons
        />
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [workInfo, eduInfo, handleSaveWorkExperience, handleSaveEducation, loading]);

    const placesLivedTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Places Lived</SectionTitle>
            <EditableField
                label="Current City"
                value={placeInfo.currentCity ?? ''}
                fieldName="currentCity"
                onSave={handleSaveField}
                IconComponent={HomeIcon}
            />
            <EditableField
                label="Hometown"
                value={placeInfo.hometown ?? ''}
                fieldName="hometown"
                onSave={handleSaveField}
                IconComponent={HomeIcon}
            />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [placeInfo, handleSaveField]);

    const contactTabContent = useMemo(() => (
         <Box mt={3}>
            <SectionTitle>Contact Information</SectionTitle>
            <EditableField label="Phone Number" value={contactInfo.phoneNumber ?? ''} fieldName="phoneNumber" onSave={handleSaveField} IconComponent={ContactPhoneIcon} />
            <EditableField label="Facebook Profile" value={contactInfo.facebook ?? ''} fieldName="facebook" onSave={handleSaveField} IconComponent={LinkIcon} prefix="facebook.com/" />
            <EditableField label="LinkedIn Profile" value={contactInfo.linkedin ?? ''} fieldName="linkedin" onSave={handleSaveField} IconComponent={LinkIcon} prefix="linkedin.com/in/" />
            <EditableField label="Website" value={contactInfo.website ?? ''} fieldName="website" onSave={handleSaveField} IconComponent={LinkIcon} prefix="https://" />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [contactInfo, handleSaveField]);

     const detailsTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Details About You</SectionTitle>
            <EditableField label="Birthdate" value={detailInfo.birthdate ?? ''} fieldName="birthdate" onSave={handleSaveField} IconComponent={InfoIcon} />
            <EditableField label="Blood Group" value={detailInfo.bloodGroup ?? ''} fieldName="bloodGroup" onSave={handleSaveField} IconComponent={InfoIcon} />
            <EditableField label="Field of Expertise" value={detailInfo.fieldOfExpertise ?? ''} fieldName="fieldOfExpertise" onSave={handleSaveField} IconComponent={InfoIcon} />
            <EditableField label="Bio" value={detailInfo.bio ?? ''} fieldName="bio" onSave={handleSaveField} IconComponent={DescriptionIcon} multiline rows={4} />
            <EditableField label="About You" value={detailInfo.aboutYou ?? ''} fieldName="aboutYou" onSave={handleSaveField} IconComponent={DescriptionIcon} multiline rows={4} />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [detailInfo, handleSaveField]);


    // ********** SKELETON LOADER **********
    if (loading) {
        return (
            <StyledContainer maxWidth="md">
                <ProfileHeader>
                    <Skeleton variant="circular" width={120} height={120} sx={{ margin: '0 auto 16px' }} />
                    <Skeleton variant="text" width="40%" height={40} sx={{ margin: '0 auto 8px' }} />
                    <Skeleton variant="text" width="50%" height={24} sx={{ margin: '0 auto 16px' }} />
                </ProfileHeader>
                <ProfileCard>
                    {/* Skeleton for Tabs */}
                    <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />

                    {/* Skeleton for Tab Content (e.g., Basic Info or current active tab) */}
                    <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} /> {/* Section Title */}

                    {/* Skeleton for Editable Fields (example for 3 fields) */}
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                     <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                     {/* Add more skeletons if the initial view has more elements */}
                </ProfileCard>
            </StyledContainer>
        );
    }
    // *************************************

    return (
        <>
            <StyledContainer maxWidth="md">
                 <ProfileHeader>
                    {/* Ensure basicInfo exists before accessing properties */}
                     <StyledAvatar profilebg={basicInfo?.profilebg}>
                         {basicInfo?.fullName ? basicInfo.fullName.charAt(0).toUpperCase() : '?'}
                     </StyledAvatar>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {basicInfo?.fullName || 'Your Profile'}
                    </Typography>
                     <Typography variant="body1" color="textSecondary">
                         {basicInfo?.email}
                     </Typography>
                 </ProfileHeader>

                <ProfileCard>
                    <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs" centered>
                        <StyledTab label="Basic Info" />
                        <StyledTab label="Work & Education" />
                        <StyledTab label="Places Lived" />
                        <StyledTab label="Contact" />
                        <StyledTab label="Details" />
                    </StyledTabs>

                    {/* Render active tab content */}
                    {activeTab === 0 && basicInfoTabContent}
                    {activeTab === 1 && workEduTabContent}
                    {activeTab === 2 && placesLivedTabContent}
                    {activeTab === 3 && contactTabContent}
                    {activeTab === 4 && detailsTabContent}

                </ProfileCard>

                {/* --- Snackbars --- */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    TransitionComponent={Slide}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        variant="filled" // Use filled variant for better visibility
                        sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
                        iconMapping={{
                            success: <CheckCircleIcon fontSize="inherit" />,
                            error: <ErrorIcon fontSize="inherit" />,
                            info: <InfoIcon fontSize="inherit" />,
                            warning: <ErrorIcon fontSize='inherit' /> // Use ErrorIcon for warning too or specific WarningIcon
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

                {/* Alert for trying to edit basic info (optional, as inline alert is added) */}
                <Snackbar
                    open={basicInfoAlertOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseBasicInfoAlert}
                    TransitionComponent={Slide}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseBasicInfoAlert}
                        severity="warning"
                        variant="filled"
                        sx={{ width: '100%' }}
                        iconMapping={{ warning: <ErrorIcon fontSize='inherit' /> }}
                    >
                        These fields cannot be edited directly. Please contact the administrator.
                    </Alert>
                </Snackbar>

            </StyledContainer>
        </>
    );
}

// --- Work & Education Tab Component ---

// Pass isLoading prop
const WorkEduTab = React.memo(({ workInfo, eduInfo, onSaveWork, onSaveEdu, isLoading }) => {
    // State specific to this tab (editing indices, form values)
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null); // null | 'NEW' | number
    const [workForm, setWorkForm] = useState({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
    const [isSavingWork, setIsSavingWork] = useState(false);

    const [editingEducationIndex, setEditingEducationIndex] = useState(null); // null | 'NEW' | number
    const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
    const [isSavingEdu, setIsSavingEdu] = useState(false);


    // --- Work Experience Handlers ---
    const handleAddWorkExperience = () => {
        setWorkForm({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
        setEditingExperienceIndex('NEW');
    };

    const handleEditWorkExperience = (index) => {
        // Ensure workExperience exists and has the item
        if (!workInfo?.workExperience?.[index]) return;
        const exp = workInfo.workExperience[index];
        const [start = '', end = ''] = exp.duration?.split(' - ') || [];
        const currentlyWorking = end === 'Present';
        setWorkForm({
            company: exp.company || '',
            position: exp.position || '',
            city: exp.city || '',
            startYear: start,
            endYear: currentlyWorking ? '' : end,
            currentlyWorking: currentlyWorking,
        });
        setEditingExperienceIndex(index);
    };

    const handleCancelWorkEdit = () => {
        setEditingExperienceIndex(null);
        setWorkForm({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false }); // Reset form
    };

    const handleDeleteWorkExperience = async (indexToDelete) => {
        setIsSavingWork(true);
        const currentExperiences = workInfo?.workExperience || [];
        const updatedWorkExperiences = currentExperiences.filter((_, index) => index !== indexToDelete);
        const success = await onSaveWork(updatedWorkExperiences);
         if (success) {
             setEditingExperienceIndex(null); // Close form if deletion was successful
         }
        setIsSavingWork(false);
    };

     const handleSaveCurrentWorkExperience = async () => {
        // Basic Validation
        if (!workForm.company || !workForm.position || !workForm.city || !workForm.startYear || (!workForm.currentlyWorking && !workForm.endYear)) {
             console.error("Work form validation failed");
             alert("Please fill in all required work experience fields."); // Simple alert for now
             return;
         }

        setIsSavingWork(true);
        const workDuration = workForm.currentlyWorking ? `${workForm.startYear} - Present` : `${workForm.startYear} - ${workForm.endYear}`;
        const newExperience = {
            company: workForm.company,
            position: workForm.position,
            city: workForm.city,
            duration: workDuration,
        };

        let updatedWorkExperiences;
        const currentExperiences = workInfo?.workExperience || [];
        if (editingExperienceIndex === 'NEW') {
            updatedWorkExperiences = [...currentExperiences, newExperience];
        } else if (typeof editingExperienceIndex === 'number') {
            updatedWorkExperiences = [...currentExperiences];
            updatedWorkExperiences[editingExperienceIndex] = newExperience;
        } else {
             setIsSavingWork(false);
             return; // Should not happen
        }

         // Sort experiences after update (most recent first)
         updatedWorkExperiences.sort((a, b) => {
            const [, endAStr] = a.duration?.split(' - ') || [];
            const [, endBStr] = b.duration?.split(' - ') || [];
            const endAYear = endAStr === 'Present' ? Infinity : parseInt(endAStr || '0', 10);
            const endBYear = endBStr === 'Present' ? Infinity : parseInt(endBStr || '0', 10);
            return endBYear - endAYear; // Descending order by end year
        });


        const success = await onSaveWork(updatedWorkExperiences);
         if (success) {
             handleCancelWorkEdit(); // Close form on success
         }
        setIsSavingWork(false);
    };

     // --- Education Handlers ---
     const handleAddEducation = () => {
        setEduForm({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
        setEditingEducationIndex('NEW');
    };

     const handleEditEducation = (index) => {
        // Ensure eduInfo exists and has the item
        if (!eduInfo?.educationDetails?.[index]) return;
        const edu = eduInfo.educationDetails[index];
        setEduForm({
            institution: edu.institution || '',
            degree: edu.degree || '',
            fieldOfStudy: edu.fieldOfStudy || '',
            graduationYear: edu.graduationYear || '',
        });
        setEditingEducationIndex(index);
    };

     const handleCancelEduEdit = () => {
        setEditingEducationIndex(null);
        setEduForm({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }); // Reset form
    };

     const handleDeleteEducation = async (indexToDelete) => {
         setIsSavingEdu(true);
         const currentEducation = eduInfo?.educationDetails || [];
        const updatedEducationDetails = currentEducation.filter((_, index) => index !== indexToDelete);
        const success = await onSaveEdu(updatedEducationDetails);
         if (success) {
             setEditingEducationIndex(null);
         }
         setIsSavingEdu(false);
    };

     const handleSaveCurrentEducation = async () => {
         // Basic Validation
         if (!eduForm.institution || !eduForm.degree || !eduForm.fieldOfStudy || !eduForm.graduationYear) {
             console.error("Education form validation failed");
              alert("Please fill in all required education fields."); // Simple alert
             return;
         }

        setIsSavingEdu(true);
        const newEducation = { ...eduForm };

        let updatedEducationDetails;
        const currentEducation = eduInfo?.educationDetails || [];
        if (editingEducationIndex === 'NEW') {
            updatedEducationDetails = [...currentEducation, newEducation];
        } else if (typeof editingEducationIndex === 'number') {
            updatedEducationDetails = [...currentEducation];
            updatedEducationDetails[editingEducationIndex] = newEducation;
        } else {
             setIsSavingEdu(false);
            return; // Should not happen
        }

         // Sort education by graduation year (most recent first)
         updatedEducationDetails.sort((a, b) => parseInt(b.graduationYear || '0', 10) - parseInt(a.graduationYear || '0', 10));


        const success = await onSaveEdu(updatedEducationDetails);
         if (success) {
             handleCancelEduEdit(); // Close form on success
         }
        setIsSavingEdu(false);
    };


    // Memoize sorted lists, handle null case
     const sortedWorkExperiences = useMemo(() =>
        [...(workInfo?.workExperience || [])].sort((a, b) => {
             const [, endAStr] = a.duration?.split(' - ') || [];
             const [, endBStr] = b.duration?.split(' - ') || [];
             const endAYear = endAStr === 'Present' ? Infinity : parseInt(endAStr || '0', 10);
             const endBYear = endBStr === 'Present' ? Infinity : parseInt(endBStr || '0', 10);
            return endBYear - endAYear; // Descending
        }), [workInfo?.workExperience]); // Depend on the array itself

     const sortedEducationDetails = useMemo(() =>
         [...(eduInfo?.educationDetails || [])].sort((a, b) =>
            parseInt(b.graduationYear || '0', 10) - parseInt(a.graduationYear || '0', 10) // Descending
         ), [eduInfo?.educationDetails]); // Depend on the array itself


    // --- Render Logic ---
    return (
        <Box mt={3}>
            {/* --- Work Experience Section --- */}
            <SectionTitle>Work Experience</SectionTitle>
            {isLoading ? (
                 <>
                    {/* Skeleton for Work Items */}
                    <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} />
                    <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} />
                 </>
             ) : (
                <>
                 {sortedWorkExperiences.map((experience, index) => (
                      <ItemBox key={`work-${index}`}>
                          <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />
                          <ItemContent>
                              <Typography variant="subtitle1" fontWeight="bold">{experience.company}</Typography>
                              <Typography variant="body2" color="textSecondary">{experience.position} - {experience.city}</Typography>
                              <Typography variant="body2" color="textSecondary">Duration: {experience.duration}</Typography>
                          </ItemContent>
                          {editingExperienceIndex !== index && ( // Show edit only if not currently editing this item
                              <ItemActions>
                                  <Tooltip title="Edit">
                                      <IconButton size="small" onClick={() => handleEditWorkExperience(index)} disabled={editingExperienceIndex !== null || isSavingWork}>
                                          <EditIcon fontSize="small" />
                                      </IconButton>
                                  </Tooltip>
                              </ItemActions>
                          )}
                      </ItemBox>
                 ))}

                 {/* Add/Edit Work Form */}
                  {(editingExperienceIndex !== null) && (
                      <WorkExperienceForm
                         formData={workForm}
                         setFormData={setWorkForm}
                         onSave={handleSaveCurrentWorkExperience}
                         onCancel={handleCancelWorkEdit}
                         onDelete={editingExperienceIndex !== 'NEW' ? () => handleDeleteWorkExperience(editingExperienceIndex) : undefined}
                         isSaving={isSavingWork}
                         isNew={editingExperienceIndex === 'NEW'}
                      />
                  )}

                  {/* Add Button - Show only if no form is open */}
                  {editingExperienceIndex === null && (
                      <Button
                          variant="outlined"
                          startIcon={<AddIcon />}
                          onClick={handleAddWorkExperience}
                          disabled={isSavingWork} // Disable while any save is in progress
                          sx={{ mt: 1 }}
                      >
                          Add Work Experience
                      </Button>
                  )}
                </>
            )}


            {/* --- Education Section --- */}
            <Box mt={5}> {/* Add more space before Education */}
                <SectionTitle>Education (MSc/MBA/PhD etc.)</SectionTitle>
                 {isLoading ? (
                     <>
                         {/* Skeleton for Education Items */}
                         <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} />
                         <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} />
                     </>
                 ) : (
                    <>
                     {sortedEducationDetails.map((education, index) => (
                         <ItemBox key={`edu-${index}`}>
                              <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                              <ItemContent>
                                  <Typography variant="subtitle1" fontWeight="bold">{education.institution}</Typography>
                                  <Typography variant="body2" color="textSecondary">{education.degree} in {education.fieldOfStudy}</Typography>
                                  <Typography variant="body2" color="textSecondary">Graduated: {education.graduationYear}</Typography>
                              </ItemContent>
                              {editingEducationIndex !== index && (
                                 <ItemActions>
                                      <Tooltip title="Edit">
                                         <IconButton size="small" onClick={() => handleEditEducation(index)} disabled={editingEducationIndex !== null || isSavingEdu}>
                                             <EditIcon fontSize="small"/>
                                         </IconButton>
                                     </Tooltip>
                                 </ItemActions>
                              )}
                          </ItemBox>
                     ))}

                     {/* Add/Edit Education Form */}
                     {(editingEducationIndex !== null) && (
                         <EducationForm
                            formData={eduForm}
                            setFormData={setEduForm}
                            onSave={handleSaveCurrentEducation}
                            onCancel={handleCancelEduEdit}
                            onDelete={editingEducationIndex !== 'NEW' ? () => handleDeleteEducation(editingEducationIndex) : undefined}
                            isSaving={isSavingEdu}
                            isNew={editingEducationIndex === 'NEW'}
                         />
                     )}

                     {/* Add Button */}
                     {editingEducationIndex === null && (
                         <Button
                             variant="outlined"
                             startIcon={<AddIcon />}
                             onClick={handleAddEducation}
                             disabled={isSavingEdu}
                             sx={{ mt: 1 }}
                         >
                             Add Education
                         </Button>
                     )}
                    </>
                 )}
            </Box>
        </Box>
    );
});


// --- Work Experience Form Component ---
const WorkExperienceForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew }) => {

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

     const canSave = formData.company && formData.position && formData.city && formData.startYear && (formData.currentlyWorking || formData.endYear);

    return (
        <FormBox>
             <Typography variant="h6" gutterBottom>{isNew ? 'Add New Work Experience' : 'Edit Work Experience'}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField label="Company *" name="company" value={formData.company} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Position *" name="position" value={formData.position} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                </Grid>
                <Grid item xs={12}>
                     <TextField label="City/Town *" name="city" value={formData.city} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                 </Grid>

                <Grid item xs={12}>
                     <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Time Period *</Typography>
                     <FormControlLabel
                         control={<Checkbox name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} disabled={isSaving} />}
                         label="I currently work here"
                     />
                 </Grid>
                 <Grid item xs={6}>
                    <TextField
                         label="Start Year *"
                         name="startYear"
                         value={formData.startYear}
                         onChange={handleChange}
                         fullWidth
                         margin="dense" // Use dense margin in grids
                         disabled={isSaving}
                         type="number" // Consider using type="number" for years
                     />
                </Grid>
                 {!formData.currentlyWorking && (
                     <Grid item xs={6}>
                        <TextField
                             label="End Year *"
                             name="endYear"
                             value={formData.endYear}
                             onChange={handleChange}
                             fullWidth
                             margin="dense"
                             disabled={isSaving || !formData.startYear} // Also disable if start year is empty
                             type="number"
                             inputProps={{ min: formData.startYear || undefined }} // Basic validation: End year >= Start year
                         />
                    </Grid>
                 )}
            </Grid>
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                <ButtonContainer>
                    <SaveButton variant="contained" onClick={onSave} disabled={isSaving || !canSave}>
                        {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </SaveButton>
                    <CancelButton onClick={onCancel} disabled={isSaving}>Cancel</CancelButton>
                </ButtonContainer>
                {!isNew && onDelete && (
                    <Tooltip title="Delete this experience">
                         {/* Ensure isSaving disables delete button */}
                         <IconButton aria-label="delete" onClick={onDelete} disabled={isSaving} color="error">
                             <DeleteIcon />
                         </IconButton>
                     </Tooltip>
                 )}
            </Box>
        </FormBox>
    );
};


// --- Education Form Component ---
const EducationForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew }) => {

     const handleChange = (e) => {
         const { name, value } = e.target;
         setFormData(prev => ({ ...prev, [name]: value }));
     };

      const canSave = formData.institution && formData.degree && formData.fieldOfStudy && formData.graduationYear;

    return (
        <FormBox>
             <Typography variant="h6" gutterBottom>{isNew ? 'Add New Education' : 'Edit Education'}</Typography>
             <Grid container spacing={2}>
                <Grid item xs={12}>
                    <TextField label="Institution *" name="institution" value={formData.institution} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                 </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Degree *" name="degree" value={formData.degree} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                 </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Field of Study *" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} />
                 </Grid>
                <Grid item xs={12} sm={6}>
                    <TextField label="Graduation Year *" name="graduationYear" value={formData.graduationYear} onChange={handleChange} fullWidth margin="normal" disabled={isSaving} type="number"/>
                 </Grid>
             </Grid>
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                 <ButtonContainer>
                     <SaveButton variant="contained" onClick={onSave} disabled={isSaving || !canSave}>
                         {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                     </SaveButton>
                     <CancelButton onClick={onCancel} disabled={isSaving}>Cancel</CancelButton>
                 </ButtonContainer>
                 {!isNew && onDelete && (
                     <Tooltip title="Delete this education entry">
                         {/* Ensure isSaving disables delete button */}
                         <IconButton aria-label="delete" onClick={onDelete} disabled={isSaving} color="error">
                             <DeleteIcon />
                         </IconButton>
                     </Tooltip>
                 )}
            </Box>
        </FormBox>
    );
};


export default Profile;