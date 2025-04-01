// src/pages/Admin.js
import React, { useEffect } from 'react';
import NotificationForm from '../components/NotificationForm';
import { useAuth } from '../auth/PrivateRoute';
import { useNavigate } from 'react-router-dom';

function Admin() {
    const { user, roles } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
    }, [user, navigate]);

    if (!user) {
        return null; // or a loading indicator
    }
        console.log(roles,user)
     if (Array.isArray(roles) && roles.includes('admin')) {
         console.log("User has admin role")
        return (
            <div>
                <h1>Admin Panel</h1>
                <p> You are an Administrator </p>
                <NotificationForm />
            </div>
        );
    }

        console.log("User NO admin role")
            return (
                 <div>
                     <h1>You do not have permission to view this page.</h1>
                     <p>Please log in with an administrator account.</p>
                     <p>You are not an Administrator </p>
                 </div>
             );
}

export default Admin;