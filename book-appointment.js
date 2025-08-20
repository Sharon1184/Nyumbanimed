import { getFirestore, doc, getDoc, collection, addDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

// Make sure to import the i18n script
import './i18n.js';

const db = getFirestore(app);

// Get URL parameters to find the provider ID
const urlParams = new URLSearchParams(window.location.search);
const providerId = urlParams.get('providerId');

const providerInfoCard = document.querySelector('.provider-info-card');
const bookingForm = document.getElementById('booking-form');
const bookingMessage = document.getElementById('booking-message');

// Function to fetch and display provider details
async function fetchProviderDetails() {
    if (!providerId) {
        providerInfoCard.innerHTML = `<p>${i18n.t('error_no_provider_selected')}</p>`;
        return;
    }
    
    try {
        const providerDocRef = doc(db, "providers", providerId);
        const providerDoc = await getDoc(providerDocRef);

        if (providerDoc.exists()) {
            const provider = providerDoc.data();
            providerInfoCard.innerHTML = `
                <h4><i class="fas fa-user-md"></i> ${i18n.t('provider')}: ${provider.name}</h4>
                <p>${i18n.t('specialty')}: ${provider.specialty}</p>
                <p>${i18n.t('location')}: ${provider.location}</p>
            `;
        } else {
            providerInfoCard.innerHTML = `<p>${i18n.t('provider_not_found')}</p>`;
        }
    } catch (error) {
        console.error("Error fetching provider details:", error);
        providerInfoCard.innerHTML = `<p>${i18n.t('error_loading_provider')}</p>`;
    }
}

// Function to handle form submission
bookingForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const patientName = document.getElementById('patient-name').value;
    const appointmentDate = document.getElementById('appointment-date').value;
    const appointmentTime = document.getElementById('appointment-time').value;
    const patientSymptoms = document.getElementById('patient-symptoms').value;

    bookingMessage.textContent = '';
    const submitBtn = bookingForm.querySelector('.cta-button');
    submitBtn.disabled = true;
    submitBtn.textContent = i18n.t('submitting_btn_text');

    try {
        const newAppointment = {
            providerId: providerId,
            patientName: patientName,
            date: appointmentDate,
            time: appointmentTime,
            symptoms: patientSymptoms,
            status: 'pending',
            createdAt: new Date()
        };

        await addDoc(collection(db, "appointments"), newAppointment);

        bookingMessage.textContent = i18n.t('appointment_success_message');
        bookingMessage.style.color = 'var(--success-color)';
        bookingForm.reset();

    } catch (error) {
        console.error("Error booking appointment:", error);
        bookingMessage.textContent = i18n.t('appointment_error_message');
        bookingMessage.style.color = 'var(--error-color)';
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = i18n.t('book_appointment_btn');
    }
});


document.addEventListener('DOMContentLoaded', fetchProviderDetails);