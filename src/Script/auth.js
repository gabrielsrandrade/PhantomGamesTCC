import { Clerk } from "@clerk/clerk-js";

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
export const clerk = new Clerk(clerkPubKey);

let authState = {
  isSignedIn: false,
  isAdmin: false,
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
      email: user.emailAddresses[0].emailAddress,
    };

    try {
      const response = await fetch("http://localhost:3000/salvar-usuario", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Erro ao salvar usuário no backend:", errorData.message);
      } else {
        console.log("Informações do usuário salvas com sucesso!");
      }
    } catch (error) {
      console.error("Erro de rede ao salvar usuário:", error);
    }
  }
}

// Escuta por mudanças de estado de autenticação (login/logout)
clerk.addListener(({ user }) => {
  if (user && user.id) {
    saveUserToDatabase();
  }
});

// Inicializa a autenticação e retorna o estado atual
export async function initializeAuth() {
  try {
    await clerk.load();
    const user = clerk.user;
    authState.user = user;
    authState.isSignedIn = !!user;

    // VERIFICAÇÃO DE ADMIN: Usa o e-mail para definir o status de administrador
    const userEmail = user?.primaryEmailAddress?.emailAddress;
    authState.isAdmin = userEmail === "phantomgamestcc@gmail.com";

    console.log(
      "Clerk inicializado. Logado:",
      authState.isSignedIn,
      "Admin:",
      authState.isAdmin
    );
    return authState;
  } catch (error) {
    console.warn("Erro ao acessar Clerk:", error);
    authState.isSignedIn = false;
    authState.isAdmin = false;
    return authState;
  }
}
