import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  Timestamp,
  updateDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';
import { User, Match } from '../types';

const USERS_COLLECTION = 'users';
const MATCHES_COLLECTION = 'matches';

// User operations
export const createUser = async (name: string): Promise<User> => {
  const userRef = doc(collection(db, USERS_COLLECTION));
  const newUser: User = {
    id: userRef.id,
    name,
    availableToday: false
  };
  
  await setDoc(userRef, newUser);
  return newUser;
};

export const getUser = async (userId: string): Promise<User | null> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    return { id: userSnap.id, ...userSnap.data() } as User;
  }
  
  return null;
};

export const updateUserAvailability = async (userId: string, available: boolean): Promise<void> => {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    availableToday: available
  });
};

// Match operations
export const getTodayMatch = async (userId: string): Promise<Match | null> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const matchesQuery = query(
    collection(db, MATCHES_COLLECTION),
    where('date', '>=', Timestamp.fromDate(today)),
    where('date', '<', Timestamp.fromDate(tomorrow)),
    where('user1Id', '==', userId)
  );
  
  const matchesQuery2 = query(
    collection(db, MATCHES_COLLECTION),
    where('date', '>=', Timestamp.fromDate(today)),
    where('date', '<', Timestamp.fromDate(tomorrow)),
    where('user2Id', '==', userId)
  );
  
  const [snapshot1, snapshot2] = await Promise.all([
    getDocs(matchesQuery),
    getDocs(matchesQuery2)
  ]);
  
  const matches = [...snapshot1.docs, ...snapshot2.docs];
  
  if (matches.length > 0) {
    const matchData = matches[0].data();
    const match = {
      id: matches[0].id,
      date: (matchData.date as Timestamp).toDate(),
      user1Id: matchData.user1Id,
      user2Id: matchData.user2Id
    } as Match;
    
    // Get user names
    const [user1Snap, user2Snap] = await Promise.all([
      getDoc(doc(db, USERS_COLLECTION, match.user1Id)),
      getDoc(doc(db, USERS_COLLECTION, match.user2Id))
    ]);
    
    if (user1Snap.exists()) {
      match.user1Name = user1Snap.data().name;
    }
    
    if (user2Snap.exists()) {
      match.user2Name = user2Snap.data().name;
    }
    
    return match;
  }
  
  return null;
}; 