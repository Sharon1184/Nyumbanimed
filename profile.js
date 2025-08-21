import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { auth, getUserDataFromFirestore } from "./auth.js";

// Main profile section elements
const userInfoDisplay = document.querySelector('.user-info-display');
const noAuthDisplay = document.querySelector('.no-auth-display');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const signOutBtn = document.getElementById('sign-out-btn');

// Modal login elements
const loginModal = document.getElementById('login-modal');
const loginLink = document.getElementById('login-link');
const modalCloseBtn = loginModal.querySelector('.close-btn');
const modalLoginForm = loginModal.querySelector('#login-form');
const modalEmailInput = loginModal.querySelector('#login-email');
const modalPasswordInput = loginModal.querySelector('#login-password');
const modalErrorMessageEl = loginModal.querySelector('#login-error-message');

// --- Main Authentication State Listener ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        userInfoDisplay.style.display = 'block';
        noAuthDisplay.style.display = 'none';

        // Fetch user data from Firestore to get full name
        const userData = await getUserDataFromFirestore(user);
        userNameEl.textContent = userData?.fullName || user.email;
        userEmailEl.textContent = user.email;

    } else {
        // User is signed out
        userInfoDisplay.style.display = 'none';
        noAuthDisplay.style.display = 'block';
    }
});

// --- Sign Out Functionality ---
signOutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log("User signed out successfully.");
        // The onAuthStateChanged listener handles the UI change
    } catch (error) {
        console.error("Error signing out:", error);
    }
});

// --- Modal Functionality ---
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'flex';
});

modalCloseBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target == loginModal) {
        loginModal.style.display = 'none';
    }
});

modalLoginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    modalErrorMessageEl.textContent = ''; // Clear previous errors

    const email = modalEmailInput.value;
    const password = modalPasswordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginModal.style.display = 'none';
        console.log("Login successful.");
        // The onAuthStateChanged listener handles the UI change
        modalLoginForm.reset();
    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-email' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            modalErrorMessageEl.textContent = 'Invalid email or password.';
        } else {
            modalErrorMessageEl.textContent = 'Login failed. Please check your credentials.';
            console.error("Login error:", error);
        }
    }
});