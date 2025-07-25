/*card destaques da semana*/
const swiper = new Swiper(".card_jogos", {
  spaceBetween: 41,
  loop: false,
  centerSlide: true,
  fade: true,
  grabCursor: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
 
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
});

/*card gratis*/
const swiper1 = new Swiper(".card_jogos2", {
  slidesPerView: 2,
  spaceBetween: 16,
  slidesPerGroup: 2,
  loop: false,
  centerSlide: true,
  fade: true,
  grabCursor: true,
  pagination: {
    el: ".swiper-pagination",
    clickable: true,
    dynamicBullets: true,
  },
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
 
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    520: {
      slidesPerView: 2,
    },
    950: {
      slidesPerView: 2,
    },
  },
});

/*card promoção*/
const swiper2 = new Swiper(".card_jogos3", {
  slidesPerView: 5,
  spaceBetween: 41,
  loop: false,
  centerSlide: true,
  fade: true,
  grabCursor: true,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
 
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
});

/*carrossel*/

async function fetchDataFromDatabase() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {
          url: 'https://img.hype.games/cdn/209a330a-50f4-48d1-9db7-7485e6a81d87cover.jpg',
          thumbnail: 'https://img.hype.games/cdn/209a330a-50f4-48d1-9db7-7485e6a81d87cover.jpg',
          price: 'R$ 99,99'
        },
        {
          url: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg?t=1753331942',
          thumbnail: 'https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/3527290/31bac6b2eccf09b368f5e95ce510bae2baf3cfcd/header.jpg?t=1753331942',
          price: 'R$ 79,99'
        },
        {
          url: 'https://tombraiderplace.com/wp-content/uploads/2021/02/tomb-raider-wallpaper-01-1280x720-1.jpg',
          thumbnail: 'https://tombraiderplace.com/wp-content/uploads/2021/02/tomb-raider-wallpaper-01-1280x720-1.jpg',
          price: 'R$ 59,99'
        },
        {
          url: 'https://www.overloadgames.com.br/img/blog/elden-ring-nightreign-e-o-novo-spin-off-focado-em-multiplayer-cooperativo/elden-ring-nightreign-e-o-novo-spin-off-focado-em-multiplayer-cooperativo.webp',
          thumbnail: 'https://www.overloadgames.com.br/img/blog/elden-ring-nightreign-e-o-novo-spin-off-focado-em-multiplayer-cooperativo/elden-ring-nightreign-e-o-novo-spin-off-focado-em-multiplayer-cooperativo.webp',
          price: 'R$ 49,99'
        }
      ]);
    }, 1000);
  });
}

const mainImage = document.getElementById('main-image');
const priceElement = document.getElementById('price');
const thumbnailsContainer = document.getElementById('thumbnails');
let currentIndex = 0;
let images = [];
let autoSlideInterval;

function startAutoSlide() {
  if (autoSlideInterval) {
    clearInterval(autoSlideInterval);
  }
  autoSlideInterval = setInterval(() => {
    currentIndex = (currentIndex + 1) % images.length;
    updateCarousel(currentIndex);
  }, 10000);
}

async function initializeCarousel() {
  images = await fetchDataFromDatabase();
  updateCarousel(0);
  startAutoSlide();
}

function updateCarousel(index) {
  mainImage.style.backgroundImage = `linear-gradient(to right, rgba(0, 0, 0, 0.39) 30%, rgba(0, 0, 0, 0) 100%), url(${images[index].url})`;
  priceElement.textContent = images[index].price;

  const nextIndices = [
    (index + 1) % images.length,
    (index + 2) % images.length,
    (index + 3) % images.length
  ];
  thumbnailsContainer.innerHTML = nextIndices.map((nextIndex, i) => `
    <div class="carrosel_side_image ${i === 0 ? 'active' : ''}" data-index="${nextIndex}" style="background-image: linear-gradient(to right, rgba(0, 0, 0, 0.39) 30%, rgba(0, 0, 0, 0) 100%), url(${images[nextIndex].thumbnail});"></div>
  `).join('');

  const thumbnails = document.querySelectorAll('.carrosel_side_image');
  thumbnails.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const nextIndex = parseInt(thumb.dataset.index);
      currentIndex = nextIndex;
      updateCarousel(nextIndex);
      startAutoSlide();
    });
  });
}

initializeCarousel();