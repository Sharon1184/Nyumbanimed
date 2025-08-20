import { auth } from './firebase-config.js';
import { onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {
    const heroActionLinksContainer = document.getElementById('hero-action-links');

    // Function to render links based on auth status and language
    function renderAuthLinks(user) {
        const lang = localStorage.getItem('nyumbacareLang') || 'en';
        const translations = window.translations[lang] || {};

        if (heroActionLinksContainer) {
            heroActionLinksContainer.innerHTML = ''; // Clear existing links
            
            if (user) {
                // User is signed in
                heroActionLinksContainer.innerHTML = `
                    <a href="dashboard.html" class="cta-button" data-i18n="go_to_dashboard_btn">${translations.go_to_dashboard_btn || 'Go to Dashboard'}</a>
                    <button id="logout-hero-btn" class="link-button" data-i18n="logout_btn">${translations.logout_btn || 'Log Out'}</button>
                `;
                document.getElementById('logout-hero-btn')?.addEventListener('click', handleLogout);
                console.log("User is logged in:", user.email);
            } else {
                // User is signed out
                heroActionLinksContainer.innerHTML = `
                    <a href="register.html" class="cta-button" data-i18n="register_now_btn">${translations.register_now_btn || 'Register Now'}</a>
                    <a href="login.html" class="link-button" data-i18n="login_link">${translations.login_link || 'Log In'}</a>
                `;
                console.log("User is logged out.");
            }
        }
    }

    // Handle logout functionality
    async function handleLogout() {
        try {
            await signOut(auth);
            console.log("User logged out successfully.");
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    // Initial check and listen for auth status changes
    onAuthStateChanged(auth, (user) => {
        renderAuthLinks(user);
    });

    // Listen for custom event from i18n.js to re-render links on language change
    document.addEventListener('authRenderLinks', () => {
        const currentUser = auth.currentUser;
        renderAuthLinks(currentUser);
    });
});