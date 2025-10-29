import { clerk, clerkReady } from "../Script/auth.js"; 

async function setupSignUpPage() {
    await clerkReady;

    if (clerk.user) {
        window.location.href = '/src/front-end/homepage.html';
        return;
    }

    const signUpDiv = document.getElementById('sign-up');
    if (signUpDiv) {
        clerk.mountSignUp(signUpDiv);
    }
}
setupSignUpPage();