//src/Profile.js
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { motion } from 'framer-motion'; // For smooth transition

const Profile = () => {
  const { currentUser, loading: authLoading } = useAuth(); // Get loading from auth context
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Add a flag to prevent setting state on unmounted components

    const fetchProfileData = async () => {
      if (currentUser) {
        const db = getFirestore();
        const userDocRef = doc(db, 'users', currentUser.uid);

        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists() && isMounted) {
            setProfileData(docSnap.data());
          } else {
            console.log("No such document!");
          }
        } catch (error) {
          console.error("Error getting document:", error);
        } finally {
            if(isMounted) {
                setLoading(false);
            }
        }
      } else {
        // Handle case where currentUser is null (e.g., user is not logged in)
          if (isMounted) {
              setLoading(false);
              setProfileData(null); // Clear any previous profile data
          }

      }
    };

    // Conditionally call fetchProfileData if currentUser is not null
    if (currentUser) {
        setLoading(true); // Set loading to true before fetching data
        fetchProfileData();
    } else {
        if (isMounted) {
            setLoading(false); // If no user, set loading to false immediately
            setProfileData(null); // Clear any existing profile data
        }
    }

    return () => {
      isMounted = false; // Set the flag to false when the component unmounts
    };
  }, [currentUser]);

  const getInitials = (fullName) => {
    if (!fullName) return '';
    return fullName.charAt(0).toUpperCase();
  };

    // Show loading if user is loading or profile is loading
    if (authLoading || loading) {
        return (
            <motion.div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: 'Arial, sans-serif',
                    fontSize: '2em',
                    fontWeight: 'bold',
                    color: '#555', // Light text for light background
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                Loading...
            </motion.div>
        );
    }


    // If profile data is not available, display a message
    if (!profileData) {
        return (
            <motion.div
                style={{
                    minHeight: '100vh',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    fontFamily: 'Arial, sans-serif',
                    color: '#555',
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <Typography variant="h6">
                    Could not load profile data. Please ensure you are logged in.
                </Typography>
            </motion.div>
        );
    }

  const { fullName, email, studentId, session } = profileData;
  let { profileBackgroundColor } = profileData;

  // Ensure profileBackgroundColor exists and is a string, if not assign a default
  if (typeof profileBackgroundColor !== 'string' || !profileBackgroundColor) {
    profileBackgroundColor = '#FFFFFF'; // Default white color
  }

  const profileImageStyle = {
    backgroundColor: profileBackgroundColor,
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '3em',
    fontWeight: 'bold',
    marginBottom: '20px',
    transition: 'background-color 0.3s ease'
  };


  return (
    <motion.div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black', // black text
        fontFamily: 'Arial, sans-serif',
        transition: 'background-color 0.3s ease'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div style={profileImageStyle}>
        {getInitials(fullName)}
      </div>
      <h2>{fullName}'s Profile</h2>
      <p>Email: {email}</p>
      <p>Student ID: {studentId}</p>
      <p>Session: {session}</p>
      {/* Add more profile information here */}
    </motion.div>
  );
};

export default Profile;