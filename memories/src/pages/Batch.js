// src/pages/Batch.js
import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, getDocs, query, where } from "firebase/firestore";
import {
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Box,
  IconButton,
} from '@mui/material';
import Navbar from '../components/Navbar';
import { useLocation } from 'react-router-dom';
import styled from '@emotion/styled';
import Loader from '../components/Loader';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

// Styled Component for the entire container
const StyledContainer = styled(Container)`
  margin-top: 20px;
  padding: 20px;
`;

// Styles for the title
const StyledTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

// Styled Component for the Table
const StyledTableContainer = styled(TableContainer)`
  box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
  overflow-x: auto; /* Make table responsive */
`;

const StyledTable = styled(Table)`
  /* No extra styling needed */
  min-width: 650px; /* Ensure table doesn't collapse too much */
`;

// Styled Component for Avatar with smaller size and consistent styling
const StyledAvatar = styled(Avatar)`
  width: 32px;
  height: 32px;
  margin-right: 8px;
`;

// Function to create a header for the table cell
const TableHeaderCell = styled(TableCell)`
  font-weight: bold;
  background-color: #f5f5f5;
  color: #555;
`;

// Styles for the Contact Icon Box
const ContactIconBox = styled(Box)`
  display: flex;
  gap: 4px;
  align-items: center;
`;

// Style for Icons
const ContactIcon = styled(IconButton)`
  padding: 5px;
  width: 24px; /* smaller icons */
  height: 24px;   /* smaller icons */
  svg {  // Target the SVG icon inside the IconButton
    width: 20px;
    height: 20px;
  }
`;

function Batch() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const year = queryParams.get('year');
  const [totalUsers, setTotalUsers] = useState(0);
  const [displayedUsersCount, setDisplayedUsersCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Create a query to fetch users matching the batch
        const q = query(collection(db, "users"), where("basicInfo.batch", "==", year));
        const querySnapshot = await getDocs(q);

        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
        setDisplayedUsersCount(usersData.length); // Update displayed count

        // Fetch total user count (without batch filter for now - adjust as needed)
        const allUsersSnapshot = await getDocs(collection(db, "users"));
        setTotalUsers(allUsersSnapshot.size); //  Total user count in the database
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [year]); // Re-fetch users when 'year' changes

  useEffect(() => {
    // Update displayed count whenever the users state changes
    setDisplayedUsersCount(users.length);
  }, [users]);

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      <Navbar />
      <StyledContainer maxWidth="lg">
        <StyledTitle variant="h4" align="center" gutterBottom>
          Batch: {year}
        </StyledTitle>

         {/* Subheader */}
         <Typography variant="subtitle1" align="center" paragraph>
          Displaying data of {displayedUsersCount} students out of a total of {totalUsers} students.
        </Typography>

        <StyledTableContainer component={Paper}>
          <StyledTable aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableHeaderCell>Photo</TableHeaderCell>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell width="20%">Name</TableHeaderCell>
                <TableHeaderCell>Hometown</TableHeaderCell> {/* Hometown Header */}
                <TableHeaderCell align="left">Contact</TableHeaderCell>
                <TableHeaderCell align="left">Status</TableHeaderCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow
                  key={user.id}
                  sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                >
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <StyledAvatar style={{ backgroundColor: user.basicInfo?.profilebg }}>
                        {user.basicInfo?.fullName?.charAt(0).toUpperCase()}
                      </StyledAvatar>
                    </Box>
                  </TableCell>
                  <TableCell>{user.basicInfo?.studentId}</TableCell>
                  <TableCell width="20%">{user.basicInfo?.fullName}</TableCell>
                   <TableCell>{user.placeInfo?.hometown || "N/A"}</TableCell> {/* Hometown Cell */}
                  <TableCell align="left">
                    <ContactIconBox>
                      {user.basicInfo?.email && (
                        <ContactIcon aria-label="email" href={`mailto:${user.basicInfo?.email}`}>
                          <EmailIcon />
                        </ContactIcon>
                      )}
                      {user.contactInfo?.phoneNumber && (
                        <ContactIcon aria-label="phone" href={`tel:${user.contactInfo?.phoneNumber}`}>
                          <PhoneIcon />
                        </ContactIcon>
                      )}
                      {user.contactInfo?.linkedin && (
                        <ContactIcon aria-label="linkedin" href={`https://www.linkedin.com/in/${user.contactInfo?.linkedin}`} target="_blank" rel="noopener noreferrer">
                          <LinkedInIcon />
                        </ContactIcon>
                      )}
                      {user.contactInfo?.facebook && (
                        <ContactIcon aria-label="facebook" href={`https://www.facebook.com/${user.contactInfo?.facebook}`} target="_blank" rel="noopener noreferrer">
                          <FacebookIcon />
                        </ContactIcon>
                      )}
                      {/* If all fields are missing, display 'N/A' */}
                      {(!user.basicInfo?.email && !user.contactInfo?.phoneNumber && !user.contactInfo?.facebook && !user.contactInfo?.linkedin) && <span>N/A</span>}
                    </ContactIconBox>
                  </TableCell>
                  <TableCell align="left">
                      {user.basicInfo?.currentStatus ? user.basicInfo?.currentStatus : "Unknown"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </StyledTable>
        </StyledTableContainer>
      </StyledContainer>
    </>
  );
}

export default Batch;