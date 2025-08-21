import { createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";
import { auth, saveUserDataToFirestore } from "./auth.js";
import { storage } from "./firebase-config.js";

// Get role selection radio buttons and associated fields
const roleRadios = document.querySelectorAll('input[name="role"]');
const providerFields = document.getElementById('provider-fields');

// Get form and success message elements
const registrationForm = document.getElementById('registration-form');
const registrationFormArea = document.getElementById('registration-form-area');
const successMessageArea = document.getElementById('success-message-area');
const errorMessageEl = document.getElementById('registration-error-message');

// --- Role Switching Logic ---
roleRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'provider') {
            providerFields.style.display = 'block';
        } else {
            providerFields.style.display = 'none';
        }
    });
});

// --- Form Submission Logic ---
registrationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMessageEl.textContent = ''; // Clear previous errors

    const fullName = document.getElementById('full-name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirm-password').value;
    const role = document.querySelector('input[name="role"]:checked').value;

    if (password !== confirmPassword) {
        errorMessageEl.textContent = 'Passwords do not match.';
        return;
    }

    // Handle provider-specific fields
    let specialization = null;
    let licenseFile = null;
    if (role === 'provider') {
        specialization = document.getElementById('specialization').value;
        licenseFile = document.getElementById('license-upload').files[0];

        if (!specialization) {
            errorMessageEl.textContent = 'Please select a specialization.';
            return;
        }
        if (!licenseFile) {
            errorMessageEl.textContent = 'Please upload your license or credential.';
            return;
        }
    }

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        await updateProfile(user, { displayName: fullName });

        const userData = {
            fullName: fullName,
            status: role === 'provider' ? 'pending' : 'active'
        };

        if (role === 'provider') {
            const licenseRef = ref(storage, `licenses/${user.uid}/${licenseFile.name}`);
            await uploadBytes(licenseRef, licenseFile);
            userData.specialty = specialization;
            userData.licensePath = `licenses/${user.uid}/${licenseFile.name}`;
            await saveUserDataToFirestore(user, userData, 'provider');
        } else {
            await saveUserDataToFirestore(user, userData, 'user');
        }

        // Show success message and hide form
        registrationFormArea.style.display = 'none';
        successMessageArea.style.display = 'block';

    } catch (error) {
        const errorCode = error.code;
        if (errorCode === 'auth/email-already-in-use') {
            errorMessageEl.textContent = 'This email address is already in use.';
        } else if (errorCode === 'auth/weak-password') {
            errorMessageEl.textContent = 'Password should be at least 6 characters.';
        } else {
            errorMessageEl.textContent = 'Registration failed. Please try again.';
            console.error("Registration error:", error);
        }
    }
});