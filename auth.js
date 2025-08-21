import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { app, db } from "./firebase-config.js";

const auth = getAuth(app);

/**
 * Saves a user's data to the appropriate Firestore collection.
 * @param {object} user - The Firebase Auth user object.
 * @param {object} data - Additional data to save (e.g., name, specialty).
 * @param {string} role - The user's role ('user' or 'provider').
 */
async function saveUserDataToFirestore(user, data, role) {
    let collectionRef;
    if (role === 'provider') {
        collectionRef = 'providers';
    } else {
        collectionRef = 'users';
    }

    try {
        await setDoc(doc(db, collectionRef, user.uid), {
            uid: user.uid,
            email: user.email,
            name: data.fullName,
            role: role,
            ...data
        }, { merge: true }); // Use merge to avoid overwriting existing data
        console.log("User data saved to Firestore successfully!");
    } catch (e) {
        console.error("Error adding user document: ", e);
    }
}

export { auth, saveUserDataToFirestore, onAuthStateChanged, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, updateProfile };