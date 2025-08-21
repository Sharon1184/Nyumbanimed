import { signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { auth, getUserDataFromFirestore } from "./auth.js";

const loginForm = document.getElementById('login-form');
const emailInput = document.getElementById('login-email');
const passwordInput = document.getElementById('login-password');
const errorMessageEl = document.getElementById('login-error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessageEl.textContent = ''; // Clear previous errors

    const email = emailInput.value;
    const password = passwordInput.value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Fetch user data from Firestore to get their role and other details
        const userData = await getUserDataFromFirestore(user);
        
        // Log the user in and redirect them based on their role
        if (userData && userData.role === 'provider' && userData.status === 'pending') {
            // Providers with pending status should not be fully logged in yet
            errorMessageEl.textContent = "Your provider account is under review. Please wait for approval.";
            // You can also sign them out if necessary
            auth.signOut();
        } else {
            // Redirect to the user's profile or home page
            window.location.href = 'profile.html';
        }

    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/invalid-email' || errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password') {
            errorMessageEl.textContent = 'Invalid email or password. Please try again.';
        } else {
            errorMessageEl.textContent = 'Login failed. Please check your credentials.';
            console.error("Login error:", error);
        }
    }
});