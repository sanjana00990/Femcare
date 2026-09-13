/* ============================================================
   FemCare AI — Chart Helpers
   ============================================================ */
const CHART_DEFAULTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor: '#1a2340', titleColor: '#f1f5f9', bodyColor: '#94a3b8', borderColor: 'rgba(255,255,255,0.1)', borderWidth: 1, padding: 10, cornerRadius: 8 } },
  scales: {
    x: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: '#475569', font: { size: 11 } } },
    y: { grid: { color: 'rgba(255,255,255,0.04)', drawBorder: false }, ticks: { color: '#475569', font: { size: 11 } } }
  }
};

function buildCycleTrendChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const d = APP_DATA.cycleHistory;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.map(r => r.month),
      datasets: [{
        data: d.map(r => r.length),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.08)',
        borderWidth: 2.5,
        pointBackgroundColor: '#0ea5e9',
        pointRadius: 4,
        pointHoverRadius: 6,
        tension: 0.45,
        fill: true
      }]
    },
    options: { ...CHART_DEFAULTS, plugins: { ...CHART_DEFAULTS.plugins }, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 22, max: 34, ticks: { ...CHART_DEFAULTS.scales.y.ticks, stepSize: 2 } } } }
  });
}

function buildSymptomBarChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const d = APP_DATA.symptomFrequency;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: d.map(r => r.label),
      datasets: [{
        data: d.map(r => r.value),
        backgroundColor: ['rgba(14,165,233,0.7)','rgba(139,92,246,0.7)','rgba(34,211,238,0.7)','rgba(245,158,11,0.7)','rgba(244,63,94,0.7)','rgba(16,185,129,0.7)'],
        borderRadius: 6,
        borderSkipped: false
      }]
    },
    options: { ...CHART_DEFAULTS, scales: { ...CHART_DEFAULTS.scales, y: { ...CHART_DEFAULTS.scales.y, min: 0, max: 100, ticks: { ...CHART_DEFAULTS.scales.y.ticks, callback: v => v + '%' } } } }
  });
}

function buildMiniCycleChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const d = APP_DATA.cycleHistory;
  new Chart(ctx, {
    type: 'line',
    data: {
      labels: d.map(r => r.month),
      datasets: [{
        data: d.map(r => r.length),
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        borderWidth: 2,
        pointRadius: 3,
        pointBackgroundColor: '#8b5cf6',
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...CHART_DEFAULTS.plugins.tooltip } },
      scales: {
        x: { display: false },
        y: { display: false, min: 22, max: 34 }
      }
    }
  });
}

function buildPhaseDonutChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Menstrual','Follicular','Ovulatory','Luteal'],
      datasets: [{
        data: [5, 9, 3, 11],
        backgroundColor: ['rgba(244,63,94,0.8)','rgba(14,165,233,0.8)','rgba(16,185,129,0.8)','rgba(139,92,246,0.8)'],
        borderColor: '#0b0f1a',
        borderWidth: 3,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true, maintainAspectRatio: false, cutout: '70%',
      plugins: {
        legend: { display: true, position: 'right', labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10, padding: 12 } },
        tooltip: { ...CHART_DEFAULTS.plugins.tooltip }
      }
    }
  });
}

function buildHormoneChart(canvasId) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  const labels = Array.from({ length: 28 }, (_, i) => i + 1);
  const estrogen = labels.map(d => d <= 14 ? Math.sin((d / 14) * Math.PI) * 80 + 20 : Math.sin(((d - 14) / 14) * Math.PI) * 40 + 15);
  const progesterone = labels.map(d => d < 14 ? 10 : Math.sin(((d - 14) / 14) * Math.PI) * 70 + 10);
  new Chart(ctx, {
    type: 'line',
    data: {
      labels,
      datasets: [
        { label: 'Estrogen', data: estrogen, borderColor: '#0ea5e9', backgroundColor: 'rgba(14,165,233,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true },
        { label: 'Progesterone', data: progesterone, borderColor: '#8b5cf6', backgroundColor: 'rgba(139,92,246,0.06)', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true }
      ]
    },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: '#94a3b8', font: { size: 11 }, boxWidth: 10 } },
        tooltip: { ...CHART_DEFAULTS.plugins.tooltip }
      },
      scales: { x: { ...CHART_DEFAULTS.scales.x, title: { display: true, text: 'Cycle Day', color: '#475569', font: { size: 10 } } }, y: { ...CHART_DEFAULTS.scales.y, display: false } }
    }
  });
}
