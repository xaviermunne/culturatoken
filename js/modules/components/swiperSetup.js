// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\components\swiperSetup.js

import { isMobileDevice } from '../utils/performance.js';
import { showToast } from '../utils/notifications.js';

// Configuración responsive para Swiper
const getResponsiveSettings = () => {
  const baseSettings = {
    slidesPerView: 1,
    spaceBetween: 20,
    grabCursor: true,
    keyboard: {
      enabled: true
    },
    autoplay: {
      delay: 5000,
      disableOnInteraction: false,
      pauseOnMouseEnter: true
    }
  };

  if (isMobileDevice()) {
    return {
      ...baseSettings,
      effect: 'slide',
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: false // Mejor rendimiento en móviles
      }
    };
  }

  return {
    ...baseSettings,
    slidesPerView: 2,
    breakpoints: {
      768: {
        slidesPerView: 2,
        spaceBetween: 30
      },
      1024: {
        slidesPerView: 3,
        spaceBetween: 40,
        effect: 'coverflow', // Efecto solo en desktop
        coverflowEffect: {
          rotate: 5,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: false
        }
      }
    }
  };
};

// Inicialización del carrusel Swiper
export const initSwiperCarousel = () => {
  if (typeof Swiper === 'undefined') {
    console.warn('Swiper no está disponible');
    return null;
  }

  const swiperContainers = document.querySelectorAll('.swiper-container');
  if (!swiperContainers.length) return null;

  const swiperInstances = [];

  swiperContainers.forEach((container, index) => {
    try {
      const config = {
        ...getResponsiveSettings(),
        loop: true,
        navigation: {
          nextEl: container.querySelector('.swiper-button-next'),
          prevEl: container.querySelector('.swiper-button-prev')
        },
        a11y: {
          prevSlideMessage: 'Slide anterior',
          nextSlideMessage: 'Slide siguiente',
          firstSlideMessage: 'Este es el primer slide',
          lastSlideMessage: 'Este es el último slide',
          paginationBulletMessage: 'Ir al slide {{index}}'
        }
      };

      const swiper = new Swiper(container, config);
      swiperInstances.push(swiper);

      // Eventos personalizados
      swiper.on('reachEnd', () => {
        if (index === 0) { // Solo notificar en el primer carrusel
          showToast(window.Alpine.store('appState'), 'Has llegado al final del carrusel', 'INFO');
        }
      });

    } catch (error) {
      console.error(`Error inicializando Swiper #${index}:`, error);
    }
  });

  // Manejar redimensionamiento
  const handleResize = () => {
    swiperInstances.forEach(swiper => {
      swiper.update();
      if (isMobileDevice()) {
        swiper.params.effect = 'slide';
      } else {
        swiper.params.effect = 'coverflow';
      }
    });
  };

  window.addEventListener('resize', handleResize);

  return {
    instances: swiperInstances,
    destroy: () => {
      window.removeEventListener('resize', handleResize);
      swiperInstances.forEach(swiper => swiper.destroy());
    }
  };
};

// Extensión para carrusel de testimonios
export const initTestimonialsSwiper = () => {
  if (typeof Swiper === 'undefined') return null;

  const container = document.querySelector('.testimonials-swiper');
  if (!container) return null;

  return new Swiper(container, {
    slidesPerView: 1,
    spaceBetween: 30,
    loop: true,
    effect: 'fade',
    fadeEffect: {
      crossFade: true
    },
    autoplay: {
      delay: 8000,
      disableOnInteraction: false
    },
    pagination: {
      el: '.testimonials-pagination',
      type: 'fraction'
    },
    navigation: {
      nextEl: '.testimonials-button-next',
      prevEl: '.testimonials-button-prev'
    }
  });
};