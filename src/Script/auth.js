import { Clerk } from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const clerk = new Clerk(clerkPubKey);

let authState = {
  isSignedIn: false,
  isAdmin: false, // O backend decide, o frontend só confia no que recebe
  user: null,
};

// Esta função salva os dados do usuário no seu banco de dados
async function saveUserToDatabase() {
  await clerk.load();
  const user = clerk.user;

  if (user) {
    const userData = {
      id: user.id,
      nome: user.username || "Usuário Anônimo",
      imagem_perfil: user.imageUrl,
    };

    try {
      // Esta chamada não precisa de token, pois é uma ação que o próprio
      // usuário logado faz em seu nome.
      const response = await fetch("http://localhost:3000/salvar-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        console.error("Erro ao salvar usuário no backend:", await response.json());
      }
    } catch (error) {
      console.error("Erro de rede ao salvar usuário:", error);
    }
  }
}

clerk.addListener(({ user }) => {
  if (user && user.id) {
    saveUserToDatabase();
  }
});

export async function initializeAuth() {
  try {
    await clerk.load();
    const user = clerk.user;
    authState.user = user;
    authState.isSignedIn = !!user;

    // A verificação de admin agora é baseada nos metadados do Clerk.
    // Isso ainda é apenas para a INTERFACE, a segurança REAL está no backend.
    authState.isAdmin = user?.publicMetadata?.role === 'admin';

    console.log(
      "Clerk inicializado. Logado:",
      authState.isSignedIn,
      "Admin (UI):",
      authState.isAdmin
    );
    return authState;
  } catch (error) {
    console.error("Erro ao inicializar Clerk:", error);
    authState.isSignedIn = false;
    authState.isAdmin = false;
    return authState;
  }
}