import { db } from '../firebase';  // Import your Firebase configuration
import { doc, getDoc } from 'firebase/firestore';

export async function getSenderName(senderId) {
  try {
    const userRef = doc(db, 'users', senderId);
    const userSnapshot = await getDoc(userRef);
    if (userSnapshot.exists()) {
      const userData = userSnapshot.data();
      return userData.displayName || userData.email || "No Name"; // Return display name if available, otherwise email, or a default
    } else {
      return "Unknown Sender";
    }
  } catch (error) {
    console.error("Error fetching sender name:", error);
    return "Unknown Sender";
  }
}