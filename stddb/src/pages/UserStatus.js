/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
import React, { useState, useEffect, useRef } from 'react';
import { auth, db } from '../firebase';
import {
    Container,
    Typography,
    Grid,
    Paper,
    Avatar,
    Modal,
    Box,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button,
    Card,
    CardContent,
    Divider,
    IconButton,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    LinearProgress,
    AppBar,
    Toolbar,
    Menu,
    useTheme,
    useMediaQuery,
    Link, // Import Link
} from '@mui/material';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import Footer from '../components/Footer';
import styled from '@emotion/styled';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import AllMomentList from '../components/AllMomentList';
import AssessmentIcon from '@mui/icons-material/Assessment';
import EventIcon from '@mui/icons-material/Event';
import PeopleIcon from '@mui/icons-material/People';
import UpdateIcon from '@mui/icons-material/Update';
import EditIcon from '@mui/icons-material/Edit';
import NotificationsIcon from '@mui/icons-material/Notifications';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MenuIcon from '@mui/icons-material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import Badge from '@mui/material/Badge';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DoNotDisturbIcon from '@mui/icons-material/DoNotDisturb';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import UserInfo from './UserStatus';  // Assuming UserInfo is in the same directory

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

// Styled Components - Streamlined and more consistent
const primaryColor = '#3f51b5';
const secondaryColor = '#7986cb';
const accentColor = '#f44336';
const backgroundColor = '#f5f5f5';
const textColor = '#212121';

const StyledContainer = styled(Container)`
    margin-top: 20px;
    padding: 20px;
    background-color: ${backgroundColor};
    color: ${textColor};
    font-family: 'Roboto', sans-serif;
    min-height: 90vh;
`;

const SectionGrid = styled(Grid)`
    margin-bottom: 30px;
`;

const StyledPaper = styled(Paper)`
    padding: 20px;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
`;

const SectionTitle = styled(Typography)`
    font-size: 1.5rem;
    font-weight: 500;
    margin-bottom: 15px;
    color: ${primaryColor};
`;

const WidgetCard = styled(Card)`
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
`;

const WidgetCardHeader = styled(CardContent)`
    border-bottom: 1px solid #eee;
    padding: 15px;
    background-color: #fafafa;
`;

const WidgetCardContent = styled(CardContent)`
    padding: 15px;
`;

const DataCard = styled(Card)`
    background-color: ${primaryColor};
    color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
`;

const DataCardContent = styled(CardContent)`
    padding: 15px;
    text-align: center;
`;

const DataCardTitle = styled(Typography)`
    font-size: 1.2rem;
    font-weight: 400;
    margin-bottom: 5px;
`;

const DataCardValue = styled(Typography)`
    font-size: 2rem;
    font-weight: 600;
`;

const ActivityItem = styled(ListItem)`
    padding: 10px;
    border-bottom: 1px solid #eee;

    &:last-child {
        border-bottom: none;
    }
`;

const NotificationItem = styled(ListItem)`
    padding: 10px;
    border-bottom: 1px solid #eee;
    &:last-child {
        border-bottom: none;
    }
    &:hover {
        background-color: #f0f0f0;
    }
`;

const CourseProgressContainer = styled(Paper)`
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 15px;
`;

const CourseProgressLabel = styled(Typography)`
    margin-bottom: 5px;
`;

const CourseProgressBar = styled(LinearProgress)`
    border-radius: 5px;
`;

const StyledAppBar = styled(AppBar)`
    background-color: ${primaryColor};
    color: white;
`;

const StyledToolbar = styled(Toolbar)`
    display: flex;
    justify-content: space-between;
`;

const MenuButton = styled(IconButton)`
    color: white;
`;

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 400,
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
    borderRadius: '8px',
};

// Data - Using more realistic/varied data
const trendingUsers = [
    { id: 1, name: 'Alice Smith', activity: 'Mastered React Hooks', avatar: 'AS' },
    { id: 2, name: 'Bob Johnson', activity: 'Contributed to Open Source Project', avatar: 'BJ' },
    { id: 3, name: 'Charlie Brown', activity: 'Published an article on Web Accessibility', avatar: 'CB' },
    { id: 4, name: 'Diana Miller', activity: 'Completed Advanced JavaScript Course', avatar: 'DM' },
];

const notifications = [
    { id: 1, message: 'Reminder: Upcoming Project Deadline', time: '1 day ago' },
    { id: 2, message: 'New Course Available: Data Science Fundamentals', time: '2 days ago' },
    { id: 3, message: 'Community Meetup Next Week - RSVP Now!', time: '3 days ago' },
    { id: 4, message: 'Congratulations on Completing the Python Course!', time: '4 days ago' },
];

// Chart data (more dynamic)
const generateChartData = () => {
    const labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const data = labels.map(() => Math.floor(Math.random() * 100)); // Random progress data
    return {
        labels,
        datasets: [
            {
                label: 'Monthly Progress',
                data,
                backgroundColor: primaryColor,
            },
        ],
    };
};

const generateAssignmentData = () => {
    const completed = Math.floor(Math.random() * 100);
    const remaining = 100 - completed;
    return {
        labels: ['Completed', 'Remaining'],
        datasets: [
            {
                label: 'Assignments',
                data: [completed, remaining],
                backgroundColor: [primaryColor, secondaryColor],
            },
        ],
    };
};

const useDashboardData = () => {
    const [chartData, setChartData] = useState(generateChartData());
    const [assignmentData, setAssignmentData] = useState(generateAssignmentData());

    useEffect(() => {
        const intervalId = setInterval(() => {
            setChartData(generateChartData());
            setAssignmentData(generateAssignmentData());
        }, 5000); // Update every 5 seconds

        return () => clearInterval(intervalId);
    }, []);

    return { chartData, assignmentData };
};

const chartOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Monthly Course Progress',
        },
    },
};

const assignmentOptions = {
    responsive: true,
    plugins: {
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Assignment Completion Rate',
        },
    },
};

const QuickLinksContainer = styled(Paper)`
    padding: 15px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    background-color: #fff;
    margin-bottom: 20px;
`;

const QuickLinksScroll = styled(Box)`
    overflow-x: auto;  /* Horizontal scroll */
    white-space: nowrap; /* Prevent wrapping */
    padding-bottom: 10px;  /* Add some space for scrollbar */

    /* Hide scrollbar */
    &::-webkit-scrollbar {
        display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;


function Dashboard() {
    const [user, setUser] = useState(null);
    const [ocrUserData, setOcrUserData] = useState(null); // State for OCR user data
    const [profileBg, setProfileBg] = useState('');
    const [openStatusModal, setOpenStatusModal] = useState(false);
    const [currentStatus, setCurrentStatus] = useState('');
    const dashboardContentRef = useRef(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);
    const isMenuOpen = Boolean(anchorEl);

    const { chartData, assignmentData } = useDashboardData(); // Use the hook
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));


    useEffect(() => {
        let isMounted = true;

        async function fetchData() {
            try {
                const userDocRef = doc(db, 'users', auth.currentUser.uid);
                const docSnap = await getDoc(userDocRef);

                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (isMounted) {
                        setUser(userData);
                        setProfileBg(userData.basicInfo.profilebg);

                        if (!userData.basicInfo.currentStatus) {
                            setOpenStatusModal(true);
                        } else {
                            setCurrentStatus(userData.basicInfo.currentStatus);
                        }

                        // Simulate OCR data (Replace with your actual OCR logic)
                        const ocrData = {
                            batch: userData.basicInfo.batch || "20XX",
                            currentStatus: userData.basicInfo.currentStatus || "Unknown",
                            email: userData.basicInfo.email || "noemail@example.com",
                            emailStatus: userData.basicInfo.emailStatus || false,
                            fullName: userData.basicInfo.fullName || "Unknown User",
                            profilebg: userData.basicInfo.profilebg || "#CCCCCC",
                            session: userData.basicInfo.session || "XXXX-XXXX",
                            studentId: userData.basicInfo.studentId || "XXXXXXXXX"
                        };

                        console.log("OCR Data:", ocrData); // Check the OCR data
                        setOcrUserData(ocrData); // Set the OCR data
                    }
                } else {
                    console.log('No such document!');
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
            }
        }

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const handleStatusChange = (event) => {
        setCurrentStatus(event.target.value);
    };

    const handleStatusSubmit = async () => {
        try {
            const userDocRef = doc(db, 'users', auth.currentUser.uid);
            await updateDoc(userDocRef, {
                'basicInfo.currentStatus': currentStatus,
            });

            setUser((prevState) => ({
                ...prevState,
                basicInfo: {
                    ...prevState.basicInfo,
                    currentStatus: currentStatus,
                },
            }));

            setOpenStatusModal(false);
        } catch (error) {
            console.error('Error updating current status:', error);
        }
    };

    const handleCloseStatusModal = () => {
        setOpenStatusModal(false);
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleProfileMenuOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        alert('Edit Profile functionality to be implemented');
        handleMenuClose();
    };

    const handleLogout = async () => {
        try {
            await auth.signOut();
            // Redirect to login page or update state as needed
        } catch (error) {
            console.error('Logout failed', error);
        }
        handleMenuClose();
    };

    const renderMenu = (
        <Menu
            anchorEl={anchorEl}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            keepMounted
            transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            open={isMenuOpen}
            onClose={handleMenuClose}
        >
            <MenuItem onClick={handleEditProfile}>Edit Profile</MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
        </Menu>
    );

    return (
        <>
            {/*No need to render the app bar*/}

            <StyledContainer maxWidth="lg" ref={dashboardContentRef}>
                {/* User Info and Welcome Text */}
                {ocrUserData ? (
                    <UserInfo userData={ocrUserData} />
                ) : (
                    <Typography>Loading user information...</Typography>
                )}

                <QuickLinksContainer>
                    <SectionTitle variant="h6">Quick Links</SectionTitle>
                    <QuickLinksScroll>
                        <Button variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                            Course Catalog
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                            Assignment Submission
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                            Grades
                        </Button>
                        <Button variant="outlined" color="primary" style={{ marginRight: '10px' }}>
                            Discussion Forums
                        </Button>
                        {/* Add more quick links here */}
                    </QuickLinksScroll>
                </QuickLinksContainer>

                <Grid container spacing={3}>
                    {/* Overview Section */}
                    <Grid item xs={12}>
                        <StyledPaper>
                            <SectionTitle variant="h5">Overview</SectionTitle>
                            <Grid container spacing={3}>
                                <Grid item xs={12} md={4}>
                                    <DataCard>
                                        <DataCardContent>
                                            <DataCardTitle>Courses Enrolled</DataCardTitle>
                                            <DataCardValue>5</DataCardValue>
                                        </DataCardContent>
                                    </DataCard>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <DataCard>
                                        <DataCardContent>
                                            <DataCardTitle>Assignments Due</DataCardTitle>
                                            <DataCardValue>2</DataCardValue>
                                        </DataCardContent>
                                    </DataCard>
                                </Grid>
                                <Grid item xs={12} md={4}>
                                    <DataCard>
                                        <DataCardContent>
                                            <DataCardTitle>Total Points Earned</DataCardTitle>
                                            <DataCardValue>450</DataCardValue>
                                        </DataCardContent>
                                    </DataCard>
                                </Grid>
                            </Grid>
                        </StyledPaper>
                    </Grid>

                    {/* Course Progress Section */}
                    <Grid item xs={12} md={6}>
                        <CourseProgressContainer>
                            <SectionTitle variant="h6">Course Progress</SectionTitle>
                            <Bar data={chartData} options={chartOptions} />
                        </CourseProgressContainer>
                    </Grid>

                    {/* Assignment Overview Section */}
                    <Grid item xs={12} md={6}>
                        <CourseProgressContainer>
                            <SectionTitle variant="h6">Assignment Overview</SectionTitle>
                            <Doughnut data={assignmentData} options={assignmentOptions} />
                        </CourseProgressContainer>
                    </Grid>

                    {/* Latest Activities Section */}
                    <Grid item xs={12} md={6}>
                        <WidgetCard>
                            <WidgetCardHeader>
                                <Typography variant="h6">Latest Activities</Typography>
                            </WidgetCardHeader>
                            <WidgetCardContent>
                                <List>
                                    {trendingUsers.map((user) => (
                                        <ActivityItem key={user.id} alignItems="flex-start">
                                            <ListItemAvatar>
                                                <Avatar>{user.avatar}</Avatar>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={user.name}
                                                secondary={
                                                    <Typography variant="body2" color="textSecondary">
                                                        {user.activity}
                                                    </Typography>
                                                }
                                            />
                                        </ActivityItem>
                                    ))}
                                </List>
                            </WidgetCardContent>
                        </WidgetCard>
                    </Grid>

                    {/* Notifications Section */}
                    <Grid item xs={12} md={6}>
                        <WidgetCard>
                            <WidgetCardHeader>
                                <Typography variant="h6">Notifications</Typography>
                            </WidgetCardHeader>
                            <WidgetCardContent>
                                <List>
                                    {notifications.map((notification) => (
                                        <NotificationItem key={notification.id} alignItems="flex-start">
                                            <ListItemText
                                                primary={notification.message}
                                                secondary={
                                                    <Typography variant="body2" color="textSecondary">
                                                        {notification.time}
                                                    </Typography>
                                                }
                                            />
                                        </NotificationItem>
                                    ))}
                                </List>
                            </WidgetCardContent>
                        </WidgetCard>
                    </Grid>

                    {/* Discussions Section */}
                    <Grid item xs={12}>
                        <WidgetCard>
                            <WidgetCardHeader>
                                <Typography variant="h6">Latest Discussions</Typography>
                            </WidgetCardHeader>
                            <WidgetCardContent>
                                <AllMomentList />
                            </WidgetCardContent>
                        </WidgetCard>
                    </Grid>
                </Grid>
            </StyledContainer>

            {/* Current Status Modal */}
            <Modal
                open={openStatusModal}
                onClose={handleCloseStatusModal}
                aria-labelledby="current-status-modal"
                aria-describedby="update-user-current-status"
            >
                <Box sx={modalStyle}>
                    <Typography id="current-status-modal" variant="h6" component="h2">
                        Update Your Current Status
                    </Typography>
                    <FormControl fullWidth margin="normal">
                        <InputLabel id="current-status-label">Current Status</InputLabel>
                        <Select
                            labelId="current-status-label"
                            id="current-status-select"
                            value={currentStatus}
                            label="Current Status"
                            onChange={handleStatusChange}
                        >
                            <MenuItem value="Studying">Studying</MenuItem>
                            <MenuItem value="Graduated">Graduated</MenuItem>
                            <MenuItem value="Employed">Employed</MenuItem>
                            <MenuItem value="Overseas">Overseas</MenuItem>
                            <MenuItem value="Unemployed">Unemployed</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleStatusSubmit}
                        style={{ marginTop: '20px' }}
                    >
                        Submit
                    </Button>
                </Box>
            </Modal>

            <Footer />
        </>
    );
}

export default Dashboard;