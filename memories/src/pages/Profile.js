// src/pages/Profile.js
import React, { useState, useEffect } from 'react';
import { auth, db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import {
    Container,
    Typography,
    TextField,
    Button,
    Avatar,
    Grid,
    Box,
    Tabs,
    Tab,
    Alert,
    Snackbar,
    Slide,
    IconButton,
    InputAdornment,
    Checkbox,
    FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import styled from '@emotion/styled';
import Navbar from '../components/Navbar';
import { useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import BusinessIcon from '@mui/icons-material/Business';
import DescriptionIcon from '@mui/icons-material/Description';
import ContactPhoneIcon from '@mui/icons-material/ContactPhone';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // Success icon
import ErrorIcon from '@mui/icons-material/Error'; // Error icon
import SchoolIcon from '@mui/icons-material/School';
import HomeIcon from '@mui/icons-material/Home';
import InfoIcon from '@mui/icons-material/Info';

const StyledContainer = styled(Container)`
  margin-top: 20px;
`;

const StyledAvatar = styled(Avatar)`
  width: 120px;
  height: 120px;
  margin: 0 auto; /* Center the avatar */
  margin-bottom: 16px;
  font-size: 60px; /* Adjust font size to fit the avatar */
`;

const StyledTabs = styled(Tabs)`
  .MuiTabs-indicator {
    background-color: #673ab7; /* Custom indicator color */
  }
`;

const StyledTab = styled(Tab)`
  color: #757575;
  &.Mui-selected {
    color: #673ab7; /* Selected tab color */
    font-weight: bold;
  }
`;

const ProfileCard = styled(Box)`
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 24px;
  margin-bottom: 24px;
`;

const SectionTitle = styled(Typography)`
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 16px;
  color: #333;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 16px;
`;

const SaveButton = styled(Button)`
  background-color: #673ab7;
  color: #fff;
  &:hover {
    background-color: #512da8;
  }
`;

const CancelButton = styled(Button)`
  color: #757575;
  &:hover {
    background-color: #f5f5f5;
  }
`;

function Profile() {
    const [fullName, setFullName] = useState(''); // Displayed name
    const [email, setEmail] = useState('');
    const [studentId, setStudentId] = useState('');
    const [batch, setBatch] = useState('');
    const [session, setSession] = useState('');
    const [profileBg, setProfileBg] = useState('');

    // States for tab information
    const [contactInfo, setContactInfo] = useState({ phoneNumber: '', facebook: '', linkedin: '', website: '' });
    const [eduInfo, setEduInfo] = useState({ education: '' });
    const [workInfoState, setWorkInfoState] = useState({ workExperience: [] }); // Changed workInfo to workInfoState


    const [placeInfo, setPlaceInfo] = useState({ placesLived: '' });
    const [detailInfo, setDetailInfo] = useState({
        birthdate: '',
        bloodGroup: '',
        fieldOfExpertise: '',
        bio: '',
        aboutYou: ''
    });

    // Edit states for tabs
    // const [isEditingContact, setIsEditingContact] = useState(false); // Removed: Now individual field edit state
    // const [isEditingEdu, setIsEditingEdu] = useState(false);
    // const [isEditingWork, setIsEditingWork] = useState(false);
    // Edit States for Current City and Hometown
    // const [isEditingCurrentCity, setIsEditingCurrentCity] = useState(false); // Removed: Now individual field edit state
    // const [isEditingHometown, setIsEditingHometown] = useState(false); // Removed: Now individual field edit state


    // const [isEditingPlace, setIsEditingPlace] = useState(false); // Removed: Now individual field edit state
    // const [isEditingDetail, setIsEditingDetail] = useState(false); // Removed: Now individual field edit state

    const [editingContactField, setEditingContactField] = useState(null);
    const [editingDetailField, setEditingDetailField] = useState(null);
    const [editingPlaceField, setEditingPlaceField] = useState(null);


    const navigate = useNavigate();
    const [originalData, setOriginalData] = useState({});
    const [activeTab, setActiveTab] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [alertType, setAlertType] = useState('success');
    const [basicInfoAlertOpen, setBasicInfoAlertOpen] = useState(false); // Snackbar for basic info edit attempt

    const [tempFullName, setTempFullName] = useState(''); // Temporary name for editing

    // New states for work experience form
    const [company, setCompany] = useState('');
    const [position, setPosition] = useState('');
    const [city, setCity] = useState('');
    const [currentlyWorking, setCurrentlyWorking] = useState(false);
    const [startYear, setStartYear] = useState('');
    const [endYear, setEndYear] = useState('');

    const [editingExperienceIndex, setEditingExperienceIndex] = useState(null); // State for inline edit

    // New states for education
    const [institution, setInstitution] = useState('');
    const [degree, setDegree] = useState('');
    const [fieldOfStudy, setFieldOfStudy] = useState('');
    const [graduationYear, setGraduationYear] = useState('');
    const [editingEducationIndex, setEditingEducationIndex] = useState(null);
    const [eduInfoState, setEduInfoState] = useState({ educationDetails: [] });

    // States for Current City and Hometown
    const [currentCity, setCurrentCity] = useState('');
    const [hometown, setHometown] = useState('');


    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                const user = auth.currentUser;
                if (user) {
                    const userDocRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setFullName(userData.basicInfo.fullName || '');
                        setEmail(userData.basicInfo.email || '');
                        setStudentId(userData.basicInfo.studentId || '');
                        setBatch(userData.basicInfo.batch || '');
                        setSession(userData.basicInfo.session || '');
                        setProfileBg(userData.basicInfo.profilebg || '');

                        // load the data into the states
                        setContactInfo(userData.contactInfo || { phoneNumber: '', facebook: '', linkedin: '', website: '' });
                        setEduInfo(userData.eduInfo || { education: '' });
                        setWorkInfoState(userData.workInfo || { workExperience: userData.workInfo?.workExperience || [] }); // Changed workInfo to workInfoState
                        setPlaceInfo(userData.placeInfo || { placesLived: '' });
                        setDetailInfo(userData.detailInfo || {
                            birthdate: '',
                            bloodGroup: '',
                            fieldOfExpertise: '',
                            bio: '',
                            aboutYou: ''
                        });
                        setEduInfoState(userData.eduInfo || { educationDetails: userData.eduInfo?.educationDetails || [] });

                        // Load Current City and Hometown
                        setCurrentCity(userData.placeInfo?.currentCity || '');
                        setHometown(userData.placeInfo?.hometown || '');


                        setOriginalData({
                            fullName: userData.basicInfo.fullName || '',
                            email: userData.basicInfo.email || '',
                            studentId: userData.basicInfo.studentId || '',
                            batch: userData.basicInfo.batch || '',
                            session: userData.basicInfo.session || '',
                            profilebg: userData.basicInfo.profilebg || '',
                            contactInfo: userData.contactInfo || { phoneNumber: '', facebook: '', linkedin: '', website: '' },
                            eduInfo: userData.eduInfo || { education: '' },
                            workInfo: userData.workInfo || { workExperience: userData.workInfo?.workExperience || [] },
                            placeInfo: userData.placeInfo || { placesLived: '' },
                            detailInfo: userData.detailInfo || {
                                birthdate: '',
                                bloodGroup: '',
                                fieldOfExpertise: '',
                                bio: '',
                                aboutYou: ''
                            },
                            eduInfoState: userData.eduInfo || { educationDetails: userData.eduInfo?.educationDetails || [] },
                            currentCity: userData.placeInfo?.currentCity || '',
                            hometown: userData.placeInfo?.hometown || '',
                        });
                        setTempFullName(userData.basicInfo.fullName || ''); // initialize temporary full name
                    } else {
                        console.log('No such document!');
                    }
                }
            } catch (error) {
                console.error('Error fetching profile data:', error);
                setError('Failed to load profile data.');
                setAlertType('error');
                setSnackbarOpen(true);
            } finally {
                setLoading(false);
            }
        };

        fetchProfileData();
    }, []);

    const handleSave = async (field, value) => {
        setError('');
        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                let updateData = {};

                switch (field) {
                    case 'fullName':
                        updateData = { 'basicInfo.fullName': tempFullName }; // Save temp name
                        setFullName(tempFullName);  // update display name after saving
                        break;
                    case 'phoneNumber':
                        updateData = { 'contactInfo.phoneNumber': value };
                        setContactInfo({ ...contactInfo, phoneNumber: value });
                        setEditingContactField(null);
                        break;
                    case 'facebook':
                        updateData = { 'contactInfo.facebook': value };
                        setContactInfo({ ...contactInfo, facebook: value });
                        setEditingContactField(null);
                        break;
                    case 'linkedin':
                        updateData = { 'contactInfo.linkedin': value };
                        setContactInfo({ ...contactInfo, linkedin: value });
                        setEditingContactField(null);
                        break;
                    case 'website':
                        updateData = { 'contactInfo.website': value };
                        setContactInfo({ ...contactInfo, website: value });
                        setEditingContactField(null);
                        break;
                    case 'birthdate':
                        updateData = { 'detailInfo.birthdate': value };
                        setDetailInfo({ ...detailInfo, birthdate: value });
                        setEditingDetailField(null);
                        break;
                    case 'bloodGroup':
                        updateData = { 'detailInfo.bloodGroup': value };
                        setDetailInfo({ ...detailInfo, bloodGroup: value });
                        setEditingDetailField(null);
                        break;
                    case 'fieldOfExpertise':
                        updateData = { 'detailInfo.fieldOfExpertise': value };
                        setDetailInfo({ ...detailInfo, fieldOfExpertise: value });
                        setEditingDetailField(null);
                        break;
                    case 'bio':
                        updateData = { 'detailInfo.bio': value };
                        setDetailInfo({ ...detailInfo, bio: value });
                        setEditingDetailField(null);
                        break;
                    case 'aboutYou':
                        updateData = { 'detailInfo.aboutYou': value };
                        setDetailInfo({ ...detailInfo, aboutYou: value });
                        setEditingDetailField(null);
                        break;
                    case 'currentCity':
                        updateData = { 'placeInfo.currentCity': value };
                        setCurrentCity(value);
                        setEditingPlaceField(null);
                        break;
                    case 'hometown':
                        updateData = { 'placeInfo.hometown': value };
                        setHometown(value);
                        setEditingPlaceField(null);
                        break;
                    case 'eduInfo':
                        updateData = { 'eduInfo.educationDetails': eduInfoState.educationDetails };
                        //setIsEditingEdu(false);
                        break;
                    case 'workInfo':
                        updateData = { 'workInfo.workExperience': workInfoState.workExperience }; // Changed workInfo to workInfoState
                        //setIsEditingWork(false);
                        break;

                    default:
                        return; // Exit if invalid field
                }

                await updateDoc(userDocRef, updateData);

                console.log('Profile updated successfully!');
                setSuccessMessage('Profile updated successfully!');
                setAlertType('success');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error updating profile:', err);
            setError('Error updating profile:', err);
            setAlertType('error');
            setSnackbarOpen(true);
        }
    };

    const handleCancel = (field) => {
        switch (field) {
            case 'fullName':
                setTempFullName(originalData.fullName);  // Reset to original name
                break;
            case 'phoneNumber':
                setContactInfo({ ...contactInfo, phoneNumber: originalData.contactInfo.phoneNumber });
                setEditingContactField(null);
                break;
            case 'facebook':
                setContactInfo({ ...contactInfo, facebook: originalData.contactInfo.facebook });
                setEditingContactField(null);
                break;
            case 'linkedin':
                setContactInfo({ ...contactInfo, linkedin: originalData.contactInfo.linkedin });
                setEditingContactField(null);
                break;
            case 'website':
                setContactInfo({ ...contactInfo, website: originalData.contactInfo.website });
                setEditingContactField(null);
                break;
            case 'birthdate':
                setDetailInfo({ ...detailInfo, birthdate: originalData.detailInfo.birthdate });
                setEditingDetailField(null);
                break;
            case 'bloodGroup':
                setDetailInfo({ ...detailInfo, bloodGroup: originalData.detailInfo.bloodGroup });
                setEditingDetailField(null);
                break;
            case 'fieldOfExpertise':
                setDetailInfo({ ...detailInfo, fieldOfExpertise: originalData.detailInfo.fieldOfExpertise });
                setEditingDetailField(null);
                break;
            case 'bio':
                setDetailInfo({ ...detailInfo, bio: originalData.detailInfo.bio });
                setEditingDetailField(null);
                break;
            case 'aboutYou':
                setDetailInfo({ ...detailInfo, aboutYou: originalData.detailInfo.aboutYou });
                setEditingDetailField(null);
                break;
            case 'currentCity':
                setCurrentCity(originalData.currentCity);
                setEditingPlaceField(null);
                break;
            case 'hometown':
                setHometown(originalData.hometown);
                setEditingPlaceField(null);
                break;
            case 'eduInfo':
                setEduInfoState(originalData.eduInfo);
                //setIsEditingEdu(false);
                break;
            case 'workInfo':
                setWorkInfoState(originalData.workInfo); // Changed workInfo to workInfoState
                //setIsEditingWork(false);
                break;
            default:
                break;
        }
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleCloseSnackbar = () => {
        setSnackbarOpen(false);
    };

    const handleEditBasicInfo = () => {
        setBasicInfoAlertOpen(true);
    };

    const handleCloseBasicInfoAlert = () => {
        setBasicInfoAlertOpen(false);
    };

    const renderTextField = (label, value, onChange, isEditing, setIsEditing, fieldName, tabName, adornmentIcon = null, multiline = false, rows = 1, basicInfo = false) => {
        const handleChange = (e) => {

            onChange(e.target.value);

        };


        return (
            <StyledTextField
                label={label}
                value={value}
                onChange={handleChange}
                fullWidth
                multiline={multiline}
                rows={rows}
                variant={isEditing ? "outlined" : "standard"} // Show border only when editing
                InputProps={{
                    readOnly: !isEditing,
                    startAdornment: adornmentIcon ? <InputAdornment position="start">{adornmentIcon}</InputAdornment> : null,
                    style: { border: isEditing ? null : 'none' },
                    endAdornment: (
                        <>
                            {basicInfo ? (
                                <IconButton onClick={handleEditBasicInfo} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                            ) : (
                                <>
                                    {isEditing ? (
                                        <>
                                            <IconButton onClick={() => handleSave(fieldName, value)} aria-label="save">
                                                <SaveIcon />
                                            </IconButton>
                                            <IconButton onClick={() => handleCancel(fieldName)} aria-label="cancel">
                                                <CancelIcon />
                                            </IconButton>
                                        </>
                                    ) : (
                                        <IconButton onClick={() => setIsEditing(fieldName)} aria-label="edit">
                                            <EditIcon />
                                        </IconButton>
                                    )}
                                </>
                            )}

                        </>
                    ),
                }}
            />
        );
    };


    const renderContactField = (label, value, fieldName, adornmentIcon = null, prefix = null) => {
        const isEditing = editingContactField === fieldName;
        return (
            <StyledTextField
                label={label}
                value={value}
                onChange={(e) => setContactInfo({ ...contactInfo, [fieldName]: e.target.value })}
                fullWidth
                variant={isEditing ? "outlined" : "standard"}
                InputProps={{
                    readOnly: !isEditing,
                    startAdornment: (
                        <>
                            {adornmentIcon ? <InputAdornment position="start">{adornmentIcon}</InputAdornment> : null}
                            {prefix && <Typography variant="body1">{prefix}</Typography>}
                        </>
                    ),
                    endAdornment: (
                        <>
                            {isEditing ? (
                                <>
                                    <IconButton onClick={() => handleSave(fieldName, value)} aria-label="save">
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleCancel(fieldName)} aria-label="cancel">
                                        <CancelIcon />
                                    </IconButton>
                                </>
                            ) : (
                                <IconButton onClick={() => setEditingContactField(fieldName)} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                            )}
                        </>
                    ),
                }}
            />
        );
    };

    const renderDetailField = (label, value, fieldName, adornmentIcon = null, multiline = false, rows = 1) => {
        const isEditing = editingDetailField === fieldName;
        return (
            <StyledTextField
                label={label}
                value={value}
                onChange={(e) => setDetailInfo({ ...detailInfo, [fieldName]: e.target.value })}
                fullWidth
                multiline={multiline}
                rows={rows}
                variant={isEditing ? "outlined" : "standard"}
                InputProps={{
                    readOnly: !isEditing,
                    startAdornment: adornmentIcon ? <InputAdornment position="start">{adornmentIcon}</InputAdornment> : null,
                    endAdornment: (
                        <>
                            {isEditing ? (
                                <>
                                    <IconButton onClick={() => handleSave(fieldName, value)} aria-label="save">
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleCancel(fieldName)} aria-label="cancel">
                                        <CancelIcon />
                                    </IconButton>
                                </>
                            ) : (
                                <IconButton onClick={() => setEditingDetailField(fieldName)} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                            )}
                        </>
                    ),
                }}
            />
        );
    };

    const renderPlaceField = (label, value, fieldName, adornmentIcon = null) => {
        const isEditing = editingPlaceField === fieldName;

        return (
            <StyledTextField
                label={label}
                value={value}
                onChange={(e) => {
                    if (fieldName === 'currentCity') {
                        setCurrentCity(e.target.value);
                    } else if (fieldName === 'hometown') {
                        setHometown(e.target.value);
                    }
                }}
                fullWidth
                variant={isEditing ? "outlined" : "standard"}
                InputProps={{
                    readOnly: !isEditing,
                    startAdornment: adornmentIcon ? <InputAdornment position="start">{adornmentIcon}</InputAdornment> : null,
                    endAdornment: (
                        <>
                            {isEditing ? (
                                <>
                                    <IconButton onClick={() => handleSave(fieldName, fieldName === 'currentCity' ? currentCity : hometown)} aria-label="save">
                                        <SaveIcon />
                                    </IconButton>
                                    <IconButton onClick={() => handleCancel(fieldName)} aria-label="cancel">
                                        <CancelIcon />
                                    </IconButton>
                                </>
                            ) : (
                                <IconButton onClick={() => setEditingPlaceField(fieldName)} aria-label="edit">
                                    <EditIcon />
                                </IconButton>
                            )}
                        </>
                    ),
                }}
            />
        );
    };

    const handleAddWorkExperience = () => {
        setCompany('');
        setPosition('');
        setCity('');
        setStartYear('');
        setEndYear('');
        setCurrentlyWorking(false);
        setEditingExperienceIndex('NEW'); // Use a special key for the "new" form
    };

    const handleSaveWorkExperience = async (indexToUpdate = null) => {
        if (!company || !position || !city || !startYear) {
            setError("Company, Position, City/Town and Starting Year are required.");
            setAlertType("error");
            setSnackbarOpen(true);
            return;
        }

        if (!currentlyWorking && !endYear) {
            setError("Ending Year is required if you are not currently working.");
            setAlertType("error");
            setSnackbarOpen(true);
            return;
        }

        const workDuration = currentlyWorking ? `${startYear} - Present` : `${startYear} - ${endYear}`;

        const newWorkExperience = {
            company,
            position,
            city,
            duration: workDuration,
        };

        const updatedWorkExperiences = [...(workInfoState.workExperience || [])];

        if (indexToUpdate === 'NEW') {
            updatedWorkExperiences.push(newWorkExperience);
        } else if (indexToUpdate !== null) {
            updatedWorkExperiences[indexToUpdate] = newWorkExperience;
        }

        setWorkInfoState({ ...workInfoState, workExperience: updatedWorkExperiences });


        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    'workInfo.workExperience': updatedWorkExperiences // Save the entire updated array
                });

                console.log('Work experience saved successfully!');
                setSuccessMessage('Work experience saved successfully!');
                setAlertType('success');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error saving work experience:', err);
            setError('Error saving work experience:', err);
            setAlertType('error');
            setSnackbarOpen(true);
        }

        // Reset form
        setCompany('');
        setPosition('');
        setCity('');
        setCurrentlyWorking(false);
        setStartYear('');
        setEndYear('');
        setEditingExperienceIndex(null); // Clear editing index
    };


    const handleDeleteWorkExperience = async (indexToDelete) => {
        const updatedWorkExperiences = [...(workInfoState.workExperience || [])];
        updatedWorkExperiences.splice(indexToDelete, 1);

        setWorkInfoState({ ...workInfoState, workExperience: updatedWorkExperiences });


        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    'workInfo.workExperience': updatedWorkExperiences // Save the entire updated array
                });

                console.log('Work experience deleted successfully!');
                setSuccessMessage('Work experience deleted successfully!');
                setAlertType('success');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error deleting work experience:', err);
            setError('Error deleting work experience:', err);
            setAlertType('error');
            setSnackbarOpen(true);
        }

        // Reset form and hide it
        setCompany('');
        setPosition('');
        setCity('');
        setCurrentlyWorking(false);
        setStartYear('');
        setEndYear('');
        setEditingExperienceIndex(null);  // Reset editing index after deleting
    };

    const handleEditWorkExperience = (index) => {
        const experience = workInfoState.workExperience[index];

        const [start, end] = experience.duration.split(' - ');
        setCompany(experience.company);
        setPosition(experience.position);
        setCity(experience.city);
        setStartYear(start);
        setEndYear(end === 'Present' ? '' : end);
        setCurrentlyWorking(end === 'Present');
        setEditingExperienceIndex(index);
    };


    const handleCancelEdit = () => {
        setEditingExperienceIndex(null);
        setCompany('');
        setPosition('');
        setCity('');
        setStartYear('');
        setEndYear('');
        setCurrentlyWorking(false);
    };

    const sortedWorkExperiences = [...workInfoState.workExperience].sort((a, b) => {
        if (a.currentlyWorking && !b.currentlyWorking) {
            return -1; // 'a' comes first
        }
        if (!a.currentlyWorking && b.currentlyWorking) {
            return 1; // 'b' comes first
        }

        const yearA = a.duration.split(' - ')[1];
        const yearB = b.duration.split(' - ')[1];

        if (yearA === 'Present' && yearB !== 'Present') {
            return -1; // Put 'Present' on top
        } else if (yearA !== 'Present' && yearB === 'Present') {
            return 1; //Put 'Present' on top
        }
        //If both are present just put it into last or first. doesnot matter.
        else if (yearA === 'Present' && yearB === 'Present') {
            return -1;
        }


        return parseInt(yearB) - parseInt(yearA); // Sort by descending end year
    });

    // Education Logic

    const handleAddEducation = () => {
        setInstitution('');
        setDegree('');
        setFieldOfStudy('');
        setGraduationYear('');
        setEditingEducationIndex('NEW');
    };

    const handleSaveEducation = async (indexToUpdate = null) => {
        if (!institution || !degree || !fieldOfStudy || !graduationYear) {
            setError("Institution, Degree, Field of Study, and Graduation Year are required.");
            setAlertType("error");
            setSnackbarOpen(true);
            return;
        }

        const newEducation = {
            institution,
            degree,
            fieldOfStudy,
            graduationYear,
        };

        const updatedEducationDetails = [...(eduInfoState.educationDetails || [])];

        if (indexToUpdate === 'NEW') {
            updatedEducationDetails.push(newEducation);
        } else if (indexToUpdate !== null) {
            updatedEducationDetails[indexToUpdate] = newEducation;
        }

        setEduInfoState({ ...eduInfoState, educationDetails: updatedEducationDetails });

        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    'eduInfo.educationDetails': updatedEducationDetails
                });

                console.log('Education saved successfully!');
                setSuccessMessage('Education saved successfully!');
                setAlertType('success');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error saving education:', err);
            setError('Error saving education:', err);
            setAlertType('error');
            setSnackbarOpen(true);
        }

        // Reset form
        setInstitution('');
        setDegree('');
        setFieldOfStudy('');
        setGraduationYear('');
        setEditingEducationIndex(null);
    };

    const handleDeleteEducation = async (indexToDelete) => {
        const updatedEducationDetails = [...(eduInfoState.educationDetails || [])];
        updatedEducationDetails.splice(indexToDelete, 1);

        setEduInfoState({ ...eduInfoState, educationDetails: updatedEducationDetails });

        try {
            const user = auth.currentUser;
            if (user) {
                const userDocRef = doc(db, 'users', user.uid);
                await updateDoc(userDocRef, {
                    'eduInfo.educationDetails': updatedEducationDetails
                });

                console.log('Education deleted successfully!');
                setSuccessMessage('Education deleted successfully!');
                setAlertType('success');
                setSnackbarOpen(true);
            }
        } catch (err) {
            console.error('Error deleting education:', err);
            setError('Error deleting education:', err);
            setAlertType('error');
            setSnackbarOpen(true);
        }

        // Reset form and hide it
        setInstitution('');
        setDegree('');
        setFieldOfStudy('');
        setGraduationYear('');
        setEditingEducationIndex(null);
    };

    const handleEditEducation = (index) => {
        const education = eduInfoState.educationDetails[index];
        setInstitution(education.institution);
        setDegree(education.degree);
        setFieldOfStudy(education.fieldOfStudy);
        setGraduationYear(education.graduationYear);
        setEditingEducationIndex(index);
    };

    const handleCancelEditEducation = () => {
        setEditingEducationIndex(null);
        setInstitution('');
        setDegree('');
        setFieldOfStudy('');
        setGraduationYear('');
    };

    const renderEducation = () => {
        return (
            <div>
                {eduInfoState.educationDetails.map((education, index) => (
                    <React.Fragment key={index}>
                        {editingEducationIndex !== index ? (
                            // Display Education
                            <Box mb={2} p={2} border="1px solid #ccc" borderRadius="4px" display="flex" alignItems="center">
                                <SchoolIcon sx={{ mr: 1, ml: 0, fontSize: '28px' }} /> {/* School icon */}
                                <Box ml={1}>
                                    <Typography variant="subtitle1">{education.institution}</Typography>
                                    <Typography variant="body2">{education.degree} in {education.fieldOfStudy}</Typography>
                                    <Typography variant="body2">Graduation Year: {education.graduationYear}</Typography>
                                </Box>
                                <Box ml="auto">
                                    <IconButton aria-label="edit" onClick={() => handleEditEducation(index)}>
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : (
                            // Display Edit Form
                            <Box mt={2} p={2} border="1px solid #ccc" borderRadius="4px" marginBottom={3}>
                                <StyledTextField
                                    label="Institution"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <StyledTextField
                                    label="Degree"
                                    value={degree}
                                    onChange={(e) => setDegree(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <StyledTextField
                                    label="Field of Study"
                                    value={fieldOfStudy}
                                    onChange={(e) => setFieldOfStudy(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <StyledTextField
                                    label="Graduation Year"
                                    value={graduationYear}
                                    onChange={(e) => setGraduationYear(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />

                                <Box mt={2} display="flex" justifyContent="space-between">
                                    <div>
                                        <SaveButton variant="contained" onClick={() => handleSaveEducation(index)} disabled={!institution || !degree || !fieldOfStudy || !graduationYear}>
                                            Save
                                        </SaveButton>
                                        <CancelButton onClick={handleCancelEditEducation}>Cancel</CancelButton>
                                    </div>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleDeleteEducation(index)}
                                        style={{ marginLeft: 'auto' }}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        )}
                    </React.Fragment>
                ))}
                {editingEducationIndex === null && (
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddEducation}
                    >
                        Add Education
                    </Button>
                )}
                {editingEducationIndex === 'NEW' && (
                    <Box mt={2} p={2} border="1px solid #ccc" borderRadius="4px" marginBottom={3}>
                        <StyledTextField
                            label="Institution"
                            value={institution}
                            onChange={(e) => setInstitution(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <StyledTextField
                            label="Degree"
                            value={degree}
                            onChange={(e) => setDegree(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <StyledTextField
                            label="Field of Study"
                            value={fieldOfStudy}
                            onChange={(e) => setFieldOfStudy(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <StyledTextField
                            label="Graduation Year"
                            value={graduationYear}
                            onChange={(e) => setGraduationYear(e.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <Box mt={2} display="flex" justifyContent="space-between">
                            <div>
                                <SaveButton variant="contained" onClick={() => handleSaveEducation('NEW')} disabled={!institution || !degree || !fieldOfStudy || !graduationYear}>
                                    Save
                                </SaveButton>
                                <CancelButton onClick={handleCancelEditEducation}>Cancel</CancelButton>
                            </div>
                        </Box>
                    </Box>
                )}
            </div>
        );
    };

    const renderWorkExperience = () => {
        return (
            <div>
                {sortedWorkExperiences.map((experience, index) => (
                    <React.Fragment key={index}>
                        {editingExperienceIndex !== index ? (
                            // Display Work Experience
                            <Box mb={2} p={2} border="1px solid #ccc" borderRadius="4px" display="flex" alignItems="center"> {/* Adjusted the display */}
                                <BusinessIcon sx={{ mr: 1, ml: 0, fontSize: '28px' }} /> {/* Job icon */}
                                <Box ml={1}> {/* Add some left margin between the icon and the text */}
                                    <Typography variant="subtitle1">{experience.company}</Typography>
                                    <Typography variant="body2">{experience.position} - {experience.city}</Typography>
                                    <Typography variant="body2">Duration: {experience.duration}</Typography>
                                </Box>
                                <Box ml="auto"> {/* Push the edit button to the right */}
                                    <IconButton aria-label="edit" onClick={() => handleEditWorkExperience(index)}>
                                        <EditIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        ) : (
                            // Display Edit Form
                            <Box mt={2} p={2} border="1px solid #ccc" borderRadius="4px" marginBottom={3}> {/* Added marginBottom */}
                                <StyledTextField
                                    label="Company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <StyledTextField
                                    label="Position"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />
                                <StyledTextField
                                    label="City/Town"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                />

                                <Typography variant="subtitle1">Time duration</Typography>
                                <FormControlLabel
                                    control={<Checkbox checked={currentlyWorking} onChange={(e) => setCurrentlyWorking(e.target.checked)} />}
                                    label="Currently working"
                                />

                                <Grid container spacing={2} alignItems="center">
                                    <Grid item xs={6}>
                                        <StyledTextField
                                            label="Starting Year"
                                            value={startYear}
                                            onChange={(e) => setStartYear(e.target.value)}
                                            fullWidth
                                            margin="normal"
                                            required /* Make Starting Year mandatory */
                                        />
                                    </Grid>
                                    {!currentlyWorking && (
                                        <Grid item xs={6}>
                                            <StyledTextField
                                                label="Ending Year"
                                                value={endYear}
                                                onChange={(e) => setEndYear(e.target.value)}
                                                fullWidth
                                                margin="normal"
                                                required /* Make Ending Year mandatory when not currently working */
                                            />
                                        </Grid>
                                    )}
                                </Grid>

                                <Box mt={2} display="flex" justifyContent="space-between">
                                    <div>
                                        <SaveButton variant="contained" onClick={() => handleSaveWorkExperience(index)} disabled={!company || !position || !city || !startYear || (!currentlyWorking && !endYear)}>
                                            Save
                                        </SaveButton>
                                        <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
                                    </div>
                                    <IconButton
                                        aria-label="delete"
                                        onClick={() => handleDeleteWorkExperience(index)}
                                        style={{ marginLeft: 'auto' }}  // Push to the right
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Box>
                        )}
                    </React.Fragment>
                ))}
                {editingExperienceIndex === null && (  /* Only show the button when *not* editing */
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={handleAddWorkExperience}
                    >
                        Add another workspace
                    </Button>
                )}
                {editingExperienceIndex === 'NEW' && (
                    <Box mt={2} p={2} border="1px solid #ccc" borderRadius="4px" marginBottom={3}> {/* Added marginBottom */}
                        <StyledTextField
                            label="Company"
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <StyledTextField
                            label="Position"
                            value={position}
                            onChange={(e) => setPosition(e.target.value)}
                            fullWidth
                            margin="normal"
                        />
                        <StyledTextField
                            label="City/Town"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            fullWidth
                            margin="normal"
                        />

                        <Typography variant="subtitle1">Time duration</Typography>
                        <FormControlLabel
                            control={<Checkbox checked={currentlyWorking} onChange={(e) => setCurrentlyWorking(e.target.checked)} />}
                            label="Currently working"
                        />

                        <Grid container spacing={2} alignItems="center">
                            <Grid item xs={6}>
                                <StyledTextField
                                    label="Starting Year"
                                    value={startYear}
                                    onChange={(e) => setStartYear(e.target.value)}
                                    fullWidth
                                    margin="normal"
                                    required /* Make Starting Year mandatory */
                                />
                            </Grid>
                            {!currentlyWorking && (
                                <Grid item xs={6}>
                                    <StyledTextField
                                        label="Ending Year"
                                        value={endYear}
                                        onChange={(e) => setEndYear(e.target.value)}
                                        fullWidth
                                        margin="normal"
                                        required /* Make Ending Year mandatory when not currently working */
                                    />
                                </Grid>
                            )}
                        </Grid>

                        <Box mt={2} display="flex" justifyContent="space-between">
                            <div>
                                <SaveButton variant="contained" onClick={() => handleSaveWorkExperience('NEW')} disabled={!company || !position || !city || !startYear || (!currentlyWorking && !endYear)}>
                                    Save
                                </SaveButton>
                                <CancelButton onClick={handleCancelEdit}>Cancel</CancelButton>
                            </div>

                        </Box>
                    </Box>
                )}
            </div>
        );
    };


    // Render the Work and Education tab
    const renderWorkAndEducationTab = () => (
        <Box mt={3}>
            <SectionTitle>Work Experience</SectionTitle>
            {renderWorkExperience()}

            <Box mt={3}><SectionTitle>MSc/ MBA/ PhD (If any)</SectionTitle>
                {renderEducation()}
            </Box>
        </Box>
    );

    const renderPlacesLivedTab = () => (
        <Box mt={3}>
            <SectionTitle>Places Lived</SectionTitle>
            {renderPlaceField(
                'Current City',
                currentCity,
                'currentCity',
                <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
            )}
            {renderPlaceField(
                'Hometown',
                hometown,
                'hometown',
                <HomeIcon sx={{ mr: 1, color: 'action.active' }} />
            )}
        </Box>
    );

    const renderContactTab = () => (
        <Box mt={3}>
            <SectionTitle>Contact Information</SectionTitle>
            {renderContactField(
                'Phone Number',
                contactInfo.phoneNumber,
                'phoneNumber',
                <ContactPhoneIcon sx={{ mr: 1, color: 'action.active' }} />
            )}
            {renderContactField(
                'Facebook',
                contactInfo.facebook,
                'facebook',
                <LinkIcon sx={{ mr: 1, color: 'action.active' }}/>,
                'https://facebook.com/' // Added prefix
            )}
            {renderContactField(
                'LinkedIn',
                contactInfo.linkedin,
                'linkedin',
                <LinkIcon sx={{ mr: 1, color: 'action.active' }}/>,
                'https://linkedin.com/in/' // Added prefix
            )}
            {renderContactField(
                'Website',
                contactInfo.website,
                'website',
                <LinkIcon sx={{ mr: 1, color: 'action.active' }}/>,
                'https://' // Added prefix
            )}
        </Box>
    );

    const renderDetailsTab = () => (
        <Box mt={3}>
            <SectionTitle>Details</SectionTitle>
            {renderDetailField(
                'Birthdate',
                detailInfo.birthdate,
                'birthdate',
                <InfoIcon sx={{ mr: 1, color: 'action.active' }}/>
            )}
            {renderDetailField(
                'Blood group',
                detailInfo.bloodGroup,
                'bloodGroup',
                <InfoIcon sx={{ mr: 1, color: 'action.active' }}/>
            )}
            {renderDetailField(
                'Field of Expertise',
                detailInfo.fieldOfExpertise,
                'fieldOfExpertise',
                <InfoIcon sx={{ mr: 1, color: 'action.active' }}/>
            )}
            {renderDetailField(
                'Bio',
                detailInfo.bio,
                'bio',
                <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />,
                true, // multiline
                4 // Rows
            )}
            {renderDetailField(
                'About you',
                detailInfo.aboutYou,
                'aboutYou',
                <DescriptionIcon sx={{ mr: 1, color: 'action.active' }} />,
                true, // multiline
                4 // Rows
            )}
        </Box>
    );


    if (loading) {
        return <Loader />;
    }

    return (
        <>
            <Navbar />
            <StyledContainer maxWidth="md">
                <Typography variant="h4" align="center" gutterBottom>
                    Your Profile
                </Typography>

                <ProfileCard>
                    <StyledTabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs" centered>
                        <StyledTab label="Basic Info" />
                        <StyledTab label="Work & Edu" />
                        <StyledTab label="Places Lived" />
                        <StyledTab label="Contact" />
                        <StyledTab label="Details" />
                    </StyledTabs>

                    {activeTab === 0 && (
                        <Box mt={3}>
                            <SectionTitle>Basic Information</SectionTitle>
                            {renderTextField(
                                'Full Name',
                                fullName,
                                () => {
                                }, // Removed direct fullName update here
                                false,
                                () => {
                                },
                                'fullName',
                                '',
                                null,
                                false,
                                1,
                                true
                            )}
                            {renderTextField(
                                'Email',
                                email,
                                () => {
                                }, // Removed direct Email update here
                                false,
                                () => {
                                },
                                'email',
                                '',
                                null,
                                false,
                                1,
                                true
                            )}
                            {renderTextField(
                                'Student ID',
                                studentId,
                                () => {
                                }, // Removed direct Email update here
                                false,
                                () => {
                                },
                                'StudentId',
                                '',
                                null,
                                false,
                                1,
                                true
                            )}
                            {renderTextField(
                                'Batch',
                                batch,
                                () => {
                                }, // Removed direct batch update here
                                false,
                                () => {
                                },
                                'Batch',
                                '',
                                null,
                                false,
                                1,
                                true
                            )}
                            {renderTextField(
                                'Session',
                                session,
                                () => {
                                }, // Removed direct session update here
                                false,
                                () => {
                                },
                                'Session',
                                '',
                                null,
                                false,
                                1,
                                true
                            )}


                        </Box>
                    )}

                    {activeTab === 1 && renderWorkAndEducationTab()}

                    {/* Places Lived Tab */}
                    {activeTab === 2 && renderPlacesLivedTab()}

                    {activeTab === 3 && renderContactTab()}

                    {activeTab === 4 && renderDetailsTab()}


                </ProfileCard>
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    TransitionComponent={Slide}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert
                        onClose={handleCloseSnackbar}
                        severity={alertType}
                        sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        icon={alertType === 'success' ? <CheckCircleIcon fontSize="inherit" /> :
                            <ErrorIcon fontSize="inherit" />} // Conditional Icon
                    >
                        {successMessage || error}

                    </Alert>
                </Snackbar>

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
                        sx={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                        }}

                    >
                        These fields cannot be edited directly. Please contact the administrator for assistance.
                    </Alert>
                </Snackbar>

            </StyledContainer>
        </>
    );
}

export default Profile;