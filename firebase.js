// Import the necessary Firebase services
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyAAi57N5bP4EoGmiT6B2ME7QuW6ps0yObA",
    authDomain: "cinespin.firebaseapp.com",
    projectId: "cinespin",
    storageBucket: "cinespin.appspot.com",
    messagingSenderId: "434323836110",
    appId: "1:434323836110:web:65a4c9cff05581c628549f"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app);
const firestore = getFirestore(app);

export { auth, firestore };