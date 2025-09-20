// carregar_jogo.js
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

// Substitua a função displayGames existente por esta corrigida
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
        gameCard.href = `jogo.html?id=${game.ID_jogo}`;

        let precoText;
        if (preco === 0) {
            precoText = 'Grátis';
        } else {
            precoText = `R$${preco.toFixed(2).replace('.', ',')}`;
        }

        // --- Lógica de avaliação com preenchimento parcial ---
        const averageRating = game.Media_nota ? parseFloat(game.Media_nota) : 0;
        const totalStars = 5;
        const ratingPercentage = (averageRating / 10) * 100;

        const starsHtml = '&#9733;'.repeat(totalStars);
        
        const starsHtmlComplete = `
            <div class="estrelas-container">
                <div class="star-empty">${starsHtml}</div>
                <div class="star-filled" style="width: ${ratingPercentage}%;">${starsHtml}</div>
            </div>
        `;
        // --- Fim da lógica de avaliação ---

        gameCard.innerHTML = `
            <div class="capa_card" style="background-image: url('${game.Capa_jogo}')"></div>
            <span class="nome_jogo">${game.Nome_jogo}</span>
            ${starsHtmlComplete}
            <span class="preco">${precoText}</span>
        `;

        cardsContainer.appendChild(gameCard);
    });
};

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