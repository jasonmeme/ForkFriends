import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getFunctions } from 'firebase/functions';

// Replace with your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAfJLWDNkxBwYvrp_U9iF10FPAqPgVKZto",
    authDomain: "forkfriend-e820b.firebaseapp.com",
    projectId: "forkfriend-e820b",
    storageBucket: "forkfriend-e820b.firebasestorage.app",
    messagingSenderId: "515863591917",
    appId: "1:515863591917:web:ca3e0836035bec6049c5e4",
    measurementId: "G-Z45Z54L0DT"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app);

export { db, auth, functions }; 