// src/contexts/AuthContext.js
import React, { createContext, useState, useEffect, useContext } from 'react';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, sendEmailVerification, onAuthStateChanged } from 'firebase/auth';
import { doc, setDoc, getFirestore } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const auth = getAuth();
  const db = getFirestore();


  const signup = async (email, password, fullName, studentId, session, batch) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Store additional user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        fullName,
        email,
        studentId,
        session,
        batch
      });

      // Send email verification
      await sendEmailVerification(user);
      setCurrentUser(user);
      navigate('/dashboard'); // Redirect after signup

      return user;
    } catch (error) {
      console.error("Signup error:", error);
      throw error; // Re-throw the error for handling in the component
    }
  };

  const login = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setCurrentUser(userCredential.user);
      navigate('/dashboard');
      return userCredential.user;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };


  const logout = () => {
    return signOut(auth).then(() => {
      setCurrentUser(null);
      navigate('/'); // Redirect to home or login
    });
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    loading
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe; // Unsubscribe on unmount
  }, [auth]);

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};