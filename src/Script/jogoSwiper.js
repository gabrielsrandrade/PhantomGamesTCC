var swiper = new Swiper(".jogo-side-image", {
    spaceBetween: 16,
    slidesPerView: 4,
    freeMode: true,
    loop: true,
    watchSlidesProgress: true,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
  });
  var swiper2 = new Swiper(".jogo-main-image", {
    spaceBetween: 10,
    autoplay: {
        delay: 2500,
        disableOnInteraction: false,
      },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
    thumbs: {
      swiper: swiper,
    },
  });