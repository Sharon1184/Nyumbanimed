import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs, updateDoc, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { getStorage, ref, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-storage.js";
import { app } from "./firebase-config.js";

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Get HTML elements
const loadingMessage = document.getElementById('loading');
const accessDeniedMessage = document.getElementById('access-denied');
const pendingProvidersList = document.getElementById('pending-providers-list');
const providersTableBody = document.getElementById('providers-table-body');
const noPendingMessage = document.getElementById('no-pending-message');

// --- Main Access Control Logic ---
onAuthStateChanged(auth, async (user) => {
    loadingMessage.style.display = 'block';
    
    if (user) {
        // Check if the current user is an admin
        const adminDocRef = doc(db, 'admins', '_admin_list_');
        const adminDoc = await getDoc(adminDocRef);

        if (adminDoc.exists() && adminDoc.data().uids.includes(user.uid)) {
            // User is an admin, show the panel
            loadingMessage.style.display = 'none';
            pendingProvidersList.style.display = 'block';
            fetchPendingProviders();
        } else {
            // User is NOT an admin
            loadingMessage.style.display = 'none';
            accessDeniedMessage.style.display = 'block';
        }
    } else {
        // No user is signed in
        loadingMessage.style.display = 'none';
        accessDeniedMessage.style.display = 'block';
    }
});

// --- Fetch Pending Providers ---
async function fetchPendingProviders() {
    providersTableBody.innerHTML = '';
    const q = query(collection(db, "providers"), where("status", "==", "pending"));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        noPendingMessage.style.display = 'block';
        return;
    }

    noPendingMessage.style.display = 'none';
    querySnapshot.forEach(async (docData) => {
        const provider = { id: docData.id, ...docData.data() };
        
        let licenseUrl = '#';
        if (provider.licensePath) {
            const licenseRef = ref(storage, provider.licensePath);
            try {
                licenseUrl = await getDownloadURL(licenseRef);
            } catch (e) {
                console.error("Error getting license URL:", e);
            }
        }
        
        const row = document.createElement('tr');
        row.dataset.id = provider.id;
        row.innerHTML = `
            <td>${provider.name}</td>
            <td>${provider.email}</td>
            <td>${provider.specialty}</td>
            <td><a href="${licenseUrl}" target="_blank" class="license-link">View License</a></td>
            <td>
                <button class="approve-btn">Approve</button>
                <button class="reject-btn">Reject</button>
            </td>
        `;
        providersTableBody.appendChild(row);
    });
}

// --- Handle Approve/Reject Actions ---
providersTableBody.addEventListener('click', async (e) => {
    const row = e.target.closest('tr');
    if (!row) return;

    const providerId = row.dataset.id;
    const providerDocRef = doc(db, "providers", providerId);

    if (e.target.classList.contains('approve-btn')) {
        await updateDoc(providerDocRef, {
            status: "approved"
        });
        row.remove();
        // Check if any more providers are left
        const remainingRows = providersTableBody.querySelectorAll('tr');
        if (remainingRows.length === 0) {
            noPendingMessage.style.display = 'block';
        }
        alert('Provider approved successfully!');

    } else if (e.target.classList.contains('reject-btn')) {
        await updateDoc(providerDocRef, {
            status: "rejected"
        });
        row.remove();
        const remainingRows = providersTableBody.querySelectorAll('tr');
        if (remainingRows.length === 0) {
            noPendingMessage.style.display = 'block';
        }
        alert('Provider rejected.');
    }
});

// We'll also need to update styles.css for the admin panel