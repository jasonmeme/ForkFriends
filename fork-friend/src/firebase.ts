import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Firebase configuration with environment variables
const firebaseConfig = {
    apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAfJLWDNkxBwYvrp_U9iF10FPAqPgVKZto",
    authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "forkfriend-e820b.firebaseapp.com",
    projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "forkfriend-e820b",
    storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "forkfriend-e820b.firebasestorage.app",
    messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "515863591917",
    appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:515863591917:web:ca3e0836035bec6049c5e4",
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-Z45Z54L0DT"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions }; 