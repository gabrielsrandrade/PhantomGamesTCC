

document.addEventListener('DOMContentLoaded', () => {

    const cardsContainer = document.querySelector('.card_jogos');

    const fetchGames = async () => {
        try {
            // Requisição para a rota que criamos no servidor
            const response = await fetch('http://localhost:3000/jogos');
            if (!response.ok) {
                throw new Error('Erro ao buscar dados dos jogos');
            }
            const games = await response.json();
            console.log('Jogos recebidos:', games);
            
            displayGames(games);

        } catch (error) {
            console.error('Erro:', error);
            cardsContainer.innerHTML = '<p style="color: red; text-align: center;">Não foi possível carregar os jogos. Tente novamente mais tarde.</p>';
        }
    };

    const displayGames = (games) => {
        if (!games || games.length === 0) {
            cardsContainer.innerHTML = '<p style="color: white; text-align: center;">Nenhum jogo encontrado.</p>';
            return;
        }

        cardsContainer.innerHTML = ''; // Limpa o container para evitar cards duplicados
        
        games.forEach(game => {
            const preco = parseFloat(game.Preco_jogo);
            const gameCard = document.createElement('div');
            gameCard.className = 'card_jogo';
            
            // Lógica para mostrar a nota do jogo com estrelas
            const rating = Math.round(game.Media_nota / 2); 
            let starHtml = '';
            for (let i = 0; i < 5; i++) {
                starHtml += `<span class="star" style="color: ${i < rating ? 'var(--star-color)' : 'var(--non-selected-color)'};">&#9733;</span>`;
            }

            gameCard.innerHTML = `
                <div class="capa_card" style="background-image: url('${game.Capa_jogo}')"></div>
                <span>${game.Nome_jogo}</span>
                <div class="estrelas">
                    ${starHtml}
                </div>
                <span>R$${preco.toFixed(2).replace('.', ',')}</span>
            `;

            cardsContainer.appendChild(gameCard);
        });
    };

    fetchGames();
});