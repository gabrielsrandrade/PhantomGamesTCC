import { clerk, waitForAuthReady } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const authData = await waitForAuthReady(); // ESPERA O SINAL VERDE
    const container = document.querySelector('.card_jogos');

    if (!authData.isSignedIn) {
        container.innerHTML = '<p style="color: white; text-align: center;">Você precisa estar logado para ver sua biblioteca.</p>';
        return;
    }

    carregarBiblioteca();
});

async function carregarBiblioteca() {
    const container = document.querySelector('.card_jogos');
    
    try {
        // A linha 'await clerk.load()' foi removida daqui pois a nova lógica no auth.js a torna desnecessária.
        if (!clerk.session) {
             throw new Error("Sessão de usuário não encontrada. Faça o login novamente.");
        }
        const token = await clerk.session.getToken();

        const response = await fetch('http://localhost:3000/biblioteca', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao carregar a biblioteca.');

        const jogos = await response.json();
        container.innerHTML = '';

        if (jogos.length === 0) {
            container.innerHTML = '<p style="color: white; text-align: center;">Sua biblioteca está vazia. Explore a loja para encontrar novos jogos!</p>';
            return;
        }

        jogos.forEach(jogo => {
            const cardHTML = `
                <a href="jogo.html?id=${jogo.ID_jogo}" class="card_jogo_biblioteca">
                    <div class="capa_card_biblioteca" style="background-image: url('${jogo.Capa_jogo}')"></div>
                    <span class="nome_jogo_biblioteca">${jogo.Nome_jogo}</span>
                </a>
            `;
            container.insertAdjacentHTML('beforeend', cardHTML);
        });

    } catch (error) {
        console.error("Erro ao carregar Biblioteca:", error);
        container.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
    }
}