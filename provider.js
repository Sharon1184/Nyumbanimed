import { collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { db } from "./firebase-config.js";

const providersContainer = document.querySelector('.provider-cards-container');
const searchInput = document.querySelector('.search-input');
const searchButton = document.querySelector('.search-btn');

// --- Function to fetch and display providers ---
const fetchProviders = async (searchTerm = '') => {
    providersContainer.innerHTML = ''; // Clear existing providers
    const providersRef = collection(db, 'providers');
    
    // Create a query to get only approved providers
    let q = query(providersRef, where("status", "==", "approved"));

    // If there is a search term, add a filter
    if (searchTerm) {
        // Simple case-insensitive search on name and specialty
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        // NOTE: Firestore queries are limited. This approach fetches all approved providers and filters client-side.
        // For larger datasets, consider a more advanced solution like Algolia or a custom backend.
    }
    
    try {
        const querySnapshot = await getDocs(q);
        const providers = [];
        querySnapshot.forEach((doc) => {
            providers.push({ id: doc.id, ...doc.data() });
        });

        // Filter providers based on the search term (client-side)
        const filteredProviders = providers.filter(provider => {
            const nameMatch = provider.fullName.toLowerCase().includes(searchTerm.toLowerCase());
            const specialtyMatch = provider.specialty.toLowerCase().includes(searchTerm.toLowerCase());
            return nameMatch || specialtyMatch;
        });

        if (filteredProviders.length === 0) {
            providersContainer.innerHTML = '<p class="no-results-message">No providers found. Please try a different search or check back later.</p>';
            return;
        }

        filteredProviders.forEach(provider => {
            const providerCard = document.createElement('div');
            providerCard.classList.add('provider-card');
            providerCard.innerHTML = `
                <div class="provider-info">
                    <h3 class="provider-name">${provider.fullName}</h3>
                    <p class="provider-specialty">${provider.specialty}</p>
                </div>
                <a href="book-appointment.html?providerId=${provider.id}" class="book-btn cta-button">Book Now</a>
            `;
            providersContainer.appendChild(providerCard);
        });

    } catch (error) {
        console.error("Error fetching providers:", error);
        providersContainer.innerHTML = '<p class="error-message">Failed to load providers. Please try again later.</p>';
    }
};

// --- Add event listeners for search ---
searchInput.addEventListener('input', (e) => {
    fetchProviders(e.target.value);
});

searchButton.addEventListener('click', () => {
    fetchProviders(searchInput.value);
});

// Initial fetch when the page loads
document.addEventListener('DOMContentLoaded', () => {
    fetchProviders();
});