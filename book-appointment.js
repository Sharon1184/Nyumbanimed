import { doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { auth, db } from "./firebase-config.js";

// DOM elements
const providerInfoCard = document.querySelector('.provider-info-card');
const bookingForm = document.getElementById('booking-form');
const patientNameInput = document.getElementById('patient-name');
const bookingMessageEl = document.getElementById('booking-message');

let currentProviderId = null;

// Function to get provider ID from URL
const getProviderIdFromUrl = () => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('providerId');
};

// Function to fetch and display provider details
const fetchProviderDetails = async (providerId) => {
    if (!providerId) {
        bookingMessageEl.textContent = 'Error: No provider selected.';
        return;
    }

    try {
        const providerDocRef = doc(db, 'providers', providerId);
        const providerDoc = await getDoc(providerDocRef);

        if (providerDoc.exists()) {
            const providerData = providerDoc.data();
            providerInfoCard.innerHTML = `
                <img src="${providerData.photoURL || 'placeholder.png'}" alt="${providerData.fullName}" class="provider-photo">
                <div class="provider-details">
                    <h3 class="provider-name">${providerData.fullName}</h3>
                    <p class="provider-specialty">${providerData.specialty}</p>
                </div>
            `;
            // Store the ID for later use in form submission
            currentProviderId = providerId;
        } else {
            bookingMessageEl.textContent = 'Provider not found.';
        }
    } catch (error) {
        console.error("Error fetching provider details:", error);
        bookingMessageEl.textContent = 'Failed to load provider information.';
    }
};

// Initial check for a logged-in user and provider ID
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in, pre-fill patient name
        patientNameInput.value = user.displayName || '';

        // Get provider ID and fetch details
        const providerId = getProviderIdFromUrl();
        fetchProviderDetails(providerId);

    } else {
        // No user is signed in, redirect to login page
        window.location.href = 'login.html';
    }
});

// Handle form submission
bookingForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    bookingMessageEl.textContent = ''; // Clear previous messages

    if (!currentProviderId) {
        bookingMessageEl.textContent = 'Error: Provider not selected.';
        return;
    }

    const appointmentData = {
        providerId: currentProviderId,
        patientId: auth.currentUser.uid,
        patientName: patientNameInput.value,
        date: document.getElementById('appointment-date').value,
        time: document.getElementById('appointment-time').value,
        symptoms: document.getElementById('patient-symptoms').value,
        status: 'pending', // 'pending', 'accepted', 'rejected'
        timestamp: new Date()
    };

    try {
        const appointmentsRef = collection(db, 'appointments');
        await addDoc(appointmentsRef, appointmentData);
        bookingMessageEl.classList.remove('error-message');
        bookingMessageEl.classList.add('success-message');
        bookingMessageEl.textContent = 'Appointment booked successfully! The provider will be in touch shortly.';
        bookingForm.reset();
    } catch (error) {
        console.error("Error booking appointment:", error);
        bookingMessageEl.classList.remove('success-message');
        bookingMessageEl.classList.add('error-message');
        bookingMessageEl.textContent = 'Failed to book appointment. Please try again.';
    }
});