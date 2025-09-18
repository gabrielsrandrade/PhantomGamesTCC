import { Clerk } from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const clerk = new Clerk(clerkPubKey);

let authState = {
    isSignedIn: false,
    isAdmin: false,
    user: null
};

export async function initializeAuth() {
    try {
        await clerk.load();
        const user = clerk.user;
        authState.user = user;
        authState.isSignedIn = !!user;
        const userEmail = user?.primaryEmailAddress?.emailAddress;
        authState.isAdmin = userEmail === "phantomgamestcc@gmail.com";
        console.log('Clerk inicializado. Logado:', authState.isSignedIn, 'Admin:', authState.isAdmin);
        return authState;
    } catch (error) {
        console.warn('Erro ao acessar Clerk:', error);
        authState.isSignedIn = false;
        authState.isAdmin = false;
        return authState;
    }
}