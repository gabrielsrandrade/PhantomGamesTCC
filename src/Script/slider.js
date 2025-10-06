async function fetchDataFromAPI() {
  try {
    const response = await fetch('http://localhost:3000/jogos-carrossel');
    if (!response.ok) throw new Error('Falha ao buscar os dados do carrossel.');
    const games = await response.json();
    const backendUrl = 'http://localhost:3000';

    return games.map(game => {
      let imageUrl = game.Primeira_Midia;
      if (imageUrl && imageUrl.startsWith('/')) {
        imageUrl = `${backendUrl}${imageUrl}`;
      }

      const precoFloat = parseFloat(game.Preco_jogo);
      const descontoFloat = parseFloat(game.Desconto_jogo);
      let precoFormatado;

      if (precoFloat === 0) {
        precoFormatado = 'Grátis';
      } else if (descontoFloat > 0) {
        const precoComDesconto = precoFloat * (1 - descontoFloat / 100);
        precoFormatado = `R$ ${precoComDesconto.toFixed(2).replace('.', ',')}`;
      } else {
        precoFormatado = `R$ ${precoFloat.toFixed(2).replace('.', ',')}`;
      }

      return {
        id: game.ID_jogo,
        url: imageUrl,
        thumbnail: imageUrl,
        price: precoFormatado
      };
    });
  } catch (error) {
    console.error("Erro ao carregar dados para o carrossel:", error);
    return [];
  }
}

const mainImage = document.getElementById('main-image');
const priceElement = document.getElementById('price');
const thumbnailsContainer = document.getElementById('thumbnails');
const carrosselContainer = document.querySelector('.carrosel');
const buyNowButton = mainImage.querySelector('button');
let currentIndex = 0;
let images = [];
let autoSlideInterval;

function startAutoSlide() {
  if (autoSlideInterval) clearInterval(autoSlideInterval);
  autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel(currentIndex);
  }, 3000);
}

async function initializeCarousel() {
  images = await fetchDataFromAPI();
  
  if (images && images.length > 0) {
    updateCarousel(0);
    startAutoSlide();

    buyNowButton.addEventListener('click', () => {
      const currentGameId = images[currentIndex].id;
      if (currentGameId) {
        window.location.href = `jogo.html?id=${currentGameId}`;
      }
    });

  } else {
    if (carrosselContainer) {
      carrosselContainer.innerHTML = '<p style="color:white; text-align:center; width:100%; height: 36rem; display: flex; align-items: center; justify-content: center;">Não foi possível carregar os jogos do carrossel.</p>';
    }
  }
}

function updateCarousel(index) {
  if (!images[index]) return;

  mainImage.style.opacity = '0';
  currentIndex = index;

  setTimeout(() => {
    mainImage.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.39) 30%, rgba(0, 0, 0, 0) 100%), url(${images[index].url})`;
    priceElement.textContent = images[index].price;

    const nextIndices = [
      (index + 1) % images.length,
      (index + 2) % images.length,
      (index + 3) % images.length
    ].slice(0, Math.min(3, images.length - 1));

    thumbnailsContainer.innerHTML = nextIndices.map((nextIndex) => `
      <div class="carrosel_side_image" data-index="${nextIndex}" style="background-image: linear-gradient(to right, rgba(0, 0, 0, 0.39) 30%, rgba(0, 0, 0, 0) 100%), url(${images[nextIndex].thumbnail});"></div>
    `).join('');

    mainImage.style.opacity = '1';

    const thumbnails = document.querySelectorAll('.carrosel_side_image');
    thumbnails.forEach(thumb => {
      thumb.addEventListener('click', () => {
        const nextIndex = parseInt(thumb.dataset.index);
        updateCarousel(nextIndex);
        startAutoSlide();
      });
    });
  }, 200);
}

initializeCarousel();

document.addEventListener("gameUpdated", () => {
  initializeCarousel();
});