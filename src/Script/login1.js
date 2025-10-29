import { clerk, clerkReady } from "../Script/auth.js";

async function setupLoginPage() {
    await clerkReady;

    if (clerk.user) {
        window.location.href = '/src/front-end/homepage.html';
        return;
    }
    
    const signInDiv = document.getElementById('sign-in');
    if (signInDiv) {
        clerk.mountSignIn(signInDiv);
    }
}
setupLoginPage();