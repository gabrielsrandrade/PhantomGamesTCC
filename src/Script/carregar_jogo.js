// carregar_jogo.js
document.addEventListener("DOMContentLoaded", () => {
  const cardsContainer = document.querySelector(".card_jogos");
  const searchInput = document.getElementById("search-input");

  // Objeto para armazenar os filtros ativos
  const filters = {};

  // Função para atualizar a URL do navegador com todos os parâmetros
  const updateUrl = (params) => {
    const url = new URL(window.location.href);
    url.searchParams.forEach((value, key) => url.searchParams.delete(key));
    for (const key in params) {
      if (params[key]) {
        url.searchParams.set(key, params[key]);
      }
    }
    window.history.pushState({}, "", url);
  };

  const fetchAndDisplayGames = async (params = {}) => {
    try {
        const { query, ...filterParams } = params;
        let url;

        if (query && query.trim() !== "") {
            url = `http://localhost:3000/buscar-jogo?query=${encodeURIComponent(query)}`;
        } else if (Object.keys(filterParams).length > 0) {
            const urlParams = new URLSearchParams(filterParams).toString();
            url = `http://localhost:3000/filtrar-jogos?${urlParams}`;
            console.log("URL de Filtro:", url); // Adicione para depuração
        } else {
            url = "http://localhost:3000/jogos";
        }

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                displayGames([], query);
                return;
            }
            throw new Error("Erro ao buscar dados dos jogos");
        }
        const games = await response.json();
        displayGames(games, query);

    } catch (error) {
        console.error("Erro:", error);
        cardsContainer.innerHTML =
            '<p style="color: red; text-align: center;">Não foi possível carregar os jogos. Verifique a conexão com o servidor.</p>';
    }
};

  // Função para renderizar os cards dos jogos
  const displayGames = (games, query) => {
    cardsContainer.innerHTML = '';
    if (!games || games.length === 0) {
      if (query) {
        cardsContainer.innerHTML = `<p style="color: white; text-align: center;">Nenhum resultado encontrado para "${query}".</p>`;
      } else {
        cardsContainer.innerHTML = '<p style="color: white; text-align: center;">Nenhum jogo encontrado com os filtros selecionados.</p>';
      }
      return;
    }

    games.forEach(game => {
      const preco = parseFloat(game.Preco_jogo);
      const desconto = parseFloat(game.Desconto_jogo);
      const gameCard = document.createElement('a');
      gameCard.className = 'card_jogo';
      gameCard.href = `jogo.html?id=${game.ID_jogo}`;

      let precoHtml;
      if (preco === 0) {
        precoHtml = 'Grátis';
      } else if (desconto > 0) {
        const precoComDesconto = preco * (1 - desconto / 100);
        precoHtml = `
                  <span class="preco-original-riscado">R$${preco.toFixed(2).replace('.', ',')}</span>
                  <span class="preco-desconto">R$${precoComDesconto.toFixed(2).replace('.', ',')}</span>
                  <span class="desconto-tag">-${desconto.toFixed(0)}%</span>
              `;
      } else {
        precoHtml = `R$${preco.toFixed(2).replace('.', ',')}`;
      }

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

      gameCard.innerHTML = `
              <div class="capa_card" style="background-image: url('${game.Capa_jogo}')"></div>
              <span class="nome_jogo">${game.Nome_jogo}</span>
              ${starsHtmlComplete}
              <span class="preco" style="display: flex; align-items: center;">${precoHtml}</span>
          `;

      cardsContainer.appendChild(gameCard);
    });
  };

  // --- Lógica de eventos para filtros e busca ---
  document.addEventListener("gameUpdated", () => {
    fetchAndDisplayGames();
  });

  document.addEventListener("searchSubmitted", (event) => {
    const query = event.detail.query;
    updateUrl({ query });
    fetchAndDisplayGames({ query });
  });

  document.addEventListener("filterApplied", (event) => {
    const { filterName, filterValue } = event.detail;
    
    if (filterValue) {
        filters[filterName] = filterValue;
    } else {
        delete filters[filterName];
    }

    console.log("Filtros Ativos:", filters); // Depuração
    updateUrl(filters);
    fetchAndDisplayGames(filters);
});

  // --- Lógica de inicialização da página ---
  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("query") || "";

  urlParams.forEach((value, key) => {
    if (key !== 'query') {
      filters[key] = value;
    }
  });

  if (searchInput) {
    searchInput.value = initialQuery;
  }

  if (initialQuery) {
    fetchAndDisplayGames({ query: initialQuery });
  } else if (Object.keys(filters).length > 0) {
    fetchAndDisplayGames(filters);
  } else {
    fetchAndDisplayGames();
  }
});