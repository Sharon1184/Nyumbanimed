import { getFirestore, doc, getDoc, collection, onSnapshot, addDoc, serverTimestamp, query, orderBy, setDoc } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { app } from "./firebase-config.js";

const db = getFirestore(app);
const auth = getAuth(app);

const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const messagesContainer = document.getElementById('messages');
const chatHeader = document.getElementById('chat-header');
const pageHeading = document.querySelector('.page-heading h2');

let currentUser = null;
let providerId = null;
let chatId = null;

// Get provider ID from URL
const urlParams = new URLSearchParams(window.location.search);
providerId = urlParams.get('providerId');

// Redirect if no provider is selected
if (!providerId) {
    pageHeading.textContent = "Error: No Provider Selected";
    messagesContainer.innerHTML = "<p>Please go back and select a provider to chat with.</p>";
    document.querySelector('.chat-input-area').style.display = 'none';
}

// Listen for authentication state changes
onAuthStateChanged(auth, async (user) => {
    if (user) {
        currentUser = user;
        // Generate a unique chat ID
        const chatMembers = [currentUser.uid, providerId].sort();
        chatId = chatMembers.join('_');

        // Fetch provider's name to display
        await fetchProviderName();

        // Check if chat exists and add initial message if new
        await checkAndInitializeChat();

        // Set up the real-time message listener
        setupMessageListener();

        // Enable chat input
        document.querySelector('.chat-input-area').style.display = 'flex';

    } else {
        // User is not signed in
        pageHeading.textContent = "Chat";
        chatHeader.textContent = "Please log in to chat.";
        messagesContainer.innerHTML = '<p>You must be logged in to chat. Please go to the profile page to log in or register.</p>';
        document.querySelector('.chat-input-area').style.display = 'none';
    }
});

async function fetchProviderName() {
    try {
        const providerDocRef = doc(db, "providers", providerId);
        const providerDoc = await getDoc(providerDocRef);
        if (providerDoc.exists()) {
            const providerData = providerDoc.data();
            chatHeader.textContent = i18n.t('chat_with', { providerName: providerData.name });
        } else {
            chatHeader.textContent = "Provider not found.";
        }
    } catch (error) {
        console.error("Error fetching provider name:", error);
        chatHeader.textContent = "Error loading chat.";
    }
}

async function checkAndInitializeChat() {
    const chatDocRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatDocRef);

    if (!chatDoc.exists()) {
        const initialMessage = i18n.t('hi_message', { username: currentUser.displayName || currentUser.email.split('@')[0] });
        
        await setDoc(chatDocRef, {
            members: [currentUser.uid, providerId],
            createdAt: serverTimestamp()
        });
        
        await addDoc(collection(chatDocRef, "messages"), {
            text: initialMessage,
            senderId: 'admin',
            timestamp: serverTimestamp()
        });
    }
}

function displayMessage(message, senderId) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    
    if (senderId === currentUser.uid) {
        messageElement.classList.add('sent-message');
    } else {
        messageElement.classList.add('received-message');
    }
    
    messageElement.textContent = message;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function setupMessageListener() {
    const messagesCollectionRef = collection(db, "chats", chatId, "messages");
    const messagesQuery = query(messagesCollectionRef, orderBy("timestamp"));

    onSnapshot(messagesQuery, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === "added") {
                const messageData = change.doc.data();
                displayMessage(messageData.text, messageData.senderId);
            }
        });
    });
}

async function sendMessage() {
    const messageText = messageInput.value.trim();
    if (messageText === '' || !currentUser || !chatId) {
        return;
    }

    try {
        await addDoc(collection(db, "chats", chatId, "messages"), {
            text: messageText,
            senderId: currentUser.uid,
            timestamp: serverTimestamp()
        });
        messageInput.value = '';
    } catch (error) {
        console.error("Error sending message: ", error);
    }
}

sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        sendMessage();
    }
});