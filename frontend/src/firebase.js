import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getDatabase } from 'firebase/database';
import { getFunctions } from 'firebase/functions';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCtSXP6zeXp_HmvEYX9xs4vZLec_orS4U4",
  authDomain: "resident-management-syst-b06cb.firebaseapp.com",
  projectId: "resident-management-syst-b06cb",
  storageBucket: "resident-management-syst-b06cb.firebasestorage.app",
  messagingSenderId: "191069102873",
  appId: "1:191069102873:web:39810b90dbc5053e615b88",
  measurementId: "G-WFMMDP6XL7",  // Remove if not needed
  databaseURL: "https://resident-management-syst-b06cb-default-rtdb.firebaseio.com"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Firebase services
const auth = getAuth(app);             // For authentication
const db = getFirestore(app);         // For Firestore database
const storage = getStorage(app);      // For Firebase storage
// const analytics = getAnalytics(app); // Optional: Comment if you don't need analytics
const rdb = getDatabase(app);
const functions = getFunctions(app);

// Export Firebase services to use in your app
export { auth, db, rdb, storage, functions };
