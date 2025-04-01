/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom'; // Added Link
import { db } from '../firebase'; // Assuming firebase is initialized
import {
    collection,
    query,
    where, // Keep if filtering by batch year is still needed
    orderBy, // Keep for potential default ordering if needed before client sort
    getDocs,
    getCountFromServer,
} from "firebase/firestore";

// Material UI Components
import {
    Container, Typography, Table, TableBody, TableCell, TableContainer,
    TableHead, TableRow, Paper, Avatar, Box, IconButton,
    CircularProgress, Alert, Tooltip
} from '@mui/material';

// Icons
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import LaunchIcon from '@mui/icons-material/Launch'; // Added for external link
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward'; // Added for sorting
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'; // Added for sorting


// Emotion Styled Components
import styled from '@emotion/styled';

// --- Styled Components (Adjusted) ---

const StyledContainer = styled(Container)`
    margin-top: 20px;
    padding: 20px;
    min-height: calc(100vh - 120px);
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
`;

const StyledTableContainer = styled(TableContainer)`
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    overflow-x: auto;
    margin-bottom: 20px;
`;

const StyledTable = styled(Table)`
    min-width: 650px;
`;

const StyledAvatar = styled(Avatar)`
    width: 32px;
    height: 32px;
    font-size: 0.8rem;
`;

const TableHeaderCell = styled(TableCell)`
    font-weight: 600;
    background-color: #f8f9fa;
    color: #343a40;
    cursor: ${props => props.issortable === 'true' ? 'pointer' : 'default'}; // Added cursor for sortable
    position: relative;
    padding: 10px 16px;
    white-space: nowrap;
    border-bottom: 1px solid #dee2e6;
    user-select: none;

     &:hover {
        background-color: ${props => props.issortable === 'true' ? '#e9ecef' : '#f8f9fa'}; // Hover effect for sortable
    }
`;

// Added SortIconContainer back
const SortIconContainer = styled.span`
    display: inline-flex;
    vertical-align: middle;
    margin-left: 4px;
    opacity: 0.6;
    transition: opacity 0.2s ease-in-out;

    &.active {
      opacity: 1;
    }
`;


const DataTableCell = styled(TableCell)`
    padding: 8px 16px;
    vertical-align: middle;
    border-bottom: 1px solid #e9ecef;
    font-size: 0.875rem;
`;

const ContactIconBox = styled(Box)`
    display: flex;
    gap: 4px; // Reduced gap between icons
    align-items: center;
    flex-wrap: nowrap;
`;

const ContactIcon = styled(IconButton)`
    padding: 4px;
    color: #6c757d;

    &:hover {
        color: #0d6efd;
        background-color: transparent;
    }

    svg {
        width: 18px;
        height: 18px;
    }
`;

const LoadingOverlay = styled(Box)`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 200px;
    width: 100%;
`;

const CenteredMessage = styled(Typography)`
    text-align: center;
    margin-top: 20px;
    color: #6c757d;
`;

// ----------------------------------------------------------------------
// Constants
// ----------------------------------------------------------------------
// Re-add Sortable Fields keys used in component logic
const SORTABLE_FIELD_KEYS = {
    ID: 'ID',
    NAME: 'Name',
};

// ----------------------------------------------------------------------
// Custom Hook (Fetching All Users - Unchanged from previous step)
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
            let q = query(usersRef);

            if (year) {
                q = query(q, where("basicInfo.batch", "==", year));
            }

            // Optional default server-side order (affects initial load before client sort)
            // Ensure index exists if using this! e.g., composite (batch, studentId)
            // q = query(q, orderBy("basicInfo.studentId", "asc"));

            // Get Count
             let countQuery = query(usersRef);
             if (year) {
                 countQuery = query(countQuery, where("basicInfo.batch", "==", year));
             }
             try {
                const snapshot = await getCountFromServer(countQuery);
                setTotalCount(snapshot.data().count);
             } catch (countError) {
                console.warn("Could not get user count:", countError);
             }

            // Get All Docs
            const documentSnapshots = await getDocs(q);
            const fetchedUsers = documentSnapshots.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setUsers(fetchedUsers);

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
// Helper Components (Memoized)
// ----------------------------------------------------------------------

// Updated Contact Icons Component
const ContactIcons = React.memo(({ user }) => {
    const { id, basicInfo = {}, contactInfo = {} } = user; // Destructure id

    return (
        <ContactIconBox>
             {/* Profile Link Icon */}
             {id && ( // Only show if user.id is available
                 <Tooltip title="View Profile" arrow TransitionProps={{ timeout: 0 }}>
                    {/* Use React Router Link component */}
                    <ContactIcon
                        aria-label="view profile"
                        component={Link} // Use Link component
                        to={`/users/${id}`} // Dynamic link
                        // target="_blank" // Optional: Open in new tab
                        // rel="noopener noreferrer" // If using target="_blank"
                    >
                         <LaunchIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
             )}

            {/* Email Icon */}
            {basicInfo.email && (
                <Tooltip title={basicInfo.email} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="email" href={`mailto:${basicInfo.email}`} target="_blank">
                        <EmailIcon fontSize="inherit" />
                    </ContactIcon>
                </Tooltip>
            )}
             {/* Other Icons */}
            {contactInfo.phoneNumber && (
                 <Tooltip title={contactInfo.phoneNumber} arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="phone" href={`tel:${contactInfo.phoneNumber}`} target="_blank">
                        <PhoneIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
            {contactInfo.linkedin && (
                 <Tooltip title="LinkedIn Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="linkedin" href={contactInfo.linkedin.startsWith('http') ? contactInfo.linkedin : `https://www.linkedin.com/in/${contactInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <LinkedInIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
            {contactInfo.facebook && (
                 <Tooltip title="Facebook Profile" arrow TransitionProps={{ timeout: 0 }}>
                    <ContactIcon aria-label="facebook" href={contactInfo.facebook.startsWith('http') ? contactInfo.facebook : `https://www.facebook.com/${contactInfo.facebook}`} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon fontSize="inherit" />
                    </ContactIcon>
                 </Tooltip>
            )}
        </ContactIconBox>
    );
});

// UserTableRow Component (Unchanged)
const UserTableRow = React.memo(({ user }) => {
    const fullName = user.basicInfo?.fullName;
    const placeholderChar = fullName?.split(' ')[0]?.charAt(0)?.toUpperCase() || '?';
    const profileBg = user.basicInfo?.profilebg || '#bdbdbd';

    return (
        <TableRow hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
            <DataTableCell sx={{ width: '5%' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <StyledAvatar sx={{ bgcolor: profileBg }}>
                        {placeholderChar}
                    </StyledAvatar>
                </Box>
            </DataTableCell>
            <DataTableCell sx={{ width: '15%' }}>
                {user.basicInfo?.studentId || "N/A"}
            </DataTableCell>
            <DataTableCell sx={{ width: '25%', fontWeight: 500 }}>
                {fullName || "N/A"}
            </DataTableCell>
            <DataTableCell sx={{ width: '20%' }}>
                {user.placeInfo?.hometown || "N/A"}
            </DataTableCell>
            <DataTableCell align="left" sx={{ width: '20%' }}>
                {/* Pass the full user object which includes the id */}
                <ContactIcons user={user} />
            </DataTableCell>
            <DataTableCell align="left" sx={{ width: '15%' }}>
                {user.basicInfo?.currentStatus || "Unknown"}
            </DataTableCell>
        </TableRow>
    );
});

// ----------------------------------------------------------------------
// Main Component (UserDirectory) - Added Client-Side Sorting
// ----------------------------------------------------------------------

function UserDirectory() {
    const location = useLocation();
    const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
    const year = queryParams.get('year');

    // State for client-side sorting
    const [sortConfig, setSortConfig] = useState({
        key: null, // 'ID' or 'Name' from SORTABLE_FIELD_KEYS, or null for default
        direction: 'ascending'
    });

    // Fetch all users using the hook
    const {
        users: fetchedUsers, // Rename to avoid conflict with sortedUsers
        loading,
        error,
        totalCount
    } = useAllUsers(year);

    // Memoized sorting logic
    const sortedUsers = useMemo(() => {
        if (!sortConfig.key) {
            // Return fetched users in their default order (potentially ordered by ID from Firestore)
            return fetchedUsers;
        }

        // Create a sortable copy
        const sortableItems = [...fetchedUsers];

        sortableItems.sort((a, b) => {
            let aValue, bValue;

            // Access the correct values based on the sort key
            if (sortConfig.key === SORTABLE_FIELD_KEYS.ID) {
                aValue = a.basicInfo?.studentId ?? ''; // Handle potential undefined
                bValue = b.basicInfo?.studentId ?? '';
            } else if (sortConfig.key === SORTABLE_FIELD_KEYS.NAME) {
                aValue = a.basicInfo?.fullName?.toLowerCase() ?? ''; // Case-insensitive name sort
                bValue = b.basicInfo?.fullName?.toLowerCase() ?? '';
            } else {
                return 0; // Should not happen if key is validated
            }

            // Comparison logic
            if (aValue < bValue) {
                return sortConfig.direction === 'ascending' ? -1 : 1;
            }
            if (aValue > bValue) {
                return sortConfig.direction === 'ascending' ? 1 : -1;
            }
            return 0; // Values are equal
        });

        return sortableItems;
    }, [fetchedUsers, sortConfig]); // Re-sort when fetched data or config changes


    // Sort request handler
    const requestSort = (key) => {
        let direction = 'ascending';
        // If clicking the same key, toggle direction
        if (sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        // If switching to a new key, default to ascending
        setSortConfig({ key, direction });
    };

    // Get sort icon helper
    const getSortIcon = (key) => {
        if (sortConfig.key === key) {
            const Icon = sortConfig.direction === 'ascending' ? ArrowUpwardIcon : ArrowDownwardIcon;
            return (
                <SortIconContainer className="active"> {/* Added active class */}
                    <Icon sx={{ fontSize: '1rem' }} />
                </SortIconContainer>
            );
        }
        // Optionally show a default dimmed icon for sortable columns when not active
        // return (
        //     <SortIconContainer>
        //         <ArrowUpwardIcon sx={{ fontSize: '1rem' }} />
        //     </SortIconContainer>
        // );
        return null; // Return null if not the active sort key
    };


    // --- Render Logic ---
    const renderTableContent = () => {
        if (loading) return <LoadingOverlay><CircularProgress /></LoadingOverlay>;
        if (error) return (
            <Alert severity="error" icon={<WarningAmberIcon />} sx={{ m: 2 }}>
                Error loading users: {error.message}. Please try again.
                {error.code === 'failed-precondition' && ' (Hint: Check Firestore indexes if using server-side default order)'}
            </Alert>
        );
         if (!loading && sortedUsers.length === 0) return <CenteredMessage>No users found{year ? ` for batch ${year}` : ''}.</CenteredMessage>;

        return (
            <StyledTableContainer component={Paper}>
                <StyledTable aria-label="User directory table">
                    <TableHead>
                        <TableRow>
                            {/* Non-Sortable Header */}
                            <TableHeaderCell issortable="false">Photo</TableHeaderCell>
                            {/* Sortable ID Header */}
                            <TableHeaderCell
                                issortable="true"
                                onClick={() => requestSort(SORTABLE_FIELD_KEYS.ID)}
                                aria-sort={sortConfig.key === SORTABLE_FIELD_KEYS.ID ? sortConfig.direction : 'none'}
                            >
                                ID {getSortIcon(SORTABLE_FIELD_KEYS.ID)}
                            </TableHeaderCell>
                             {/* Sortable Name Header */}
                            <TableHeaderCell
                                issortable="true"
                                onClick={() => requestSort(SORTABLE_FIELD_KEYS.NAME)}
                                aria-sort={sortConfig.key === SORTABLE_FIELD_KEYS.NAME ? sortConfig.direction : 'none'}
                            >
                                Name {getSortIcon(SORTABLE_FIELD_KEYS.NAME)}
                            </TableHeaderCell>
                             {/* Non-Sortable Headers */}
                            <TableHeaderCell issortable="false">Hometown</TableHeaderCell>
                            <TableHeaderCell align="left" issortable="false">Contact</TableHeaderCell>
                            <TableHeaderCell align="left" issortable="false">Status</TableHeaderCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {/* Map over the client-side sorted users */}
                        {sortedUsers.map((user) => (
                            <UserTableRow key={user.id} user={user} />
                        ))}
                    </TableBody>
                </StyledTable>
            </StyledTableContainer>
        );
    }

    return (
        <StyledContainer maxWidth="lg">
            <ContentWrapper>
                <StyledTitle variant="h5" component="h1">
                    User Directory
                     {totalCount > 0 && !loading && ` (${totalCount})`}
                     {year && ` - Batch ${year}`}
                </StyledTitle>

                {renderTableContent()}

            </ContentWrapper>
            {/* <Footer /> */}
        </StyledContainer>
    );
}

export default UserDirectory;