const swiper = new Swiper(".generos", {
    slidesPerView: 4,
    spaceBetween: 16,
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
        slidesPerView: 4,
      },
    },
  });
