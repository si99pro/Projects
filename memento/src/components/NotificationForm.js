// src/components/NotificationForm.js
import React, { useState, useCallback } from 'react';
import { db, auth } from '../firebase';
import {
    collection,
    doc, // Kept for referencing user documents and subcollections
    addDoc,
    serverTimestamp,
    writeBatch, // Still crucial for efficient writes
    query,
    where,
    getDocs
} from 'firebase/firestore';
import { useAuth } from '../auth/PrivateRoute'; // Or '../auth/AuthContext'
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
const NOTIFICATIONS_COLLECTION = 'notifications'; // Top-level collection (optional, but kept for audit)
const USERS_COLLECTION = 'users';
const USER_NOTIFICATIONS_SUBCOLLECTION = 'notifications'; // Subcollection name under each user

// --- Component ---
function NotificationForm() {
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

        if (currentFormData.audience === 'private') {
            if (authLoading) {
                errors.audience = "Verifying admin permissions...";
                isValid = false;
            } else if (!isAdmin) {
                errors.audience = "Only admins can send private messages.";
                isValid = false;
            } else if (!adminBatchYear) {
                errors.audience = "Cannot send private message: Your batch information is missing in your profile.";
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
        if (formErrors[name]) {
            setFormErrors(prev => ({ ...prev, [name]: undefined }));
        }
        if (name === 'audience' && formErrors.audience) {
            setFormErrors(prev => ({ ...prev, audience: undefined }));
        }
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
            createdAt: serverTimestamp(), // When the notification reached the user
            readTimestamp: null,
            reacted: null,
            commented: false,
            shared: false
            // Note: 'timestamp' from notificationData is when it was *sent*
        };

        const usersToNotify = [];
        const usersRef = collection(db, USERS_COLLECTION);

        try {
            if (audienceType === 'public') {
                console.log("Fetching all users for PUBLIC audience distribution...");
                // WARNING: Fetching all users can be inefficient/costly for large user bases.
                // Consider using Cloud Functions for large-scale distribution.
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
                return; // No users to distribute to
            }

            if (usersToNotify.length === 0) {
                console.log("No users found for the specified audience.");
                return;
            }

            // Use a batch to write the combined notification data + state to each user's subcollection
            const batch = writeBatch(db);
            usersToNotify.forEach(userId => {
                // Reference to the specific notification document within the user's subcollection
                // Use the *same notificationId* generated earlier for consistency
                const userNotificationRef = doc(db, USERS_COLLECTION, userId, USER_NOTIFICATIONS_SUBCOLLECTION, notificationId);

                // Combine the original notification content with the initial user-specific state
                const userNotificationPayload = {
                    ...notificationData, // Spread the original notification details
                    ...initialState      // Add the initial state fields
                };

                batch.set(userNotificationRef, userNotificationPayload);
            });

            await batch.commit();
            console.log(`Successfully distributed notification ${notificationId} to ${usersToNotify.length} users' subcollections.`);

        } catch (error) {
            console.error(`Error distributing notification ${notificationId} to users:`, error);
            // Throw the error so the calling function knows distribution failed
            throw new Error(`Failed to distribute notification to users. ${error.message}`);
        }
    };


    // --- Form Submission Handler ---
    const handleSubmit = async (event) => {
        event.preventDefault();
        setSubmitStatus({ error: null, success: null });

        if (!validateForm()) {
            console.log("Form validation failed", formErrors);
            return;
        }

        setLoading(true);
        const currentUser = auth.currentUser;

        if (!currentUser) {
            setSubmitStatus({ error: "You must be logged in to send notifications.", success: null });
            setLoading(false);
            return;
        }

        const targetBatch = formData.audience === 'private' ? adminBatchYear : null;
        const senderNameValue = userProfile?.basicInfo?.fullName || currentUser.displayName || 'Admin';
        // Map internal audience state ('everyone'/'private') to Firestore values ('public'/'private')
        const audienceTypeValue = formData.audience === 'everyone' ? 'public' : 'private';

        let mainNotificationDocRef = null; // Ref for the top-level document

        try {
            // 1. Construct the data object for the main/audit notification document
            // This data will ALSO be copied to user subcollections
            const notificationData = {
                title: formData.title.trim(),
                message: formData.message.trim(),
                category: formData.category,
                audienceType: audienceTypeValue,
                ...(audienceTypeValue === 'private' && targetBatch && { audienceTarget: targetBatch }),
                // senderId: currentUser.uid, // Usually not needed if data is in user's subcollection
                senderName: senderNameValue,
                senderStudentId: senderStudentIdValue || null,
                timestamp: serverTimestamp(), // When the notification was *sent*
                ...(formData.link.trim() && { link: formData.link.trim() }),
            };

            console.log("Creating main notification document with data:", notificationData);

            // 2. Add the main notification document (optional, but kept for audit)
            // If you decide you don't need the top-level collection AT ALL, you can remove this `addDoc`
            // and generate a unique ID differently (e.g., using `doc(collection(db, 'some_dummy_path')).id`)
            // before calling distributeNotificationToUsers.
            mainNotificationDocRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);
            const newNotificationId = mainNotificationDocRef.id; // Get the ID of the created document
            console.log("Main notification document added successfully with ID: ", newNotificationId);

            // --- 3. Distribute the notification (content + initial state) to target user subcollections ---
            console.log(`Attempting to distribute notification ${newNotificationId} to users...`);
            await distributeNotificationToUsers(
                newNotificationId,      // Pass the ID for consistency
                notificationData,       // Pass the full content data
                audienceTypeValue,
                audienceTypeValue === 'private' ? targetBatch : null
            );

            // --- 4. If both succeed (main doc creation and distribution), update UI ---
            setFormData({
                title: '', message: '', link: '',
                audience: 'private',
                category: 'general'
            });
            setFormErrors({});
            setSubmitStatus({ error: null, success: "Notification sent successfully!" });
            setSnackbarOpen(true);

        } catch (err) {
            console.error("Error during notification submission process: ", err);
            if (mainNotificationDocRef && err.message.includes("Failed to distribute notification")) {
                setSubmitStatus({ error: `Main notification created (ID: ${mainNotificationDocRef.id}), but failed to distribute to users. ${err.message}. Check logs.`, success: null });
            } else if (!mainNotificationDocRef) {
                setSubmitStatus({ error: `Failed to create main notification document. ${err.message || 'Please try again.'}`, success: null });
            } else {
                // Generic error after main doc creation but maybe before/during distribution start
                setSubmitStatus({ error: `An unexpected error occurred. ${err.message}`, success: null });
            }
        } finally {
            setLoading(false);
        }
    };


    // --- Render Logic (Largely Unchanged) ---
    const isPrivateOptionDisabled = authLoading || !isAdmin || (isAdmin && !adminBatchYear);
    const privateDisabledReasonText = (!authLoading && isAdmin && !adminBatchYear)
        ? "Private option disabled: Batch info missing in profile."
        : !isAdmin ? "Private option disabled: Admin role required." : "";

    let audienceHelperText = "";
    if (formErrors.audience) {
        audienceHelperText = formErrors.audience;
    } else if (isPrivateOptionDisabled && privateDisabledReasonText) {
        audienceHelperText = privateDisabledReasonText;
    } else if (isAdmin && formData.audience === 'private' && adminBatchYear) {
        audienceHelperText = `Will be sent privately to batch ${adminBatchYear}.`;
    } else if (isAdmin && formData.audience === 'everyone') {
        audienceHelperText = "Will be sent publicly to all users.";
    } else if (!isAdmin) {
        audienceHelperText = "Audience selection restricted.";
    }

    // --- JSX (Unchanged structure, only text/logic updates handled above) ---
    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, maxWidth: 700, mx: 'auto' }}>
            {authLoading && <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}><CircularProgress /></Box>}

            {!authLoading && (
                <>
                    <Typography variant="h6" gutterBottom>
                        Send New Notification
                    </Typography>

                    <Stack spacing={3}>
                        {submitStatus.error && (
                            <Alert severity="error" onClose={() => setSubmitStatus(prev => ({ ...prev, error: null }))}>
                                {submitStatus.error}
                            </Alert>
                        )}

                        <TextField
                            required fullWidth id="title" name="title" label="Notification Title"
                            value={formData.title} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.title} helperText={formErrors.title}
                            disabled={loading} autoFocus
                        />

                        <TextField
                            required fullWidth id="message" name="message" label="Notification Message"
                            multiline rows={4} value={formData.message} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.message} helperText={formErrors.message} disabled={loading}
                        />

                        <TextField
                            fullWidth id="link" name="link" label="Optional Link (URL)"
                            placeholder="https://example.com" value={formData.link} onChange={handleInputChange} onBlur={handleBlur}
                            error={!!formErrors.link} helperText={formErrors.link} disabled={loading}
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
                                </FormControl>
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth required error={!!formErrors.audience} disabled={loading}>
                                    <InputLabel id="audience-select-label">Audience</InputLabel>
                                    <Select
                                        labelId="audience-select-label" id="audience-select" name="audience"
                                        value={formData.audience} label="Audience" onChange={handleInputChange}
                                    >
                                        <MenuItem key="private" value="private" disabled={isPrivateOptionDisabled}>
                                            Private (Your Batch)
                                        </MenuItem>
                                        <MenuItem key="everyone" value="everyone">
                                            Public (Everyone)
                                        </MenuItem>
                                    </Select>
                                    <FormHelperText>{audienceHelperText}</FormHelperText>
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

            <Snackbar
                open={snackbarOpen} autoHideDuration={5000} onClose={handleSnackbarClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                {submitStatus.success && (
                    <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
                        {submitStatus.success}
                    </Alert>
                )}
            </Snackbar>
        </Box>
    );
}

export default NotificationForm;