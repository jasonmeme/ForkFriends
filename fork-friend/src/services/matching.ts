import { 
  collection, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  serverTimestamp, 
  Timestamp,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebase';
import { User } from '../types';

// This function would normally be implemented as a Firebase Cloud Function
// that runs daily at 11 AM. For now, we're implementing it client-side.
export const performMatching = async (): Promise<void> => {
  try {
    // Check if matching has already been done today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const matchesQuery = query(
      collection(db, 'matches'),
      where('createdAt', '>=', Timestamp.fromDate(today)),
      where('createdAt', '<', Timestamp.fromDate(tomorrow))
    );
    
    const existingMatches = await getDocs(matchesQuery);
    
    if (!existingMatches.empty) {
      console.log('Matching already performed today');
      return;
    }
    
    // Get all users who are available today
    const availableUsersQuery = query(
      collection(db, 'users'),
      where('availableToday', '==', true)
    );
    
    const availableUsersSnapshot = await getDocs(availableUsersQuery);
    const availableUsers: User[] = [];
    
    availableUsersSnapshot.forEach(doc => {
      availableUsers.push({ id: doc.id, ...doc.data() } as User);
    });
    
    // Shuffle the available users
    const shuffledUsers = shuffleArray([...availableUsers]);
    
    // Create matches
    const matches = [];
    
    for (let i = 0; i < shuffledUsers.length - 1; i += 2) {
      const user1 = shuffledUsers[i];
      const user2 = shuffledUsers[i + 1];
      
      if (user1 && user2) {
        matches.push({
          user1Id: user1.id,
          user2Id: user2.id,
          date: serverTimestamp(),
          createdAt: serverTimestamp()
        });
      }
    }
    
    // Store matches in Firestore
    const matchPromises = matches.map(match => addDoc(collection(db, 'matches'), match));
    await Promise.all(matchPromises);
    
    // Reset availability for all users
    const resetPromises = availableUsers.map(user => {
      const userRef = doc(db, 'users', user.id);
      return updateDoc(userRef, { availableToday: false });
    });
    
    await Promise.all(resetPromises);
    
    console.log('Matching completed successfully');
  } catch (error) {
    console.error('Error performing matching:', error);
    throw error;
  }
};

// Helper function to shuffle an array
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}; 