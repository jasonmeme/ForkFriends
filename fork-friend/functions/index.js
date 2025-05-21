// functions/index.js
const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

exports.dailyMatching = functions.pubsub
  .schedule('0 11 * * *')
  .timeZone('America/New_York')
  .onRun(async (context) => {
    try {
      // Check if matching has already been done today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const matchesQuery = await db.collection('matches')
        .where('createdAt', '>=', admin.firestore.Timestamp.fromDate(today))
        .where('createdAt', '<', admin.firestore.Timestamp.fromDate(tomorrow))
        .get();
      
      if (!matchesQuery.empty) {
        console.log('Matching already performed today');
        return null;
      }
      
      // Get all users who are available today
      const availableUsersQuery = await db.collection('users')
        .where('availableToday', '==', true)
        .get();
      
      const availableUsers = [];
      
      availableUsersQuery.forEach(doc => {
        availableUsers.push({ id: doc.id, ...doc.data() });
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
            date: admin.firestore.FieldValue.serverTimestamp(),
            createdAt: admin.firestore.FieldValue.serverTimestamp()
          });
        }
      }
      
      // Store matches in Firestore
      const batch = db.batch();
      
      for (const match of matches) {
        const matchRef = db.collection('matches').doc();
        batch.set(matchRef, match);
      }
      
      // Reset availability for all users
      for (const user of availableUsers) {
        const userRef = db.collection('users').doc(user.id);
        batch.update(userRef, { availableToday: false });
      }
      
      await batch.commit();
      
      console.log('Matching completed successfully');
      return null;
    } catch (error) {
      console.error('Error performing matching:', error);
      return null;
    }
  });

// Helper function to shuffle an array
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};