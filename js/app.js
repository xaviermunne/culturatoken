// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\app.js

import { initGSAPAnimations } from './modules/animations/gsapSetup.js';
import { initSwiperCarousel } from './modules/components/swiperSetup.js';
import { initCTKChart } from './modules/components/chartSetup.js';
import appState from './stores/appState.js';

// Configuración de eventos pasivos optimizados
const setupPassiveListeners = () => {
  const debounce = (fn, delay = 100) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => fn.apply(this, args), delay);
    };
  };

  const handleScroll = debounce(() => {
    // Lógica de scroll optimizada
  });

  const handleResize = debounce(() => {
    // Lógica de resize optimizada
  });

  document.addEventListener('scroll', handleScroll, { passive: true });
  window.addEventListener('resize', handleResize, { passive: true });

  return () => {
    document.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', handleResize);
  };
};

// Inicialización de la aplicación
const initApp = () => {
  try {
    // 1. Inicializar animaciones
    initGSAPAnimations();
    
    // 2. Inicializar componentes
    initSwiperCarousel();
    initCTKChart();
    
    // 3. Configurar listeners pasivos
    const cleanupListeners = setupPassiveListeners();
    
    // 4. Inicializar Alpine.js
    window.Alpine.store('appState', appState());
    window.Alpine.start();
    
    return () => {
      cleanupListeners();
      // Limpieza adicional si es necesaria
    };
  } catch (error) {
    console.error('Error durante la inicialización:', error);
    // Mostrar mensaje de error al usuario
    const errorDisplay = document.createElement('div');
    errorDisplay.className = 'global-error';
    errorDisplay.textContent = 'Error al cargar la aplicación. Por favor recarga la página.';
    document.body.prepend(errorDisplay);
  }
};

// Iniciar cuando el DOM esté listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}