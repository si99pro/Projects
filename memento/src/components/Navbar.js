import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import {
    AppBar,
    Toolbar,
    Typography,
    Button,
    Menu,
    MenuItem,
    Avatar,
    IconButton,
    Box,
    Tooltip,
    Stack,
    List,
    ListItem,
    ListItemText,
    Divider,
    Paper,
    Badge,
    styled,
} from '@mui/material';
import NotificationsIcon from '@mui/icons-material/Notifications'; // More modern filled icon
import AccountCircle from '@mui/icons-material/AccountCircle';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, getDocs } from 'firebase/firestore'; // Import Firestore functions
import { getSenderName } from '../utils/notificationUtils'; // Import the utility function
import { useAuth } from '../auth/PrivateRoute'; // Importing the useAuth Hook

// Styles (Leave your styles as they are)
const StyledAppBar = styled(AppBar)`
  background-color: #fff;
  color: #333;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
`;

const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
  min-height: 64px;
`;

const StyledTypography = styled(Typography)`
  cursor: pointer;
  font-weight: 600;
  color: #006de2;
  &:hover {
    color: #1565c0;
  }
`;

const NotificationDropdownPaper = styled(Paper)`
  position: absolute;
  top: 60px;
  right: 20px;
  z-index: 1000;
  border: 1px solid #ddd;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  min-width: 200px;
  max-width: 350px;
  max-height: 400px;
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
  border-radius: 4px;
`;

const NotificationItem = styled(ListItem)`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 16px;
    background-color: ${props => props.read ? '#ffffff' : '#f0f0f0'}; // Apply background color based on read status

    &:hover {
        background-color: #e0e0e0; // Darken slightly on hover
        cursor: pointer;
    }
`;

function Navbar() {
    const navigate = useNavigate();
    const [batchAnchorEl, setBatchAnchorEl] = useState(null);
    const batchOpen = Boolean(batchAnchorEl);
    const [deptAnchorEl, setDeptAnchorEl] = useState(null);
    const deptOpen = Boolean(deptAnchorEl);
    const [profileAnchorEl, setProfileAnchorEl] = useState(null);
    const profileOpen = Boolean(profileAnchorEl);
    const [notifications, setNotifications] = useState([]); // Renamed from notices
    const [notificationDropdownOpen, setNotificationDropdownOpen] = useState(false);
    const notificationRef = useRef(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const MAX_NOTIFICATIONS = 5;
    const [senderNames, setSenderNames] = useState({}); // To cache sender names
    // eslint-disable-next-line no-unused-vars
    const {user, loading, profileBg, userName} = useAuth(); // Get the user and data from the AuthContext

    const userId = user ? user.uid : null; // Get the user ID

    useEffect(() => {
        if (!userId) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }

        const noticesCollection = collection(db, 'notices');
        const q = query(
            noticesCollection,
            where('userId', '==', userId),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const newNotifications = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setNotifications(newNotifications);

            // Calculate unread count
            const initialUnread = newNotifications.filter(notice => !notice.read).length; // Assuming 'read' field exists
            setUnreadCount(initialUnread);

            // Fetch sender names in bulk and store in state
            const uniqueSenderIds = [...new Set(newNotifications.map(n => n.senderId))];

            const fetchSenderNames = async () => {
                const names = {};
                for (const senderId of uniqueSenderIds) {
                    if (!senderNames[senderId]) {
                        names[senderId] = await getSenderName(senderId);
                    } else {
                        names[senderId] = senderNames[senderId]; // Use cached name
                    }
                }
                setSenderNames(prev => ({ ...prev, ...names }));  // Merge new names into existing cache
            };

            fetchSenderNames();
        });

        return () => unsubscribe();
    }, [userId, senderNames]); // Add userId and senderNames to the dependency array


    const handleBatchMenuOpen = (event) => {
        setBatchAnchorEl(event.currentTarget);
    };

    const handleBatchMenuClose = () => {
        setBatchAnchorEl(null);
    };

    const handleDeptMenuOpen = (event) => {
        setDeptAnchorEl(event.currentTarget);
    };

    const handleDeptMenuClose = () => {
        setDeptAnchorEl(null);
    };

    const handleGoToDashboard = () => {
        navigate('/dashboard');
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Logout Error:', error);
        }
    };

    const handleMenuItemClick = (year) => {
        handleBatchMenuClose();
        navigate(`/batch?year=${year}`);
    };

    const handleDeptMenuItemClick = (path) => {
        handleDeptMenuClose();
        navigate(path);
    };

    const handleProfileMenuOpen = (event) => {
        setProfileAnchorEl(event.currentTarget);
    };

    const handleProfileMenuClose = () => {
        setProfileAnchorEl(null);
    };

    const handleProfileClick = () => {
        handleProfileMenuClose();
        navigate('/profile');
    };

    const handleSettingsClick = () => {
        handleProfileMenuClose();
        navigate('/settings');
    };

    const currentYear = new Date().getFullYear();
    const startYear = 2016;
    const batchYears = [];
    for (let year = startYear; year <= currentYear; year++) {
        batchYears.push(year);
    }

    const handleNotificationIconClick = () => {
        setNotificationDropdownOpen(!notificationDropdownOpen);
    };

    useEffect(() => {
        function handleClickOutside(event) {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setNotificationDropdownOpen(false);
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [notificationRef]);

    const displayedNotices = notifications.slice(0, MAX_NOTIFICATIONS);
    const hasMoreNotifications = notifications.length > MAX_NOTIFICATIONS;

    const handleViewAllNotificationsClick = () => {
        setNotificationDropdownOpen(false); // Close the dropdown
        navigate('/notifications');  // Redirect to Notifications.js
    };

    const handleMarkAllAsRead = async () => {
        try {
            const batch = db.batch(); // Create a new batch
            notifications.forEach(notice => {
                if (!notice.read) { // Only mark unread notifications
                    const notificationRef = doc(db, 'notices', notice.id);
                    batch.update(notificationRef, { read: true }); // Queue the update
                }
            });
            await batch.commit(); // Commit the batch
             setNotifications(prevNotifications =>
                prevNotifications.map(notice => ({ ...notice, read: true }))
            ); //Set the value to read as well.
        } catch (error) {
            console.error("Error marking all notifications as read:", error);
            // Optionally show an error message to the user
        }
    };

    return (
        <React.Fragment>
            <StyledAppBar position="static">
                <StyledToolbar>
                    <StyledTypography variant="h6" onClick={handleGoToDashboard}>
                        MEmento
                    </StyledTypography>

                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Button
                                aria-controls={deptOpen ? 'dept-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={deptOpen ? 'true' : undefined}
                                onClick={handleDeptMenuOpen}
                                color="inherit"
                            >
                                Dept.
                            </Button>

                            <Menu
                                id="dept-menu"
                                anchorEl={deptAnchorEl}
                                open={deptOpen}
                                onClose={handleDeptMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'dept-button',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                <MenuItem onClick={() => handleDeptMenuItemClick('/dept/overview')}>Overview</MenuItem>
                                <MenuItem onClick={() => handleDeptMenuItemClick('/dept/teachers')}>Teachers</MenuItem>
                                <MenuItem onClick={() => handleDeptMenuItemClick('/dept/students')}>Students</MenuItem>
                                <MenuItem onClick={() => handleDeptMenuItemClick('/dept/alumni')}>Alumni</MenuItem>
                                <MenuItem onClick={() => handleDeptMenuItemClick('/dept/materials')}>Materials</MenuItem>
                            </Menu>

                            <Button
                                aria-controls={batchOpen ? 'batch-menu' : undefined}
                                aria-haspopup="true"
                                aria-expanded={batchOpen ? 'true' : undefined}
                                onClick={handleBatchMenuOpen}
                                color="inherit"
                            >
                                Batch
                            </Button>

                            <Menu
                                id="batch-menu"
                                anchorEl={batchAnchorEl}
                                open={batchOpen}
                                onClose={handleBatchMenuClose}
                                MenuListProps={{
                                    'aria-labelledby': 'batch-button',
                                }}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                            >
                                {batchYears.map((year) => (
                                    <MenuItem
                                        key={year}
                                        onClick={() => handleMenuItemClick(year)}
                                    >
                                        {year}
                                    </MenuItem>
                                ))}
                            </Menu>

                            <Tooltip title="Notifications">
                                <IconButton
                                    color="inherit"
                                    onClick={handleNotificationIconClick}
                                    ref={notificationRef}
                                    sx={{
                                        transition: 'transform 0.2s ease-in-out', // Smooth hover
                                        '&:hover': {
                                            transform: 'scale(1.1)',  // Slight enlargement on hover
                                        },
                                    }}
                                >
                                    <Badge badgeContent={unreadCount} color="error">
                                        <NotificationsIcon />
                                    </Badge>
                                </IconButton>
                            </Tooltip>

                            <IconButton
                                size="small"
                                aria-label="account of current user"
                                aria-controls="profile-menu"
                                aria-haspopup="true"
                                onClick={handleProfileMenuOpen}
                                color="inherit"
                            >
                                {userName ? (
                                    <Avatar style={{ backgroundColor: profileBg, width: '28px', height: '28px', fontSize: '0.8rem' }}>{userName?.charAt(0).toUpperCase()}</Avatar>
                                ) : (
                                    <AccountCircle style={{ width: '28px', height: '28px' }} />
                                )}
                            </IconButton>

                            <Menu
                                id="profile-menu"
                                anchorEl={profileAnchorEl}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'right',
                                }}
                                keepMounted
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'right',
                                }}
                                open={profileOpen}
                                onClose={handleProfileMenuClose}
                            >
                                <MenuItem onClick={handleProfileClick}>Profile</MenuItem>
                                <MenuItem onClick={handleSettingsClick}>Settings</MenuItem>
                                <MenuItem onClick={handleLogout}>Sign out</MenuItem>
                            </Menu>
                        </Stack>
                    </Box>

                    {notificationDropdownOpen && (
                        <NotificationDropdownPaper>
                            <Box display="flex" justifyContent="space-between" alignItems="center" padding="5px">
                                <Typography variant="h6">Notifications</Typography>
                                <Button
                                    onClick={handleMarkAllAsRead}
                                    color="primary"
                                    size="small"
                                    disabled={notifications.every(notice => notice.read)} // Disable if all are read
                                >
                                    Mark All as Read
                                </Button>
                            </Box>

                            <Divider style={{ marginBottom: '10px' }} />
                            <List>
                                {displayedNotices.map(notice => (
                                    <NotificationItem
                                        key={notice.id}
                                        alignItems="flex-start"
                                        component="li"
                                        read={notice.read}
                                        onClick={handleViewAllNotificationsClick}
                                    >
                                        <ListItemText
                                            primary={<Typography variant="subtitle2">{notice.title}</Typography>}
                                            secondary={
                                                <React.Fragment>
                                                    <Typography
                                                        component="span"
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {senderNames[notice.senderId] || "Loading..."} - {notice.timestamp?.toDate().toLocaleDateString()}
                                                        {/* Display sender's name and format timestamp */}
                                                    </Typography>
                                                    {` — ${notice.message.substring(0, 50)}...`}
                                                    {/* Display a short snippet of the message */}
                                                </React.Fragment>
                                            }
                                            sx={{ cursor: 'pointer' }}
                                        />
                                    </NotificationItem>
                                ))}
                                {displayedNotices.length === 0 && <Typography style={{ padding: '10px' }}>You have no notifications</Typography>}
                            </List>

                            {hasMoreNotifications && (
                                <Box display="flex" justifyContent="center" p={1}>
                                    <Button onClick={handleViewAllNotificationsClick} variant="outlined" size="small">
                                        Show More
                                    </Button>
                                </Box>
                            )}
                            {!hasMoreNotifications && displayedNotices.length > 0 && (
                                <Box display="flex" justifyContent="center" p={1}>
                                    <Button onClick={handleViewAllNotificationsClick} variant="outlined" size="small">
                                        View All
                                    </Button>
                                </Box>
                            )}
                        </NotificationDropdownPaper>
                    )}
                </StyledToolbar>
            </StyledAppBar>

        </React.Fragment>
    );
}

export default Navbar;