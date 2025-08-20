import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);

// Function to render the provider cards on the page
function renderProviders(providers) {
    const container = document.querySelector('.provider-cards-container');
    container.innerHTML = ''; 

    if (providers.length === 0) {
        container.innerHTML = '<p style="text-align:center; color: var(--light-text-color);">No providers found.</p>';
        return;
    }

    providers.forEach(provider => {
        const card = document.createElement('div');
        card.className = 'provider-card';
        card.innerHTML = `
            <i class="fas fa-user-md provider-icon"></i>
            <h4>${provider.name}</h4>
            <p class="specialty">${provider.specialty}</p>
            <p class="location"><i class="fas fa-map-marker-alt"></i> ${provider.location}</p>
            <p class="availability">${provider.availability}</p>
            <a href="chat.html?providerId=${provider.id}" class="chat-btn">Chat Now</a>
            <a href="book-appointment.html?providerId=${provider.id}" class="book-btn">Book Now</a>
        `;
        container.appendChild(card);
    });
}

// Function to fetch providers from Firestore
async function fetchProviders() {
    try {
        const providersCollection = collection(db, "providers");
        const providerSnapshot = await getDocs(providersCollection);
        
        const providersList = providerSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        renderProviders(providersList);

    } catch (error) {
        console.error("Error fetching providers: ", error);
        const container = document.querySelector('.provider-cards-container');
        container.innerHTML = '<p style="text-align:center; color: var(--light-text-color);">Error loading providers.</p>';
    }
}

// Initial function call to fetch providers when the page loads
document.addEventListener('DOMContentLoaded', fetchProviders);