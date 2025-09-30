import { clerk, waitForAuthReady } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    const authData = await waitForAuthReady();
    const container = document.querySelector('.card_jogos');

    if (!authData.isSignedIn) {
        container.innerHTML = '<p style="color: white; text-align: center;">Você precisa estar logado para ver sua biblioteca.</p>';
        return;
    }

    carregarBiblioteca();
});

let jogosData = [];
let sortAlphabetic = 'a-z'; // Default ordenação alfabética
let sortDate = 'recent-old'; // Default ordenação por data

async function carregarBiblioteca() {
    const container = document.querySelector('.card_jogos');
    
    try {
        if (!clerk.session) {
            throw new Error("Sessão de usuário não encontrada. Faça o login novamente.");
        }
        const token = await clerk.session.getToken();

        const response = await fetch('http://localhost:3000/biblioteca', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!response.ok) throw new Error('Falha ao carregar a biblioteca.');

        jogosData = await response.json();
        sortAndRender();
    } catch (error) {
        console.error("Erro ao carregar Biblioteca:", error);
        container.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
    }

    // Listeners para eventos de filtro
    document.addEventListener('filterApplied', (event) => {
        const { filterName, filterValue } = event.detail;
        if (filterName === 'ordem-alfabetica' && filterValue) {
            sortAlphabetic = filterValue;
        } else if (filterName === 'data-compra' && filterValue) {
            sortDate = filterValue;
        } else if (filterValue === null) {
            sortAlphabetic = 'a-z'; // Reset alfabético
            sortDate = 'recent-old'; // Reset data
        }
        sortAndRender();
    });
}

function sortAndRender() {
    let sortedJogos = [...jogosData];

    // Aplicar ordenação alfabética primeiro, se definida
    if (sortAlphabetic === 'a-z') {
        sortedJogos.sort((a, b) => a.Nome_jogo.localeCompare(b.Nome_jogo));
    } else if (sortAlphabetic === 'z-a') {
        sortedJogos.sort((a, b) => b.Nome_jogo.localeCompare(a.Nome_jogo));
    }

    // Aplicar ordenação por data_adicao depois, se definida, sobrescrevendo a anterior
    if (sortDate === 'recent-old') {
        sortedJogos.sort((a, b) => {
            const dateA = new Date(a.data_adicao);
            const dateB = new Date(b.data_adicao);
            if (isNaN(dateA) || isNaN(dateB)) {
                console.warn("Data inválida encontrada:", a.data_adicao, b.data_adicao);
                return 0; // Mantém a ordem atual se data for inválida
            }
            return dateB - dateA; // Recente - Antigo
        });
    } else if (sortDate === 'old-recent') {
        sortedJogos.sort((a, b) => {
            const dateA = new Date(a.data_adicao);
            const dateB = new Date(b.data_adicao);
            if (isNaN(dateA) || isNaN(dateB)) {
                console.warn("Data inválida encontrada:", a.data_adicao, b.data_adicao);
                return 0;
            }
            return dateA - dateB; // Antigo - Recente
        });
    }

    renderJogos(sortedJogos);
}

function renderJogos(jogos) {
    const container = document.querySelector('.card_jogos');
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
}