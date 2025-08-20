import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);

// Get HTML elements
const userDisplay = document.getElementById('auth-status');
const userInfoDisplay = userDisplay.querySelector('.user-info-display');
const noAuthDisplay = userDisplay.querySelector('.no-auth-display');
const userNameEl = document.getElementById('user-name');
const userEmailEl = document.getElementById('user-email');
const signOutBtn = document.getElementById('sign-out-btn');

// Login modal elements
const loginModal = document.getElementById('login-modal');
const loginLink = document.getElementById('login-link');
const closeBtn = loginModal.querySelector('.close-btn');
const loginForm = document.getElementById('login-form');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');
const loginErrorMsg = document.getElementById('login-error-message');

// --- Main Auth State Listener ---
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, show profile info
        userInfoDisplay.style.display = 'flex';
        noAuthDisplay.style.display = 'none';
        userNameEl.textContent = user.displayName || 'User';
        userEmailEl.textContent = user.email;
    } else {
        // User is signed out, show login/register options
        userInfoDisplay.style.display = 'none';
        noAuthDisplay.style.display = 'block';
    }
});

// --- Login Modal Control ---
loginLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginModal.style.display = 'flex';
});

closeBtn.addEventListener('click', () => {
    loginModal.style.display = 'none';
    loginErrorMsg.textContent = ''; // Clear any previous error messages
});

window.addEventListener('click', (e) => {
    if (e.target === loginModal) {
        loginModal.style.display = 'none';
        loginErrorMsg.textContent = '';
    }
});

// --- Form Submission Handlers ---
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    loginErrorMsg.textContent = '';

    const email = loginEmailInput.value;
    const password = loginPasswordInput.value;

    try {
        await signInWithEmailAndPassword(auth, email, password);
        loginModal.style.display = 'none';
        console.log('User logged in successfully!');
    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/wrong-password' || errorCode === 'auth/user-not-found') {
            loginErrorMsg.textContent = 'Invalid email or password.';
        } else {
            loginErrorMsg.textContent = 'Login failed. Please try again later.';
        }
        console.error('Login error:', error);
    }
});

// --- Sign Out Handler ---
signOutBtn.addEventListener('click', async () => {
    try {
        await signOut(auth);
        console.log('User signed out successfully!');
        // The onAuthStateChanged listener will handle the UI update
    } catch (error) {
        console.error('Sign out error:', error);
    }
});