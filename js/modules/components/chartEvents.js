// C:\Users\xavie\OneDrive\Escritorio\feina\programas propios\CulturalToken\deepseek\js\modules\components\chartEvents.js

// Animación al hacer hover en segmentos
export const setupChartHoverEffects = (chartInstance) => {
  if (!chartInstance) return;

  chartInstance.canvas.addEventListener('mousemove', (event) => {
    const segments = chartInstance.getElementsAtEventForMode(
      event, 
      'nearest', 
      { intersect: true }, 
      false
    );

    if (segments.length > 0) {
      chartInstance.canvas.style.cursor = 'pointer';
      gsap.to(chartInstance.data.datasets[0], {
        hoverOffset: 20,
        duration: 0.3
      });
      chartInstance.update();
    } else {
      chartInstance.canvas.style.cursor = 'default';
      gsap.to(chartInstance.data.datasets[0], {
        hoverOffset: 12,
        duration: 0.3
      });
      chartInstance.update();
    }
  });
};

// Integración con Alpine.js
export const createChartAlpineComponent = (chartType = 'doughnut') => ({
  chartInstance: null,
  init() {
    this.$nextTick(() => {
      const ctx = this.$el.getContext('2d');
      const config = chartType === 'doughnut' 
        ? getChartConfig(this.$store.appState.darkMode)
        : getPerformanceChartConfig();
      
      this.chartInstance = new Chart(ctx, config);
      
      // Actualizar cuando cambien los datos
      this.$watch('$store.appState.chartData', (data) => {
        updateChartData(this.chartInstance, data);
      });
    });
  },
  destroy() {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }
  }
});