// src/dept/Alumni.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Container, Typography, Grid, Card, CardContent, Avatar, Box, IconButton, Skeleton, Stack } from '@mui/material';
import styled from '@emotion/styled';
// import Footer from '../components/Footer'; // Removed Footer import
import { db } from '../firebase';
import { collection, getDocs } from "firebase/firestore";
import EmailIcon from '@mui/icons-material/Email';
import PhoneIcon from '@mui/icons-material/Phone';
import FacebookIcon from '@mui/icons-material/Facebook';
import LinkedInIcon from '@mui/icons-material/LinkedIn';

const StyledContainer = styled(Container)`
  padding-top: 40px;
  padding-bottom: 40px; // Keep bottom padding for spacing
`;

const StyledTitle = styled(Typography)`
  text-align: center;
  margin-bottom: 30px;
  color: #333;
  font-weight: 500;
`;

const StyledAvatar = styled(Avatar)`
  width: 80px;
  height: 80px;
  margin-bottom: 15px;
  margin-left: auto;
  margin-right: auto;
  font-size: 2rem;
  border: 2px solid #eee;
`;

const AlumniCard = styled(Card)`
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  cursor: pointer; // Make card look clickable
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 4px 10px rgba(0,0,0,0.15);
  }
`;

const BatchBadge = styled(Box)`
  position: absolute;
  top: 8px;   // Move closer to the corner
  right: 8px;  // Move closer to the corner
  background-color: ${({ theme }) => theme.palette.primary.main};
  color: white;
  border-radius: 50%;
  width: 30px;   // Make smaller
  height: 30px;  // Make smaller
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem; // Adjust font size for smaller badge
  font-weight: bold;
  z-index: 1;
`;

const ContactIconBox = styled(Box)`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 15px;
`;

const StyledIconButton = styled(IconButton)`
  padding: 6px;
  color: ${({ theme, disabled }) => (disabled ? theme.palette.action.disabled : theme.palette.text.secondary)};
  &:not([disabled]):hover {
     color: ${({ theme }) => theme.palette.primary.main};
  }
  & .MuiSvgIcon-root {
    font-size: 1.25rem;
  }
`;

// --- Skeleton Component (Remains the same) ---
const AlumniCardSkeleton = () => (
  <Grid item xs={12} sm={6} md={4}>
    <AlumniCard>
      <CardContent sx={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Skeleton variant="circular" width={80} height={80} sx={{ marginBottom: '15px' }} />
        <Skeleton variant="text" width="70%" height={28} sx={{ marginBottom: '5px' }} /> {/* Name */}
        <Skeleton variant="text" width="50%" height={20} sx={{ marginBottom: '2px' }}/> {/* Position */}
        <Skeleton variant="text" width="60%" height={20} sx={{ marginBottom: '15px' }}/> {/* Company */}
        <Stack direction="row" spacing={1} justifyContent="center">
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
          <Skeleton variant="circular" width={28} height={28} />
        </Stack>
      </CardContent>
    </AlumniCard>
  </Grid>
);

// --- Main Component ---
function Alumni() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Initialize useNavigate hook

  useEffect(() => {
    const fetchAlumni = async () => {
      setLoading(true);
      setError(null);
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const alumniData = querySnapshot.docs.map(doc => ({
          id: doc.id, // Ensure ID (UID) is captured
          ...doc.data()
        }));
        setAlumni(alumniData);
      } catch (err) {
        console.error("Error fetching alumni:", err);
        setError("Failed to load alumni data. Please check your connection and try again.");
      } finally {
        setTimeout(() => setLoading(false), 500);
      }
    };

    fetchAlumni();
  }, []);

  const getWorkInfo = (person) => {
    return person?.workInfo?.workExperience?.[0] ?? {};
  };

  // Function to handle card click navigation
  const handleCardClick = (userId) => {
    if (userId) {
      navigate(`/users/${userId}`); // Navigate to the dynamic user profile page
    } else {
      console.warn("Cannot navigate: User ID is missing."); // Optional warning
    }
  };

  // Function to stop propagation when clicking icons inside the card
  const handleIconClick = (e) => {
    e.stopPropagation();
    // The default link behavior (href) will still work if not disabled
  };


  return (
    <>
      <StyledContainer maxWidth="lg">
        <StyledTitle variant="h4" gutterBottom>
          Department Alumni
        </StyledTitle>

        {error && (
          <Typography color="error" align="center" sx={{ my: 3 }}>
            {error}
          </Typography>
        )}

        <Grid container spacing={4}>
          {loading
            ?
              Array.from(new Array(6)).map((_, index) => (
                <AlumniCardSkeleton key={index} />
              ))
            :
              alumni.map(person => {
                const basicInfo = person?.basicInfo ?? {};
                const contactInfo = person?.contactInfo ?? {};
                const workInfo = getWorkInfo(person);

                const fullName = basicInfo.fullName || 'Alumnus Name';
                const position = workInfo.position || 'Position Unavailable';
                const company = workInfo.company || 'Company Unavailable';
                const batch = basicInfo.batch ? basicInfo.batch.slice(-2) : '??';
                const profileBg = basicInfo.profilebg || '#bdbdbd';
                const initial = fullName !== 'Alumnus Name' ? fullName.charAt(0).toUpperCase() : '?';

                return (
                  <Grid item xs={12} sm={6} md={4} key={person.id}>
                    {/* Attach onClick handler to the Card */}
                    <AlumniCard onClick={() => handleCardClick(person.id)}>
                      <BatchBadge>
                        {batch}
                      </BatchBadge>
                      <CardContent>
                        <StyledAvatar
                          style={{ backgroundColor: profileBg }}
                          src={basicInfo.profilePhotoURL}
                          alt={fullName}
                        >
                          {!basicInfo.profilePhotoURL && initial}
                        </StyledAvatar>
                        <Typography variant="h6" component="div" gutterBottom>
                          {fullName}
                        </Typography>
                        {(workInfo.position || workInfo.company) ? (
                          <>
                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: '1.43em' }}>
                              {position}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ minHeight: '1.43em' }}>
                              {company}
                            </Typography>
                          </>
                         ) : (
                          <Typography variant="body2" color="text.disabled" sx={{ minHeight: '2.86em', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                             Work Info Unavailable
                           </Typography>
                         )}

                        <ContactIconBox>
                          <StyledIconButton
                            aria-label="email"
                            href={basicInfo.email ? `mailto:${basicInfo.email}` : undefined}
                            disabled={!basicInfo.email}
                            onClick={handleIconClick} // Stop propagation
                          >
                            <EmailIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            aria-label="phone"
                            href={contactInfo.phoneNumber ? `tel:${contactInfo.phoneNumber}` : undefined}
                            disabled={!contactInfo.phoneNumber}
                            onClick={handleIconClick} // Stop propagation
                          >
                            <PhoneIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            aria-label="linkedin"
                            href={contactInfo.linkedin ? `https://www.linkedin.com/in/${contactInfo.linkedin}` : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={!contactInfo.linkedin}
                            onClick={handleIconClick} // Stop propagation
                          >
                            <LinkedInIcon />
                          </StyledIconButton>
                          <StyledIconButton
                            aria-label="facebook"
                            href={contactInfo.facebook ? `https://www.facebook.com/${contactInfo.facebook}` : undefined}
                            target="_blank"
                            rel="noopener noreferrer"
                            disabled={!contactInfo.facebook}
                            onClick={handleIconClick} // Stop propagation
                          >
                            <FacebookIcon />
                          </StyledIconButton>
                        </ContactIconBox>
                      </CardContent>
                    </AlumniCard>
                  </Grid>
                );
            })}
        </Grid>

        {!loading && !error && alumni.length === 0 && (
            <Typography color="text.secondary" align="center" sx={{ my: 5 }}>
                No alumni data found.
            </Typography>
        )}

      </StyledContainer>
      {/* <Footer /> Removed */}
    </>
  );
}

export default Alumni;