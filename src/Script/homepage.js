// homepage.js (Conteúdo Corrigido)

// --- FUNÇÕES DE UTILIDADE (Mantidas aqui para garantir o escopo) ---

// --- FUNÇÕES DE UTILIDADE (Mantidas aqui para garantir o escopo) ---

function createRatingStars(mediaNota) {
    const numStars = 5;
    const rating = parseFloat(mediaNota) || 0;
    const percentage = (rating / 5) * 100;

    return `
        <div class="estrelas-container">
            <div class="star-empty">
                ${'&#9733;'.repeat(numStars)}
            </div>
            <div class="star-filled" style="width: ${percentage}%;">
                ${'&#9733;'.repeat(numStars)}
            </div>
        </div>
    `;
}

function createPriceHtml(preco, desconto) {
    const precoFloat = parseFloat(preco);
    const descontoFloat = parseFloat(desconto);

    if (precoFloat === 0) {
        return `<span class="preco-gratis" style="color: var(--selected-text-color);">Grátis</span>`;
    } else if (descontoFloat > 0) {
        const precoComDesconto = precoFloat * (1 - descontoFloat / 100);
        return `
            <span class="preco-original-riscado">R$ ${precoFloat.toFixed(2).replace('.', ',')}</span>
            <span class="preco-desconto" style="color: var(--button-color);">R$ ${precoComDesconto.toFixed(2).replace('.', ',')}</span>
            <span class="desconto-tag">-${descontoFloat.toFixed(0)}%</span>
        `;
    } else {
        return `<span class="preco-cheio">R$ ${precoFloat.toFixed(2).replace('.', ',')}</span>`;
    }
}


// --- LÓGICA PRINCIPAL DE CARREGAMENTO DOS DESTAQUES ---

async function fetchAndDisplayHighlights() {
    const cardsContainer = document.getElementById("destaques-cards-container");
    if (!cardsContainer) return;

    try {
        const response = await fetch("http://localhost:3000/jogos-destaques");
        if (!response.ok) {
            throw new Error(`Erro HTTP ao buscar destaques: ${response.status}`);
        }
        const destaques = await response.json();

        if (destaques.length === 0) {
            cardsContainer.innerHTML = '<p class="error-message">Nenhum destaque encontrado esta semana.</p>';
            return;
        }

        cardsContainer.innerHTML = ''; // Limpa o container

        destaques.forEach(game => {
            const gameCard = document.createElement("a");
            gameCard.href = `jogo.html?id=${game.ID_jogo}`;
            gameCard.className = "swiper-slide destaques-card";

            const starsHtml = createRatingStars(game.Media_nota);
            const precoHtml = createPriceHtml(game.Preco_jogo, game.Desconto_jogo);

            gameCard.innerHTML = `
                <div class="capa_card_destaque" style="background-image: url('${game.Capa_jogo}')"></div>
                <div class="card-info">
                    <span class="nome_jogo_destaque">${game.Nome_jogo}</span>
                    ${starsHtml}
                    <span class="preco_destaque" style="display: flex; align-items: center;">${precoHtml}</span>
                </div>
            `;
            cardsContainer.appendChild(gameCard);
        });

        // INICIALIZA O SWIPER DIRETAMENTE AQUI, APÓS INJETAR OS ELEMENTOS
        new Swiper('.destaques-swiper', {
            slidesPerView: 5,
            spaceBetween: 41,
            loop: false,
            centerSlide: true,
            fade: true,
            grabCursor: true,
            breakpoints: {
                0: {
                    slidesPerView: 2,
                },
                520: {
                    slidesPerView: 3,
                },
                950: {
                    slidesPerView: 5,
                },
            },
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
        });

    } catch (error) {
        console.error("Falha ao carregar os destaques:", error);
        cardsContainer.innerHTML = '<p class="error-message">Erro ao carregar os destaques da semana.</p>';
    }
}

// Ponto de entrada: Garante que a função só roda depois que o HTML estiver carregado
document.addEventListener("DOMContentLoaded", fetchAndDisplayHighlights);