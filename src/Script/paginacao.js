document.addEventListener("DOMContentLoaded", () => {

    const cardsContainer = document.querySelector(".card_jogos");
    const searchInput = document.getElementById("search-input");
    const paginationContainer = document.querySelector(".pagination");
    const numbersContainer = paginationContainer.querySelector(".numbers");
    const firstBtn = paginationContainer.querySelector(".first");
    const prevBtn = paginationContainer.querySelector(".prev");
    const nextBtn = paginationContainer.querySelector(".next");
    const lastBtn = paginationContainer.querySelector(".last");

    const gamesPerPage = 15;
    let allGames = [];
    let currentPage = 1;
    let totalPages = 0;
    const filters = {};


    const getImageUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http://') || path.startsWith('https://')) return path;
        const backendUrl = 'http://localhost:3000';
        return `${backendUrl}${path.startsWith('/') ? path : '/' + path}`;
    };

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
                    allGames = [];
                } else {
                    throw new Error("Erro ao buscar dados dos jogos");
                }
            } else {
                allGames = await response.json();
            }

            currentPage = 1;
            totalPages = Math.ceil(allGames.length / gamesPerPage);
            
            renderPage(currentPage, query);

        } catch (error) {
            console.error("Erro:", error);
            cardsContainer.innerHTML =
                '<p style="color: red; text-align: center;">Não foi possível carregar os jogos. Verifique a conexão com o servidor.</p>';
            paginationContainer.style.display = 'none';
        }
    };

    const renderPage = (page, query) => {
        cardsContainer.innerHTML = '';

        if (!allGames || allGames.length === 0) {
            if (query) {
                cardsContainer.innerHTML = `<p style="color: white; text-align: center;">Nenhum resultado encontrado para "${query}".</p>`;
            } else {
                cardsContainer.innerHTML = '<p style="color: white; text-align: center;">Nenhum jogo encontrado com os filtros selecionados.</p>';
            }
            paginationContainer.style.display = 'none';
            return;
        }
        
        paginationContainer.style.display = totalPages > 1 ? 'flex' : 'none';

        const startIndex = (page - 1) * gamesPerPage;
        const endIndex = startIndex + gamesPerPage;
        const paginatedGames = allGames.slice(startIndex, endIndex);

        paginatedGames.forEach(game => {
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
            const ratingForDisplay = averageRating / 2;
            const ratingPercentage = (ratingForDisplay / totalStars) * 100;
            const starsHtml = '&#9733;'.repeat(totalStars);

            const starsHtmlComplete = `
                <div class="estrelas-container" data-avaliacao="${averageRating.toFixed(1)}">
                    <div class="star-empty">${starsHtml}</div>
                    <div class="star-filled" style="width: ${ratingPercentage}%;">${starsHtml}</div>
                </div>
            `;

            const imageUrl = getImageUrl(game.Capa_jogo);
            gameCard.innerHTML = `
                <div class="capa_card" style="background-image: url('${imageUrl}')"></div>
                <span class="nome_jogo">${game.Nome_jogo}</span>
                ${starsHtmlComplete}
                <span class="preco" style="display: flex; align-items: center;">${precoHtml}</span>
            `;

            cardsContainer.appendChild(gameCard);
        });
        
        renderPaginationControls();
    };

    const renderPaginationControls = () => {
        numbersContainer.innerHTML = '';
        const maxVisibleButtons = 7;
        
        if (totalPages <= maxVisibleButtons) {
            for (let i = 1; i <= totalPages; i++) {
                numbersContainer.appendChild(createPageButton(i));
            }
        } else {
            numbersContainer.appendChild(createPageButton(1));
            let startPage = Math.max(2, currentPage - 1);
            let endPage = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                startPage = 2;
                endPage = 4;
            }
            if (currentPage >= totalPages - 2) {
                startPage = totalPages - 3;
                endPage = totalPages - 1;
            }
            if (startPage > 2) {
                numbersContainer.appendChild(createEllipsis());
            }
            for (let i = startPage; i <= endPage; i++) {
                numbersContainer.appendChild(createPageButton(i));
            }
            if (endPage < totalPages - 1) {
                numbersContainer.appendChild(createEllipsis());
            }
            numbersContainer.appendChild(createPageButton(totalPages));
        }
    };
    
    const createPageButton = (page) => {
        const pageNumber = document.createElement('div');
        pageNumber.textContent = page;
        if (page === currentPage) {
            pageNumber.classList.add('active');
        }
        pageNumber.addEventListener('click', (event) => {
            event.preventDefault();
            goToPage(page);
        });
        return pageNumber;
    };

    const createEllipsis = () => {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        ellipsis.className = 'ellipsis';
        return ellipsis;
    };

    const goToPage = (page) => {
        currentPage = page;
        renderPage(page);
        window.scrollTo(0, 0);
    };
    

    const addControlListener = (element, action) => {
        element.addEventListener('click', (event) => {
            event.preventDefault();
            action();
        });
    };

    addControlListener(firstBtn, () => { if (currentPage > 1) goToPage(1); });
    addControlListener(prevBtn, () => { if (currentPage > 1) goToPage(currentPage - 1); });
    addControlListener(nextBtn, () => { if (currentPage < totalPages) goToPage(currentPage + 1); });
    addControlListener(lastBtn, () => { if (currentPage < totalPages) goToPage(totalPages); });
    
    document.addEventListener("gameUpdated", () => { fetchAndDisplayGames(); });
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