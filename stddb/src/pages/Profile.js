/* eslint-disable no-unused-vars */
 /* eslint-disable react-hooks/exhaustive-deps */
 import React, { useState, useEffect, useCallback, useMemo } from 'react';
 import { useAuth } from '../context/AuthContext';
 import { auth, db } from '../firebase';
 import { doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
 import { useNavigate } from 'react-router-dom';

 // MUI Components
 import Box from '@mui/material/Box';
 import Typography from '@mui/material/Typography';
 import CircularProgress from '@mui/material/CircularProgress';
 import Alert from '@mui/material/Alert';
 import Paper from '@mui/material/Paper';
 import Avatar from '@mui/material/Avatar';
 import Snackbar from '@mui/material/Snackbar';
 import Tooltip from '@mui/material/Tooltip';
 import { useTheme } from '@mui/material/styles';
 import IconButton from '@mui/material/IconButton';
 import Grid from '@mui/material/Grid';
 import TextField from '@mui/material/TextField';
 import Button from '@mui/material/Button';
 import InputAdornment from '@mui/material/InputAdornment';
 import Checkbox from '@mui/material/Checkbox';
 import FormControlLabel from '@mui/material/FormControlLabel';
 import Tabs from '@mui/material/Tabs';
 import Tab from '@mui/material/Tab';
 import Stack from '@mui/material/Stack';
 import Chip from '@mui/material/Chip';
 import Divider from '@mui/material/Divider';
 import CssBaseline from '@mui/material/CssBaseline';

 // MUI Icons
 import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
 import VerifiedUserOutlinedIcon from '@mui/icons-material/VerifiedUserOutlined';
 import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
 import BadgeOutlinedIcon from '@mui/icons-material/BadgeOutlined';
 import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
 import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
 import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
 import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined';
 import SaveIcon from '@mui/icons-material/Save';
 import CancelIcon from '@mui/icons-material/Cancel';
 import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
 import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
 import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
 import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
 import ContactPhoneOutlinedIcon from '@mui/icons-material/ContactPhoneOutlined';
 import LinkOutlinedIcon from '@mui/icons-material/LinkOutlined';
 import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
 import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
 import CheckCircleIcon from '@mui/icons-material/CheckCircle';
 import ErrorIcon from '@mui/icons-material/Error';
 import AccountBoxOutlinedIcon from '@mui/icons-material/AccountBoxOutlined';
 import WorkOutlineOutlinedIcon from '@mui/icons-material/WorkOutlineOutlined';
 import PlaceOutlinedIcon from '@mui/icons-material/PlaceOutlined';
 import ContactMailOutlinedIcon from '@mui/icons-material/ContactMailOutlined';
 import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

 // --- Helper Functions ---
 const formatDisplayValue = (value, isDate = false) => { if (value === undefined || value === null || value === '') { return <Typography variant="body2" color="text.secondary" component="span" sx={{ fontStyle: 'italic' }}>Not specified</Typography>; } if (isDate && value instanceof Timestamp) { try { return value.toDate().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { console.error("Error converting Timestamp:", e, value); return <Typography variant="body2" color="error" component="span">Invalid Date</Typography>; } } if (value instanceof Date) { try { return value.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { console.error("Error converting Date:", e, value); return <Typography variant="body2" color="error" component="span">Invalid Date</Typography>; } } return value; };
 const getInitials = (name) => { if (!name || typeof name !== 'string' || name.trim() === "") return '?'; const nameParts = name.trim().split(' ').filter(Boolean); if (nameParts.length >= 2) return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase(); if (nameParts.length === 1 && nameParts[0].length > 0) return nameParts[0][0].toUpperCase(); return '?'; };
 function debounce(func, wait) { let timeout; return function executedFunction(...args) { const later = () => { clearTimeout(timeout); func(...args); }; clearTimeout(timeout); timeout = setTimeout(later, wait); }; }

 // --- Reusable Components ---
 const EditableField = React.memo(({
     label, value, fieldName, onSave,
     IconComponent, multiline = false, rows = 1,
     readOnly = false, prefix = null, disabled = false, placeholder = `Enter ${label.toLowerCase()}`
 }) => {
     const [isEditing, setIsEditing] = useState(false); const [currentValue, setCurrentValue] = useState(value); const [isSaving, setIsSaving] = useState(false); const theme = useTheme();
     useEffect(() => { setCurrentValue(value); }, [value]);
     const handleEditClick = () => !readOnly && !disabled && setIsEditing(true);
     const handleCancelClick = () => { setCurrentValue(value); setIsEditing(false); }; const handleChange = (e) => setCurrentValue(e.target.value);
     const handleSaveClick = async () => { if (currentValue === value) { setIsEditing(false); return; } setIsSaving(true); try { await onSave(fieldName, currentValue); setIsEditing(false); } catch (error) { console.error("Save failed:", error); } finally { setIsSaving(false); } };
     const handleKeyDown = (e) => { if (e.key === 'Enter' && !multiline && isEditing) { e.preventDefault(); handleSaveClick(); } else if (e.key === 'Escape' && isEditing) handleCancelClick(); };
     const formattedDisplayValue = formatDisplayValue(value); // Display original value until saved
     return (
        // Apply padding directly here for consistency, esp. on mobile
         <Box onClick={!isEditing ? handleEditClick : undefined} sx={{ position: 'relative', py: 1, px: { xs: 2, sm: 0 }, display: 'flex', alignItems: 'center', cursor: (readOnly || disabled || isEditing) ? 'default' : 'pointer', borderBottom: `1px solid var(--color-border, ${theme.palette.divider})`, '&:last-of-type': { borderBottom: 'none' }, transition: 'background-color 0.2s ease', '&:hover': { backgroundColor: (readOnly || disabled || isEditing) ? 'transparent' : 'action.hover', '& .edit-action-icon': { opacity: 1 } }, minHeight: '56px', }}>
             {IconComponent && ( <Box sx={{ mr: 2, color: 'action.active', display: 'flex', alignItems: 'center' }}> <IconComponent sx={{ fontSize: '1.3rem' }} /> </Box> )}
             <Box sx={{ flexGrow: 1 }}>
                 {!isEditing ? ( <> <Typography variant="caption" color="text.secondary" display="block" sx={{ lineHeight: 1.2, mb: 0.2 }}>{label}</Typography> <Typography variant="body1" component="div" sx={{ fontWeight: 500, color: 'text.primary', wordBreak: 'break-word', whiteSpace: multiline ? 'pre-wrap' : 'normal' }}> {formattedDisplayValue} </Typography> </> ) : ( <TextField placeholder={placeholder} value={currentValue ?? ''} onChange={handleChange} onKeyDown={handleKeyDown} fullWidth multiline={multiline} rows={rows} variant="outlined" size="small" autoFocus disabled={disabled || isSaving || readOnly} sx={{ '& .MuiInputBase-root': { backgroundColor: 'var(--color-surface-variant, #f8f9fa)' } }} /> )}
             </Box>
             {!readOnly && !disabled && ( <Box sx={{ ml: 1 }}> {isEditing ? ( <Stack direction="row" spacing={0.5}> <Tooltip title="Save"> <span> <IconButton onClick={handleSaveClick} size="small" disabled={isSaving || currentValue === value} color="primary"> {isSaving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon fontSize="small" />} </IconButton> </span> </Tooltip> <Tooltip title="Cancel"> <IconButton onClick={handleCancelClick} size="small" disabled={isSaving}> <CancelIcon fontSize="small" /> </IconButton> </Tooltip> </Stack> ) : ( <Tooltip title="Edit"> <IconButton size="small" onClick={handleEditClick} className="edit-action-icon" sx={{ opacity: 0, transition: 'opacity 0.2s ease' }}> <EditOutlinedIcon fontSize="small" /> </IconButton> </Tooltip> )} </Box> )}
         </Box> );
 });

 const ItemBox = ({
     children, onEdit, onDelete, isEditing, isSaving }) => {
     const theme = useTheme(); return (
         <Box sx={{
            // Apply responsive padding
             p: { xs: 1.5, sm: 2 },
             mb: 1.5, display: 'flex', alignItems: 'flex-start', border: `1px solid var(--color-border, ${theme.palette.divider})`, borderRadius: 'var(--border-radius-medium, 8px)', bgcolor: 'var(--color-surface, #fff)', position: 'relative', overflow: 'hidden', transition: 'box-shadow 0.2s ease', '&:hover': { boxShadow: 'var(--mui-shadows-2)', '& .item-actions': { opacity: 1, transform: 'translateX(0)', } } }}>
             <Box sx={{ flexGrow: 1, mr: 1 }}>{children}</Box>
             {!isEditing && (onEdit || onDelete) && ( <Stack direction="row" spacing={0.5} className="item-actions" sx={{ position: { xs: 'relative', sm: 'absolute' }, top: { sm: theme.spacing(1.5) }, right: { sm: theme.spacing(1.5) }, opacity: { xs: 1, sm: 0 }, transform: { sm: 'translateX(10px)' }, transition: 'opacity 0.2s ease, transform 0.2s ease', backgroundColor: 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(2px)', borderRadius: 'var(--border-radius-small, 4px)', p: 0.5, }}> {onEdit && ( <Tooltip title="Edit"> <IconButton size="small" onClick={onEdit} disabled={isSaving}> <EditOutlinedIcon fontSize="small" /> </IconButton> </Tooltip> )} {onDelete && ( <Tooltip title="Delete"> <IconButton size="small" onClick={onDelete} disabled={isSaving} color="error"> <DeleteOutlineIcon fontSize="small" /> </IconButton> </Tooltip> )} </Stack> )}
         </Box> );
 };

 const FormContainer = ({ children, title, ...props }) => (
     <Box component={Paper} elevation={0} variant="outlined" sx={{
        mt: 2,
        // Apply responsive padding
        px: { xs: 2, sm: 3 },
        py: { xs: 2, sm: 3 },
        borderRadius: 'var(--border-radius-medium, 8px)', mb: 3, bgcolor: 'var(--color-surface-variant, #f8f9fa)' }} {...props}>
         <Typography variant="h6" sx={{ mb: 2.5, fontSize: '1.1rem', fontWeight: 600 }}>{title}</Typography>
         {children}
     </Box> );

 // WorkExperienceForm & EducationForm remain unchanged structurally, but benefit from FormContainer's responsive padding

 const WorkExperienceForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew }) => { const handleChange = (e) => { const { name, value, type, checked } = e.target; setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value })); }; const canSave = formData.company && formData.position && formData.city && formData.startYear && (formData.currentlyWorking || formData.endYear); return ( <FormContainer title={isNew ? 'Add Work Experience' : 'Edit Work Experience'}> <Grid container spacing={2}> <Grid item xs={12} sm={6}> <TextField label="Company *" name="company" value={formData.company ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12} sm={6}> <TextField label="Position *" name="position" value={formData.position ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12}> <TextField label="City/Town *" name="city" value={formData.city ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12} sx={{ pt: '16px !important' }}> <FormControlLabel control={<Checkbox name="currentlyWorking" checked={formData.currentlyWorking ?? false} onChange={handleChange} disabled={isSaving} size="small"/>} label="I currently work here" /> </Grid> <Grid item xs={6}> <TextField label="Start Year *" name="startYear" value={formData.startYear ?? ''} onChange={handleChange} fullWidth disabled={isSaving} type="number" size="small" variant="filled" hiddenLabel/> </Grid> {!formData.currentlyWorking && ( <Grid item xs={6}> <TextField label="End Year *" name="endYear" value={formData.endYear ?? ''} onChange={handleChange} fullWidth disabled={isSaving || !formData.startYear} type="number" inputProps={{ min: formData.startYear || undefined }} size="small" variant="filled" hiddenLabel/> </Grid> )} </Grid> <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3} spacing={1}> <Stack direction="row" spacing={1}> <Button variant="contained" onClick={onSave} disabled={isSaving || !canSave} size="small" startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}> Save </Button> <Button onClick={onCancel} disabled={isSaving} size="small" variant="outlined" color="secondary">Cancel</Button> </Stack> {!isNew && onDelete && ( <Tooltip title="Delete This Entry"> <IconButton onClick={onDelete} disabled={isSaving} color="error" size="small"> <DeleteOutlineIcon fontSize="small"/> </IconButton> </Tooltip> )} </Stack> </FormContainer> ); };
 const EducationForm = ({ formData, setFormData, onSave, onCancel, onDelete, isSaving, isNew }) => { const handleChange = (e) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); }; const canSave = formData.institution && formData.degree && formData.fieldOfStudy && formData.graduationYear; return ( <FormContainer title={isNew ? 'Add Education' : 'Edit Education'}> <Grid container spacing={2}> <Grid item xs={12}> <TextField label="Institution *" name="institution" value={formData.institution ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12} sm={6}> <TextField label="Degree *" name="degree" value={formData.degree ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12} sm={6}> <TextField label="Field of Study *" name="fieldOfStudy" value={formData.fieldOfStudy ?? ''} onChange={handleChange} fullWidth disabled={isSaving} size="small" variant="filled" hiddenLabel/> </Grid> <Grid item xs={12} sm={6}> <TextField label="Graduation Year *" name="graduationYear" value={formData.graduationYear ?? ''} onChange={handleChange} fullWidth disabled={isSaving} type="number" size="small" variant="filled" hiddenLabel/> </Grid> </Grid> <Stack direction="row" justifyContent="space-between" alignItems="center" mt={3} spacing={1}> <Stack direction="row" spacing={1}> <Button variant="contained" onClick={onSave} disabled={isSaving || !canSave} size="small" startIcon={isSaving ? <CircularProgress size={16} color="inherit" /> : null}> Save </Button> <Button onClick={onCancel} disabled={isSaving} size="small" variant="outlined" color="secondary">Cancel</Button> </Stack> {!isNew && onDelete && ( <Tooltip title="Delete This Entry"> <IconButton onClick={onDelete} disabled={isSaving} color="error" size="small"> <DeleteOutlineIcon fontSize="small"/> </IconButton> </Tooltip> )} </Stack> </FormContainer> ); };


 /**
  * Profile Page Component
  */
 const Profile = () => {
   const theme = useTheme();
   const { currentUser } = useAuth();
   const navigate = useNavigate();

   // --- State ---
   const [basicInfo, setBasicInfo] = useState(null);
   const [contactInfo, setContactInfo] = useState(null);
   const [eduInfo, setEduInfo] = useState(null);
   const [workInfo, setWorkInfo] = useState(null);
   const [placeInfo, setPlaceInfo] = useState(null);
   const [detailInfo, setDetailInfo] = useState(null);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState('');
   const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
   const [activeTab, setActiveTab] = useState(0);
   const [editingExperienceIndex, setEditingExperienceIndex] = useState(null);
   const [workForm, setWorkForm] = useState({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false });
   const [isSavingWork, setIsSavingWork] = useState(false);
   const [editingEducationIndex, setEditingEducationIndex] = useState(null);
   const [eduForm, setEduForm] = useState({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' });
   const [isSavingEdu, setIsSavingEdu] = useState(false);

   // --- Constants & Defaults ---
   const defaultValues = useMemo(() => ({
         basicInfo: { fullName: 'User', email: '', studentId: '', session: '', profileBgColor: theme.palette.primary.light, profileImageUrl: null, bannerImageUrl: '/images/default-banner.jpg', emailVerified: false, createdAt: null, uid: '' },
         contactInfo: { phoneNumber: '', facebook: '', linkedin: '', website: '' },
         eduInfo: { educationDetails: [] },
         workInfo: { workExperience: [] },
         placeInfo: { currentCity: '', hometown: '' },
         detailInfo: { birthdate: null, bloodGroup: '', fieldOfExpertise: '', bio: '', aboutYou: '' }
   }), [theme.palette.primary.light]);
   const avatarSize = { xs: 80, sm: 100, md: 120 };

   // --- Fetching Logic (unchanged) ---
   useEffect(() => {
     let isMounted = true;
     const fetchUserProfile = async () => {
         if (!currentUser?.uid) { if (isMounted) { setError("Not logged in."); setLoading(false); } return; }
         setError('');
         try {
             const userDocRef = doc(db, "users", currentUser.uid);
             const docSnap = await getDoc(userDocRef);
             if (isMounted) {
                 const initialBasic = { ...defaultValues.basicInfo, fullName: currentUser.displayName || defaultValues.basicInfo.fullName, email: currentUser.email || defaultValues.basicInfo.email, emailVerified: currentUser.emailVerified, uid: currentUser.uid, createdAt: currentUser.metadata?.creationTime ? Timestamp.fromDate(new Date(currentUser.metadata.creationTime)) : null };
                 if (docSnap.exists()) {
                     const data = docSnap.data();
                     const dbBasic = data.basicInfo || {}; const dbMeta = data.metadata || {}; const dbEdu = data.eduInfo || {}; const dbWork = data.workInfo || {}; const dbContact = data.contactInfo || {}; const dbPlace = data.placeInfo || {}; const dbDetail = data.detailInfo || {};
                     setBasicInfo({ ...initialBasic, ...dbBasic, createdAt: dbMeta.createdAt || dbBasic.createdAt || initialBasic.createdAt });
                     setContactInfo({ ...defaultValues.contactInfo, ...dbContact });
                     setEduInfo({ ...defaultValues.eduInfo, educationDetails: Array.isArray(dbEdu.educationDetails) ? dbEdu.educationDetails : [] });
                     setWorkInfo({ ...defaultValues.workInfo, workExperience: Array.isArray(dbWork.workExperience) ? dbWork.workExperience : [] });
                     setPlaceInfo({ ...defaultValues.placeInfo, ...dbPlace });
                     setDetailInfo({ ...defaultValues.detailInfo, ...dbDetail });
                 } else {
                      setError('Profile data not found. Please fill in details.');
                      setBasicInfo(initialBasic); setContactInfo(defaultValues.contactInfo); setEduInfo(defaultValues.eduInfo); setWorkInfo(defaultValues.workInfo); setPlaceInfo(defaultValues.placeInfo); setDetailInfo(defaultValues.detailInfo);
                 }
             }
         } catch (err) {
             console.error("Error fetching profile:", err);
             if (isMounted) setError('Failed to load profile data.');
         } finally {
             if (isMounted) setLoading(false);
         }
     };
     fetchUserProfile();
     return () => { isMounted = false; };
   }, [currentUser, defaultValues]);

   // --- Save Handlers & Callbacks (unchanged) ---
    const showSnackbar = (message, severity = 'success') => { setSnackbar({ open: true, message, severity }); };
    const handleSaveField = useCallback(async (fieldName, value) => {
         setSnackbar(prev => ({ ...prev, open: false })); if (!currentUser?.uid) { showSnackbar("User not authenticated.", "error"); return; }
         const userDocRef = doc(db, 'users', currentUser.uid); let updateData = {}; let stateUpdateFunc = null;
         if (contactInfo && fieldName in contactInfo) { updateData[`contactInfo.${fieldName}`] = value; stateUpdateFunc = setContactInfo; }
         else if (placeInfo && fieldName in placeInfo) { updateData[`placeInfo.${fieldName}`] = value; stateUpdateFunc = setPlaceInfo; }
         else if (detailInfo && fieldName in detailInfo) { updateData[`detailInfo.${fieldName}`] = value; stateUpdateFunc = setDetailInfo; }
         else { console.error("Unknown field:", fieldName); showSnackbar(`Error: Cannot update '${fieldName}'`, 'error'); return; }
         try { await updateDoc(userDocRef, updateData); if (stateUpdateFunc) { stateUpdateFunc(prev => prev ? ({ ...prev, [fieldName]: value }) : null); } showSnackbar('Profile updated!', 'success'); }
         catch (err) { console.error('Error updating field:', fieldName, err); showSnackbar(`Error updating profile: ${err.message}`, 'error'); throw err; }
    }, [currentUser, contactInfo, placeInfo, detailInfo]);
    const handleSaveWorkExperienceList = useCallback(async (updatedExperiences) => {
         const sortedExperiences = [...(updatedExperiences || [])].sort((a, b) => { const getEndYear = (d) => { if (!d) return 0; const p = d.split(' - '); const e = p[1]?.trim(); return e === 'Present' ? Infinity : parseInt(e || '0', 10); }; return getEndYear(b.duration) - getEndYear(a.duration); });
         if (!currentUser?.uid) { showSnackbar('Not authenticated', 'error'); return false; } setIsSavingWork(true); const userDocRef = doc(db, 'users', currentUser.uid);
         try { await updateDoc(userDocRef, { 'workInfo.workExperience': sortedExperiences }); setWorkInfo(prev => ({ ...prev, workExperience: sortedExperiences })); showSnackbar('Work experience updated.', 'success'); return true; }
         catch (err) { console.error('Error saving work:', err); showSnackbar(`Error saving work: ${err.message}`, 'error'); return false; }
         finally { setIsSavingWork(false); }
    }, [currentUser]);
    const handleSaveEducationList = useCallback(async (updatedEducation) => {
        const sortedEducation = [...(updatedEducation || [])].sort((a, b) => parseInt(b.graduationYear || '0', 10) - parseInt(a.graduationYear || '0', 10) );
        if (!currentUser?.uid) { showSnackbar('Not authenticated', 'error'); return false; } setIsSavingEdu(true); const userDocRef = doc(db, 'users', currentUser.uid);
        try { await updateDoc(userDocRef, { 'eduInfo.educationDetails': sortedEducation }); setEduInfo(prev => ({ ...prev, educationDetails: sortedEducation })); showSnackbar('Education updated.', 'success'); return true; }
        catch (err) { console.error('Error saving edu:', err); showSnackbar(`Error saving education: ${err.message}`, 'error'); return false; }
        finally { setIsSavingEdu(false); }
    }, [currentUser]);

    // --- Work/Edu Add/Edit/Cancel/Delete Handlers (unchanged) ---
    const handleAddWorkExperience = () => { setWorkForm({ company: '', position: '', city: '', startYear: '', endYear: '', currentlyWorking: false }); setEditingExperienceIndex('NEW'); };
    const handleEditWorkExperience = (index) => { if (!workInfo?.workExperience?.[index]) return; const exp = workInfo.workExperience[index]; const [start = '', end = ''] = exp.duration?.split(' - ') || []; const currentlyWorking = end.trim() === 'Present'; setWorkForm({ company: exp.company || '', position: exp.position || '', city: exp.city || '', startYear: start.trim(), endYear: currentlyWorking ? '' : end.trim(), currentlyWorking: currentlyWorking, }); setEditingExperienceIndex(index); };
    const handleCancelWorkEdit = () => { setEditingExperienceIndex(null); };
    const handleDeleteWorkExperience = async (indexToDelete) => { if (typeof indexToDelete !== 'number' || !workInfo?.workExperience) return; if (!window.confirm("Delete this work experience entry?")) return; const updated = workInfo.workExperience.filter((_, i) => i !== indexToDelete); const success = await handleSaveWorkExperienceList(updated); if (success) { setEditingExperienceIndex(null); }};
    const handleSaveCurrentWorkExperience = async () => { if (!workForm.company || !workForm.position || !workForm.city || !workForm.startYear || (!workForm.currentlyWorking && !workForm.endYear)) { showSnackbar('Please fill required work fields.', 'warning'); return; } if (!workForm.currentlyWorking && workForm.endYear && parseInt(workForm.endYear) < parseInt(workForm.startYear)) { showSnackbar('End year cannot be before start year.', 'warning'); return; } const duration = workForm.currentlyWorking ? `${workForm.startYear} - Present` : `${workForm.startYear} - ${workForm.endYear}`; const newItem = { company: workForm.company.trim(), position: workForm.position.trim(), city: workForm.city.trim(), duration }; let updated; const current = workInfo?.workExperience || []; if (editingExperienceIndex === 'NEW') { updated = [...current, newItem]; } else if (typeof editingExperienceIndex === 'number') { updated = [...current]; updated[editingExperienceIndex] = newItem; } else return; const success = await handleSaveWorkExperienceList(updated); if (success) handleCancelWorkEdit(); };
    const handleAddEducation = () => { setEduForm({ institution: '', degree: '', fieldOfStudy: '', graduationYear: '' }); setEditingEducationIndex('NEW'); };
    const handleEditEducation = (index) => { if (!eduInfo?.educationDetails?.[index]) return; const edu = eduInfo.educationDetails[index]; setEduForm({ institution: edu.institution || '', degree: edu.degree || '', fieldOfStudy: edu.fieldOfStudy || '', graduationYear: edu.graduationYear || '', }); setEditingEducationIndex(index); };
    const handleCancelEduEdit = () => { setEditingEducationIndex(null); };
    const handleDeleteEducation = async (indexToDelete) => { if (typeof indexToDelete !== 'number' || !eduInfo?.educationDetails) return; if (!window.confirm("Delete this education entry?")) return; const updated = eduInfo.educationDetails.filter((_, i) => i !== indexToDelete); const success = await handleSaveEducationList(updated); if (success) { setEditingEducationIndex(null); }};
    const handleSaveCurrentEducation = async () => { if (!eduForm.institution || !eduForm.degree || !eduForm.fieldOfStudy || !eduForm.graduationYear) { showSnackbar('Please fill required education fields.', 'warning'); return; } const currentYear = new Date().getFullYear(); if (parseInt(eduForm.graduationYear) > currentYear + 10 || parseInt(eduForm.graduationYear) < 1950) { showSnackbar('Invalid graduation year.', 'warning'); return; } const newItem = { institution: eduForm.institution.trim(), degree: eduForm.degree.trim(), fieldOfStudy: eduForm.fieldOfStudy.trim(), graduationYear: eduForm.graduationYear.trim() }; let updated; const current = eduInfo?.educationDetails || []; if (editingEducationIndex === 'NEW') { updated = [...current, newItem]; } else if (typeof editingEducationIndex === 'number') { updated = [...current]; updated[editingEducationIndex] = newItem; } else return; const success = await handleSaveEducationList(updated); if (success) handleCancelEduEdit(); };

   // --- Tab Change Handler ---
   const handleTabChange = (event, newValue) => {
       if (editingExperienceIndex !== null || editingEducationIndex !== null) {
           showSnackbar('Please save or cancel your current edits first.', 'warning');
           return;
       }
       setActiveTab(newValue);
   };

   // --- Other Handlers ---
   const handleCloseSnackbar = useCallback((event, reason) => { if (reason === 'clickaway') return; setSnackbar(prev => ({ ...prev, open: false })); }, []);
   const userInitials = useMemo(() => getInitials(basicInfo?.fullName), [basicInfo?.fullName]);
   const isEditingOrSaving = isSavingWork || isSavingEdu || editingExperienceIndex !== null || editingEducationIndex !== null;

   // --- Styles & Constants ---
   const SectionTitleSx = { fontSize: '1.2rem', fontWeight: 600, mb: 1, color: 'text.primary' };
   const commonTabSx = { textTransform: 'none', fontWeight: 500, fontSize: '0.9rem', color: 'text.secondary', minHeight: 48, minWidth: 'auto', opacity: 0.9, '& .MuiTab-iconWrapper': { mr: 1, ml: 0, alignItems: 'center' }, '& .MuiSvgIcon-root': { fontSize: '1.25rem', mb: '0 !important' }, '&.Mui-selected': { color: 'primary.main', fontWeight: 600, opacity: 1 }, '&:hover': { backgroundColor: 'action.hover', opacity: 1, borderRadius: 'var(--border-radius-medium)' } };

   // --- RENDER LOGIC ---

     if (loading) {
         return ( <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}> <CircularProgress /> </Box> );
     }
     if (error && !basicInfo) {
         return ( <Box sx={{ width: '100%', maxWidth: '800px', margin: '40px auto', p: 3 }}> <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert> {error.includes("Not logged in") && <Button variant="contained" onClick={() => navigate('/login')} sx={{mt: 1}}>Login</Button>} </Box> );
     }
     if (!basicInfo) {
         return <Box sx={{ p: 3 }}><Typography>Profile data unavailable.</Typography></Box>;
     }

   // --- Section Content Renderer ---
   const renderSectionContent = (sectionIndex) => {
        switch (sectionIndex) {
           case 0: // Basic Info
                // Apply padding to the outer stack for mobile consistency
               return ( <Stack spacing={1.5} id="basic-info-section" sx={{ px: { xs: 2, sm: 0 } }}> <Typography sx={{...SectionTitleSx, px: {xs: 0, sm: 0} }}>Basic Information</Typography> <EditableField label="Full Name" value={basicInfo.fullName} readOnly IconComponent={BadgeOutlinedIcon}/> <EditableField label="Email Address" value={basicInfo.email} readOnly IconComponent={EmailOutlinedIcon}/> <EditableField label="Student ID" value={basicInfo.studentId} readOnly IconComponent={SchoolOutlinedIcon}/> <EditableField label="Session" value={basicInfo.session} readOnly IconComponent={SchoolOutlinedIcon}/> {basicInfo.createdAt && (<EditableField label="Member Since" value={formatDisplayValue(basicInfo.createdAt, true)} readOnly IconComponent={CalendarMonthOutlinedIcon}/> )} <Alert severity="info" variant='standard' sx={{ mt: 2, bgcolor: 'info.lighter', color: 'info.darker', mx: { xs: 2, sm: 0 } }}> Basic info cannot be edited here. </Alert> </Stack> );
           case 1: // Experience (Work & Edu)
                const workItems = workInfo?.workExperience || []; const eduItems = eduInfo?.educationDetails || [];
                // Apply padding to the outer stack for mobile consistency
                return ( <Stack spacing={3} id="experience-section" sx={{ px: { xs: 2, sm: 0 } }}> {/* Outer stack for major sections */} <Stack spacing={1.5}> {/* Work */} <Stack direction="row" justifyContent="space-between" alignItems="center"> <Typography sx={SectionTitleSx}>Work Experience</Typography> {editingExperienceIndex === null && ( <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={handleAddWorkExperience} disabled={isEditingOrSaving} sx={{ color: 'text.secondary', borderColor: 'var(--color-border)' }}> Add New </Button> )} </Stack> {editingExperienceIndex === 'NEW' && ( <WorkExperienceForm formData={workForm} setFormData={setWorkForm} onSave={handleSaveCurrentWorkExperience} onCancel={handleCancelWorkEdit} isSaving={isSavingWork} isNew={true} /> )} {workItems.length === 0 && editingExperienceIndex === null && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 1 }}>No work experience added yet.</Typography>} {workItems.map((experience, index) => ( <Box key={`work-${index}`}> <ItemBox onEdit={() => handleEditWorkExperience(index)} onDelete={() => handleDeleteWorkExperience(index)} isEditing={editingExperienceIndex === index} isSaving={isSavingWork}> <BusinessOutlinedIcon sx={{ mr: 2, color: 'primary.main', alignSelf: 'center', fontSize: '2rem' }} /> <Box> <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>{experience.company}</Typography> <Typography variant="body2" color="text.secondary">{experience.position} - {experience.city}</Typography> <Typography variant="caption" color="text.secondary">Duration: {experience.duration}</Typography> </Box> </ItemBox> {editingExperienceIndex === index && ( <WorkExperienceForm formData={workForm} setFormData={setWorkForm} onSave={handleSaveCurrentWorkExperience} onCancel={handleCancelWorkEdit} onDelete={() => handleDeleteWorkExperience(index)} isSaving={isSavingWork} isNew={false} /> )} </Box> ))} </Stack> <Divider sx={{ my: 2 }} /> {/* Separator */} <Stack spacing={1.5}> {/* Education */} <Stack direction="row" justifyContent="space-between" alignItems="center"> <Typography sx={SectionTitleSx}>Education</Typography> {editingEducationIndex === null && ( <Button variant="outlined" size="small" startIcon={<AddCircleOutlineIcon />} onClick={handleAddEducation} disabled={isEditingOrSaving} sx={{ color: 'text.secondary', borderColor: 'var(--color-border)' }}> Add New </Button> )} </Stack> {editingEducationIndex === 'NEW' && ( <EducationForm formData={eduForm} setFormData={setEduForm} onSave={handleSaveCurrentEducation} onCancel={handleCancelEduEdit} isSaving={isSavingEdu} isNew={true} /> )} {eduItems.length === 0 && editingEducationIndex === null && <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', pl: 1 }}>No education details added yet.</Typography>} {eduItems.map((education, index) => ( <Box key={`edu-${index}`}> <ItemBox onEdit={() => handleEditEducation(index)} onDelete={() => handleDeleteEducation(index)} isEditing={editingEducationIndex === index} isSaving={isSavingEdu}> <SchoolOutlinedIcon sx={{ mr: 2, color: 'secondary.main', alignSelf: 'center', fontSize: '2rem' }} /> <Box> <Typography variant="subtitle1" fontWeight="600" color="text.primary" gutterBottom>{education.institution}</Typography> <Typography variant="body2" color="text.secondary">{education.degree} in {education.fieldOfStudy}</Typography> <Typography variant="caption" color="text.secondary">Graduated: {education.graduationYear}</Typography> </Box> </ItemBox> {editingEducationIndex === index && ( <EducationForm formData={eduForm} setFormData={setEduForm} onSave={handleSaveCurrentEducation} onCancel={handleCancelEduEdit} onDelete={() => handleDeleteEducation(index)} isSaving={isSavingEdu} isNew={false} /> )} </Box> ))} </Stack> </Stack> );
           case 2: // Places
                // Apply padding to the outer stack for mobile consistency
               return ( <Stack spacing={1.5} id="places-section" sx={{ px: { xs: 2, sm: 0 } }}> <Typography sx={{...SectionTitleSx, px: {xs: 0, sm: 0} }}>Places Lived</Typography> <EditableField label="Current City" value={placeInfo?.currentCity} fieldName="currentCity" onSave={handleSaveField} IconComponent={LocationOnOutlinedIcon} disabled={isEditingOrSaving}/> <EditableField label="Hometown" value={placeInfo?.hometown} fieldName="hometown" onSave={handleSaveField} IconComponent={HomeOutlinedIcon} disabled={isEditingOrSaving}/> </Stack> );
           case 3: // Contact
                // Apply padding to the outer stack for mobile consistency
               return ( <Stack spacing={1.5} id="contact-section" sx={{ px: { xs: 2, sm: 0 } }}> <Typography sx={{...SectionTitleSx, px: {xs: 0, sm: 0} }}>Contact Information</Typography> <EditableField label="Phone Number" value={contactInfo?.phoneNumber} fieldName="phoneNumber" onSave={handleSaveField} IconComponent={ContactPhoneOutlinedIcon} disabled={isEditingOrSaving}/> <EditableField label="Facebook Profile URL" value={contactInfo?.facebook} fieldName="facebook" onSave={handleSaveField} IconComponent={LinkOutlinedIcon} placeholder="https://facebook.com/..." disabled={isEditingOrSaving}/> <EditableField label="LinkedIn Profile URL" value={contactInfo?.linkedin} fieldName="linkedin" onSave={handleSaveField} IconComponent={LinkOutlinedIcon} placeholder="https://linkedin.com/in/..." disabled={isEditingOrSaving}/> <EditableField label="Personal Website" value={contactInfo?.website} fieldName="website" onSave={handleSaveField} IconComponent={LinkOutlinedIcon} placeholder="https://..." disabled={isEditingOrSaving}/> </Stack> );
           case 4: // About
                // Apply padding to the outer stack for mobile consistency
               return ( <Stack spacing={1.5} id="about-section" sx={{ px: { xs: 2, sm: 0 } }}> <Typography sx={{...SectionTitleSx, px: {xs: 0, sm: 0} }}>About</Typography> <EditableField label="Field of Expertise / Interests" value={detailInfo?.fieldOfExpertise} fieldName="fieldOfExpertise" onSave={handleSaveField} IconComponent={InfoOutlinedIcon} disabled={isEditingOrSaving}/> <EditableField label="Bio / Short Introduction" value={detailInfo?.bio} fieldName="bio" onSave={handleSaveField} IconComponent={DescriptionOutlinedIcon} multiline rows={4} disabled={isEditingOrSaving} placeholder="Write a brief introduction about yourself..."/> </Stack> );
           default: return null;
        }
   };

   return (
     // Main Container: Apply responsive horizontal padding
     <Box sx={{
         width: '100%',
         maxWidth: '1200px',
         margin: '0 auto',
         px: { xs: 0, sm: 2, md: 3 }, // No horizontal padding on xs
         py: { xs: 1, sm: 2, md: 3 }  // Keep vertical padding
         }}>
       <CssBaseline />

         {/* --- Profile Header (Adjusted Padding) --- */}
         <Paper elevation={0} sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: 'center',
            // Apply consistent padding matching mobile content padding on xs
            p: { xs: 2, sm: 3 },
            mb: 3,
            bgcolor: 'var(--color-surface, #fff)',
            // Apply responsive border radius and ensure border exists
            borderRadius: { xs: 0, sm: 'var(--border-radius-large, 12px)' },
            border: `1px solid var(--color-border, ${theme.palette.divider})`
            }} >
             <Avatar
                 sx={{
                     width: avatarSize,
                     height: avatarSize,
                     mb: { xs: 2, sm: 0 }, mr: { sm: 3 },
                     bgcolor: basicInfo.profileBgColor || theme.palette.primary.light,
                     color: theme.palette.getContrastText(basicInfo.profileBgColor || theme.palette.primary.light),
                     fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                     boxShadow: theme.shadows[2]
                 }}
                 src={basicInfo.profileImageUrl || undefined}
                 alt={`${basicInfo.fullName || 'User'}'s Avatar`}
             >
                 {!basicInfo.profileImageUrl ? userInitials : null}
             </Avatar>
             <Box sx={{ textAlign: { xs: 'center', sm: 'left' }, width: '100%' }}>
                  <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 0.5 }}> {basicInfo.fullName || 'User Profile'} </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" justifyContent={{ xs: 'center', sm: 'flex-start' }}>
                     <Typography variant="body1" color="text.secondary" sx={{ wordBreak: 'break-all' }}> {basicInfo.email || 'No email'} </Typography>
                      {basicInfo.emailVerified ? (<Chip icon={<VerifiedUserOutlinedIcon />} label="Verified" size="small" color="success" variant="outlined" sx={{ height: 22, fontSize: '0.75rem', '.MuiChip-icon': { fontSize: '1rem' } }} />) : (<Chip icon={<ErrorOutlineIcon />} label="Not Verified" size="small" color="warning" variant="outlined" sx={{ height: 22, fontSize: '0.75rem', '.MuiChip-icon': { fontSize: '1rem' } }} /> )}
                  </Stack>
                  {!loading && error && <Alert severity="warning" sx={{ mt: 2, width: 'fit-content', mx: { xs: 'auto', sm: 0 } }}>{error}</Alert>}
             </Box>
         </Paper>


         {/* --- MOBILE VIEW: HORIZONTAL TABS (Adjusted Padding/Border) --- */}
         <Box sx={{ display: { xs: 'block', md: 'none' } }}>
             {/* Mobile Container Paper: Apply responsive border radius */}
             <Paper elevation={0} sx={{
                 mb: 3,
                 bgcolor: 'var(--color-surface, #fff)',
                 borderRadius: { xs: 0, sm: 'var(--border-radius-large, 12px)' }, // Square edges on xs
                 border: `1px solid var(--color-border, ${theme.palette.divider})`,
                 overflow: 'hidden' }} >
                 <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'var(--color-surface-variant, #f8f9fa)' }}>
                     <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" allowScrollButtonsMobile centered sx={{ '& .MuiTabs-indicator': { backgroundColor: 'primary.main', height: '3px' }, '& .MuiTab-root': { ...commonTabSx, px: { xs: 1.5, sm: 2.5 }, py: 1 } }} >
                         <Tab icon={<AccountBoxOutlinedIcon />} iconPosition="start" label="Basic" />
                         <Tab icon={<WorkOutlineOutlinedIcon />} iconPosition="start" label="Experience" />
                         <Tab icon={<PlaceOutlinedIcon />} iconPosition="start" label="Places" />
                         <Tab icon={<ContactMailOutlinedIcon />} iconPosition="start" label="Contact" />
                         <Tab icon={<NotesOutlinedIcon />} iconPosition="start" label="About" />
                     </Tabs>
                 </Box>
                 {/* Mobile Content Box: Apply consistent padding */}
                 <Box sx={{
                     px: { xs: 0, sm: 3 }, // No horizontal padding on xs (handled by renderSectionContent)
                     py: { xs: 2, sm: 3 }  // Vertical padding
                     }}>
                     {renderSectionContent(activeTab)} {/* Render only active tab content */}
                 </Box>
             </Paper>
         </Box>

         {/* --- DESKTOP VIEW: FULL WIDTH STACKED CONTENT (Adjusted Padding) --- */}
         <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              {/* Desktop Container Paper: Keep existing padding */}
              <Paper elevation={0} sx={{
                  bgcolor: 'var(--color-surface, #fff)',
                  borderRadius: 'var(--border-radius-large, 12px)',
                  border: `1px solid var(--color-border, ${theme.palette.divider})`,
                  p: { md: 3, lg: 4 } // Keep this padding for desktop
                  }} >
                  <Stack spacing={4} divider={<Divider sx={{ my: 2 }} />}> {/* Stack all sections vertically */}
                      {renderSectionContent(0)} {/* Basic Info */}
                      {renderSectionContent(1)} {/* Experience */}
                      {renderSectionContent(2)} {/* Places */}
                      {renderSectionContent(3)} {/* Contact */}
                      {renderSectionContent(4)} {/* About */}
                  </Stack>
             </Paper>
         </Box>


       {/* --- Snackbar (unchanged) --- */}
       <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }} variant="filled" elevation={6} iconMapping={{ success: <CheckCircleIcon fontSize="inherit" />, error: <ErrorIcon fontSize="inherit" />, info: <InfoOutlinedIcon fontSize="inherit" />, warning: <ErrorOutlineIcon fontSize='inherit' /> }} > {snackbar.message} </Alert>
       </Snackbar>
     </Box>
   );
 };

 export default Profile;