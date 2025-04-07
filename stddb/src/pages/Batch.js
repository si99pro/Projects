/* eslint-disable no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

// src/pages/Batch.js or wherever UserDirectory is defined

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { db } from '../firebase'; // Adjust path if necessary
import {
    collection,
    query,
    where,
    getCountFromServer,
    getDocs,
} from "firebase/firestore";

// Material UI Components
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar, Box, IconButton,
    CircularProgress, Alert, Tooltip, useTheme, useMediaQuery,
    Card, CardContent, CardActionArea, Stack, Grid // Added for mobile view
} from '@mui/material';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LocationOnIcon from '@mui/icons-material/LocationOn'; // Added for card details
import WorkOutlineIcon from '@mui/icons-material/WorkOutline'; // Added for card details

// Emotion Styled Components
import styled from '@emotion/styled';

// --- Styled Components ---

const StyledContainer = styled(Container)`
    margin-top: 20px;
    padding: 20px;
    min-height: calc(100vh - 120px); // Adjust based on your header/footer height
    display: flex;
    flex-direction: column;
`;

const ContentWrapper = styled(Box)`
    flex-grow: 1;
`;

const StyledTitle = styled(Typography)`
    text-align: center;
    margin-bottom: 25px;
    color: #333;
    font-weight: 500;
`;

// -- Desktop Table Styles --
const StyledTableContainer = styled(TableContainer)`
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    overflow-x: auto;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
`;

const StyledTable = styled(Table)`
    min-width: 650px;
`;

const TableHeaderCell = styled(TableCell)`
    font-weight: 600;
    background-color: #f8f9fa;
    color: #343a40;
    cursor: ${props => props.issortable === 'true' ? 'pointer' : 'default'};
    position: relative;
    padding: 12px 16px;
    white-space: nowrap;
    border-bottom: 2px solid #dee2e6;
    user-select: none;

     &:hover {
        background-color: ${props => props.issortable === 'true' ? '#e9ecef' : '#f8f9fa'};
    }

    .MuiBox-root { /* For icon alignment */
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%;
    }
`;

const SortIconContainer = styled.span`
    display: inline-flex;
    vertical-align: middle;
    opacity: 0.4;
    transition: opacity 0.2s ease-in-out;
    line-height: 0;

    &.active {
      opacity: 1;
      color: #007bff;
    }
`;

const DataTableCell = styled(TableCell)`
    padding: 10px 16px;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.9rem;
    line-height: 1.4;
`;

const ClickableTableRow = styled(TableRow)`
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    &:hover {
        background-color: #f5f5f5;
    }
    &:last-child td, &:last-child th {
        border: 0;
    }
`;

const StyledAvatar = styled(Avatar)`
    width: 36px;
    height: 36px;
    font-size: 0.9rem;
    margin-right: 8px;
`;

// -- Common Styles --
const ContactIconBox = styled(Box)`
    display: flex;
    gap: 6px;
    align-items: center;
    flex-wrap: nowrap;
`;

const ContactIcon = styled(IconButton)`
    padding: 5px;
    color: #6c757d;

    &:hover {
        color: #0d6efd;
        background-color: rgba(13, 110, 253, 0.05);
    }

    svg {
        width: 20px;
        height: 20px;
    }
`;

const LoadingOverlay = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px;
    width: 100%;
`;

const CenteredMessage = styled(Typography)`
    text-align: center;
    padding: 40px 20px;
    color: #6c757d;
`;

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------
const SORTABLE_FIELD_KEYS = {
    ID: 'ID',
    NAME: 'Name',
};

// ----------------------------------------------------------------------
// Custom Hook (Fetching Users)
// ----------------------------------------------------------------------
const useAllUsers = (year) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAllUsers = useCallback(async () => {
        setError(null);
        setLoading(true);
        setUsers([]);
        setTotalCount(0);

        try {
            const usersRef = collection(db, "users");
            let dataQuery = query(usersRef);
            let countQuery = query(usersRef);

            if (year) {
                const yearConstraint = where("basicInfo.batch", "==", year);
                dataQuery = query(dataQuery, yearConstraint);
                countQuery = query(countQuery, yearConstraint);
            }

            // Fetch count and data potentially in parallel
            const countPromise = getCountFromServer(countQuery)
                .then(snapshot => setTotalCount(snapshot.data().count))
                .catch(countError => {
                    console.error("Could not get user count:", countError); // Changed from warn to error
                    // Don't throw, just report 0 count or handle specific permission errors later
                    setTotalCount(0);
                    // Re-throw if it's a critical error you want to surface differently?
                    // Or set a specific error state for the count?
                    // For now, just logging and setting 0.
                });

            const dataPromise = getDocs(dataQuery)
                .then(documentSnapshots => {
                    const fetchedUsers = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    setUsers(fetchedUsers);
                });

            // Wait for both promises
            await Promise.all([dataPromise, countPromise]);

        } catch (err) {
            // Catch errors from getDocs primarily
            console.error("Error fetching user data:", err);
            setError(err); // Set the main error state
            setUsers([]);
            setTotalCount(0); // Reset count on data fetch error too
        } finally {
            setLoading(false);
        }
    }, [year]);

    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    return { users, loading, error, totalCount };
};

// ----------------------------------------------------------------------
// Reusable Helper Components
// ----------------------------------------------------------------------

// --- Contact Icons ---
const ContactIcons = React.memo(({ user }) => {
    const { basicInfo = {}, contactInfo = {} } = user;

    const formatUrl = (url, prefix = 'https://') => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) return url;
        return `${prefix}${url}`;
    };

    const linkedInUrl = useMemo(() => formatUrl(contactInfo.linkedin, 'https://www.linkedin.com/in/'), [contactInfo.linkedin]);
    const facebookUrl = useMemo(() => formatUrl(contactInfo.facebook, 'https://www.facebook.com/'), [contactInfo.facebook]);

    return (
        <ContactIconBox onClick={(e) => e.stopPropagation()} aria-label="Contact links"> {/* Added aria-label */}
            {basicInfo.email && (
                <Tooltip title={`Mail ${basicInfo.email}`} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label={`Email ${basicInfo.fullName}`} href={`mailto:${basicInfo.email}`} target="_blank">
                        <EmailIcon fontSize="inherit" />
                    </ContactIcon>
                </Tooltip>
            )}
            {contactInfo.phoneNumber && (
                 <Tooltip title={`Call ${contactInfo.phoneNumber}`} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label={`Call ${basicInfo.fullName}`} href={`tel:${contactInfo.phoneNumber}`} target="_blank">
                        <PhoneIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
            {linkedInUrl && (
                 <Tooltip title="View LinkedIn Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label={`LinkedIn profile of ${basicInfo.fullName}`} href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                        <LinkedInIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
             {facebookUrl && (
                 <Tooltip title="View Facebook Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label={`Facebook profile of ${basicInfo.fullName}`} href={facebookUrl} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
        </ContactIconBox>
    );
});

// --- Desktop Table Row ---
const UserTableRow = React.memo(({ user }) => {
    const navigate = useNavigate();
    const fullName = user.basicInfo?.fullName;
    const placeholderChar = fullName?.split(' ')[0]?.charAt(0)?.toUpperCase() || '?';
    const profileBg = user.basicInfo?.profilebg || '#bdbdbd';

    const handleRowClick = useCallback(() => {
        if (user.id) navigate(`/users/${user.id}`);
        else console.warn("User ID missing, cannot navigate.", user);
    }, [navigate, user.id]);

    return (
        <ClickableTableRow onClick={handleRowClick} aria-label={`View profile for ${fullName || 'user'}`}>
            <DataTableCell sx={{ width: '5%' }}>
                 <StyledAvatar sx={{ bgcolor: profileBg }} aria-hidden="true">
                     {placeholderChar}
                 </StyledAvatar>
            </DataTableCell>
            <DataTableCell sx={{ width: '15%' }}>
                {user.basicInfo?.studentId || "N/A"}
            </DataTableCell>
            <DataTableCell sx={{ width: '25%', fontWeight: 500, color: '#212529' }}>
                {fullName || "N/A"}
            </DataTableCell>
            <DataTableCell sx={{ width: '20%' }}>
                {user.placeInfo?.hometown || "N/A"}
            </DataTableCell>
            <DataTableCell align="left" sx={{ width: '20%' }}>
                <ContactIcons user={user} />
            </DataTableCell>
            <DataTableCell
                align="left"
                sx={{ width: '15%', display: { xs: 'none', sm: 'table-cell' } }} // Hides cell itself on xs
            >
                {user.basicInfo?.currentStatus || "Unknown"}
            </DataTableCell>
        </ClickableTableRow>
    );
});

// --- Mobile Card ---
const UserCard = React.memo(({ user }) => {
    const navigate = useNavigate();
    const theme = useTheme();

    const {
        fullName = "N/A",
        studentId = "N/A",
        profilebg = theme.palette.grey[300],
    } = user.basicInfo || {};
    // Extract details that might be missing gracefully
    const hometown = user.placeInfo?.hometown;
    const currentStatus = user.basicInfo?.currentStatus;
    const placeholderChar = fullName?.split(' ')[0]?.charAt(0)?.toUpperCase() || '?';

    const handleCardClick = useCallback(() => {
        if (user.id) navigate(`/users/${user.id}`);
        else console.warn("User ID missing, cannot navigate.", user);
    }, [navigate, user.id]);

    return (
        <Card elevation={2} sx={{ width: '100%' }}>
            <CardActionArea
                onClick={handleCardClick}
                sx={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'flex-start' }} // Align items top
                aria-label={`View profile for ${fullName}`}
            >
                {/* Avatar Column */}
                <Box sx={{ p: 2, pt: 2.5 }}> {/* Adjust padding top */}
                     <StyledAvatar sx={{ bgcolor: profilebg, width: 44, height: 44 }} aria-hidden="true">
                         {placeholderChar}
                     </StyledAvatar>
                </Box>

                {/* Info Column */}
                <CardContent sx={{ flexGrow: 1, p: 2, pt: 1.5, '&:last-child': { pb: 1.5 } }}>
                    {/* Name and ID */}
                    <Typography variant="h6" component="div" sx={{ fontWeight: 500, lineHeight: 1.3, mb: 0.5 }}>
                        {fullName}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        ID: {studentId}
                    </Typography>

                    {/* Details */}
                    <Stack spacing={0.75} sx={{ mb: 1.5 }}>
                         {hometown && (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                 <LocationOnIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} aria-hidden="true" />
                                 <Typography variant="body2" color="text.secondary">
                                     {hometown}
                                 </Typography>
                             </Box>
                         )}
                         {currentStatus && (
                             <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                                 <WorkOutlineIcon sx={{ fontSize: '1rem', color: 'text.secondary' }} aria-hidden="true" />
                                 <Typography variant="body2" color="text.secondary">
                                     {currentStatus}
                                 </Typography>
                             </Box>
                         )}
                    </Stack>

                    {/* Contact Icons */}
                    <ContactIcons user={user} />
                </CardContent>
            </CardActionArea>
        </Card>
    );
});


// ----------------------------------------------------------------------
// Main Component (UserDirectory)
// ----------------------------------------------------------------------

function UserDirectory() {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = queryParams.get('year');

    // --- Hooks ---
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm')); // Check for small screens and below
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const { users: fetchedUsers, loading, error, totalCount } = useAllUsers(year);

    // --- Sorting ---
    const sortedUsers = useMemo(() => {
        if (!sortConfig.key) return fetchedUsers;
        const sortableItems = [...fetchedUsers];
        sortableItems.sort((a, b) => {
            let aValue, bValue;
            if (sortConfig.key === SORTABLE_FIELD_KEYS.ID) {
                aValue = a.basicInfo?.studentId ?? '';
                bValue = b.basicInfo?.studentId ?? '';
            } else if (sortConfig.key === SORTABLE_FIELD_KEYS.NAME) {
                aValue = a.basicInfo?.fullName?.toLowerCase() ?? '';
                bValue = b.basicInfo?.fullName?.toLowerCase() ?? '';
            } else return 0;
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
        return sortableItems;
    }, [fetchedUsers, sortConfig]);

    const requestSort = useCallback((key) => {
        setSortConfig(currentConfig => ({
            key,
            direction: currentConfig.key === key && currentConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    }, []);

    const getSortIcon = useCallback((key) => {
        const isActive = sortConfig.key === key;
        const IconComponent = isActive
            ? (sortConfig.direction === 'ascending' ? ArrowUpwardIcon : ArrowDownwardIcon)
            : ArrowDownwardIcon; // Default inactive icon (consistent)

        return (
            <SortIconContainer className={isActive ? "active" : ""}>
                <IconComponent sx={{ fontSize: '1rem' }} />
            </SortIconContainer>
        );
    }, [sortConfig]);

    // --- Render Functions for Different Views ---

    const renderDesktopContent = () => (
        <StyledTableContainer component={Paper} elevation={0}>
            <StyledTable aria-label="Student directory table">
                <TableHead>
                    <TableRow>
                        <TableHeaderCell issortable="false" sx={{ width: '5%' }} aria-label="Avatar"></TableHeaderCell>
                        <TableHeaderCell issortable="true" onClick={() => requestSort(SORTABLE_FIELD_KEYS.ID)} sx={{ width: '15%' }}>
                            <Box><span>ID</span>{getSortIcon(SORTABLE_FIELD_KEYS.ID)}</Box>
                        </TableHeaderCell>
                        <TableHeaderCell issortable="true" onClick={() => requestSort(SORTABLE_FIELD_KEYS.NAME)} sx={{ width: '25%' }}>
                            <Box><span>Name</span>{getSortIcon(SORTABLE_FIELD_KEYS.NAME)}</Box>
                        </TableHeaderCell>
                        <TableHeaderCell issortable="false" sx={{ width: '20%' }}>Hometown</TableHeaderCell>
                        <TableHeaderCell align="left" issortable="false" sx={{ width: '20%' }}>Contact</TableHeaderCell>
                        <TableHeaderCell align="left" issortable="false" sx={{ width: '15%', display: { xs: 'none', sm: 'table-cell' } }}>
                            Status
                        </TableHeaderCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sortedUsers.map((user) => (
                        <UserTableRow key={user.id} user={user} />
                    ))}
                </TableBody>
            </StyledTable>
        </StyledTableContainer>
    );

    const renderMobileContent = () => (
        <Stack spacing={2} sx={{ width: '100%' }}>
            {sortedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
            ))}
        </Stack>
        // Alternative: Grid layout if preferred
        // <Grid container spacing={2}>
        //     {sortedUsers.map((user) => (
        //         <Grid item xs={12} key={user.id}> {/* Ensure full width */}
        //             <UserCard user={user} />
        //         </Grid>
        //     ))}
        // </Grid>
    );

    // --- Main Render Logic ---
    const renderContent = () => {
        if (loading) return <LoadingOverlay><CircularProgress size={50} /></LoadingOverlay>;
        // Handle Firestore permission errors specifically if possible
        if (error?.code === 'permission-denied') {
            return (
                 <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ m: 2, alignItems: 'center' }}>
                    You do not have permission to view this directory. Please contact an administrator if you believe this is an error.
                </Alert>
            );
        }
        if (error) return (
            <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ m: 2, alignItems: 'center' }}>
                Failed to load student directory{year ? ` for batch ${year}` : ''}. Error: {error.message}
            </Alert>
        );
         if (!loading && sortedUsers.length === 0) return (
            <CenteredMessage>
                 No students found{year ? ` matching batch ${year}` : ''}.
             </CenteredMessage>
         );

        // The responsive switch
        return isMobile ? renderMobileContent() : renderDesktopContent();
    }

    return (
        <StyledContainer maxWidth="xl" sx={{ px: { xs: 1, sm: 2, md: 3 } }}> {/* Responsive padding */}
            <ContentWrapper>
                <StyledTitle variant="h5" component="h1">
                    Student Directory
                     {totalCount > 0 && !loading && ` (${totalCount})`}
                     {year && ` - Batch of ${year}`}
                </StyledTitle>

                {/* Render based on state and screen size */}
                {renderContent()}

            </ContentWrapper>
        </StyledContainer>
    );
}

export default UserDirectory;