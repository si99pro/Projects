// src/pages/ViewProfile.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom'; // Import useParams
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
    Container, Typography, TextField, Button, Avatar, Grid, Box,
    Tabs, Tab, Alert, Snackbar, Slide, IconButton, InputAdornment,
    Checkbox, FormControlLabel, CircularProgress, Tooltip, Skeleton
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
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings'; // Icon for Admin View

// --- Styled Components (Copied from Profile.js - no changes needed) ---
const StyledContainer = styled(Container)`
  margin-top: 40px;
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
  background-color: ${props => props.profilebg || '#673ab7'};
`;

const StyledTabs = styled(Tabs)`
  margin-bottom: 24px;
  border-bottom: 1px solid #e0e0e0;
  .MuiTabs-indicator {
    background-color: #673ab7;
  }
`;

const StyledTab = styled(Tab)`
  color: #555;
  text-transform: none;
  font-weight: 500;
  &.Mui-selected {
    color: #673ab7;
    font-weight: 700;
  }
`;

const ProfileCard = styled(Box)`
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  padding: 32px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.3rem;
  font-weight: 600;
  margin-bottom: 20px;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
`;

const StyledTextField = styled(TextField)`
    margin-bottom: 16px;
    .MuiInputBase-root.Mui-disabled {
        color: rgba(0, 0, 0, 0.7);
        background-color: #f9f9f9;
    }
    .MuiInput-underline:before {
        border-bottom: none;
    }
    .MuiInput-underline:hover:not(.Mui-disabled):before {
        border-bottom: 1px solid rgba(0, 0, 0, 0.42);
    }
    .MuiInputBase-input:read-only {
      cursor: default;
    }
`;

const ButtonContainer = styled(Box)`
  display: flex;
  gap: 8px;
`;

const SaveButton = styled(Button)`
  background-color: #673ab7;
  color: #fff;
  &:hover {
    background-color: #512da8;
  }
  &:disabled {
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
  background-color: #fafafa;
  position: relative;
`;

const ItemContent = styled(Box)`
  margin-left: 16px;
  flex-grow: 1;
`;

const ItemActions = styled(Box)`
  margin-left: auto;
  display: flex;
  gap: 4px;
`;

const FormBox = styled(Box)`
  margin-top: 16px;
  padding: 20px;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 24px;
  background-color: #fff;
`;

// --- Helper: Debounce Function (Copied) ---
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

// Generic Editable Field Component - MODIFIED to accept isAdmin prop
const EditableField = React.memo(({
    label, value, fieldName, onSave, onCancel, onChange,
    IconComponent, multiline = false, rows = 1,
    readOnly = false, // For fields that should *never* be editable (e.g., email, maybe ID)
    prefix = null,
    disabled = false, // General disabled state (e.g., during save)
    isAdmin = false // NEW: Controls if editing UI is shown at all
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [currentValue, setCurrentValue] = useState(value);
    const [isSaving, setIsSaving] = useState(false);

    // Determine if the field can ever be edited based on props
    const canEdit = !readOnly && isAdmin;

    useEffect(() => {
        setCurrentValue(value);
        // If admin status changes *after* editing started (unlikely but possible), cancel edit
        if (!canEdit && isEditing) {
             setIsEditing(false);
             setCurrentValue(value);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value, canEdit]); // React to external value changes and edit permission changes

    const handleEditClick = () => {
        if (!canEdit) return; // Don't allow edit start if not admin or field is readOnly
        setIsEditing(true);
    };

    const handleSaveClick = async () => {
        if (!canEdit || currentValue === value) {
            setIsEditing(false);
            return;
        }
        setIsSaving(true);
        try {
            // onSave should handle its own permission check, but good practice here too
            await onSave(fieldName, currentValue);
            setIsEditing(false);
        } catch (error) {
            console.error("Save failed:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancelClick = () => {
        setCurrentValue(value);
        setIsEditing(false);
        if (onCancel) onCancel(fieldName);
    };

    const handleChange = (e) => {
        setCurrentValue(e.target.value);
        if (onChange) onChange(e.target.value);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSave = useCallback(debounce(handleSaveClick, 1000), [currentValue, fieldName, onSave, canEdit]);

    const handleKeyDown = (e) => {
         if (!canEdit) return;
        if (e.key === 'Enter' && !multiline && isEditing) {
            handleSaveClick();
        } else if (e.key === 'Escape' && isEditing) {
            handleCancelClick();
        }
    };

    const handleBlur = () => {
        if (!canEdit) return;
        if (isEditing && !multiline && currentValue !== value) {
             handleSaveClick();
        } else if (isEditing && !multiline && currentValue === value) {
            handleCancelClick();
        }
    };

    const effectiveReadOnly = !isEditing || !canEdit;
    const displayVariant = isEditing && canEdit ? "outlined" : "standard";

    return (
        <StyledTextField
            label={label}
            value={currentValue ?? ''}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            fullWidth
            multiline={multiline}
            rows={rows}
            variant={displayVariant}
            // Disable if explicitly disabled, saving, or if editing isn't allowed for this field/user
            disabled={disabled || isSaving || !canEdit}
            InputProps={{
                readOnly: effectiveReadOnly,
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
                    // Only show adornments if the field is potentially editable by an admin
                    canEdit && (
                        <InputAdornment position="end">
                            {isEditing ? (
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
                                    <IconButton onClick={handleEditClick} aria-label="edit" size="small" disabled={disabled || isSaving}>
                                        <EditIcon />
                                    </IconButton>
                                </Tooltip>
                            )}
                        </InputAdornment>
                    )
                ),
            }}
             sx={{
                // Styles for standard view mode (when not editing or not editable)
                ...( (effectiveReadOnly || displayVariant === 'standard') && {
                    '& .MuiInput-underline:before': { borderBottom: '1px dashed rgba(0, 0, 0, 0.1)' }, // Very subtle line in view mode
                    '&:hover .MuiInput-underline:before': { borderBottom: '1px solid rgba(0, 0, 0, 0.3) !important' },
                    // Hide underline completely if it should never be editable or editing is disabled for user
                    ...(readOnly || !isAdmin) && {
                         '& .MuiInput-underline:before': { borderBottom: 'none' },
                         '& .MuiInput-underline:after': { borderBottom: 'none' },
                         '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: 'none !important' },
                         '& .MuiInputBase-input': { cursor: 'default' }
                    }
                }),
            }}
        />
    );
});

// --- Main ViewProfile Component ---

function ViewProfile() {
    const { userId } = useParams(); // Get userId from URL

    // State for the profile being viewed
    const [basicInfo, setBasicInfo] = useState({ fullName: null, email: null, studentId: null, batch: null, session: null, profilebg: null });
    const [contactInfo, setContactInfo] = useState({ phoneNumber: null, facebook: null, linkedin: null, website: null });
    const [eduInfo, setEduInfo] = useState({ educationDetails: null });
    const [workInfo, setWorkInfo] = useState({ workExperience: null });
    const [placeInfo, setPlaceInfo] = useState({ currentCity: null, hometown: null });
    const [detailInfo, setDetailInfo] = useState({ birthdate: null, bloodGroup: null, fieldOfExpertise: null, bio: null, aboutYou: null });

    // State for the component/viewer
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [isAdminViewer, setIsAdminViewer] = useState(false); // Is the logged-in user an admin?
    const [profileExists, setProfileExists] = useState(true); // Track if the profile exists
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fetch Data: Profile data AND viewing user's role
    useEffect(() => {
        const fetchProfileAndRoleData = async () => {
            setLoading(true);
            setIsAdminViewer(false); // Reset admin status on user change
            setProfileExists(true); // Assume profile exists initially

             // Reset states for skeleton display
            setBasicInfo({ fullName: null, email: null, studentId: null, batch: null, session: null, profilebg: null });
            setContactInfo({ phoneNumber: null, facebook: null, linkedin: null, website: null });
            setEduInfo({ educationDetails: null });
            setWorkInfo({ workExperience: null });
            setPlaceInfo({ currentCity: null, hometown: null });
            setDetailInfo({ birthdate: null, bloodGroup: null, fieldOfExpertise: null, bio: null, aboutYou: null });


            // 1. Check logged-in user's role
            const currentUser = auth.currentUser;
            let isAdmin = false;
            if (currentUser) {
                try {
                    const viewerDocRef = doc(db, 'users', currentUser.uid);
                    const viewerDocSnap = await getDoc(viewerDocRef);
                    if (viewerDocSnap.exists() && viewerDocSnap.data().role === 'admin') {
                        isAdmin = true;
                    }
                } catch (error) {
                    console.error("Error fetching viewing user's role:", error);
                    // Non-critical error, proceed assuming not admin
                }
            }
            setIsAdminViewer(isAdmin); // Set admin status

            // 2. Fetch the target profile data using userId from URL
            if (!userId) {
                console.error("No userId provided in URL");
                setSnackbar({ open: true, message: 'Invalid user profile link.', severity: 'error' });
                setProfileExists(false);
                setLoading(false);
                return;
            }

            try {
                const userDocRef = doc(db, 'users', userId);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setBasicInfo(data.basicInfo || { fullName: '', email: '', studentId: '', batch: '', session: '', profilebg: '#673ab7' });
                    setContactInfo(data.contactInfo || { phoneNumber: '', facebook: '', linkedin: '', website: '' });
                    setEduInfo(data.eduInfo || { educationDetails: [] });
                    setWorkInfo(data.workInfo || { workExperience: [] });
                    setPlaceInfo(data.placeInfo || { currentCity: '', hometown: '' });
                    setDetailInfo(data.detailInfo || { birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
                } else {
                    console.log('No profile document found for user ID:', userId);
                    setSnackbar({ open: true, message: 'User profile not found.', severity: 'error' });
                    setProfileExists(false);
                     // Set empty defaults even if profile doesn't exist to avoid render errors
                    setBasicInfo({ fullName: 'N/A', email: 'N/A', studentId: '', batch: '', session: '', profilebg: '#bdbdbd' });
                    setContactInfo({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
                    setEduInfo({ educationDetails: [] });
                    setWorkInfo({ workExperience: [] });
                    setPlaceInfo({ currentCity: '', hometown: '' });
                    setDetailInfo({ birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setSnackbar({ open: true, message: `Failed to load profile data: ${error.message}`, severity: 'error' });
                setProfileExists(false);
                // Set empty defaults on error
                setBasicInfo({ fullName: 'Error', email: 'Error', studentId: '', batch: '', session: '', profilebg: '#bdbdbd' });
                setContactInfo({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
                setEduInfo({ educationDetails: [] });
                setWorkInfo({ workExperience: [] });
                setPlaceInfo({ currentCity: '', hometown: '' });
                setDetailInfo({ birthdate: '', bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' });
            } finally {
                 setTimeout(() => setLoading(false), 300); // Short delay
            }
        };

        fetchProfileAndRoleData();
    }, [userId]); // Re-run effect if userId changes


    // --- Generic Save Handler - MODIFIED for Admin and specific userId ---
    const handleSaveField = useCallback(async (fieldName, value) => {
        setSnackbar(prev => ({ ...prev, open: false }));

        if (!isAdminViewer) {
             console.error("Permission Denied: Only admins can edit profiles.");
             setSnackbar({ open: true, message: 'You do not have permission to edit this profile.', severity: 'error' });
             throw new Error("Permission Denied."); // Prevent EditableField from updating state optimistically
        }

        if (!userId) {
            setSnackbar({ open: true, message: 'Invalid user profile.', severity: 'error' });
            throw new Error("Invalid user ID.");
        }

        const userDocRef = doc(db, 'users', userId); // Use userId from URL
        let updateData = {};
        let newStateUpdater = () => {};

        // Determine update path (allow editing basic info for admins)
         if (basicInfo && fieldName in basicInfo) {
            // Allow editing basic fields if admin (handle specific readOnly below if needed)
            if (fieldName === 'email' || fieldName === 'studentId') { // Example: Prevent direct edit of email/ID even by admin
                 console.warn(`Admin attempted to edit read-only field: ${fieldName}`);
                 setSnackbar({ open: true, message: `Field '${fieldName}' cannot be edited directly.`, severity: 'warning' });
                 throw new Error(`Field '${fieldName}' is read-only.`);
            }
            updateData[`basicInfo.${fieldName}`] = value;
            newStateUpdater = () => setBasicInfo(prev => ({ ...prev, [fieldName]: value }));
        } else if (contactInfo && fieldName in contactInfo) {
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
            newStateUpdater();
            setSnackbar({ open: true, message: 'Profile updated successfully!', severity: 'success' });
            console.log(`Admin updated profile ${userId}:`, fieldName);
        } catch (err) {
            console.error('Error updating profile field:', fieldName, err);
            setSnackbar({ open: true, message: `Error updating profile: ${err.message}`, severity: 'error' });
            throw err;
        }
    }, [isAdminViewer, userId, basicInfo, contactInfo, placeInfo, detailInfo]); // Include all relevant states and userId


    // --- Save Handlers for Array Data (Work/Edu) - MODIFIED for Admin and specific userId ---
    const handleSaveWorkExperience = useCallback(async (updatedWorkExperiences) => {
        setSnackbar(prev => ({ ...prev, open: false }));

        if (!isAdminViewer) {
             setSnackbar({ open: true, message: 'You do not have permission to edit this profile.', severity: 'error' });
             return false;
        }
        if (!userId) {
            setSnackbar({ open: true, message: 'Invalid user profile.', severity: 'error' });
            return false;
        }

        const userDocRef = doc(db, 'users', userId); // Use userId from URL
        try {
            await updateDoc(userDocRef, { 'workInfo.workExperience': updatedWorkExperiences });
            setWorkInfo({ workExperience: updatedWorkExperiences });
            setSnackbar({ open: true, message: 'Work experience updated.', severity: 'success' });
            return true;
        } catch (err) {
            console.error('Error saving work experience:', err);
            setSnackbar({ open: true, message: `Error saving work experience: ${err.message}`, severity: 'error' });
            return false;
        }
    }, [isAdminViewer, userId]); // Depend on admin status and userId

    const handleSaveEducation = useCallback(async (updatedEducationDetails) => {
         setSnackbar(prev => ({ ...prev, open: false }));

         if (!isAdminViewer) {
            setSnackbar({ open: true, message: 'You do not have permission to edit this profile.', severity: 'error' });
            return false;
         }
         if (!userId) {
            setSnackbar({ open: true, message: 'Invalid user profile.', severity: 'error' });
            return false;
         }

        const userDocRef = doc(db, 'users', userId); // Use userId from URL
        try {
            await updateDoc(userDocRef, { 'eduInfo.educationDetails': updatedEducationDetails });
            setEduInfo({ educationDetails: updatedEducationDetails });
            setSnackbar({ open: true, message: 'Education updated.', severity: 'success' });
             return true;
        } catch (err) {
            console.error('Error saving education:', err);
            setSnackbar({ open: true, message: `Error saving education: ${err.message}`, severity: 'error' });
            return false;
        }
    }, [isAdminViewer, userId]); // Depend on admin status and userId


    // --- Tab Change Handler ---
    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    // --- Snackbar Handler ---
    const handleCloseSnackbar = () => {
        setSnackbar(prev => ({ ...prev, open: false }));
    };

    // --- Memoized Tab Content ---
    // Pass isAdminViewer down to relevant components

    const basicInfoTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Basic Information</SectionTitle>
            {/* Admins can edit these, non-admins see read-only */}
             <EditableField
                label="Full Name"
                value={basicInfo.fullName ?? ''}
                fieldName="fullName"
                onSave={handleSaveField}
                isAdmin={isAdminViewer} // Pass admin status
                readOnly={false} // Allow admin edit
            />
             <EditableField
                label="Email"
                value={basicInfo.email ?? ''}
                fieldName="email"
                onSave={handleSaveField}
                isAdmin={isAdminViewer}
                readOnly={true} // Keep Email generally read-only even for admins
            />
             <EditableField
                label="Student ID"
                value={basicInfo.studentId ?? ''}
                fieldName="studentId"
                onSave={handleSaveField}
                isAdmin={isAdminViewer}
                readOnly={true} // Keep Student ID generally read-only even for admins
            />
             <EditableField
                label="Batch"
                value={basicInfo.batch ?? ''}
                fieldName="batch"
                onSave={handleSaveField}
                isAdmin={isAdminViewer}
                readOnly={false} // Allow admin edit
            />
             <EditableField
                label="Session"
                value={basicInfo.session ?? ''}
                fieldName="session"
                onSave={handleSaveField}
                isAdmin={isAdminViewer}
                readOnly={false} // Allow admin edit
            />
            {/* Maybe show info only to non-admins, or hide completely */}
            {!isAdminViewer && basicInfo.email && ( // Show only if not admin and data exists
                 <Alert severity="info" sx={{ mt: 2 }}>
                    Contact an administrator if changes are needed for read-only fields.
                 </Alert>
             )}
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [basicInfo, isAdminViewer, handleSaveField]); // Depend on isAdminViewer

    const workEduTabContent = useMemo(() => (
        <WorkEduTab
            workInfo={workInfo}
            eduInfo={eduInfo}
            onSaveWork={handleSaveWorkExperience}
            onSaveEdu={handleSaveEducation}
            isLoading={loading}
            isAdmin={isAdminViewer} // Pass admin status
        />
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [workInfo, eduInfo, handleSaveWorkExperience, handleSaveEducation, loading, isAdminViewer]); // Depend on isAdminViewer

    const placesLivedTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Places Lived</SectionTitle>
            <EditableField
                label="Current City"
                value={placeInfo.currentCity ?? ''}
                fieldName="currentCity"
                onSave={handleSaveField}
                IconComponent={HomeIcon}
                isAdmin={isAdminViewer} // Pass admin status
                readOnly={false}
            />
            <EditableField
                label="Hometown"
                value={placeInfo.hometown ?? ''}
                fieldName="hometown"
                onSave={handleSaveField}
                IconComponent={HomeIcon}
                isAdmin={isAdminViewer} // Pass admin status
                readOnly={false}
            />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [placeInfo, handleSaveField, isAdminViewer]); // Depend on isAdminViewer

    const contactTabContent = useMemo(() => (
         <Box mt={3}>
            <SectionTitle>Contact Information</SectionTitle>
            <EditableField label="Phone Number" value={contactInfo.phoneNumber ?? ''} fieldName="phoneNumber" onSave={handleSaveField} IconComponent={ContactPhoneIcon} isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="Facebook Profile" value={contactInfo.facebook ?? ''} fieldName="facebook" onSave={handleSaveField} IconComponent={LinkIcon} prefix="facebook.com/" isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="LinkedIn Profile" value={contactInfo.linkedin ?? ''} fieldName="linkedin" onSave={handleSaveField} IconComponent={LinkIcon} prefix="linkedin.com/in/" isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="Website" value={contactInfo.website ?? ''} fieldName="website" onSave={handleSaveField} IconComponent={LinkIcon} prefix="https://" isAdmin={isAdminViewer} readOnly={false} />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [contactInfo, handleSaveField, isAdminViewer]); // Depend on isAdminViewer

     const detailsTabContent = useMemo(() => (
        <Box mt={3}>
            <SectionTitle>Details About User</SectionTitle> {/* Changed title slightly */}
            <EditableField label="Birthdate" value={detailInfo.birthdate ?? ''} fieldName="birthdate" onSave={handleSaveField} IconComponent={InfoIcon} isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="Blood Group" value={detailInfo.bloodGroup ?? ''} fieldName="bloodGroup" onSave={handleSaveField} IconComponent={InfoIcon} isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="Field of Expertise" value={detailInfo.fieldOfExpertise ?? ''} fieldName="fieldOfExpertise" onSave={handleSaveField} IconComponent={InfoIcon} isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="Bio" value={detailInfo.bio ?? ''} fieldName="bio" onSave={handleSaveField} IconComponent={DescriptionIcon} multiline rows={4} isAdmin={isAdminViewer} readOnly={false} />
            <EditableField label="About User" value={detailInfo.aboutYou ?? ''} fieldName="aboutYou" onSave={handleSaveField} IconComponent={DescriptionIcon} multiline rows={4} isAdmin={isAdminViewer} readOnly={false} />
        </Box>
    // eslint-disable-next-line react-hooks/exhaustive-deps
    ), [detailInfo, handleSaveField, isAdminViewer]); // Depend on isAdminViewer


    // --- Loading State / Profile Not Found ---
    if (loading) {
        // Use the same Skeleton structure as Profile.js
         return (
            <StyledContainer maxWidth="md">
                <ProfileHeader>
                    <Skeleton variant="circular" width={120} height={120} sx={{ margin: '0 auto 16px' }} />
                    <Skeleton variant="text" width="40%" height={40} sx={{ margin: '0 auto 8px' }} />
                    <Skeleton variant="text" width="50%" height={24} sx={{ margin: '0 auto 16px' }} />
                </ProfileHeader>
                <ProfileCard>
                    <Skeleton variant="rectangular" height={48} sx={{ mb: 3 }} />
                    <Skeleton variant="text" width="30%" height={40} sx={{ mb: 3 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                    <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
                </ProfileCard>
            </StyledContainer>
         );
    }

    if (!profileExists) {
         // Display a clear message if the profile wasn't found after loading
         return (
            <StyledContainer maxWidth="md">
                <Alert severity="error" sx={{ mt: 5, p: 3 }}>
                    <Typography variant="h6">Profile Not Found</Typography>
                    <Typography>The requested user profile (ID: {userId}) does not exist or could not be loaded.</Typography>
                </Alert>
            </StyledContainer>
         );
    }

    // --- Render Profile ---
    return (
        <>
            <StyledContainer maxWidth="md">
                 <ProfileHeader>
                     <StyledAvatar profilebg={basicInfo?.profilebg}>
                         {basicInfo?.fullName ? basicInfo.fullName.charAt(0).toUpperCase() : '?'}
                     </StyledAvatar>
                    <Typography variant="h4" component="h1" gutterBottom>
                        {basicInfo?.fullName || 'User Profile'}
                         {/* Add an indicator if the viewer is an admin */}
                         {isAdminViewer && (
                             <Tooltip title="Admin View: Editing Enabled">
                                 <AdminPanelSettingsIcon color="primary" sx={{ ml: 1, verticalAlign: 'middle' }} />
                             </Tooltip>
                         )}
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

                {/* --- Snackbar --- */}
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
                        variant="filled"
                        sx={{ width: '100%', display: 'flex', alignItems: 'center' }}
                        iconMapping={{
                            success: <CheckCircleIcon fontSize="inherit" />,
                            error: <ErrorIcon fontSize="inherit" />,
                            info: <InfoIcon fontSize="inherit" />,
                            warning: <ErrorIcon fontSize='inherit' />
                        }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>

            </StyledContainer>
        </>
    );
}

// --- Work & Education Tab Component - MODIFIED to accept isAdmin ---

const WorkEduTab = React.memo(({ workInfo, eduInfo, onSaveWork, onSaveEdu, isLoading, isAdmin }) => { // Added isAdmin prop
    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
    const [workForm, setWorkForm] = useState({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
    const [isSavingWork, setIsSavingWork] = useState(false);

    const [editingEducationIndex, setEditingEducationIndex] = useState(null);
    const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
    const [isSavingEdu, setIsSavingEdu] = useState(false);


    // --- Work Experience Handlers ---
    // (Handlers themselves remain mostly the same logic, but trigger based on isAdmin)
     const handleAddWorkExperience = () => {
         if (!isAdmin) return; // Prevent non-admins from opening form
         setWorkForm({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
         setEditingExperienceIndex('NEW');
     };

     const handleEditWorkExperience = (index) => {
         if (!isAdmin) return; // Prevent non-admins from opening form
         if (!workInfo?.workExperience?.[index]) return;
         const exp = workInfo.workExperience[index];
         const [start = '', end = ''] = exp.duration?.split(' - ') || [];
         const currentlyWorking = end === 'Present';
         setWorkForm({ /* ... as before ... */
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
         setWorkForm({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
     };

     const handleDeleteWorkExperience = async (indexToDelete) => {
         if (!isAdmin) return; // Prevent non-admins from deleting
         setIsSavingWork(true);
         const currentExperiences = workInfo?.workExperience || [];
         const updatedWorkExperiences = currentExperiences.filter((_, index) => index !== indexToDelete);
         // onSaveWork should already contain the permission check, but it's good practice
         const success = await onSaveWork(updatedWorkExperiences);
         if (success) {
             setEditingExperienceIndex(null);
         }
         setIsSavingWork(false);
     };

     const handleSaveCurrentWorkExperience = async () => {
          if (!isAdmin) return; // Prevent non-admins from saving
          // Validation...
          if (!workForm.company || !workForm.position || !workForm.city || !workForm.startYear || (!workForm.currentlyWorking && !workForm.endYear)) {
              alert("Please fill in all required work experience fields.");
              return;
          }
          setIsSavingWork(true);
          // ... (rest of save logic as before) ...
          const workDuration = workForm.currentlyWorking ? `${workForm.startYear} - Present` : `${workForm.startYear} - ${workForm.endYear}`;
          const newExperience = {
            company: workForm.company,
            position: workForm.position,
            city: workForm.city,
            duration: workDuration,
          };
          let updatedWorkExperiences;
          const currentExperiences = workInfo?.workExperience || [];
           if (editingExperienceIndex === 'NEW') { updatedWorkExperiences = [...currentExperiences, newExperience];}
           else if (typeof editingExperienceIndex === 'number') { updatedWorkExperiences = [...currentExperiences]; updatedWorkExperiences[editingExperienceIndex] = newExperience; }
           else { setIsSavingWork(false); return; }
           updatedWorkExperiences.sort((a, b) => { /* ... sort logic ... */
                 const [, endAStr] = a.duration?.split(' - ') || []; const [, endBStr] = b.duration?.split(' - ') || [];
                 const endAYear = endAStr === 'Present' ? Infinity : parseInt(endAStr || '0', 10); const endBYear = endBStr === 'Present' ? Infinity : parseInt(endBStr || '0', 10);
                 return endBYear - endAYear;
           });

          const success = await onSaveWork(updatedWorkExperiences);
          if (success) { handleCancelWorkEdit(); }
          setIsSavingWork(false);
     };

     // --- Education Handlers --- (Apply similar isAdmin checks)
      const handleAddEducation = () => {
          if (!isAdmin) return;
          setEduForm({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
          setEditingEducationIndex('NEW');
      };
      const handleEditEducation = (index) => {
           if (!isAdmin) return;
           if (!eduInfo?.educationDetails?.[index]) return;
           const edu = eduInfo.educationDetails[index];
           setEduForm({ /* ... as before ... */
                institution: edu.institution || '',
                degree: edu.degree || '',
                fieldOfStudy: edu.fieldOfStudy || '',
                graduationYear: edu.graduationYear || '',
           });
           setEditingEducationIndex(index);
      };
       const handleCancelEduEdit = () => {
           setEditingEducationIndex(null);
           setEduForm({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
       };
      const handleDeleteEducation = async (indexToDelete) => {
           if (!isAdmin) return;
           setIsSavingEdu(true);
           const currentEducation = eduInfo?.educationDetails || [];
           const updatedEducationDetails = currentEducation.filter((_, index) => index !== indexToDelete);
           const success = await onSaveEdu(updatedEducationDetails);
           if (success) { setEditingEducationIndex(null); }
           setIsSavingEdu(false);
      };
     const handleSaveCurrentEducation = async () => {
         if (!isAdmin) return;
         // Validation...
         if (!eduForm.institution || !eduForm.degree || !eduForm.fieldOfStudy || !eduForm.graduationYear) {
             alert("Please fill in all required education fields.");
             return;
         }
         setIsSavingEdu(true);
         // ... (rest of save logic as before) ...
          const newEducation = { ...eduForm };
          let updatedEducationDetails;
          const currentEducation = eduInfo?.educationDetails || [];
           if (editingEducationIndex === 'NEW') { updatedEducationDetails = [...currentEducation, newEducation]; }
           else if (typeof editingEducationIndex === 'number') { updatedEducationDetails = [...currentEducation]; updatedEducationDetails[editingEducationIndex] = newEducation;}
           else { setIsSavingEdu(false); return; }
           updatedEducationDetails.sort((a, b) => parseInt(b.graduationYear || '0', 10) - parseInt(a.graduationYear || '0', 10));

          const success = await onSaveEdu(updatedEducationDetails);
          if (success) { handleCancelEduEdit(); }
          setIsSavingEdu(false);
     };


    // Memoized sorted lists (no change needed here)
     const sortedWorkExperiences = useMemo(() => /* ... */[...(workInfo?.workExperience || [])].sort((a, b) => {const [, endAStr] = a.duration?.split(' - ') || []; const [, endBStr] = b.duration?.split(' - ') || []; const endAYear = endAStr === 'Present' ? Infinity : parseInt(endAStr || '0', 10); const endBYear = endBStr === 'Present' ? Infinity : parseInt(endBStr || '0', 10); return endBYear - endAYear;}), [workInfo?.workExperience]);
     const sortedEducationDetails = useMemo(() => /* ... */[...(eduInfo?.educationDetails || [])].sort((a, b) => parseInt(b.graduationYear || '0', 10) - parseInt(a.graduationYear || '0', 10)), [eduInfo?.educationDetails]);

    return (
        <Box mt={3}>
            {/* --- Work Experience Section --- */}
            <SectionTitle>Work Experience</SectionTitle>
            {isLoading ? ( /* ... skeleton ... */ <> <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} /> <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} /> </>
             ) : (
                <>
                 {sortedWorkExperiences.map((experience, index) => (
                      <ItemBox key={`work-${index}`}>
                          <BusinessIcon sx={{ mr: 1, color: 'action.active' }} />
                          <ItemContent> {/* ... content ... */}<Typography variant="subtitle1" fontWeight="bold">{experience.company}</Typography><Typography variant="body2" color="textSecondary">{experience.position} - {experience.city}</Typography><Typography variant="body2" color="textSecondary">Duration: {experience.duration}</Typography></ItemContent>
                          {/* Show Edit button ONLY if admin and not currently editing this one */}
                          {isAdmin && editingExperienceIndex !== index && (
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

                 {/* Add/Edit Work Form - Show only if editing index is set (and implicitly, if admin triggered it) */}
                  {(editingExperienceIndex !== null) && (
                      <WorkExperienceForm
                         formData={workForm}
                         setFormData={setWorkForm}
                         onSave={handleSaveCurrentWorkExperience}
                         onCancel={handleCancelWorkEdit}
                         onDelete={isAdmin && editingExperienceIndex !== 'NEW' ? () => handleDeleteWorkExperience(editingExperienceIndex) : undefined} // Pass delete only if admin & editing existing
                         isSaving={isSavingWork}
                         isNew={editingExperienceIndex === 'NEW'}
                         isAdmin={isAdmin} // Pass admin status to form
                      />
                  )}

                  {/* Add Button - Show only if Admin and no form is open */}
                  {isAdmin && editingExperienceIndex === null && (
                      <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddWorkExperience} disabled={isSavingWork} sx={{ mt: 1 }}>
                          Add Work Experience
                      </Button>
                  )}
                </>
            )}


            {/* --- Education Section --- */}
            <Box mt={5}>
                <SectionTitle>Education (MSc/MBA/PhD etc.)</SectionTitle>
                 {isLoading ? ( /* ... skeleton ... */ <> <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} /> <Skeleton variant="rectangular" height={80} sx={{ mb: 2, borderRadius: '8px' }} /> </>
                 ) : (
                    <>
                     {sortedEducationDetails.map((education, index) => (
                        <ItemBox key={`edu-${index}`}>
                             <SchoolIcon sx={{ mr: 1, color: 'action.active' }} />
                             <ItemContent> {/* ... content ... */}<Typography variant="subtitle1" fontWeight="bold">{education.institution}</Typography><Typography variant="body2" color="textSecondary">{education.degree} in {education.fieldOfStudy}</Typography><Typography variant="body2" color="textSecondary">Graduated: {education.graduationYear}</Typography></ItemContent>
                             {/* Show Edit button ONLY if admin and not currently editing this one */}
                             {isAdmin && editingEducationIndex !== index && (
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
                            onDelete={isAdmin && editingEducationIndex !== 'NEW' ? () => handleDeleteEducation(editingEducationIndex) : undefined} // Pass delete only if admin & editing existing
                            isSaving={isSavingEdu}
                            isNew={editingEducationIndex === 'NEW'}
                            isAdmin={isAdmin} // Pass admin status to form
                         />
                     )}

                     {/* Add Button */}
                     {isAdmin && editingEducationIndex === null && (
                         <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddEducation} disabled={isSavingEdu} sx={{ mt: 1 }}>
                             Add Education
                         </Button>
                     )}
                    </>
                 )}
            </Box>
        </Box>
    );
});


// --- Work Experience Form Component - MODIFIED to accept isAdmin ---
const WorkExperienceForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew, isAdmin }) => { // Added isAdmin

    const handleChange = (e) => { /* ... */ const { name, value, type, checked } = e.target; setFormData(prev => ({...prev, [name]: type === 'checkbox' ? checked : value })); };
    const canSave = isAdmin && formData.company && formData.position && formData.city && formData.startYear && (formData.currentlyWorking || formData.endYear);
    const isDisabled = !isAdmin || isSaving; // Disable all fields if not admin or saving

    return (
        <FormBox>
             <Typography variant="h6" gutterBottom>{isNew ? 'Add New Work Experience' : 'Edit Work Experience'}</Typography>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}><TextField label="Company *" name="company" value={formData.company} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Position *" name="position" value={formData.position} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12}><TextField label="City/Town *" name="city" value={formData.city} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12}><Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>Time Period *</Typography><FormControlLabel control={<Checkbox name="currentlyWorking" checked={formData.currentlyWorking} onChange={handleChange} disabled={isDisabled} />} label="I currently work here" /></Grid>
                <Grid item xs={6}><TextField label="Start Year *" name="startYear" value={formData.startYear} onChange={handleChange} fullWidth margin="dense" disabled={isDisabled} type="number" /></Grid>
                {!formData.currentlyWorking && (<Grid item xs={6}><TextField label="End Year *" name="endYear" value={formData.endYear} onChange={handleChange} fullWidth margin="dense" disabled={isDisabled || !formData.startYear} type="number" inputProps={{ min: formData.startYear || undefined }} /></Grid>)}
            </Grid>
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                <ButtonContainer>
                    <SaveButton variant="contained" onClick={onSave} disabled={isDisabled || !canSave}>
                        {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                    </SaveButton>
                    <CancelButton onClick={onCancel} disabled={isDisabled}>Cancel</CancelButton>
                </ButtonContainer>
                {/* Show Delete button ONLY if admin, not new, and not saving */}
                {isAdmin && !isNew && onDelete && (
                     <Tooltip title="Delete this experience">
                         <IconButton aria-label="delete" onClick={onDelete} disabled={isDisabled} color="error"><DeleteIcon /></IconButton>
                     </Tooltip>
                 )}
            </Box>
        </FormBox>
    );
};


// --- Education Form Component - MODIFIED to accept isAdmin ---
const EducationForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew, isAdmin }) => { // Added isAdmin

     const handleChange = (e) => { /* ... */ const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
     const canSave = isAdmin && formData.institution && formData.degree && formData.fieldOfStudy && formData.graduationYear;
     const isDisabled = !isAdmin || isSaving; // Disable all fields if not admin or saving

    return (
        <FormBox>
             <Typography variant="h6" gutterBottom>{isNew ? 'Add New Education' : 'Edit Education'}</Typography>
             <Grid container spacing={2}>
                <Grid item xs={12}><TextField label="Institution *" name="institution" value={formData.institution} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Degree *" name="degree" value={formData.degree} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Field of Study *" name="fieldOfStudy" value={formData.fieldOfStudy} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} /></Grid>
                <Grid item xs={12} sm={6}><TextField label="Graduation Year *" name="graduationYear" value={formData.graduationYear} onChange={handleChange} fullWidth margin="normal" disabled={isDisabled} type="number"/></Grid>
             </Grid>
            <Box mt={3} display="flex" justifyContent="space-between" alignItems="center">
                 <ButtonContainer>
                     <SaveButton variant="contained" onClick={onSave} disabled={isDisabled || !canSave}>
                         {isSaving ? <CircularProgress size={24} color="inherit" /> : 'Save'}
                     </SaveButton>
                     <CancelButton onClick={onCancel} disabled={isDisabled}>Cancel</CancelButton>
                 </ButtonContainer>
                 {/* Show Delete button ONLY if admin, not new, and not saving */}
                 {isAdmin && !isNew && onDelete && (
                     <Tooltip title="Delete this education entry">
                         <IconButton aria-label="delete" onClick={onDelete} disabled={isDisabled} color="error"><DeleteIcon /></IconButton>
                     </Tooltip>
                 )}
            </Box>
        </FormBox>
    );
};


export default ViewProfile;