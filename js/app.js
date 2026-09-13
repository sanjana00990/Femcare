/* ============================================================
   FemCare AI — App Logic
   ============================================================ */

const PAGES = {
  dashboard:  { title: 'Health Dashboard',       subtitle: 'Real-time monitoring · Cycle Day 18',    render: renderDashboard,  afterRender: () => { buildMiniCycleChart('miniCycleChart'); } },
  tracker:    { title: 'Period Tracker',          subtitle: 'Calendar-based cycle logging',            render: renderTracker,    afterRender: () => {} },
  symptoms:   { title: 'Symptom Checker',         subtitle: 'AI-powered symptom analysis',             render: renderSymptoms,   afterRender: () => {} },
  journal:    { title: 'Symptom Journal',         subtitle: 'Daily health diary',                      render: renderJournal,    afterRender: () => {} },
  insights:   { title: 'Cycle Insights',          subtitle: 'Predictive analytics & trends',           render: renderInsights,   afterRender: () => { buildCycleTrendChart('cycleTrendChart'); buildSymptomBarChart('symptomBarChart'); buildPhaseDonutChart('phaseDonutChart'); buildHormoneChart('hormoneChart'); } },
  diet:       { title: 'Diet & Nutrition',        subtitle: 'Phase-synced nutrition protocol',         render: renderDiet,       afterRender: () => {} },
  exercise:   { title: 'Exercise Planner',        subtitle: 'Personalized movement recommendations',   render: renderExercise,   afterRender: () => {} },
  report:     { title: 'Health Report',           subtitle: 'Clinical summary & PDF export',           render: renderReport,     afterRender: () => {} },
  doctors:    { title: 'Find Specialists',        subtitle: 'Nearby gynaecologists & clinics',         render: renderDoctors,    afterRender: () => {} }
};

let selectedSymptoms = [];
let currentPage = 'dashboard';

function navigate(pageId, el) {
  currentPage = pageId;

  // Update active nav item
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  if (el) el.classList.add('active');

  const page = PAGES[pageId];
  if (!page) return;

  // Update header
  document.getElementById('pageTitle').textContent = page.title;
  document.getElementById('pageSubtitle').textContent = page.subtitle;

  // Destroy existing charts
  Chart.helpers && Object.values(Chart.instances || {}).forEach(c => c.destroy());

  // Render content
  const content = document.getElementById('pageContent');
  content.innerHTML = page.render();
  content.scrollTop = 0;

  // Run after-render (charts etc.)
  requestAnimationFrame(() => {
    try { page.afterRender(); } catch(e) { console.warn('afterRender:', e); }
  });
}

function selectDay(d) {
  showToast(`📅 Day ${d} selected — log your flow below`);
}

function toggleSymptom(el, name) {
  el.classList.toggle('selected');
  if (el.classList.contains('selected')) {
    if (!selectedSymptoms.includes(name)) selectedSymptoms.push(name);
  } else {
    selectedSymptoms = selectedSymptoms.filter(s => s !== name);
  }
}

function analyzeSymptoms() {
  if (selectedSymptoms.length === 0) {
    showToast('⚠️ Please select at least one symptom');
    return;
  }
  const key = selectedSymptoms.find(s => APP_DATA.suggestions[s]) || 'default';
  const sugg = APP_DATA.suggestions[key] || APP_DATA.suggestions.default;
  const severity = document.getElementById('severitySlider').value;

  document.getElementById('suggestionPanel').innerHTML = `
    <div class="panel-title">
      <svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      AI Recommendations
      <span class="badge badge-teal" style="margin-left:auto">Severity ${severity}/10</span>
    </div>
    <div style="margin-bottom:12px;padding:10px 12px;background:var(--teal-glow);border:1px solid rgba(14,165,233,.2);border-radius:var(--r-md);font-size:12.5px;color:var(--text-secondary)">
      Analysing: <strong style="color:var(--teal)">${selectedSymptoms.join(', ')}</strong>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px">
      <div class="result-card">
        <div class="result-card-label" style="color:var(--emerald)">🥗 Recommended Foods</div>
        <div class="result-items">${sugg.foods.map(f=>`<div class="result-item"><div class="dot dot-green"></div>${f}</div>`).join('')}</div>
      </div>
      <div class="result-card">
        <div class="result-card-label" style="color:var(--teal)">🏃 Exercise Suggestions</div>
        <div class="result-items">${sugg.exercises.map(e=>`<div class="result-item"><div class="dot dot-teal"></div>${e}</div>`).join('')}</div>
      </div>
      <div class="result-card">
        <div class="result-card-label" style="color:var(--purple)">💡 Health Tips</div>
        <div class="result-items">${sugg.tips.map(t=>`<div class="result-item"><div class="dot dot-purple"></div>${t}</div>`).join('')}</div>
      </div>
    </div>`;
  showToast('✅ Analysis complete');
}

function showToast(msg) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = msg;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(40px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  navigate('dashboard', document.querySelector('.nav-item[data-page="dashboard"]'));
});
