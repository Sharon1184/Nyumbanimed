import { collection, query, orderBy, addDoc, serverTimestamp, onSnapshot } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-auth.js";
import { auth, db, getUserDataFromFirestore } from "./auth.js";

const chatHeaderEl = document.getElementById('chat-header');
const messagesContainer = document.getElementById('messages');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');

let currentUser = null;
let currentUserId = null;
let currentUserName = "Guest";

// --- Authentication State Listener & Initialization ---
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // User is signed in
        currentUser = user;
        currentUserId = user.uid;
        
        // Fetch user data from Firestore to get their full name
        const userData = await getUserDataFromFirestore(user);
        if (userData && userData.fullName) {
            currentUserName = userData.fullName;
        }

        // Display chat header and start listening for messages
        chatHeaderEl.textContent = `Chatting as ${currentUserName}`;
        startChatListener();

    } else {
        // No user is signed in, redirect to login page
        window.location.href = 'login.html';
    }
});

// --- Function to display messages ---
const displayMessage = (message) => {
    const messageEl = document.createElement('div');
    messageEl.classList.add('message');

    if (message.senderId === currentUserId) {
        messageEl.classList.add('sent');
    } else {
        messageEl.classList.add('received');
    }

    const messageContent = `
        <span class="sender-name">${message.senderName || 'Anonymous'}</span>
        <p class="message-text">${message.text}</p>
        <span class="message-time">${message.timestamp ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
    `;
    messageEl.innerHTML = messageContent;
    messagesContainer.appendChild(messageEl);

    // Scroll to the latest message
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
};

// --- Real-time chat listener ---
const startChatListener = () => {
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, orderBy('timestamp'));

    onSnapshot(q, (snapshot) => {
        snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
                const message = { id: change.doc.id, ...change.doc.data() };
                displayMessage(message);
            }
        });
    }, (error) => {
        console.error("Error listening to messages:", error);
    });
};

// --- Function to send a message ---
const sendMessage = async () => {
    const messageText = messageInput.value.trim();
    if (!messageText || !currentUserId) return;

    const message = {
        senderId: currentUserId,
        senderName: currentUserName,
        text: messageText,
        timestamp: serverTimestamp()
    };

    try {
        const messagesRef = collection(db, 'messages');
        await addDoc(messagesRef, message);
        messageInput.value = ''; // Clear input field
    } catch (error) {
        console.error("Error sending message:", error);
    }
};

// --- Event listeners for sending messages ---
sendButton.addEventListener('click', sendMessage);
messageInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});