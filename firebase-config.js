// Import the functions you need from the SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDm3e_Heb6C2MV3GVEbAxAonFAn0q9tyrM",
    authDomain: "nyumbani-79352.firebaseapp.com",
    projectId: "nyumbani-79352",
    storageBucket: "nyumbani-79352.firebasestorage.app",
    messagingSenderId: "11444835305",
    appId: "1:11444835305:web:b64740ea8a42e473933178",
    measurementId: "G-11JPW1X2K7" // Keep this if you use Google Analytics, otherwise can be removed.
};

// Initialize Firebase services
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Export the initialized services for use in other modules
export { app, auth, db, storage };