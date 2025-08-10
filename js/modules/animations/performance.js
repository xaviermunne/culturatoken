// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\performance.js

// Debounce optimizado
export const debounce = (func, wait = 100, immediate = false) => {
  let timeout;
  return function() {
    const context = this, args = arguments;
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

// Throttle para eventos de scroll/resize
export const throttle = (func, limit = 100) => {
  let lastFunc;
  let lastRan;
  return function() {
    const context = this;
    const args = arguments;
    if (!lastRan) {
      func.apply(context, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(() => {
        if ((Date.now() - lastRan) >= limit) {
          func.apply(context, args);
          lastRan = Date.now();
        }
      }, limit - (Date.now() - lastRan));
    }
  };
};

// Optimización de animaciones en dispositivos móviles
export const isMobileDevice = () => {
  return window.matchMedia('(max-width: 768px)').matches || 
         /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Configuración de performance para GSAP
export const getAnimationSettings = () => {
  return {
    duration: isMobileDevice() ? 0.6 : 0.8,
    ease: isMobileDevice() ? 'power2.out' : 'power3.out',
    stagger: isMobileDevice() ? 0.1 : 0.2
  };
};