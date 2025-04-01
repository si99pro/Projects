import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { getSenderName } from '../utils/notificationUtils'; // Import the function!

function Notifications({ userId }) {
  const [notifications, setNotifications] = useState([]);
  const [senderNames, setSenderNames] = useState({}); // Cache sender names
    const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false); // Set loading to false if no userId
        return;
    }
    setLoading(true); // set Loading to true when load
    const noticesCollection = collection(db, 'notices');
    const q = query(
      noticesCollection,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newNotifications = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setNotifications(newNotifications);

      // Fetch sender names in bulk and store in state
      const uniqueSenderIds = [...new Set(newNotifications.map(n => n.senderId))];

      const fetchSenderNames = async () => {
        const names = {};
        for (const senderId of uniqueSenderIds) {
          if (!senderNames[senderId]) { // Only fetch if not already cached
            names[senderId] = await getSenderName(senderId);
          } else {
            names[senderId] = senderNames[senderId]; // Use cached value
          }
        }
        setSenderNames(prev => ({ ...prev, ...names }));  // Merge new names into existing cache
      };

      fetchSenderNames();
        setLoading(false)

    });

    return () => unsubscribe();
  }, [userId, senderNames]);  // add senderNames to the dependency array

  const handleMarkAsRead = async (notificationId) => {
    try {
        const notificationRef = doc(db, 'notices', notificationId);
        await updateDoc(notificationRef, { read: true });
    } catch (error) {
        console.error("Error marking notification as read:", error);
        // Optionally show an error message to the user
    }
  };

    if (loading) {
        return <p>Loading notifications...</p>;
    }
  if (!userId) {
    return <p>Please log in to view notifications.</p>;
  }

  return (
    <div>
      {notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul>
          {notifications.map(notification => (
            <li key={notification.id}>
              <Link to={notification.link || '/notifications'} onClick={() => handleMarkAsRead(notification.id)}>
                <strong>{notification.title}</strong> (from {senderNames[notification.senderId] || "Loading..."}): {notification.message}
                {!notification.read && <span> (New)</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Notifications;