function createPriceHtml(preco, desconto) {
    const precoFloat = parseFloat(preco);
    const descontoFloat = parseFloat(desconto);

    if (precoFloat === 0) {
        return `<span class="preco-gratis">Grátis</span>`;
    }
    
    if (descontoFloat > 0) {
        const precoComDesconto = precoFloat * (1 - descontoFloat / 100);
        // ADICIONAMOS A TAG DE DESCONTO AQUI
        return `
        <span class="promocao">R$ ${precoFloat.toFixed(2).replace('.', ',')}</span>
        <span>R$ ${precoComDesconto.toFixed(2).replace('.', ',')}</span>
        <span class="desconto-tag">-${descontoFloat.toFixed(0)}%</span>
        `;
    }
    
    return `<span>R$ ${precoFloat.toFixed(2).replace('.', ',')}</span>`;
}

function createRatingStars(mediaNota) {
    const averageRating = mediaNota ? parseFloat(mediaNota) : 0;
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

    return starsHtmlComplete;
}

async function fetchAndDisplayHighlights() {
    const cardsContainer = document.getElementById("destaques-cards-container");
    if (!cardsContainer) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-destaques");
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const destaques = await response.json();

        if (!destaques || destaques.length === 0) {
            cardsContainer.innerHTML = '<p class="error-message">Nenhum destaque encontrado.</p>';
            return;
        }

        cardsContainer.innerHTML = '';
        const backendUrl = 'http://localhost:3000';

        destaques.forEach(game => {
            const gameCard = document.createElement("a");
            gameCard.href = `jogo.html?id=${game.ID_jogo}`;
            gameCard.className = "card_jogo swiper-slide"; 

            let imageUrl = game.Capa_jogo;
            if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${backendUrl}${imageUrl}`;

            const estrelasHtml = createRatingStars(game.Media_nota);
            const precoHtml = createPriceHtml(game.Preco_jogo, game.Desconto_jogo);

            gameCard.innerHTML = `
                <div class="capa_card" style="background-image: url('${imageUrl}')"></div>
                <span>${game.Nome_jogo}</span>
                ${estrelasHtml}
                <div class="preco">${precoHtml}</div>
            `;
            cardsContainer.appendChild(gameCard);
        });

        new Swiper('.destaques-swiper', {
            slidesPerView: 5, spaceBetween: 41, loop: destaques.length > 5, grabCursor: true,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: { 0: { slidesPerView: 2 }, 520: { slidesPerView: 3 }, 950: { slidesPerView: 5 } },
        });

    } catch (error) {
        console.error("Falha ao carregar os destaques:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar os destaques.</p>';
    }
}

async function fetchAndDisplayFreeGames() {
    const cardsContainer = document.getElementById("free-games-container");
    if (!cardsContainer) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-gratis");
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const freeGames = await response.json();

        if (!freeGames || freeGames.length === 0) {
            cardsContainer.innerHTML = '<p class="error-message">Nenhum jogo grátis encontrado.</p>';
            return;
        }

        cardsContainer.innerHTML = '';
        const backendUrl = 'http://localhost:3000';

        freeGames.forEach(game => {
            const descriptionSnippet = game.Descricao_jogo ? game.Descricao_jogo.substring(0, 500)  : 'Descrição não disponível.';
            const gameCard = document.createElement("div");
            gameCard.className = "card_jogo swiper-slide";

            const rawImageUrl = game.Primeira_Midia || game.Capa_jogo;
            let imageUrl = rawImageUrl;
            if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${backendUrl}${rawImageUrl}`;

            gameCard.innerHTML = `
                <div class="capa-container">
                    <img class="capa_card" src="${imageUrl}" alt="">
                </div>
                <div class="info_card_gratis">
                    <span class="titulo_jogo">${game.Nome_jogo}</span>
                    <span class="info_jogo">${descriptionSnippet}</span>
                    <div class="bottom_side">
                        <a href="jogo.html?id=${game.ID_jogo}" style="text-decoration: none;">
                            <button>Jogue Agora</button>
                        </a>
                    </div>
                </div>
            `;
            cardsContainer.appendChild(gameCard);
        });

        new Swiper('.card_jogos2', {
            slidesPerView: 2, spaceBetween: 16, slidesPerGroup: 2, loop: freeGames.length > 2, grabCursor: true,
            pagination: { el: ".swiper-pagination", clickable: true, dynamicBullets: true },
            navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
            breakpoints: { 0: { slidesPerView: 1, slidesPerGroup: 1 }, 520: { slidesPerView: 2, slidesPerGroup: 2 }, 950: { slidesPerView: 2, slidesPerGroup: 2 } },
        });

    } catch (error) {
        console.error("Falha ao carregar jogos grátis:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar jogos grátis.</p>';
    }
}

async function fetchAndDisplayPromotions() {
    const cardsContainer = document.getElementById("promocoes-cards-container");
    if (!cardsContainer) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-promocoes");
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const promotions = await response.json();

        if (!promotions || promotions.length === 0) {
            cardsContainer.innerHTML = '<p class="error-message">Nenhuma promoção encontrada.</p>';
            return;
        }

        cardsContainer.innerHTML = '';
        const backendUrl = 'http://localhost:3000';

        promotions.forEach(game => {
            const gameCard = document.createElement("a");
            gameCard.href = `jogo.html?id=${game.ID_jogo}`;
            gameCard.className = "card_jogo swiper-slide";

            let imageUrl = game.Capa_jogo;
            if (imageUrl && imageUrl.startsWith('/')) imageUrl = `${backendUrl}${imageUrl}`;

            const estrelasHtml = createRatingStars(game.Media_nota);
            const precoHtml = createPriceHtml(game.Preco_jogo, game.Desconto_jogo);

            gameCard.innerHTML = `
                <div class="capa_card" style="background-image: url('${imageUrl}')"></div>
                <span>${game.Nome_jogo}</span>
                ${estrelasHtml}
                <div class="preco">${precoHtml}</div>
            `;
            cardsContainer.appendChild(gameCard);
        });

        new Swiper('.card_jogos3', {
            slidesPerView: 5, spaceBetween: 41, loop: promotions.length > 5, grabCursor: true,
            navigation: { nextEl: '.swiper-button-next', prevEl: '.swiper-button-prev' },
            breakpoints: { 0: { slidesPerView: 2 }, 520: { slidesPerView: 3 }, 950: { slidesPerView: 5 } },
        });

    } catch (error) {
        console.error("Falha ao carregar promoções:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar promoções.</p>';
    }
}

async function fetchAndDisplayNationalGames() {
    const cardsContainer = document.getElementById("card_jogos4");
    if (!cardsContainer) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-nacionais");
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        let nationalGames = await response.json();

        if (!nationalGames || nationalGames.length === 0) {
            cardsContainer.innerHTML = '<p class="error-message">Nenhum jogo nacional encontrado.</p>';
            return;
        }

        nationalGames.sort((a, b) => (parseFloat(b.Media_nota) || 0) - (parseFloat(a.Media_nota) || 0));
        nationalGames = nationalGames.slice(0, 3);

        cardsContainer.innerHTML = '';
        const backendUrl = 'http://localhost:3000';

        nationalGames.forEach(game => {
            const gameCard = document.createElement("a");
            gameCard.href = `jogo.html?id=${game.ID_jogo}`;
            gameCard.className = "card_jogo card_jogo_nacional";

            let imageUrl = game.Capa_jogo;
            if (imageUrl && imageUrl.startsWith('/')) {
                imageUrl = `${backendUrl}${imageUrl}`;
            }

            const estrelasHtml = createRatingStars(game.Media_nota);
            const precoHtml = createPriceHtml(game.Preco_jogo, game.Desconto_jogo);

            // ===== INÍCIO DA MODIFICAÇÃO =====
            // Agora criamos duas divs para a imagem: uma para o fundo desfocado (bg)
            // e outra para a imagem nítida no centro (fg).
            gameCard.innerHTML = `
                <div class="capa_nacional">
                    <div class="capa_card_bg" style="background-image: url(${imageUrl})"></div>
                    <div class="capa_card_fg" style="background-image: url(${imageUrl})"></div>
                    <div class="info_overlay">
                        <span>${game.Nome_jogo}</span>
                        ${estrelasHtml}
                        <div class="preco">${precoHtml}</div>
                    </div>
                </div>
            `;
            // ===== FIM DA MODIFICAÇÃO =====

            cardsContainer.appendChild(gameCard);
        });

    } catch (error) {
        console.error("Falha ao carregar jogos nacionais:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar jogos nacionais.</p>';
    }
}


// Adicione esta função ao final do arquivo homepage.js, antes do document.addEventListener

async function fetchAndDisplayCarousel() {
    const carouselMain = document.querySelector(".carrosel_main_image");
    const carouselSides = document.querySelectorAll(".carrosel_side_image");
    const priceDiv = carouselMain.querySelector(".price");

    if (!carouselMain || carouselSides.length !== 3) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-carrossel");
        if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
        const carouselGames = await response.json();

        if (!carouselGames || carouselGames.length < 4) {
            console.warn("Menos de 4 jogos disponíveis para o carrossel.");
            return;
        }

        const backendUrl = 'http://localhost:3000';

        // Atualizar a imagem principal
        let mainImageUrl = carouselGames[0].Primeira_Midia;
        if (mainImageUrl && mainImageUrl.startsWith('/')) mainImageUrl = `${backendUrl}${mainImageUrl}`;
        carouselMain.style.backgroundImage = `url('${mainImageUrl}')`;

        // Atualizar o preço da principal com desconto ou grátis
        priceDiv.innerHTML = createPriceHtml(carouselGames[0].Preco_jogo, carouselGames[0].Desconto_jogo);

        // Tornar a principal clicável
        carouselMain.onclick = () => {
            window.location.href = `jogo.html?id=${carouselGames[0].ID_jogo}`;
        };

        // Atualizar as imagens laterais
        for (let i = 0; i < 3; i++) {
            let sideImageUrl = carouselGames[i + 1].Primeira_Midia;
            if (sideImageUrl && sideImageUrl.startsWith('/')) sideImageUrl = `${backendUrl}${sideImageUrl}`;
            carouselSides[i].style.backgroundImage = `url('${sideImageUrl}')`;

            // Tornar as laterais clicáveis
            carouselSides[i].onclick = () => {
                window.location.href = `jogo.html?id=${carouselGames[i + 1].ID_jogo}`;
            };
        }

    } catch (error) {
        console.error("Falha ao carregar o carrossel principal:", error);
    }
}

// Atualize o event listener no final do arquivo para incluir o carrossel
document.addEventListener("DOMContentLoaded", () => {
    fetchAndDisplayHighlights();
    fetchAndDisplayFreeGames();
    fetchAndDisplayPromotions();
    fetchAndDisplayNationalGames();
    fetchAndDisplayCarousel(); // Adicione esta chamada
});

document.addEventListener("gameUpdated", () => {
    fetchAndDisplayHighlights();
    fetchAndDisplayFreeGames();
    fetchAndDisplayPromotions();
    fetchAndDisplayNationalGames();
    fetchAndDisplayCarousel(); // Adicione esta chamada
});