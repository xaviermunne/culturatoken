// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\animations\gsapSetup.js

import { debounce } from '../utils/performance.js';

// Configuración global de GSAP
const setupGSAP = () => {
  if (typeof gsap === 'undefined') {
    console.warn('GSAP no está disponible');
    return false;
  }

  // Optimización de animaciones
  gsap.config({
    autoSleep: 60,
    nullTargetWarn: false,
    units: { left: '%', top: '%', rotation: 'deg' }
  });

  // Registrar plugins
  if (typeof ScrollTrigger !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ limitCallbacks: true });
  }

  return true;
};

// Animaciones iniciales de la página
export const initGSAPAnimations = () => {
  if (!setupGSAP()) return;

  // Animación del hero
  const heroAnimation = () => {
    const heroBg = document.querySelector('.hero-bg');
    if (!heroBg) return;

    gsap.from(heroBg, {
      opacity: 0,
      y: 50,
      duration: 1.2,
      ease: 'power3.out',
      onStart: () => heroBg.style.willChange = 'opacity, transform'
    });
  };

  // Animaciones de secciones al hacer scroll
  const setupScrollAnimations = () => {
    const sections = gsap.utils.toArray('section:not(.no-animate)');
    if (!sections.length) return;

    sections.forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 80,
        duration: 0.8,
        ease: 'back.out(0.5)',
        scrollTrigger: {
          trigger: section,
          start: 'top 75%',
          toggleActions: 'play none none none',
          onEnter: () => section.style.willChange = 'opacity, transform',
          onLeaveBack: () => section.style.willChange = 'auto'
        }
      });
    });
  };

  // Fallback para cuando ScrollTrigger no está disponible
  const setupIntersectionFallback = () => {
    if (typeof ScrollTrigger !== 'undefined') return;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gsap.to(entry.target, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power2.out',
            onComplete: () => observer.unobserve(entry.target)
          });
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('section').forEach(section => {
      gsap.set(section, { opacity: 0, y: 50 });
      observer.observe(section);
    });
  };

  // Inicializar animaciones
  heroAnimation();
  
  if (typeof ScrollTrigger !== 'undefined') {
    ScrollTrigger.addEventListener('refresh', () => {
      document.querySelectorAll('[style*="will-change"]').forEach(el => {
        el.style.willChange = 'auto';
      });
    });
    setupScrollAnimations();
  } else {
    setupIntersectionFallback();
  }

  // Recalcular en resize (con debounce)
  window.addEventListener('resize', debounce(() => {
    if (typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.refresh();
    }
  }, 250));
};

// Animaciones personalizadas para elementos específicos
export const animateElement = (element, options) => {
  const defaults = {
    y: 20,
    opacity: 0,
    duration: 0.6,
    ease: 'power2.out'
  };

  return gsap.from(element, { ...defaults, ...options });
};

// Efecto de hover para tarjetas
export const setupCardHoverEffects = () => {
  const cards = document.querySelectorAll('.card-hover');
  if (!cards.length) return;

  cards.forEach(card => {
    gsap.set(card, { transformPerspective: 1000 });
    
    card.addEventListener('mouseenter', () => {
      gsap.to(card, {
        y: -10,
        scale: 1.03,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    card.addEventListener('mouseleave', () => {
      gsap.to(card, {
        y: 0,
        scale: 1,
        duration: 0.4,
        ease: 'power2.out'
      });
    });
  });
};