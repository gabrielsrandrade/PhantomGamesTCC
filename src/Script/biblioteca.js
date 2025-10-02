import { clerk, waitForAuthReady } from "./auth.js";

document.addEventListener("DOMContentLoaded", async () => {
    // A função setupDropdown() não é chamada aqui, pois você a removeu.
    
    const authData = await waitForAuthReady();
    const container = document.querySelector('.card_jogos');

    if (!authData.isSignedIn) {
        container.innerHTML = '<p style="color: white; text-align: center;">Você precisa estar logado para ver sua biblioteca.</p>';
        return;
    }

    carregarBiblioteca();
});

let jogosData = [];
let currentSort = 'a-z'; // Default ordenação (engloba todas as opções do filtro order-by)

async function carregarBiblioteca() {
    const container = document.querySelector('.card_jogos');
    
    // Adicionamos a busca pelos elementos de UI aqui, pois vamos usá-los no listener
    const select = document.querySelector('.select');
    const dropdown = document.querySelector('.filtro-content');
    const selectValue = document.querySelector('.select-value');

     if (select && dropdown) {
        select.addEventListener('click', (event) => {
            // Impede que o clique no select feche o menu imediatamente
            event.stopPropagation(); 
            dropdown.classList.toggle('show');
        });
    }

    // Adiciona um listener para fechar o dropdown se o usuário clicar fora dele
    document.addEventListener('click', () => {
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
        }
    });

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
        console.log("Dados carregados:", jogosData); 
        sortAndRender();
    } catch (error) {
        console.error("Erro ao carregar Biblioteca:", error);
        container.innerHTML = `<p style="color: red; text-align: center;">${error.message}</p>`;
    }

    // Listener para o evento de filtro (mantido igual)
    document.addEventListener('filterApplied', (event) => {
        const { filterName, filterValue } = event.detail;
        console.log("Evento filterApplied:", { filterName, filterValue });
        if (filterName === 'order-by') {
            currentSort = filterValue || 'a-z';
            sortAndRender();
        }
    });

    // Adiciona listeners para os itens do dropdown
    document.querySelectorAll('.dropdown-item[data-filter="order-by"]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const filterName = item.dataset.filter;
            const filterValue = item.dataset.value;

            if (selectValue) {
                selectValue.textContent = item.textContent;
            }
            

            if (dropdown) dropdown.classList.remove('show');
            if (select) select.classList.remove('active');
            
            
            const event = new CustomEvent('filterApplied', { detail: { filterName, filterValue } });
            document.dispatchEvent(event);
        });
    });
}

function sortAndRender() {
    // Cria uma cópia dos dados para evitar modificar o original
    let sortedJogos = [...jogosData];

    // Log para verificar o valor atual de ordenação
    console.log("Ordenação atual:", currentSort);

    // Aplica a ordenação com base no valor de currentSort
    if (currentSort === 'recent-old') {
        sortedJogos.sort((a, b) => {
            const dateA = a.data_adicao ? new Date(a.data_adicao) : new Date(0);
            const dateB = b.data_adicao ? new Date(b.data_adicao) : new Date(0);

            if (isNaN(dateA) || isNaN(dateB)) {
                console.warn("Data inválida encontrada:", { a, b });
                return 0;
            }

            const dateDiff = dateB - dateA;
            if (dateDiff === 0) {
                return a.Nome_jogo.localeCompare(b.Nome_jogo); // Tie-breaker por nome
            }

            console.log(`Comparando ${a.Nome_jogo} (${dateA.toISOString()}) com ${b.Nome_jogo} (${dateB.toISOString()}): ${dateDiff}`);
            return dateDiff; // Recente - Antigo
        });
    } else if (currentSort === 'old-recent') {
        sortedJogos.sort((a, b) => {
            const dateA = a.data_adicao ? new Date(a.data_adicao) : new Date(0);
            const dateB = b.data_adicao ? new Date(b.data_adicao) : new Date(0);

            if (isNaN(dateA) || isNaN(dateB)) {
                console.warn("Data inválida encontrada:", { a, b });
                return 0;
            }

            const dateDiff = dateA - dateB;
            if (dateDiff === 0) {
                return a.Nome_jogo.localeCompare(b.Nome_jogo); // Tie-breaker por nome
            }

            console.log(`Comparando ${a.Nome_jogo} (${dateA.toISOString()}) com ${b.Nome_jogo} (${dateB.toISOString()}): ${dateDiff}`);
            return dateDiff; // Antigo - Recente
        });
    } else if (currentSort === 'a-z') {
        sortedJogos.sort((a, b) => a.Nome_jogo.localeCompare(b.Nome_jogo));
    } else if (currentSort === 'z-a') {
        sortedJogos.sort((a, b) => b.Nome_jogo.localeCompare(a.Nome_jogo));
    } else {
        console.warn("Valor de ordenação inválido:", currentSort);
    }

    // Log para verificar o resultado da ordenação
    console.log("Jogos ordenados:", sortedJogos);

    // Renderiza os jogos ordenados
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