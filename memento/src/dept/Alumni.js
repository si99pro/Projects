// src/dept/Alumni.js
import React, { useState, useEffect } from 'react';
import { Container, Typography, Grid, Card, CardContent, Avatar, Box, IconButton } from '@mui/material';
import styled from '@emotion/styled';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import Loader from '../components/Loader';
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const StyledContainer = styled(Container)`
  margin-top: 20px;
  padding: 20px;
`;

const StyledTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
`;

const StyledAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  margin-bottom: 10px;
`;

const AlumniCard = styled(Card)`
  height: 100%;
  display: flex;
  flexDirection: column;
  justifyContent: space-between;
  position: relative;
`;

const BatchBadge = styled(Box)`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: primary;
  color: white;
  border-radius: 50%;
  width: 30px; /* Adjust as needed */
  height: 30px; /* Adjust as needed */
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem; /* Adjust as needed */
  font-weight: bold;
`;

const ContactIconBox = styled(Box)`
  display: flex;
  justify-content: center;
  margin-top: 10px;
`;

const ContactIcon = styled(IconButton)`
  padding: 5px;
  width: 24px;
  height: 24px;
  svg {
    width: 20px;
    height: 20px;
  }
`;

function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const alumniData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setAlumni(alumniData);
      } catch (err) {
        console.error("Error fetching alumni:", err);
        setError("Failed to load alumni data.");
      } finally {
        setLoading(false);
      }
    };

    fetchAlumni();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return (
      <>
        <Navbar />
        <StyledContainer maxWidth="md">
          <StyledTitle variant="h4" align="center" gutterBottom>
            Department Alumni
          </StyledTitle>
          <Typography color="error" align="center">
            {error}
          </Typography>
        </StyledContainer>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <StyledContainer maxWidth="lg">
        <StyledTitle variant="h4" align="center" gutterBottom>
          Department Alumni
        </StyledTitle>

        <Grid container spacing={3}>
          {alumni.map(person => (
            <Grid item xs={12} sm={6} md={4} key={person.id}>
              <AlumniCard>
                <BatchBadge>
                  {person.basicInfo?.batch?.slice(-2)}
                </BatchBadge>
                <CardContent sx={{ textAlign: 'center' }}>
                  <StyledAvatar
                    style={{ backgroundColor: person.basicInfo?.profilebg || '#ccc', margin: '0 auto' }}
                    src={person.basicInfo?.profilePhotoURL}
                    alt={person.basicInfo?.fullName}
                  >
                    {!person.basicInfo?.profilePhotoURL && person.basicInfo?.fullName?.charAt(0).toUpperCase()}
                  </StyledAvatar>
                  <Typography variant="h6" component="div">
                    {person.basicInfo?.fullName}
                  </Typography>
                  {person.workInfo?.workExperience && person.workInfo.workExperience[0] && (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {person.workInfo.workExperience[0].position}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {person.workInfo.workExperience[0].company}
                      </Typography>
                    </>
                  )}
                  <ContactIconBox>
                    {person.basicInfo?.email && (
                      <ContactIcon aria-label="email" href={`mailto:${person.basicInfo.email}`}>
                        <EmailIcon />
                      </ContactIcon>
                    )}
                    {person.contactInfo?.phoneNumber && (
                      <ContactIcon aria-label="phone" href={`tel:${person.contactInfo.phoneNumber}`}>
                        <PhoneIcon />
                      </ContactIcon>
                    )}
                    {person.contactInfo?.linkedin && (
                      <ContactIcon aria-label="linkedin" href={`https://www.linkedin.com/in/${person.contactInfo.linkedin}`} target="_blank" rel="noopener noreferrer">
                        <LinkedInIcon />
                      </ContactIcon>
                    )}
                    {person.contactInfo?.facebook && (
                      <ContactIcon aria-label="facebook" href={`https://www.facebook.com/${person.contactInfo.facebook}`} target="_blank" rel="noopener noreferrer">
                        <FacebookIcon />
                      </ContactIcon>
                    )}
                  </ContactIconBox>
                </CardContent>
              </AlumniCard>
            </Grid>
          ))}
        </Grid>
      </StyledContainer>
      <Footer />
    </>
  );
}

export default Alumni;