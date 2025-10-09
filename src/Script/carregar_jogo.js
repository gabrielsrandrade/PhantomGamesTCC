import { setupPagination } from './paginacao.js';

document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const filters = {};

  const limparUrl = () => {
      const url = new URL(window.location.href);
      if (url.search) {
        url.search = '';
        window.history.pushState({}, '', url);
      }
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
        } else {
            url = "http://localhost:3000/jogos";
        }

        const response = await fetch(url);
        if (!response.ok) {
            if (response.status === 404) {
                setupPagination([], params);
                return;
            }
            throw new Error("Erro ao buscar dados dos jogos");
        }
        const games = await response.json();
        
        setupPagination(games, params);

    } catch (error) {
        console.error("Erro:", error);
        setupPagination([], {}, error);
    }
  };

  document.addEventListener("gameUpdated", () => {
    fetchAndDisplayGames();
  });

  document.addEventListener("searchSubmitted", (event) => {
    const query = event.detail.query;
    limparUrl(); 
    fetchAndDisplayGames({ query });
  });

  document.addEventListener("filterApplied", (event) => {
    const { filterName, filterValue } = event.detail;
    
    if (filterValue) {
        filters[filterName] = filterValue;
    } else {
        delete filters[filterName];
    }
    
    limparUrl();
    fetchAndDisplayGames(filters);
  });

  const urlParams = new URLSearchParams(window.location.search);
  const initialQuery = urlParams.get("query");

  if (initialQuery) {
      if (searchInput) {
        searchInput.value = initialQuery;
      }
      fetchAndDisplayGames({ query: initialQuery });
  } else {
      fetchAndDisplayGames(); 
  }
});