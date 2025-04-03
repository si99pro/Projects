/* eslint-disable no-unused-vars */
// src/components/NotificationForm.js
import React, { useState, useCallback } from 'react';
import { db, auth } from '../firebase';
import {
    collection,
    doc,
    addDoc,
    serverTimestamp,
    writeBatch,
    query,
    where,
    getDocs
} from 'firebase/firestore';
// --- CORRECTED IMPORT PATH FOR useAuth ---
import { useAuth } from '../auth/AuthContext';
// --- END CORRECTION ---
import {
    Box,
    TextField,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    Typography,
    CircularProgress,
    Alert,
    Stack,
    Snackbar,
    InputAdornment,
    FormHelperText,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import LinkIcon from '@mui/icons-material/Link';

// --- Constants ---
const notificationCategories = [
    { value: 'general', label: 'General' },
    { value: 'academic', label: 'Academic' },
    { value: 'discussion', label: 'Discussion' },
    { value: 'important', label: 'Important' },
    { value: 'event', label: 'Event' },
    { value: 'other', label: 'Other' },
];

const URL_REGEX = /^https?:\/\/[^\s/$.?#].[^\s]*$/i;
const NOTIFICATIONS_COLLECTION = 'notifications'; // Top-level collection (optional, for audit)
const USERS_COLLECTION = 'users';
const USER_NOTIFICATIONS_SUBCOLLECTION = 'notifications'; // Subcollection name under each user

// --- Component ---
function NotificationForm() {
    // Use the correctly imported useAuth hook
    const { user, isAdmin, userProfile, authLoading } = useAuth();
    const adminBatchYear = userProfile?.basicInfo?.batch;
    const senderStudentIdValue = userProfile?.basicInfo?.studentId;

    // --- State ---
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        link: '',
        audience: 'private', // Default remains private
        category: 'general',
    });
    const [formErrors, setFormErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitStatus, setSubmitStatus] = useState({ error: null, success: null });
    const [snackbarOpen, setSnackbarOpen] = useState(false);

    // --- Validation Logic (Unchanged) ---
    const validateField = useCallback((name, value) => {
        let error = undefined;
        switch (name) {
            case 'title':
                if (!value.trim()) error = 'Title is required.';
                break;
            case 'message':
                if (!value.trim()) error = 'Message is required.';
                break;
            case 'link':
                if (value.trim() && !URL_REGEX.test(value.trim())) {
                    error = 'Must be a valid URL (e.g., https://example.com)';
                }
                break;
            default:
                break;
        }
        return error;
    }, []);

    const validateForm = useCallback(() => {
        const errors = {};
        let isValid = true;
        const currentFormData = formData;

        const fieldsToValidate = ['title', 'message', 'link', 'category', 'audience'];
        for (const key of fieldsToValidate) {
            const value = currentFormData[key];
            const error = validateField(key, value);
            if (error) {
                errors[key] = error;
                isValid = false;
            }
        }

        // Specific validation for audience based on admin status and profile info
        if (currentFormData.audience === 'private') {
            if (authLoading) {
                errors.audience = "Verifying admin permissions..."; // User needs to wait
                isValid = false;
            } else if (!isAdmin) {
                errors.audience = "Private option disabled: Admin role required.";
                isValid = false;
            } else if (!adminBatchYear) {
                // Admin, but missing batch info needed for private targeting
                errors.audience = "Private option disabled: Your batch info is missing in your profile.";
                isValid = false;
            }
        }

        setFormErrors(errors);
        return isValid;
    }, [formData, validateField, isAdmin, adminBatchYear, authLoading]);

    // --- Event Handlers (Unchanged) ---
    const handleInputChange = useCallback((event) => {
        const { name, value } = event.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the specific field being changed
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
        // Clear audience error if audience itself is changed
        if (name === 'audience' && formErrors.audience) {
            setFormErrors(prev => ({ ...prev, audience: undefined }));
        }
        // Clear submission status on input change
        setSubmitStatus({ error: null, success: null });
    }, [formErrors]);

    const handleBlur = useCallback((event) => {
        const { name, value } = event.target;
        const error = validateField(name, value);
        setFormErrors(prev => ({ ...prev, [name]: error }));
    }, [validateField]);

    const handleSnackbarClose = useCallback((event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    }, []);


    // --- Function to DISTRIBUTE notification data + initial state to user subcollections ---
    const distributeNotificationToUsers = async (notificationId, notificationData, audienceType, audienceTarget) => {
        // Initial state for each user's copy of the notification
        const initialState = {
            read: false,
            createdAt: serverTimestamp(), // When the notification reached the user's subcollection
            readTimestamp: null,
            reacted: null,
            commented: false,
            shared: false
        };

        const usersToNotify = [];
        const usersRef = collection(db, USERS_COLLECTION);

        try {
            if (audienceType === 'public') {
                console.log("Fetching all users for PUBLIC audience distribution...");
                // Consider alternatives for large user bases (e.g., Cloud Functions triggered by the top-level doc)
                const allUsersSnapshot = await getDocs(usersRef);
                allUsersSnapshot.forEach(doc => usersToNotify.push(doc.id));
                console.log(`Found ${usersToNotify.length} users for public notification distribution.`);

            } else if (audienceType === 'private' && audienceTarget) {
                console.log(`Fetching users for PRIVATE batch '${audienceTarget}' distribution...`);
                const q = query(usersRef, where('basicInfo.batch', '==', audienceTarget));
                const batchUsersSnapshot = await getDocs(q);
                batchUsersSnapshot.forEach(doc => usersToNotify.push(doc.id));
                console.log(`Found ${usersToNotify.length} users in batch ${audienceTarget}.`);

            } else {
                console.log("No specific audience matched for distribution.");
                return; // Or throw an error if this case shouldn't happen
            }

            if (usersToNotify.length === 0) {
                console.log("No users found for the specified audience.");
                // Maybe set a specific status message for the user?
                return;
            }

            // Use a batch for efficient writes
            const batch = writeBatch(db);
            usersToNotify.forEach(userId => {
                const userNotificationRef = doc(db, USERS_COLLECTION, userId, USER_NOTIFICATIONS_SUBCOLLECTION, notificationId);
                const userNotificationPayload = {
                    ...notificationData, // Original notification content
                    ...initialState      // User-specific initial state
                };
                batch.set(userNotificationRef, userNotificationPayload);
            });

            await batch.commit();
            console.log(`Successfully distributed notification ${notificationId} to ${usersToNotify.length} users.`);

        } catch (error) {
            console.error(`Error distributing notification ${notificationId} to users:`, error);
            throw new Error(`Failed to distribute notification to users. ${error.message}`);
        }
    };


    // --- Form Submission Handler ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitStatus({ error: null, success: null }); // Clear previous status

        if (!validateForm()) {
            console.log("Form validation failed", formErrors);
            return; // Stop submission if form is invalid
        }

        setLoading(true);
        const currentUser = auth.currentUser;

        // Double-check user authentication (should be handled by routing, but belt-and-suspenders)
        if (!currentUser) {
            setSubmitStatus({ error: "Authentication error. Please log in again.", success: null });
            setLoading(false);
            return;
        }

        const targetBatch = formData.audience === 'private' ? adminBatchYear : null;
        const senderNameValue = userProfile?.basicInfo?.fullName || currentUser.displayName || 'Admin';
        // Map internal state ('private'/'everyone') to Firestore values ('private'/'public')
        const audienceTypeValue = formData.audience === 'private' ? 'private' : 'public';

        let mainNotificationDocRef = null; // To store the ref of the optional top-level doc

        try {
            // 1. Construct the core notification data object
            const notificationData = {
                title: formData.title.trim(),
                message: formData.message.trim(),
                category: formData.category,
                audienceType: audienceTypeValue,
                // Only include audienceTarget if it's a private notification with a valid target batch
                ...(audienceTypeValue === 'private' && targetBatch && { audienceTarget: targetBatch }),
                // Include sender details
                senderName: senderNameValue,
                senderStudentId: senderStudentIdValue || null, // Store sender's student ID if available
                timestamp: serverTimestamp(), // Timestamp when the notification was *sent*
                // Include link only if provided
                ...(formData.link.trim() && { link: formData.link.trim() }),
            };

            console.log("Constructed notification data:", notificationData);

            // 2. (Optional but Recommended for Audit/Functions) Add to top-level 'notifications' collection
            // This gives you a single place to view all sent notifications and potentially trigger functions.
            // If you *only* want user subcollections, generate an ID first, then call distribute.
            mainNotificationDocRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);
            const newNotificationId = mainNotificationDocRef.id; // Get the ID generated by Firestore
            console.log("Main (audit) notification document created with ID:", newNotificationId);

            // 3. Distribute the notification to target user subcollections
            console.log(`Distributing notification ${newNotificationId} to users...`);
            await distributeNotificationToUsers(
                newNotificationId,      // Use the SAME ID for consistency
                notificationData,       // Pass the notification content
                audienceTypeValue,      // 'private' or 'public'
                audienceTypeValue === 'private' ? targetBatch : null // Pass target only if private
            );

            // 4. Success: Reset form and show success message
            setFormData({
                title: '', message: '', link: '',
                audience: 'private', // Reset to default
                category: 'general'  // Reset to default
            });
            setFormErrors({});
            setSubmitStatus({ error: null, success: "Notification sent successfully!" });
            setSnackbarOpen(true);

        } catch (err) {
            console.error("Error during notification submission:", err);
            // Provide more specific feedback based on where the error might have occurred
            if (mainNotificationDocRef && err.message.includes("Failed to distribute")) {
                setSubmitStatus({ error: `Notification created (ID: ${mainNotificationDocRef.id}) but failed to distribute. ${err.message}`, success: null });
            } else if (!mainNotificationDocRef) {
                setSubmitStatus({ error: `Failed to create the notification document. ${err.message}`, success: null });
            } else {
                // Generic error
                setSubmitStatus({ error: `An unexpected error occurred: ${err.message}`, success: null });
            }
        } finally {
            setLoading(false); // Ensure loading state is always turned off
        }
    };


    // --- Render Logic ---
    // Determine if the 'private' option should be disabled and why
    const isPrivateOptionDisabled = authLoading || !isAdmin || (isAdmin && !adminBatchYear);
    const privateDisabledReasonText = (!authLoading && !isAdmin)
        ? "Admin role required to send private messages."
        : (!authLoading && isAdmin && !adminBatchYear)
        ? "Your batch info is missing in profile."
        : "";

    // Determine the helper text for the Audience dropdown
    let audienceHelperText = "";
    if (formErrors.audience) {
        audienceHelperText = formErrors.audience; // Show specific validation error first
    } else if (formData.audience === 'private' && isPrivateOptionDisabled) {
        audienceHelperText = privateDisabledReasonText; // Show why it's disabled
    } else if (formData.audience === 'private' && !isPrivateOptionDisabled) {
        audienceHelperText = `Will be sent privately to batch ${adminBatchYear}.`; // Confirm target batch
    } else if (formData.audience === 'everyone') {
        audienceHelperText = "Will be sent publicly to all users.";
    }

    // --- JSX ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, maxWidth: 700, mx: 'auto' }}>
            {/* Show loading spinner only if authentication is still loading initially */}
            {authLoading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
                    <CircularProgress />
                    <Typography sx={{ ml: 2 }}>Verifying permissions...</Typography>
                </Box>
            )}

            {/* Render form only after initial auth check is done */}
            {!authLoading && (
                <>
                    <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
                        Send New Notification
                    </Typography>

                    <Stack spacing={3}>
                        {/* Display submission errors */}
                        {submitStatus.error && (
                            <Alert severity="error" onClose={() => setSubmitStatus(prev => ({ ...prev, error: null }))}>
                                {submitStatus.error}
                            </Alert>
                        )}

                        <TextField
                            required fullWidth id="title" name="title" label="Notification Title"
                            value={formData.title} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.title} helperText={formErrors.title || ' '} // Add space to prevent layout jumps
                            disabled={loading} autoFocus
                        />

                        <TextField
                            required fullWidth id="message" name="message" label="Notification Message"
                            multiline rows={4} value={formData.message} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.message} helperText={formErrors.message || ' '}
                            disabled={loading}
                        />

                        <TextField
                            fullWidth id="link" name="link" label="Optional Link (URL)"
                            placeholder="https://example.com" value={formData.link} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.link} helperText={formErrors.link || ' '}
                            disabled={loading}
                            InputProps={{
                                startAdornment: (<InputAdornment position="start"><LinkIcon color="action" /></InputAdornment>),
                            }}
                        />

                        <Grid container spacing={2} alignItems="flex-start">
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!!formErrors.category} disabled={loading}>
                                    <InputLabel id="category-select-label">Category</InputLabel>
                                    <Select
                                        labelId="category-select-label" id="category-select" name="category"
                                        value={formData.category} label="Category" onChange={handleInputChange}
                                    >
                                        {notificationCategories.map((cat) => (
                                            <MenuItem key={cat.value} value={cat.value}>{cat.label}</MenuItem>
                                        ))}
                                    </Select>
                                    {/* Add space for helper text consistency */}
                                    <FormHelperText> </FormHelperText>
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!!formErrors.audience} disabled={loading}>
                                    <InputLabel id="audience-select-label">Audience</InputLabel>
                                    <Select
                                        labelId="audience-select-label" id="audience-select" name="audience"
                                        value={formData.audience} label="Audience" onChange={handleInputChange}
                                    >
                                        {/* Disable private option based on calculated state */}
                                        <MenuItem key="private" value="private" disabled={isPrivateOptionDisabled}>
                                            Private (Your Batch)
                                        </MenuItem>
                                        <MenuItem key="everyone" value="everyone">
                                            Public (Everyone)
                                        </MenuItem>
                                    </Select>
                                    {/* Display dynamic helper text */}
                                    <FormHelperText>{audienceHelperText || ' '}</FormHelperText>
                                </FormControl>
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                type="submit" variant="contained" disabled={loading}
                                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                                sx={{ minWidth: 150 }}
                            >
                                {loading ? 'Sending...' : 'Send Notification'}
                            </Button>
                        </Box>
                    </Stack>
                </>
            )}

            {/* Snackbar for success messages */}
            <Snackbar
                open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {/* Ensure Alert is only rendered when there's a success message */}
                {submitStatus.success ? (
                    <Alert onClose={handleSnackbarClose} severity="success" variant="filled" sx={{ width: '100%' }}>
                        {submitStatus.success}
                    </Alert>
                ) : undefined /* Render nothing otherwise */}
            </Snackbar>
        </Box>
    );
}

export default NotificationForm;