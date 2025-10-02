// /Script/auth.js
import { Clerk } from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const clerk = new Clerk(clerkPubKey);

let authData = {
  isSignedIn: false,
  isAdmin: false,
  user: null,
};

let authReadyResolver;
const authReadyPromise = new Promise(resolve => {
  authReadyResolver = resolve;
});

export const waitForAuthReady = () => authReadyPromise;

async function syncUserToDatabase(user) {
  if (!user) return;
  const userData = {
    id: user.id,
    nome: user.username || user.firstName || "Usuário Anônimo",
    imagem_perfil: user.imageUrl,
  };
  try {
    await fetch("http://localhost:3000/salvar-usuario", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    });
  } catch (error) {
    console.error("Erro de rede ao sincronizar usuário:", error);
  }
}

clerk.addListener(({ user }) => {
  authData.user = user;
  authData.isSignedIn = !!user;
  authData.isAdmin = user?.publicMetadata?.role === 'admin';
  
  console.log(
    "Estado de autenticação atualizado. Logado:", authData.isSignedIn,
    "Admin (UI):", authData.isAdmin
  );

  if (user) {
    syncUserToDatabase(user);
  }
  
  authReadyResolver(authData); 
});

export async function initializeAuth() {
    await clerk.load();
    return waitForAuthReady();
}