document.addEventListener('DOMContentLoaded', () => {

    const cardsContainer = document.querySelector('.card_jogos');
    const searchInput = document.getElementById('search-input');
    // Note: searchForm e clearButton não são mais necessários neste arquivo,
    // pois a lógica de busca é gerenciada pelo navbar.js.
    // Eles foram removidos para evitar redundância.

    // Função para atualizar a URL do navegador sem recarregar a página.
    // Esta função é importante para manter o estado da página.
    const updateUrl = (query) => {
        const url = new URL(window.location.href);
        if (query) {
            url.searchParams.set('query', query);
        } else {
            url.searchParams.delete('query');
        }
        window.history.pushState({}, '', url);
    };

    // Função para buscar os jogos com base em uma query (ou sem ela).
    const fetchGames = async (query = '') => {
        try {
            let url = 'http://localhost:3000/jogos';
            if (query.trim() !== '') {
                url = `http://localhost:3000/buscar-jogo?query=${encodeURIComponent(query)}`;
            }

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Erro ao buscar dados dos jogos');
            }
            const games = await response.json();
            console.log('Jogos recebidos:', games);
            
            displayGames(games, query);

        } catch (error) {
            console.error('Erro:', error);
            cardsContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar os jogos. Tente novamente mais tarde.</p>';
        }
    };

    // Função para renderizar os jogos no container.
    const displayGames = (games, query) => {
        cardsContainer.innerHTML = '';
        
        if (!games || games.length === 0) {
            if (query) {
                cardsContainer.innerHTML = `<p style="color: white; text-align: center;">Nenhum resultado encontrado para "${query}".</p>`;
            } else {
                cardsContainer.innerHTML = '<p style="color: white; text-align: center;">Nenhum jogo encontrado.</p>';
            }
            return;
        }

        games.forEach(game => {
            const preco = parseFloat(game.Preco_jogo);
            const gameCard = document.createElement('a'); // Corrigido para 'a' para ser clicável
            gameCard.className = 'card_jogo';
            gameCard.href = `pagina_jogo.html?id=${game.id}`;
            
            // Lógica de avaliação por estrelas
            // Assume que 'Media_nota' é um valor de 1 a 10.
            const rating = Math.round(game.Media_nota / 2); 
            let starHtml = '';
            for (let i = 0; i < 5; i++) {
                starHtml += `<span class="star" style="color: ${i < rating ? 'var(--star-color)' : 'var(--non-selected-color)'};">&#9733;</span>`;
            }

            gameCard.innerHTML = `
                <div class="capa_card" style="background-image: url('${game.Capa_jogo}')"></div>
                <span class="nome_jogo">${game.Nome_jogo}</span>
                <div class="estrelas">
                    ${starHtml}
                </div>
                <span class="preco">R$${preco.toFixed(2).replace('.', ',')}</span>
            `;

            cardsContainer.appendChild(gameCard);
        });
    };

    // --- Lógica de comunicação com navbar.js ---

    // Ouve o evento 'searchSubmitted' disparado pelo navbar.js.
    document.addEventListener('searchSubmitted', (event) => {
        const query = event.detail.query;
        updateUrl(query);
        fetchGames(query);
    });

    // --- Lógica de inicialização da página ---

    // Lógica para verificar o termo de busca na URL ao carregar a página.
    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query') || ''; // Garante que é sempre uma string
    
    // Sincroniza o input com a URL inicial.
    if (searchInput) {
        searchInput.value = initialQuery;
    }

    // Chama a função de busca com a query inicial.
    fetchGames(initialQuery);
});