// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getFirestore, getDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
};

// Function to generate a random hex color
const generateRandomColor = () => {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
};

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const auth = getAuth();
    const db = getFirestore();


    const signup = async (email, password, basicInfo) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;


            // Get color or create the profile background color
            const profileBackgroundColor = await getOrCreateProfileColor(user.uid);
            // Store additional user data in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                ...basicInfo,
                profileBackgroundColor, // Store color
                is_verified: false, // Mark user as unverified in Firestore
            });

            // Send email verification
            await sendEmailVerification(user);
            setCurrentUser(user);

            return user;
        } catch (error) {
            console.error("Signup error:", error);
            throw error; // Re-throw the error for handling in the component
        }
    };

    const sendVerificationMail = async (user) => {
        try {
            setLoading(true);
            await sendEmailVerification(user);
            console.log("verification email resent success");
        } catch (error) {
            console.error("verification email resent failed", error);
            throw error;
        } finally {
            setLoading(false);
        }
    }


    // New Function: Get or create profile color
    async function getOrCreateProfileColor(userId) {
        const userDocRef = doc(db, "users", userId);
        try {
            const userDocSnap = await getDoc(userDocRef);

            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                if (userData.profileBackgroundColor) {
                    return userData.profileBackgroundColor; // Use existing color
                } else {
                    // Generate and save if not exists
                    const newColor = generateRandomColor();
                    await setDoc(userDocRef, { profileBackgroundColor: newColor }, { merge: true });
                    return newColor;
                }
            } else {
                // Generate a color for new user profile
                const newColor = generateRandomColor();
                await setDoc(userDocRef, { profileBackgroundColor: newColor }, { merge: true });
                return newColor;
            }
        } catch (error) {
            console.error("Error in getOrCreateProfileColor:", error);
            return generateRandomColor();
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // Load profile data from firestore for the user if it's valid, or create it.
                const userDocRef = doc(db, "users", user.uid);
                 // Get or create profile background color
                await getOrCreateProfileColor(user.uid);

                // Get existing data from Firestore for the current user and update is_verified
                const docSnap = await getDoc(userDocRef);
                 if (docSnap.exists()) {
                        const existingData = docSnap.data();
                         //setting user.isverified to existingData.is_verified from Firebase
                        user.is_verified = existingData.is_verified
                }

                setCurrentUser(user);
                setLoading(false);
                if (user.emailVerified) {
                    try {
                        const profileBackgroundColor = await getOrCreateProfileColor(user.uid); //Get ProfileBackgroundColor
                        const userDocRef = doc(db, 'users', user.uid);
                        const docSnap = await getDoc(userDocRef);
                        if (docSnap.exists()) {
                            const existingData = docSnap.data();
                            await setDoc(userDocRef, {
                                ...existingData,
                                profileBackgroundColor
                            });
                        } else {
                            console.log("No such document!");
                        }
                    } catch (error) {
                        console.error("Error updating Firestore:", error);
                    }
                }
            } else {
                setCurrentUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, [auth, db, currentUser]);

    const login = async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            // Access currentUser immediately after login
            const user = userCredential.user;

            return user;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    };

    const logout = () => {
        return signOut(auth).then(() => {
            setCurrentUser(null);
            navigate('/');
        });
    };

    const value = {
        currentUser,
        signup,
        login,
        logout,
        loading,
        sendVerificationMail,
        setLoading,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};