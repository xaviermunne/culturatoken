// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\utils\notifications.js

// Configuración global de notificaciones
const NOTIFICATION_TYPES = {
  SUCCESS: {
    className: 'bg-green-500 text-white',
    icon: '✓',
    duration: 3000
  },
  ERROR: {
    className: 'bg-red-500 text-white',
    icon: '⚠',
    duration: 5000
  },
  INFO: {
    className: 'bg-blue-500 text-white',
    icon: 'ℹ',
    duration: 4000
  },
  WARNING: {
    className: 'bg-yellow-500 text-black',
    icon: '⚠',
    duration: 4000
  }
};

// Mostrar notificación toast
export const showToast = (context, message, type = 'SUCCESS') => {
  if (!context || !message) return;
  
  const config = NOTIFICATION_TYPES[type] || NOTIFICATION_TYPES.SUCCESS;
  const toastId = `toast-${Date.now()}`;
  
  // Crear elemento toast
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `fixed bottom-4 right-4 ${config.className} px-6 py-3 rounded-lg shadow-lg flex items-center justify-between space-x-4 transform transition-all duration-300 ease-in-out opacity-0 translate-y-2`;
  toast.innerHTML = `
    <span class="font-bold">${config.icon} ${message}</span>
    <button onclick="document.getElementById('${toastId}').remove()" class="text-lg font-bold">&times;</button>
  `;
  
  // Añadir al DOM
  document.body.appendChild(toast);
  
  // Animación de entrada
  setTimeout(() => {
    toast.classList.remove('opacity-0', 'translate-y-2');
    toast.classList.add('opacity-100', 'translate-y-0');
  }, 10);
  
  // Auto-eliminación después del tiempo configurado
  setTimeout(() => {
    fadeOutAndRemove(toast);
  }, config.duration);
  
  // Cierre al hacer click
  toast.addEventListener('click', () => fadeOutAndRemove(toast));
};

// Animación de salida
const fadeOutAndRemove = (toast) => {
  if (!toast) return;
  
  toast.classList.add('opacity-0', 'translate-y-2');
  setTimeout(() => {
    toast.remove();
  }, 300);
};

// Manejador de errores global
export const getErrorMessage = (error) => {
  const errorMessages = {
    // Errores de wallet
    'METAMASK_NOT_INSTALLED': 'MetaMask no detectado. Instala la extensión para continuar.',
    'PHANTOM_NOT_INSTALLED': 'Phantom Wallet no detectado. Instala la extensión para continuar.',
    'NO_ACCOUNTS_FOUND': 'No se encontraron cuentas. Configura tu wallet e intenta nuevamente.',
    'NETWORK_CHANGE_FAILED': 'Error al cambiar a Polygon. Intenta manualmente.',
    
    // Errores de inversión
    'INSUFFICIENT_BALANCE': 'Saldo insuficiente para completar la transacción.',
    'INVESTMENT_LIMIT_EXCEEDED': 'El monto excede el límite permitido.',
    'SHOW_NOT_FOUND': 'El proyecto seleccionado no está disponible.',
    
    // Errores generales
    'DEFAULT': 'Ocurrió un error inesperado. Por favor, intenta nuevamente.'
  };
  
  return errorMessages[error.message] || error.message || errorMessages.DEFAULT;
};

// Notificación de sistema (para eventos importantes)
export const showSystemNotification = (title, options) => {
  if (!('Notification' in window)) {
    console.warn('Este navegador no soporta notificaciones del sistema');
    return;
  }
  
  if (Notification.permission === 'granted') {
    new Notification(title, options);
  } else if (Notification.permission !== 'denied') {
    Notification.requestPermission().then(permission => {
      if (permission === 'granted') {
        new Notification(title, options);
      }
    });
  }
};

// Limpiar todas las notificaciones
export const clearAllToasts = () => {
  document.querySelectorAll('[id^="toast-"]').forEach(toast => {
    fadeOutAndRemove(toast);
  });
};