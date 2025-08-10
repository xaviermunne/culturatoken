// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\components\swiperExtensions.js

// Efecto de parallax para el carrusel
export const setupSwiperParallax = (swiperInstance) => {
  if (!swiperInstance) return;

  const parallaxBg = swiperInstance.el.querySelector('.swiper-parallax-bg');
  if (!parallaxBg) return;

  swiperInstance.on('slideChange', () => {
    const progress = swiperInstance.progress;
    gsap.to(parallaxBg, {
      y: `${progress * 50}%`,
      ease: 'none'
    });
  });
};

// Lazy loading mejorado
export const enhanceSwiperLazyLoading = (swiperInstance) => {
  if (!swiperInstance || !swiperInstance.params.lazy) return;

  swiperInstance.on('lazyImageReady', (swiper, slideEl, imageEl) => {
    gsap.from(imageEl, {
      opacity: 0,
      scale: 0.95,
      duration: 0.8,
      ease: 'power2.out',
      onStart: () => imageEl.style.willChange = 'opacity, transform'
    });
  });
};

// Integración con Alpine.js
export const createSwiperAlpineComponent = () => ({
  swiperInstance: null,
  init() {
    this.$nextTick(() => {
      this.swiperInstance = new Swiper(this.$el, getResponsiveSettings());
    });
  },
  destroy() {
    if (this.swiperInstance) {
      this.swiperInstance.destroy();
    }
  }
});