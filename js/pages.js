/* ============================================================
   FemCare AI — Pages
   ============================================================ */

function renderDashboard() {
  return `
<div class="fade-up">
  <!-- KPI row -->
  <div class="grid-4 mb-20">
    <div class="stat-card fade-up-delay-1">
      <div class="stat-card-header">
        <div class="stat-icon teal"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div>
        <span class="badge badge-teal">Day ${APP_DATA.user.cycleDay}</span>
      </div>
      <div class="stat-label">Cycle Day</div>
      <div class="stat-value">${APP_DATA.user.cycleDay}</div>
      <div class="stat-sub">of ${APP_DATA.user.cycleLength}-day cycle</div>
    </div>
    <div class="stat-card fade-up-delay-2">
      <div class="stat-card-header">
        <div class="stat-icon purple"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z"/><path d="M12 8v4l3 3"/></svg></div>
        <span class="badge badge-purple">${APP_DATA.user.phase}</span>
      </div>
      <div class="stat-label">Current Phase</div>
      <div class="stat-value" style="font-size:20px">${APP_DATA.user.phase}</div>
      <div class="stat-sub">Days 15–28 of cycle</div>
    </div>
    <div class="stat-card fade-up-delay-3">
      <div class="stat-card-header">
        <div class="stat-icon rose"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/></svg></div>
        <span class="badge badge-rose">Upcoming</span>
      </div>
      <div class="stat-label">Next Period</div>
      <div class="stat-value" style="font-size:20px">${APP_DATA.user.nextPeriod}</div>
      <div class="stat-sub">in ~12 days</div>
    </div>
    <div class="stat-card fade-up-delay-4">
      <div class="stat-card-header">
        <div class="stat-icon green"><svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
        <span class="badge badge-green">Normal</span>
      </div>
      <div class="stat-label">Cycle Length</div>
      <div class="stat-value">${APP_DATA.user.cycleLength}</div>
      <div class="stat-sub">days avg · Regular</div>
    </div>
  </div>

  <!-- Row 2: Cycle card + AI Insights -->
  <div class="grid-2 mb-20">
    <div class="panel">
      <div class="panel-title"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/></svg>Cycle Phase Overview</div>
      <div class="phase-ring-wrap">
        <div class="phase-ring"><div class="phase-ring-inner"><div class="phase-ring-day">${APP_DATA.user.cycleDay}</div><div class="phase-ring-lbl">DAY</div></div></div>
        <div class="phase-details">
          <div class="phase-name">${APP_DATA.user.phase} Phase</div>
          <div class="phase-desc">Progesterone is dominant. Energy may dip. Focus on rest, magnesium-rich foods, and gentle movement.</div>
          <div style="margin-top:12px;display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge badge-rose" style="font-size:10px">● Menstrual Day 1–5</span>
            <span class="badge badge-teal" style="font-size:10px">● Follicular 6–13</span>
            <span class="badge badge-green" style="font-size:10px">● Ovulatory 14</span>
            <span class="badge badge-purple" style="font-size:10px">● Luteal 15–28</span>
          </div>
        </div>
      </div>
      <div class="divider"></div>
      <div style="font-size:12px;color:var(--text-secondary)">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Cycle regularity</span><span style="color:var(--emerald);font-weight:600">Regular</span></div>
        <div class="progress-bar"><div class="progress-fill green" style="width:78%"></div></div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-title"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>AI Health Insights</div>
      <div>
        ${APP_DATA.aiInsights.map(i => `
          <div class="insight-item">
            <div class="insight-icon" style="background:rgba(255,255,255,0.05)">${i.icon}</div>
            <div class="insight-text">${i.text}</div>
          </div>`).join('')}
      </div>
    </div>
  </div>

  <!-- Row 3: Symptoms + Charts -->
  <div class="grid-2 mb-20">
    <div class="panel">
      <div class="panel-title"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>Recent Symptoms</div>
      ${APP_DATA.recentSymptoms.map(s => `
        <div class="severity-row">
          <div class="severity-label">${s.name}</div>
          <div class="severity-bar-wrap">
            <div class="progress-bar">
              <div class="progress-fill ${s.severity > 6 ? 'rose' : s.severity > 4 ? 'amber' : 'teal'}" style="width:${s.severity*10}%"></div>
            </div>
          </div>
          <div class="severity-value">${s.severity}/10</div>
        </div>`).join('')}
    </div>

    <div class="panel">
      <div class="panel-title">Cycle Length Trend (6 months)</div>
      <div class="chart-container" style="height:160px"><canvas id="miniCycleChart"></canvas></div>
    </div>
  </div>

  <!-- Row 4: Quick suggestions -->
  <div class="panel">
    <div class="panel-title"><svg width="15" height="15" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>Today's Quick Suggestions <span class="badge badge-purple" style="margin-left:auto;font-size:10px">${APP_DATA.user.phase} Phase</span></div>
    <div class="grid-3">
      <div class="result-card">
        <div class="result-card-label" style="color:var(--emerald)">🥗 Eat Today</div>
        <div class="result-items">
          ${APP_DATA.suggestions.Fatigue.foods.map(f => `<div class="result-item"><div class="dot dot-green"></div>${f}</div>`).join('')}
        </div>
      </div>
      <div class="result-card">
        <div class="result-card-label" style="color:var(--teal)">🏃 Move Today</div>
        <div class="result-items">
          ${APP_DATA.suggestions.Fatigue.exercises.map(e => `<div class="result-item"><div class="dot dot-teal"></div>${e}</div>`).join('')}
        </div>
      </div>
      <div class="result-card">
        <div class="result-card-label" style="color:var(--purple)">💡 Health Tips</div>
        <div class="result-items">
          ${APP_DATA.suggestions.Fatigue.tips.map(t => `<div class="result-item"><div class="dot dot-purple"></div>${t}</div>`).join('')}
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function renderTracker() {
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const today = new Date();
  const year = today.getFullYear(), month = today.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthName = today.toLocaleString('default', { month: 'long' });
  const periodDays = [1,2,3,4,5];
  const predictedDays = [29,30,31];
  const ovulationDay = 14;
  const fertileDays = [12,13,14,15,16];

  let cells = '';
  for (let i = 0; i < firstDay; i++) cells += `<div class="cal-day empty"></div>`;
  for (let d = 1; d <= daysInMonth; d++) {
    let cls = 'cal-day';
    if (d === today.getDate()) cls += ' today';
    else if (periodDays.includes(d)) cls += ' period';
    else if (predictedDays.includes(d)) cls += ' predicted';
    else if (d === ovulationDay) cls += ' ovulation';
    else if (fertileDays.includes(d)) cls += ' fertile';
    cells += `<div class="${cls}" onclick="selectDay(${d})">${d}</div>`;
  }

  return `
<div class="fade-up">
  <div class="grid-2-1" style="grid-template-columns:1.5fr 1fr">
    <div class="panel">
      <div class="calendar-header">
        <div class="cal-month">${monthName} ${year}</div>
        <div style="display:flex;gap:6px">
          <div class="cal-nav-btn">‹</div>
          <div class="cal-nav-btn">›</div>
        </div>
      </div>
      <div class="calendar-grid">
        ${days.map(d => `<div class="cal-day-name">${d}</div>`).join('')}
        ${cells}
      </div>
      <div class="cal-legend">
        <div class="legend-item"><div class="legend-dot" style="background:rgba(244,63,94,0.7)"></div>Period</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(139,92,246,0.7)"></div>Predicted</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(16,185,129,0.7)"></div>Ovulation</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(14,165,233,0.4)"></div>Fertile</div>
        <div class="legend-item"><div class="legend-dot" style="background:rgba(14,165,233,0.8);border-radius:50%"></div>Today</div>
      </div>
    </div>

    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="panel">
        <div class="panel-title">Cycle Stats</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${[['Average Cycle','28 days','teal'],['Last Cycle','27 days','purple'],['Cycle Variation','± 2 days','green'],['Period Duration','5 days','amber']].map(([l,v,c]) => `
            <div style="display:flex;justify-content:space-between;align-items:center">
              <span style="font-size:12.5px;color:var(--text-secondary)">${l}</span>
              <span class="badge badge-${c}" style="font-size:11px">${v}</span>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Log Period</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">Flow Intensity</div>
            <div style="display:flex;gap:6px">
              ${['Light','Medium','Heavy'].map(f => `<button class="chip" onclick="this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')">${f}</button>`).join('')}
            </div>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">Symptoms</div>
            <div style="display:flex;gap:6px;flex-wrap:wrap">
              ${['Cramps','Bloating','Fatigue'].map(s => `<button class="chip">${s}</button>`).join('')}
            </div>
          </div>
          <button class="btn btn-primary w-full" style="justify-content:center" onclick="showToast('✅ Period logged successfully')">Log Today</button>
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function renderSymptoms() {
  return `
<div class="fade-up">
  <div class="grid-2">
    <div class="panel">
      <div class="panel-title">Select Your Symptoms</div>
      <div class="symptom-grid" id="symptomChips">
        ${APP_DATA.symptoms.map(s => `<div class="symptom-chip" onclick="toggleSymptom(this,'${s}')">${s}</div>`).join('')}
      </div>
      <div class="divider"></div>
      <div style="display:flex;gap:10px;align-items:center">
        <div style="flex:1">
          <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">Severity (1–10)</div>
          <input type="range" min="1" max="10" value="5" id="severitySlider" class="app-input" style="padding:4px;height:30px" oninput="document.getElementById('sevVal').textContent=this.value">
        </div>
        <div style="font-size:22px;font-weight:800;color:var(--teal);width:36px;text-align:center" id="sevVal">5</div>
      </div>
      <button class="btn btn-primary w-full" style="justify-content:center;margin-top:14px" onclick="analyzeSymptoms()">Analyze Symptoms</button>
    </div>

    <div class="panel" id="suggestionPanel">
      <div class="panel-title">AI Recommendations</div>
      <div style="color:var(--text-muted);font-size:13px;text-align:center;padding:40px 0">
        <div style="font-size:36px;margin-bottom:12px">🔍</div>
        Select symptoms on the left and click Analyze to get personalized recommendations.
      </div>
    </div>
  </div>
</div>`;
}

function renderJournal() {
  return `
<div class="fade-up">
  <div class="grid-2">
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="panel">
        <div class="panel-title">New Entry</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">Date</div>
            <input type="date" class="app-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">How are you feeling?</div>
            <textarea class="app-input" placeholder="Describe your symptoms, mood, and energy levels today..."></textarea>
          </div>
          <div>
            <div style="font-size:11px;color:var(--text-muted);margin-bottom:6px;text-transform:uppercase;letter-spacing:0.6px">Mood</div>
            <div style="display:flex;gap:8px">
              ${['😊','😐','😔','😤','😴'].map(e => `<button class="chip" style="font-size:18px;padding:6px 10px" onclick="this.parentElement.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));this.classList.add('active')">${e}</button>`).join('')}
            </div>
          </div>
          <button class="btn btn-primary w-full" style="justify-content:center" onclick="showToast('📔 Journal entry saved')">Save Entry</button>
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="section-header"><div class="section-title">Past Entries</div></div>
      ${APP_DATA.journalEntries.map(e => `
        <div class="journal-entry">
          <div class="journal-date">${e.date}</div>
          <div class="journal-text">${e.text}</div>
          <div class="journal-tags">${e.tags.map(t => `<span class="journal-tag">${t}</span>`).join('')}</div>
        </div>`).join('')}
    </div>
  </div>
</div>`;
}

function renderInsights() {
  return `
<div class="fade-up">
  <div class="grid-2 mb-20">
    <div class="panel">
      <div class="panel-title">Cycle Length Trend</div>
      <div class="chart-container" style="height:200px"><canvas id="cycleTrendChart"></canvas></div>
    </div>
    <div class="panel">
      <div class="panel-title">Symptom Frequency</div>
      <div class="chart-container" style="height:200px"><canvas id="symptomBarChart"></canvas></div>
    </div>
  </div>
  <div class="grid-2">
    <div class="panel">
      <div class="panel-title">Phase Distribution</div>
      <div class="chart-container" style="height:220px"><canvas id="phaseDonutChart"></canvas></div>
    </div>
    <div class="panel">
      <div class="panel-title">Hormone Levels (Estimated)</div>
      <div class="chart-container" style="height:220px"><canvas id="hormoneChart"></canvas></div>
    </div>
  </div>
</div>`;
}

function renderDiet() {
  const col = (items, type) => `
    <div class="diet-col">
      <div class="diet-col-header ${type}">
        ${{eat:'✅ Eat More',limit:'⚠️ Limit',avoid:'❌ Avoid'}[type]}
      </div>
      <div class="diet-col-body">
        ${items.map(i => `
          <div class="food-item">
            <div class="food-emoji">${i.emoji}</div>
            <div><div class="food-info-name">${i.name}</div><div class="food-info-why">${i.why}</div></div>
          </div>`).join('')}
      </div>
    </div>`;
  return `
<div class="fade-up">
  <div class="grid-3">
    ${col(APP_DATA.diet.eat,'eat')}
    ${col(APP_DATA.diet.limit,'limit')}
    ${col(APP_DATA.diet.avoid,'avoid')}
  </div>
</div>`;
}

function renderExercise() {
  return `
<div class="fade-up">
  <div class="grid-2-1">
    <div style="display:flex;flex-direction:column;gap:12px">
      <div class="panel" style="padding-bottom:14px">
        <div class="panel-title">Today's Exercise Plan <span class="badge badge-purple" style="margin-left:auto">${APP_DATA.user.phase} Phase</span></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${APP_DATA.exercises.slice(0,4).map(e => `
            <div class="exercise-card">
              <div class="ex-icon" style="background:rgba(14,165,233,0.1)">${e.emoji}</div>
              <div>
                <div class="ex-name">${e.name}</div>
                <div class="ex-meta">${e.duration} · ${e.desc}</div>
              </div>
              <div class="ex-intensity intensity-${e.intensity}">${e.intensity.charAt(0).toUpperCase()+e.intensity.slice(1)}</div>
            </div>`).join('')}
        </div>
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <div class="panel">
        <div class="panel-title">Weekly Activity</div>
        <div class="week-bar">
          ${APP_DATA.weeklyActivity.map(w => `
            <div class="week-bar-col">
              <div class="week-bar-fill${w.done?' active':''}" style="height:${Math.max(w.pct*0.44,4)}px"></div>
              <div class="week-bar-lbl">${w.day}</div>
            </div>`).join('')}
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Phase Recommendations</div>
        <div style="font-size:13px;color:var(--text-secondary);line-height:1.7">
          During the <strong style="color:var(--purple)">Luteal phase</strong>, focus on low-to-medium intensity workouts. Avoid heavy lifting. Yoga, walking, and swimming are ideal to support progesterone balance and reduce PMS symptoms.
        </div>
      </div>
    </div>
  </div>
</div>`;
}

function renderReport() {
  const today = new Date().toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
  return `
<div class="fade-up">
  <div class="grid-2-1">
    <div class="report-preview">
      <div class="report-header-block">
        <div><div class="report-title-lg">Health Cycle Report</div><div class="report-date">Generated: ${today} · Patient: ${APP_DATA.user.name}</div></div>
        <span class="badge badge-teal">Premium Report</span>
      </div>
      <div class="report-section">
        <div class="report-section-title">Cycle Summary</div>
        ${[['Current Phase',APP_DATA.user.phase],['Cycle Day',`Day ${APP_DATA.user.cycleDay} of ${APP_DATA.user.cycleLength}`],['Next Period',APP_DATA.user.nextPeriod],['Avg Cycle Length','28 days'],['Cycle Status','Regular']].map(([k,v])=>`<div class="report-row"><span>${k}</span><span>${v}</span></div>`).join('')}
      </div>
      <div class="report-section">
        <div class="report-section-title">Symptom Log (Last 30 Days)</div>
        ${APP_DATA.recentSymptoms.map(s=>`<div class="report-row"><span>${s.name} <span style="color:var(--text-muted);font-size:11px">${s.date}</span></span><span>Severity ${s.severity}/10</span></div>`).join('')}
      </div>
      <div class="report-section">
        <div class="report-section-title">AI Clinical Observations</div>
        ${APP_DATA.aiInsights.map(i=>`<div class="report-row"><span>${i.text.replace(/<[^>]+>/g,'')}</span></div>`).join('')}
      </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:14px">
      <div class="panel">
        <div class="panel-title">Generate Report</div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${[['Date Range','Last 30 Days'],['Format','PDF'],['Include Charts','Yes']].map(([l,v])=>`<div style="display:flex;justify-content:space-between;font-size:13px;color:var(--text-secondary)"><span>${l}</span><span style="color:var(--text-primary);font-weight:500">${v}</span></div>`).join('')}
          <div class="divider"></div>
          <button class="btn btn-primary w-full" style="justify-content:center" onclick="showToast('📄 Report downloaded as PDF')">
            <svg width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
            Download PDF
          </button>
        </div>
      </div>
      <div class="panel">
        <div class="panel-title">Report History</div>
        ${[['Mar 2026','Full Report'],['Feb 2026','Symptom Summary'],['Jan 2026','Full Report']].map(([m,t])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border)"><div><div style="font-size:13px;color:var(--text-primary)">${t}</div><div style="font-size:11px;color:var(--text-muted)">${m}</div></div><button class="btn btn-ghost btn-sm">↓</button></div>`).join('')}
      </div>
    </div>
  </div>
</div>`;
}

function renderDoctors() {
  return `
<div class="fade-up">
  <div class="map-placeholder mb-20">
    <div class="map-icon-lg">🗺️</div>
    <div style="font-weight:600;font-size:14px;color:var(--text-secondary)">Interactive Map</div>
    <div style="font-size:12px">Enable location to find nearby specialists</div>
    <button class="btn btn-primary btn-sm" onclick="showToast('📍 Location enabled')">Enable Location</button>
  </div>
  <div class="grid-2">
    ${APP_DATA.doctors.map(d => `
      <div class="doctor-card">
        <div class="doctor-avatar">${d.emoji}</div>
        <div style="flex:1">
          <div class="doctor-name">${d.name}</div>
          <div class="doctor-spec">${d.spec}</div>
          <div class="doctor-meta">
            <span class="star-rating">★ ${d.rating}</span>
            <span>${d.reviews} reviews</span>
            <span>${d.hospital}</span>
          </div>
          <div style="margin-top:6px;font-size:11px;color:var(--text-muted)">📍 ${d.dist} away</div>
        </div>
        <button class="book-btn" onclick="showToast('📅 Booking with ${d.name}')">Book</button>
      </div>`).join('')}
  </div>
</div>`;
}
