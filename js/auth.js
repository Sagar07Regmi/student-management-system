// All authentication related functions (Cognito integration will go here)
// For now, these are MOCK functions.

let MOCK_AUTH_USER = null; 

async function mockSignUp(username, email, password, role) { 
    console.log("MOCK: Attempting sign up for:", username, email, "as role:", role);
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!username || !email || !password || !role) { 
        throw new Error("Username, email, password, and role are required.");
    }
    if (password.length < 8) {
        throw new Error("Password must be at least 8 characters long.");
    }
    if (username === "existinguser") {
        throw new Error("Username already exists.");
    }
    if (role === "Admin" || role === "SuperAdmin") { // Prevent self-assigning Admin/SuperAdmin for mock
        throw new Error("This role cannot be self-selected during signup.");
    }

    console.log(`MOCK: Sign up for ${username} (Role: ${role}) successful. Confirmation needed.`);
    return { user: { username, role }, userConfirmed: false, userSub: `mock-sub-${username}` };
}

async function mockConfirmSignUp(username, code) {
    console.log("MOCK: Attempting to confirm user:", username, "with code:", code);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (code === "123456") { 
        console.log(`MOCK: User ${username} confirmed successfully.`);
        return { success: true };
    } else {
        throw new Error("Invalid confirmation code.");
    }
}

async function mockSignIn(username, password) {
    console.log("MOCK: Attempting sign in for:", username);
    await new Promise(resolve => setTimeout(resolve, 500));

    if (password !== "password123") { 
        throw new Error("Incorrect username or password.");
    }

    let role = 'Student'; // Default role
    const lowerUsername = username.toLowerCase();

    if (lowerUsername.includes('superadmin') || lowerUsername.includes('principal') || lowerUsername === 'admin') {
        role = 'SuperAdmin'; // 'admin' keyword now clearly maps to SuperAdmin
    } else if (lowerUsername.includes('teacher')) {
        role = 'Teacher';
    } else if (lowerUsername.includes('parent')) {
        role = 'Parent';
    }
    // Otherwise, it defaults to 'Student'

    MOCK_AUTH_USER = { 
        username: username, 
        email: `${username}@example.com`, 
        role: role, 
        token: `mock-jwt-token-for-${username}-${Date.now()}`,
        sub: `mock-sub-${username}`
    };
    
    console.log("MOCK: Sign in successful:", MOCK_AUTH_USER);
    return MOCK_AUTH_USER;
}

async function mockSignOut() {
    console.log("MOCK: Signing out user");
    await new Promise(resolve => setTimeout(resolve, 300));
    MOCK_AUTH_USER = null;
    console.log("MOCK: User signed out.");
    return { success: true };
}

async function mockGetCurrentUser() {
    console.log("MOCK: Checking for current user session.");
    await new Promise(resolve => setTimeout(resolve, 100)); 
    return MOCK_AUTH_USER; 
}

async function mockForgotPassword(usernameOrEmail) { 
    console.log("MOCK: Initiating forgot password for:", usernameOrEmail);
    await new Promise(resolve => setTimeout(resolve, 700));

    if (!usernameOrEmail) {
        throw new Error("Username or email is required to reset password.");
    }
    console.log(`MOCK: Password reset instructions would be sent to ${usernameOrEmail}.`);
    return { success: true, message: `If an account exists for '${usernameOrEmail}', password reset instructions have been sent (mock). Check your console.` };
}


// --- Functions to attach event listeners to auth forms ---

function attachLoginListeners() {
    const loginForm = document.getElementById('loginForm');
    const messageTarget = '#auth-message-login'; 

    if (loginForm) {
        loginForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            window.ui.showUserMessage("Processing login...", "info", messageTarget);

            const username = document.getElementById('loginUsername').value;
            const password = document.getElementById('loginPassword').value;
            
            try {
                const user = await mockSignIn(username, password); 
                window.ui.showUserMessage("Login successful! Redirecting...", "success", messageTarget);
                
                setTimeout(() => { 
                    window.ui.updateHeader(user);
                    window.app.navigateToDashboard(user.role);
                }, 1000);

            } catch (error) {
                console.error("Login failed:", error);
                window.ui.showUserMessage(error.message || "Login failed. Please check your credentials.", "error", messageTarget);
            }
        });
    } else {
        console.warn("Login form not found on current page for attaching listeners.");
    }
}

function attachSignUpListeners() {
    const signUpForm = document.getElementById('signUpForm');
    const messageTarget = '#auth-message-signup';

    if (signUpForm) {
        signUpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            window.ui.showUserMessage("Processing sign up...", "info", messageTarget);

            const username = document.getElementById('signUpUsername').value;
            const email = document.getElementById('signUpEmail').value;
            const password = document.getElementById('signUpPassword').value;
            const role = document.getElementById('signUpRole').value; 

            try {
                const result = await mockSignUp(username, email, password, role); 
                window.ui.showUserMessage(`User ${result.user.username} (as ${result.user.role}) registered. Please check your email for a confirmation code (mock: 123456).`, "success", messageTarget);
                
                window.location.hash = '#confirm-signup'; 
                 setTimeout(() => { 
                    const confirmUsernameInput = document.getElementById('confirmUsername');
                    if (confirmUsernameInput) confirmUsernameInput.value = username;
                }, 100);

            } catch (error) {
                console.error("Sign up failed:", error);
                window.ui.showUserMessage(error.message || "Sign up failed. Please try again.", "error", messageTarget);
            }
        });
    } else {
        console.warn("Sign up form not found for attaching listeners.");
    }
}

function attachConfirmSignUpListeners() {
    const confirmSignUpForm = document.getElementById('confirmSignUpForm');
    const messageTarget = '#auth-message-confirm';

    if (confirmSignUpForm) {
        confirmSignUpForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            window.ui.showUserMessage("Confirming account...", "info", messageTarget);
            
            const username = document.getElementById('confirmUsername').value;
            const code = document.getElementById('confirmationCode').value;
            
            try {
                await mockConfirmSignUp(username, code);
                window.ui.showUserMessage("Account confirmed successfully! You can now log in.", "success", messageTarget);
                setTimeout(() => { window.location.hash = '#login'; }, 1500);
            } catch (error) {
                console.error("Confirmation failed:", error);
                window.ui.showUserMessage(error.message || "Confirmation failed. Please try again.", "error", messageTarget);
            }
        });
    } else {
        console.warn("Confirm sign up form not found for attaching listeners.");
    }
}

function attachForgotPasswordListeners() { 
    const forgotPasswordForm = document.getElementById('forgotPasswordForm');
    const messageTarget = '#auth-message-forgot-password'; 

    if (forgotPasswordForm) {
        forgotPasswordForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            window.ui.showUserMessage("Processing request...", "info", messageTarget);

            const usernameOrEmail = document.getElementById('forgotPasswordUsername').value;

            try {
                const result = await mockForgotPassword(usernameOrEmail); 
                window.ui.showUserMessage(result.message, "success", messageTarget);
                forgotPasswordForm.reset();
            } catch (error) {
                console.error("Forgot password request failed:", error);
                window.ui.showUserMessage(error.message || "Failed to process request. Please try again.", "error", messageTarget);
            }
        });
    } else {
        console.warn("Forgot password form not found for attaching listeners.");
    }
}

window.auth = {
    attachLoginListeners,
    attachSignUpListeners,
    attachConfirmSignUpListeners,
    attachForgotPasswordListeners, 
    signIn: mockSignIn, 
    signUp: mockSignUp,
    confirmSignUp: mockConfirmSignUp,
    signOut: mockSignOut,
    getCurrentUser: mockGetCurrentUser,
    forgotPassword: mockForgotPassword 
};
 