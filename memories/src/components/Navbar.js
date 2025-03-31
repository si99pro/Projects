// Navbar.js
import React, { useState, useEffect } from 'react';
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
    Stack
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import AccountCircle from '@mui/icons-material/AccountCircle';
import styled from '@emotion/styled';
import { doc, getDoc } from 'firebase/firestore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

// Styled component for the app bar.
const StyledAppBar = styled(AppBar)`
  background-color: #fff;
  color: #333;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
`;

// Styles for the toolbar
const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
  min-height: 64px; /* Standard toolbar height */
`;

// Styles for the typography component(for app logo)
const StyledTypography = styled(Typography)`
  cursor: pointer;
  font-weight: 600; // Semi-bold
  color:#006de2; /* Green accent color */
  &:hover {
    color:#1565c0; /* Darker shade on hover */
  }
`;

function Navbar() {
    const navigate = useNavigate();
    const [profileBg, setProfileBg] = useState('');
    const [userName, setUserName] = useState('');
    const [batchAnchorEl, setBatchAnchorEl] = useState(null); // Renamed for clarity
    const batchOpen = Boolean(batchAnchorEl); // Renamed for clarity
    const [deptAnchorEl, setDeptAnchorEl] = useState(null);
    const deptOpen = Boolean(deptAnchorEl);

    const [profileAnchorEl, setProfileAnchorEl] = React.useState(null);
    const profileOpen = Boolean(profileAnchorEl);


    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(async (user) => {
            if (user) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    const docSnap = await getDoc(userDocRef);

                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setProfileBg(userData.basicInfo.profilebg)
                        setUserName(userData.basicInfo.fullName);
                    } else {
                        console.log('No such document!');
                    }
                } catch (error) {
                    console.error('Error fetching user data:', error);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    const handleBatchMenuOpen = (event) => { // Renamed for clarity
        setBatchAnchorEl(event.currentTarget);
    };

    const handleBatchMenuClose = () => { // Renamed for clarity
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
        handleBatchMenuClose(); // Close the menu after selecting a batch
        navigate(`/batch?year=${year}`);
    };

     const handleDeptMenuItemClick = (path) => {
        handleDeptMenuClose();
        navigate(path);
    };

    // Profile button functions
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

    return (
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
                          endIcon={<ArrowDropDownIcon />}
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
                          <MenuItem onClick={() => handleDeptMenuItemClick('/dept/stars')}>Stars</MenuItem>
                          <MenuItem onClick={() => handleDeptMenuItemClick('/dept/syllabus')}>Syllabus</MenuItem>
                          <MenuItem onClick={() => handleDeptMenuItemClick('/dept/materials')}>Materials</MenuItem>
                      </Menu>

                      <Button
                          aria-controls={batchOpen ? 'batch-menu' : undefined}  // Renamed
                          aria-haspopup="true"
                          aria-expanded={batchOpen ? 'true' : undefined}  // Renamed
                          onClick={handleBatchMenuOpen}  // Renamed
                          color="inherit"
                          endIcon={<ArrowDropDownIcon />}
                      >
                          Batch
                      </Button>

                      <Menu
                          id="batch-menu"  // Renamed
                          anchorEl={batchAnchorEl}  // Renamed
                          open={batchOpen}  // Renamed
                          onClose={handleBatchMenuClose}  // Renamed
                          MenuListProps={{
                              'aria-labelledby': 'batch-button', // Renamed
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
                                  onClick={() => handleMenuItemClick(year)}  // Simplified
                              >
                                  {year}
                              </MenuItem>
                          ))}
                      </Menu>

                      <Tooltip title="Notifications">
                          <IconButton color="inherit">
                              <NotificationsNoneOutlinedIcon />
                          </IconButton>
                      </Tooltip>

                      {/* Profile Icon and Dropdown */}
                      <IconButton
                          size="small"
                          aria-label="account of current user"
                          aria-controls="profile-menu" // Added ID for accessibility
                          aria-haspopup="true"
                          onClick={handleProfileMenuOpen}
                          color="inherit"
                      >
                          {userName ? (
                              <Avatar style={{ backgroundColor: profileBg, width: '28px', height: '28px', fontSize: '0.8rem' }}>{userName?.charAt(0).toUpperCase()}</Avatar>
                          ) : (
                              <AccountCircle style={{ width: '28px', height: '28px' }} /> // Use a default icon if no user data
                          )}
                      </IconButton>

                      <Menu // Menu is on top and the functions also now all set
                          id="profile-menu"  // Added ID for accessibility
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
            </StyledToolbar>
        </StyledAppBar>
    );
}

export default Navbar;