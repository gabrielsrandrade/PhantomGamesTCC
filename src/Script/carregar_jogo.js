document.addEventListener('DOMContentLoaded', () => {

    const cardsContainer = document.querySelector('.card_jogos');
    const searchInput = document.getElementById('search-input');

    // Função para atualizar a URL do navegador sem recarregar a página.
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
                // Se a API não encontrar resultados (status 404), tratamos aqui.
                if (response.status === 404) {
                    displayGames([], query);
                    return; 
                }
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
            const gameCard = document.createElement('a');
            gameCard.className = 'card_jogo';
            gameCard.href = `pagina_jogo.html?id=${game.ID_jogo}`;
            
            // Lógica para definir o texto do preço
            let precoText;
            if (preco === 0) {
                precoText = 'Grátis';
            } else {
                precoText = `R$${preco.toFixed(2).replace('.', ',')}`;
            }

            // Lógica de avaliação por estrelas
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
                <span class="preco">${precoText}</span>
            `;

            cardsContainer.appendChild(gameCard);
        });
    };

    // --- Lógica de comunicação com navbar.js ---

    document.addEventListener('gameUpdated', () => {
        fetchGames();
    });

    document.addEventListener('searchSubmitted', (event) => {
        const query = event.detail.query;
        updateUrl(query);
        fetchGames(query);
    });

    // --- Lógica de inicialização da página ---

    const urlParams = new URLSearchParams(window.location.search);
    const initialQuery = urlParams.get('query') || '';
    
    if (searchInput) {
        searchInput.value = initialQuery;
    }

    fetchGames(initialQuery);
});