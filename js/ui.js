// Functions for updating the UI, loading page content, etc.

const mainContent = document.getElementById('app-main-content');
const appHeader = document.getElementById('app-header');
const loadingIndicator = document.getElementById('loading-indicator');

/**
 * Loads HTML content from a file into a specified element.
 * @param {string} pagePath - The path to the HTML file (e.g., 'pages/login.html')
 * @param {HTMLElement} targetElement - The DOM element to load content into.
 * @param {function} [callback] - Optional callback function to execute after content is loaded.
 */
// In ui.js
async function loadPageContent(pagePath, targetElement, callback) {
    if (loadingIndicator) loadingIndicator.style.display = 'flex';
    if (targetElement) {
        console.log(`[ui.js] Clearing targetElement before loading ${pagePath}`, targetElement);
        targetElement.innerHTML = ''; // Clear previous content
    } else {
        console.error("[ui.js] Target element is null for", pagePath);
        if (loadingIndicator) loadingIndicator.style.display = 'none';
        return; // Can't proceed
    }

    try {
        console.log(`[ui.js] Fetching page: ${pagePath}`);
        const response = await fetch(pagePath);
        console.log(`[ui.js] Response status for ${pagePath}: ${response.status}`);

        if (!response.ok) {
            throw new Error(`Failed to load page: ${pagePath}, Status: ${response.status}`);
        }
        const html = await response.text();
        console.log(`[ui.js] Successfully fetched HTML for ${pagePath}. Length: ${html.length}. Preview: ${html.substring(0, 100)}...`);
        
        if (targetElement) {
            console.log(`[ui.js] About to set innerHTML for target:`, targetElement);
            targetElement.innerHTML = html;
            console.log(`[ui.js] innerHTML set for ${pagePath}. Target now contains:`, targetElement.innerHTML.substring(0, 200) + "..."); // Log what was just set
        }

        if (callback && typeof callback === 'function') {
            console.log(`[ui.js] Preparing to call callback for ${pagePath}`);
            setTimeout(() => {
                console.log(`[ui.js] Executing callback for ${pagePath} (e.g., attachLoginListeners)`);
                callback();
            }, 50); // Keep a small delay
        }
    } catch (error) {
        console.error(`[ui.js] Error loading page content for ${pagePath}:`, error);
        if (targetElement) {
            targetElement.innerHTML = `<div class="message-box error text-center">Error loading content: ${error.message} <br> Please check the file path: ${pagePath} and server logs.</div>`;
        }
    } finally {
        if (loadingIndicator) loadingIndicator.style.display = 'none';
    }
}

/**
 * Updates the header based on login state and user role.
 * @param {object|null} user - The current user object { username, email, role }, or null.
 */
function updateHeader(user) {
    if (!appHeader) return;

    let navLinks = '';
    if (user) {
        // User is logged in
        if (user.role && typeof window.app !== 'undefined' && typeof window.app.getNavForRole === 'function') {
            navLinks += window.app.getNavForRole(user.role); // Get role-specific nav
        }
        navLinks += `
            <span class="text-sky-100 mr-4 hidden md:inline">Welcome, ${user.username || user.email}! (<span class="font-semibold">${user.role || 'User'}</span>)</span>
            <button id="logoutButtonNav" class="bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out">Logout</button>
        `;
    } else {
        // User is not logged in
        navLinks = `
            <a href="#login" class="nav-link text-sky-100 hover:text-white mr-3 font-medium px-3 py-2 rounded-md hover:bg-sky-700 transition-colors">Login</a>
            <a href="#signup" class="nav-link bg-white text-sky-600 hover:bg-sky-100 font-semibold py-2 px-4 rounded-md shadow-sm transition duration-150 ease-in-out">Sign Up</a>
        `;
    }

    appHeader.innerHTML = `
        <div class="container mx-auto px-4 py-3 flex justify-between items-center">
            <a href="#" id="homeLogoLink" class="text-2xl font-bold hover:text-sky-100 transition-colors">Student Portal</a>
            <nav id="main-nav" class="flex items-center space-x-2 md:space-x-4">
                ${navLinks}
            </nav>
        </div>
    `;
    
    const homeLogoLink = document.getElementById('homeLogoLink');
    if(homeLogoLink) {
        homeLogoLink.addEventListener('click', (e) => {
            e.preventDefault();
            // Navigate to dashboard if logged in, else to login
            if (window.auth && typeof window.auth.getCurrentUser === 'function' && window.auth.getCurrentUser()) {
                 window.app.navigateToDashboard(window.auth.getCurrentUser().role);
            } else {
                window.location.hash = '#login';
            }
        });
    }


    // Add event listener for the new logout button if it exists
    const logoutButtonNav = document.getElementById('logoutButtonNav');
    if (logoutButtonNav && window.app && typeof window.app.handleSignOut === 'function') {
        logoutButtonNav.addEventListener('click', window.app.handleSignOut);
    }
}


/**
 * Displays a message to the user in a specified target element.
 * @param {string} message - The message text.
 * @param {string} type - 'success', 'error', 'info', or 'warning'.
 * @param {string|HTMLElement} targetElementOrSelector - The DOM element or a CSS selector for the element.
 */
function showUserMessage(message, type = 'info', targetElementOrSelector) {
    let targetElement = typeof targetElementOrSelector === 'string' 
        ? document.querySelector(targetElementOrSelector) 
        : targetElementOrSelector;

    if (!targetElement) {
        console.warn("showUserMessage: Target element not found for message:", message);
        // Fallback to a general message area if one exists, or create one dynamically
        let fallbackTarget = document.getElementById('global-message-area');
        if (!fallbackTarget) {
            fallbackTarget = document.createElement('div');
            fallbackTarget.id = 'global-message-area';
            // Style and append it somewhere visible, e.g., top of main content
            // For now, just log if primary target not found
            return;
        }
        targetElement = fallbackTarget;
    }
    
    targetElement.innerHTML = message; // Allow HTML in message for flexibility
    targetElement.className = `message-box ${type}`; // Uses classes from components.css
    targetElement.style.display = 'block'; 

    // Optional: auto-hide after some time, but can be annoying for errors
    // if (type !== 'error') {
    //    setTimeout(() => { if(targetElement) targetElement.style.display = 'none'; }, 7000);
    // }
}

// Initialize footer year
const currentYearSpan = document.getElementById('current-year');
if (currentYearSpan) {
    currentYearSpan.textContent = new Date().getFullYear();
}

// Expose functions to be used by main.js or other modules
window.ui = {
    loadPageContent,
    updateHeader,
    showUserMessage,
    mainContentElement: mainContent,
};
