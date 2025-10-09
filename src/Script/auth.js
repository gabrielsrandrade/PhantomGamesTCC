import { Clerk } from "@clerk/clerk-js";
import { dark } from '@clerk/themes';         // Adicionado para o tema escuro
import { ptBR } from '@clerk/localizations'; // Adicionado para o idioma português

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

export const clerk = new Clerk(clerkPubKey);

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

let authData = {
  isSignedIn: false,
  isAdmin: false,
  user: null,
};

let authReadyPromise = null;

export const initializeAuth = () => {
    if (authReadyPromise) {
        return authReadyPromise;
    }

    authReadyPromise = new Promise(async (resolve) => {
        clerk.addListener(({ user }) => {
            console.log("Listener do Clerk acionado. Usuário:", user ? user.id : 'Nenhum');
            authData.user = user;
            authData.isSignedIn = !!user;
            authData.isAdmin = user?.publicMetadata?.role === 'admin';
            if (user) {
                syncUserToDatabase(user);
            }
        });

        // A configuração de aparência e idioma foi adicionada aqui
        await clerk.load({
            localization: ptBR,
            appearance: {
                baseTheme: dark,
            }
        });

        // Sua lógica original foi mantida pois está correta
        console.log(
            "Clerk carregado. Estado final:",
            "Logado:", authData.isSignedIn,
            "Admin:", authData.isAdmin
        );
        resolve(authData);
    });

    return authReadyPromise;
};