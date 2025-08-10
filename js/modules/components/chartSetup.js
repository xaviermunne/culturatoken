// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\components\chartSetup.js

import { isMobileDevice } from '../utils/performance.js';

// Configuración base del gráfico CTK
const getChartConfig = (darkMode = false) => ({
  type: 'doughnut',
  data: {
    labels: ['Inversores', 'Artistas', 'Reserva', 'Equipo'],
    datasets: [{
      data: [60, 20, 10, 10],
      backgroundColor: [
        darkMode ? '#9F7AEA' : '#764ba2', // Inversores
        darkMode ? '#818CF8' : '#4f46e5', // Artistas
        darkMode ? '#F472B6' : '#ec4899', // Reserva
        darkMode ? '#FBBF24' : '#f59e0b'  // Equipo
      ],
      borderWidth: 0,
      hoverOffset: 12,
      hoverBorderColor: darkMode ? '#E5E7EB' : '#1F2937'
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    cutout: isMobileDevice() ? '65%' : '70%',
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: !isMobileDevice(),
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.raw}%`;
          }
        },
        bodyFont: {
          family: "'Inter', sans-serif",
          size: 14
        }
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true,
      duration: 1500
    }
  }
});

// Inicialización del gráfico CTK
export const initCTKChart = () => {
  if (typeof Chart === 'undefined') {
    console.warn('Chart.js no está disponible');
    return null;
  }

  const chartEl = document.getElementById('ctkChart');
  if (!chartEl) return null;

  // Verificar modo oscuro
  const darkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  try {
    const ctx = chartEl.getContext('2d');
    const chartConfig = getChartConfig(darkMode);
    
    // Aplicar estilos responsive
    if (isMobileDevice()) {
      chartConfig.options.animation.duration = 1000;
      chartConfig.data.datasets[0].hoverOffset = 8;
    }

    const ctkChart = new Chart(ctx, chartConfig);

    // Manejar cambios en modo oscuro
    const colorSchemeQuery = window.matchMedia('(prefers-color-scheme: dark)');
    colorSchemeQuery.addEventListener('change', (e) => {
      const newDarkMode = e.matches;
      ctkChart.data.datasets[0].backgroundColor = [
        newDarkMode ? '#9F7AEA' : '#764ba2',
        newDarkMode ? '#818CF8' : '#4f46e5',
        newDarkMode ? '#F472B6' : '#ec4899',
        newDarkMode ? '#FBBF24' : '#f59e0b'
      ];
      ctkChart.update();
    });

    return ctkChart;
  } catch (error) {
    console.error('Error al inicializar el gráfico:', error);
    return null;
  }
};

// Actualización dinámica de datos
export const updateChartData = (chartInstance, newData) => {
  if (!chartInstance || !newData) return;

  try {
    chartInstance.data.datasets[0].data = newData;
    chartInstance.update();
  } catch (error) {
    console.error('Error actualizando gráfico:', error);
  }
};

// Extensión para gráfico de rendimiento
export const initPerformanceChart = (elementId, data) => {
  if (typeof Chart === 'undefined' || !elementId || !data) return null;

  const ctx = document.getElementById(elementId)?.getContext('2d');
  if (!ctx) return null;

  return new Chart(ctx, {
    type: 'line',
    data: {
      labels: data.labels,
      datasets: [{
        label: 'Rendimiento CTK',
        data: data.values,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.1)',
        fill: true,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context) => `${context.parsed.y}% de rendimiento`
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: (value) => `${value}%`
          }
        }
      }
    }
  });
};