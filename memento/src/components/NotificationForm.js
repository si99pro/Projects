import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, serverTimestamp, getDocs, writeBatch, doc } from 'firebase/firestore';
import { useAuth } from '../auth/PrivateRoute';

function NotificationForm() {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [link, setLink] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const { user } = useAuth(); // get current user

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            if (!user) {
                setError("You must be logged in to send notifications.");
                return;
            }

            const senderId = user.uid; // Get the current user's ID

            // 1. Get all user IDs from the 'users' collection
            const usersCollection = collection(db, 'users');
            const usersSnapshot = await getDocs(usersCollection);
            const userIds = usersSnapshot.docs.map(doc => doc.id);

            // 2. Create a batched write to efficiently add notifications for all users

            const batch = writeBatch(db);
            const noticesCollection = collection(db, 'notices');

            userIds.forEach(userId => {
                const newDocRef = doc(noticesCollection); // Generate a unique document ID
                batch.set(newDocRef, {
                    userId: userId,
                    title: title,
                    message: message,
                    link: link,
                    timestamp: serverTimestamp(),
                    read: false,
                    senderId: senderId // Use the actual sender's ID
                });
            });

            // 3. Commit the batched write
            await batch.commit();

            setSuccess(true);
            setTitle('');
            setMessage('');
            setLink('');
        } catch (error) {
            console.error("Error sending notification:", error);
            setError("Failed to send notifications. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>Send Notification to All Users</h2>

            {error && <p className="error">{error}</p>}
            {success && <p className="success">Notifications sent successfully!</p>}

            <div>
                <label htmlFor="title">Title:</label>
                <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="message">Message:</label>
                <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                />
            </div>

            <div>
                <label htmlFor="link">Link (optional):</label>
                <input
                    type="text"
                    id="link"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                />
            </div>

            <button type="submit" disabled={loading}>
                {loading ? "Sending..." : "Send Notification"}
            </button>
        </form>
    );
}

export default NotificationForm;