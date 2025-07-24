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