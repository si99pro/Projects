/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom'; // useNavigate added, Link removed
import { db } from '../firebase';
import {
    collection,
    query,
    where,
    // orderBy, // Only needed if default server-order is critical before client sort
    getCountFromServer,
    getDocs,
} from "firebase/firestore";

// Material UI Components
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar, Box, IconButton,
    CircularProgress, Alert, Tooltip, useTheme, useMediaQuery // Import breakpoint hooks if needed elsewhere, but sx prop is simpler here
} from '@mui/material';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
// import LaunchIcon from '@mui/icons-material/Launch'; // Removed
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';


// Emotion Styled Components
import styled from '@emotion/styled';

// --- Styled Components (Adjusted) ---

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
    font-weight: 500; // Slightly bolder title
`;

const StyledTableContainer = styled(TableContainer)`
    border: 1px solid #e0e0e0;
    border-radius: 8px; // Slightly more rounded
    overflow-x: auto;
    margin-bottom: 20px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.05); // Subtle shadow
`;

const StyledTable = styled(Table)`
    min-width: 650px; // Keep min-width for larger screens
`;

const StyledAvatar = styled(Avatar)`
    width: 36px; // Slightly larger avatar
    height: 36px;
    font-size: 0.9rem;
    margin-right: 8px; // Add space between avatar and ID
`;

const TableHeaderCell = styled(TableCell)`
    font-weight: 600;
    background-color: #f8f9fa;
    color: #343a40;
    cursor: ${props => props.issortable === 'true' ? 'pointer' : 'default'};
    position: relative;
    padding: 12px 16px; // Slightly increased padding
    white-space: nowrap;
    border-bottom: 2px solid #dee2e6; // Stronger bottom border
    user-select: none;

     &:hover {
        background-color: ${props => props.issortable === 'true' ? '#e9ecef' : '#f8f9fa'};
    }

    /* Added Flexbox for icon positioning */
    .MuiBox-root {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 100%; /* Ensure Box takes full width */
    }
`;

const SortIconContainer = styled.span`
    display: inline-flex; /* Changed to inline-flex */
    vertical-align: middle; /* Keep vertical alignment */
    /* margin-left: 5px; // Removed margin, using flexbox space-between now */
    opacity: 0.4; /* Slightly more faded for inactive */
    transition: opacity 0.2s ease-in-out;
    line-height: 0; /* Prevent container from affecting line height */

    &.active {
      opacity: 1;
      color: #007bff; // Highlight active sort icon
    }
`;


const DataTableCell = styled(TableCell)`
    padding: 10px 16px; // Adjusted padding
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.9rem; // Slightly larger data font
    line-height: 1.4; // Improved line height for readability
`;

// Styled TableRow for clickability and hover effect
const ClickableTableRow = styled(TableRow)`
    cursor: pointer;
    transition: background-color 0.15s ease-in-out;
    &:hover {
        background-color: #f5f5f5; // Standard hover color
    }
    &:last-child td, &:last-child th {
        border: 0; // Remove border for last row
    }
`;


const ContactIconBox = styled(Box)`
    display: flex;
    gap: 6px; // Slightly increased gap
    align-items: center;
    flex-wrap: nowrap;
`;

const ContactIcon = styled(IconButton)`
    padding: 5px; // Adjusted padding
    color: #6c757d;

    &:hover {
        color: #0d6efd;
        background-color: rgba(13, 110, 253, 0.05); // Subtle background on hover
    }

    svg {
        width: 20px; // Slightly larger icons
        height: 20px;
    }
`;

const LoadingOverlay = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 300px; // Increased height for loading
    width: 100%;
`;

const CenteredMessage = styled(Typography)`
    text-align: center;
    padding: 40px 20px; // More padding for empty/error message
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
// Custom Hook (Fetching All Users - Unchanged)
// ----------------------------------------------------------------------
const useAllUsers = (year) => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [totalCount, setTotalCount] = useState(0);

    const fetchAllUsers = useCallback(async () => {
        // Reset states
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

            const countPromise = getCountFromServer(countQuery).then(snapshot => {
                 setTotalCount(snapshot.data().count);
            }).catch(countError => {
                 console.warn("Could not get user count:", countError);
                 setTotalCount(0);
            });

            const dataPromise = getDocs(dataQuery).then(documentSnapshots => {
                 const fetchedUsers = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                 setUsers(fetchedUsers);
            });

            await Promise.all([dataPromise, countPromise]);

        } catch (err) {
            console.error("Error fetching users:", err);
            setError(err);
            setUsers([]);
            setTotalCount(0);
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
// Helper Components (Memoized & Updated)
// ----------------------------------------------------------------------

// Updated Contact Icons Component (Profile Icon Removed)
const ContactIcons = React.memo(({ user }) => {
    const { basicInfo = {}, contactInfo = {} } = user;

    const formatUrl = (url, prefix = 'https://') => {
        if (!url) return '';
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }
        return `${prefix}${url}`;
    };

    const linkedInUrl = useMemo(() => formatUrl(contactInfo.linkedin, 'https://www.linkedin.com/in/'), [contactInfo.linkedin]);
    const facebookUrl = useMemo(() => formatUrl(contactInfo.facebook, 'https://www.facebook.com/'), [contactInfo.facebook]);

    return (
        <ContactIconBox onClick={(e) => e.stopPropagation()}>
            {basicInfo.email && (
                <Tooltip title={`Mail ${basicInfo.email}`} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="email" href={`mailto:${basicInfo.email}`} target="_blank">
                        <EmailIcon fontSize="inherit" />
                    </ContactIcon>
                </Tooltip>
            )}
            {contactInfo.phoneNumber && (
                 <Tooltip title={`Call ${contactInfo.phoneNumber}`} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="phone" href={`tel:${contactInfo.phoneNumber}`} target="_blank">
                        <PhoneIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
            {linkedInUrl && (
                 <Tooltip title="View LinkedIn Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="linkedin" href={linkedInUrl} target="_blank" rel="noopener noreferrer">
                        <LinkedInIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
             {facebookUrl && (
                 <Tooltip title="View Facebook Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="facebook" href={facebookUrl} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
        </ContactIconBox>
    );
});

// **UPDATED** UserTableRow Component (Status hidden on small screens)
const UserTableRow = React.memo(({ user }) => {
    const navigate = useNavigate();
    const fullName = user.basicInfo?.fullName;
    const placeholderChar = fullName?.split(' ')[0]?.charAt(0)?.toUpperCase() || '?';
    const profileBg = user.basicInfo?.profilebg || '#bdbdbd';

    const handleRowClick = useCallback(() => {
        if (user.id) {
            navigate(`/users/${user.id}`);
        } else {
            console.warn("User ID missing, cannot navigate.", user);
        }
    }, [navigate, user.id]);

    return (
        <ClickableTableRow onClick={handleRowClick}>
            {/* Avatar */}
            <DataTableCell sx={{ width: '5%' }}>
                 <StyledAvatar sx={{ bgcolor: profileBg }}>
                     {placeholderChar}
                 </StyledAvatar>
            </DataTableCell>
            {/* Student ID */}
            <DataTableCell sx={{ width: '15%' }}>
                {user.basicInfo?.studentId || "N/A"}
            </DataTableCell>
            {/* Full Name */}
            <DataTableCell sx={{ width: '25%', fontWeight: 500, color: '#212529' }}>
                {fullName || "N/A"}
            </DataTableCell>
            {/* Hometown */}
            <DataTableCell sx={{ width: '20%' }}>
                {user.placeInfo?.hometown || "N/A"}
            </DataTableCell>
            {/* Contact Icons */}
            <DataTableCell align="left" sx={{ width: '20%' }}>
                <ContactIcons user={user} />
            </DataTableCell>
            {/* Status (Hidden on small screens 'xs', shown 'sm' and up) */}
            <DataTableCell
                align="left"
                sx={{
                    width: '15%', // Keep width consistent for larger screens
                    display: { xs: 'none', sm: 'table-cell' } // Apply responsive display
                }}
            >
                {user.basicInfo?.currentStatus || "Unknown"}
            </DataTableCell>
        </ClickableTableRow>
    );
});

// ----------------------------------------------------------------------
// Main Component (UserDirectory - Title, Sorting Icons, Responsive Column updated)
// ----------------------------------------------------------------------

function UserDirectory() {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = queryParams.get('year');

    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
    const { users: fetchedUsers, loading, error, totalCount } = useAllUsers(year);

    // Memoized sorting logic (remains the same)
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

    // Sort request handler (remains the same)
    const requestSort = useCallback((key) => {
        setSortConfig(currentConfig => ({
            key,
            direction: currentConfig.key === key && currentConfig.direction === 'ascending' ? 'descending' : 'ascending'
        }));
    }, []);

    // Get sort icon helper (UPDATED to show active/inactive icons)
    const getSortIcon = useCallback((key) => {
        const isActive = sortConfig.key === key;
        const IconComponent = isActive
            ? (sortConfig.direction === 'ascending' ? ArrowUpwardIcon : ArrowDownwardIcon)
            : ArrowDownwardIcon; // Default inactive icon

        return (
            <SortIconContainer className={isActive ? "active" : ""}>
                <IconComponent sx={{ fontSize: '1rem' }} />
            </SortIconContainer>
        );
    }, [sortConfig]);


    // --- Render Logic ---
    const renderTableContent = () => {
        if (loading) return <LoadingOverlay><CircularProgress size={50} /></LoadingOverlay>;
        if (error) return (
            <Alert severity="error" icon={<WarningAmberIcon fontSize="inherit" />} sx={{ m: 2, alignItems: 'center' }}>
                Failed to load student directory{year ? ` for batch ${year}` : ''}. Please try refreshing the page.
            </Alert>
        );
         if (!loading && sortedUsers.length === 0) return (
            <CenteredMessage>
                 No students found{year ? ` matching batch ${year}` : ''}. {/* Updated empty message */}
             </CenteredMessage>
         );

        return (
            <StyledTableContainer component={Paper} elevation={0}>
                {/* Updated aria-label */}
                <StyledTable aria-label="Student directory table">
                    <TableHead>
                        <TableRow>
                            {/* Header Cells */}
                            <TableHeaderCell issortable="false" sx={{ width: '5%' }}>{/* Avatar */}</TableHeaderCell>
                            <TableHeaderCell issortable="true" onClick={() => requestSort(SORTABLE_FIELD_KEYS.ID)} sx={{ width: '15%' }}>
                                <Box>
                                    <span>ID</span>
                                    {getSortIcon(SORTABLE_FIELD_KEYS.ID)}
                                </Box>
                            </TableHeaderCell>
                            <TableHeaderCell issortable="true" onClick={() => requestSort(SORTABLE_FIELD_KEYS.NAME)} sx={{ width: '25%' }}>
                                <Box>
                                    <span>Name</span>
                                    {getSortIcon(SORTABLE_FIELD_KEYS.NAME)}
                                </Box>
                            </TableHeaderCell>
                            <TableHeaderCell issortable="false" sx={{ width: '20%' }}>Hometown</TableHeaderCell>
                            <TableHeaderCell align="left" issortable="false" sx={{ width: '20%' }}>Contact</TableHeaderCell>
                            {/* **UPDATED** Status Header (Hidden on 'xs', shown 'sm' and up) */}
                            <TableHeaderCell
                                align="left"
                                issortable="false"
                                sx={{
                                    width: '15%', // Keep width consistent for larger screens
                                    display: { xs: 'none', sm: 'table-cell' } // Apply responsive display
                                }}
                            >
                                Status
                            </TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sortedUsers.map((user) => (
                            // Pass user data to the updated UserTableRow component
                            <UserTableRow key={user.id} user={user} />
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        );
    }

    return (
        <StyledContainer maxWidth="xl">
            <ContentWrapper>
                {/* UPDATED Title */}
                <StyledTitle variant="h5" component="h1">
                    Student Directory {/* Changed Title */}
                     {totalCount > 0 && !loading && ` (${totalCount})`}
                     {year && ` - Batch of ${year}`}
                </StyledTitle>

                {renderTableContent()}

            </ContentWrapper>
        </StyledContainer>
    );
}

export default UserDirectory;