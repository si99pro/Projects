// Navbar.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    Box
} from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import GraphicEqIcon from '@mui/icons-material/GraphicEq';
import styled from '@emotion/styled';
import { doc, getDoc } from 'firebase/firestore';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

//Styled component for the app bar.
const StyledAppBar = styled(AppBar)`
  background-color: #fff;
  color: #333;
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.05);
`;

//Styles for the toolbar
const StyledToolbar = styled(Toolbar)`
  display: flex;
  justify-content: space-between;
  padding-left: 24px;
  padding-right: 24px;
`;

//Styles for the typography component(for app logo)
const StyledTypography = styled(Typography)`
  cursor: pointer;
  font-weight: 600; // Semi-bold
  color: #2e7d32; /* Green accent color */
`;

function Navbar() {
    const navigate = useNavigate();
    const [profileBg, setProfileBg] = useState('');
    const [userName, setUserName] = useState('');
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

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

    const handleMenu = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
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
             handleClose(); // Close the menu after selecting a batch
            navigate(`/batch?year=${year}`);
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
                    MEmories
                </StyledTypography>

                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Button color="inherit" component={Link} to="/stars">Stars</Button>

               <Button
                aria-controls={open ? 'basic-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                onClick={handleMenu}
                    color="inherit"
                    endIcon={<ArrowDropDownIcon />}
                        >
                      Batches
                </Button>

                    <Menu
                        id="basic-menu"
                        anchorEl={anchorEl}
                           open={open}
                           onClose={handleClose}
                          MenuListProps={{
                          'aria-labelledby': 'basic-button',
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
                                       onClick={(event) => handleMenuItemClick(year)}
                                     >
                                       {year}
                                   </MenuItem>
                             ))}
                     </Menu>



                    <IconButton color="inherit" component={Link} to="/moment-form">
                         <GraphicEqIcon />
                     </IconButton>

                     <IconButton color="inherit">
                        <ChatBubbleOutlineIcon />
                     </IconButton>

                    <IconButton color="inherit">
                        <NotificationsNoneOutlinedIcon />
                     </IconButton>

                     {/* Profile Icon and Dropdown */}
                     <IconButton
                            size="small"
                            aria-label="account of current user"
                            aria-controls="menu-appbar"
                            aria-haspopup="true"
                            onClick={handleProfileMenuOpen}
                              color="inherit"
                              >
                         <Avatar style={{ backgroundColor: profileBg, width: '28px', height: '28px' }}>{userName?.charAt(0).toUpperCase()}</Avatar>
                     </IconButton>


             <Menu // Menu is on top and the functions also now all set
               id="menu-appbar"
             anchorEl={profileAnchorEl}
            anchorOrigin={{
                 vertical: 'top',
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
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
           </Menu>
          </Box>
            </StyledToolbar>
        </StyledAppBar>
    );
}

export default Navbar;