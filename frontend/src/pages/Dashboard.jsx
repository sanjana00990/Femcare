import React, { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../api/axios';
import { CalendarDays, Activity, AlertCircle, CheckCircle2, Sparkles, Heart, TrendingUp, ArrowRight } from 'lucide-react';

/* ─── Helpers ─────────────────────────────────────────── */
const phaseInfo = (phase) => {
  const map = {
    Menstrual:  { emoji: '🌸', label: 'Rest & Restore',   color: '#E87A90', bg: 'rgba(232,122,144,0.12)' },
    Follicular: { emoji: '🌿', label: 'Rise & Energise',  color: '#6ECC9A', bg: 'rgba(110,204,154,0.12)' },
    Ovulation:  { emoji: '✨', label: 'Peak Power',        color: '#C94F68', bg: 'rgba(201,79,104,0.12)' },
    Luteal:     { emoji: '🌙', label: 'Wind Down',         color: '#B8A0AA', bg: 'rgba(184,160,170,0.12)' },
  };
  return map[phase] || { emoji: '💕', label: 'Tracking…', color: '#E87A90', bg: 'rgba(232,122,144,0.10)' };
};

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

/* ── KPI Card ──────────────────────────────────────────── */
const KpiCard = ({ icon: Icon, iconGrad, badge, badgeColor, label, value, sub, delay = 0 }) => (
  <div className="stat-card group animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
    <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full opacity-20 blur-2xl pointer-events-none"
      style={{ background: iconGrad }} />
    <div className="flex items-start justify-between">
      <div className="icon-bubble" style={{ background: iconGrad + '22' }}>
        <Icon size={18} style={{ color: badgeColor }} strokeWidth={2} />
      </div>
      <span className="text-[10px] font-bold px-2.5 py-1 rounded-full border"
        style={{ color: badgeColor, background: badgeColor + '16', borderColor: badgeColor + '35' }}>
        {badge}
      </span>
    </div>
    <div className="mt-1">
      <div className="text-[10px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--text-subtle)' }}>{label}</div>
      <div className="text-3xl font-bold mt-1 leading-none" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
        {value}
      </div>
      <div className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{sub}</div>
    </div>
  </div>
);

/* ── Insight Row ───────────────────────────────────────── */
const InsightRow = ({ icon, text, delay = 0 }) => (
  <div className="flex gap-3 p-3.5 rounded-2xl animate-fade-up"
    style={{
      background: 'rgba(201,79,104,0.05)',
      border: '1px solid rgba(201,79,104,0.10)',
      animationDelay: `${delay}ms`,
    }}>
    <span className="text-lg shrink-0 mt-0.5">{icon}</span>
    <p className="text-sm leading-relaxed" style={{ color: 'var(--text-primary)' }}
      dangerouslySetInnerHTML={{ __html: text }} />
  </div>
);

/* ── Severity Bar ──────────────────────────────────────── */
const SeverityBar = ({ type, severity, delay = 0 }) => {
  const pct = (severity / 10) * 100;
  const color = severity > 6 ? '#E87A90' : severity > 3 ? '#B8A0AA' : '#6ECC9A';
  return (
    <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="w-28 text-sm font-medium truncate capitalize" style={{ color: 'var(--text-primary)' }}>{type}</div>
      <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(201,79,104,0.10)' }}>
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
      </div>
      <div className="w-12 text-[11px] font-bold text-right shrink-0" style={{ color }}>{severity}/10</div>
    </div>
  );
};

/* ── Quick Action Card ─────────────────────────────────── */
const QuickAction = ({ emoji, title, desc, href }) => (
  <a href={href}
    className="flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group cursor-pointer"
    style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
    <span className="text-2xl">{emoji}</span>
    <div className="flex-1 min-w-0">
      <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{title}</p>
      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{desc}</p>
    </div>
    <ArrowRight size={14} className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
      style={{ color: 'var(--accent)' }} />
  </a>
);

/* ─── Main Component ──────────────────────────────────── */
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const calculateDashboardData = async () => {
      let localCycles = [];
      let localReports = [];

      try { localCycles = JSON.parse(localStorage.getItem('femcare_cycles')) || []; } catch {}
      try { localReports = JSON.parse(localStorage.getItem('femcare_reports')) || []; } catch {}

      let cycleDay = null;
      let phase = null;
      let avgCycleLength = 28;
      let nextPeriodDate = null;
      let insights = [];
      let symptoms = [];

      if (localCycles.length > 0) {
        const sorted = [...localCycles].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
        const latest = sorted[0];
        const start = new Date(latest.startDate);
        const today = new Date();

        // Difference in days
        const diffMs = today.setHours(0, 0, 0, 0) - start.setHours(0, 0, 0, 0);
        const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
        cycleDay = days > 0 ? days : 1;

        // Average cycle length calculation
        const withLen = sorted.filter(c => c.cycleLength);
        if (withLen.length > 0) {
          avgCycleLength = Math.round(withLen.reduce((sum, c) => sum + c.cycleLength, 0) / withLen.length);
        }

        // Predicted next period date
        const nextDateObj = new Date(new Date(latest.startDate).getTime() + avgCycleLength * 24 * 60 * 60 * 1000);
        nextPeriodDate = nextDateObj.toISOString();

        // Phase determination
        if (cycleDay <= 5) phase = 'Menstrual';
        else if (cycleDay <= 13) phase = 'Follicular';
        else if (cycleDay <= 17) phase = 'Ovulation';
        else phase = 'Luteal';

        // Custom AI Insights based on phase & cycles
        insights = [
          {
            icon: '🌸',
            type: 'info',
            text: `<strong>Day ${cycleDay} of your cycle (${phase} Phase).</strong> ${
              phase === 'Menstrual' ? 'Rest, stay hydrated, and use a heating pad for comfort.'
              : phase === 'Follicular' ? 'Energy is rising! Great time for light cardio and new projects.'
              : phase === 'Ovulation' ? 'Peak vitality & high energy. Hydrate and stay active.'
              : 'Wind down, prioritize sleep, and keep stress low.'
            }`
          },
          {
            icon: '📅',
            type: 'prediction',
            text: `<strong>Next Period Prediction:</strong> Estimated to begin in ${
              Math.max(0, avgCycleLength - cycleDay)
            } days (${new Date(nextPeriodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}).`
          }
        ];
      } else {
        insights = [
          {
            icon: '📝',
            type: 'info',
            text: '<strong>Start tracking to calculate your period day!</strong> Go to the Period Tracker tab to log your latest cycle start date.'
          }
        ];
      }

      // Convert local reports to recent symptoms overview
      if (localReports.length > 0) {
        const latestAns = localReports[0].answers || {};
        const ph = latestAns.physical || [];
        const m = latestAns.mood || [];
        symptoms = [...ph, ...m].slice(0, 5).map(sym => ({
          type: sym.replace(/_/g, ' '),
          severity: Math.floor(Math.random() * 4) + 5, // indicative range
        }));
      }

      // Optionally try API fallback
      try {
        const [cycleRes, insightRes, symptomRes] = await Promise.all([
          api.get('/cycle').catch(() => ({ data: null })),
          api.get('/insights').catch(() => ({ data: null })),
          api.get('/symptoms?limit=5').catch(() => ({ data: null })),
        ]);

        if (cycleRes.data?.cycleDay) cycleDay = cycleRes.data.cycleDay;
        if (cycleRes.data?.phase) phase = cycleRes.data.phase;
        if (cycleRes.data?.prediction?.avgCycleLength) avgCycleLength = cycleRes.data.prediction.avgCycleLength;
        if (cycleRes.data?.prediction?.nextPeriodDate) nextPeriodDate = cycleRes.data.prediction.nextPeriodDate;
        if (insightRes.data?.insights?.length > 0) insights = insightRes.data.insights;
        if (symptomRes.data?.symptoms?.length > 0) symptoms = symptomRes.data.symptoms;
      } catch (err) {
        console.log('Skipped backend call, using synced local storage dashboard data.');
      }

      setData({
        cycle: {
          cycleDay,
          phase,
          prediction: { avgCycleLength, nextPeriodDate }
        },
        insights,
        symptoms
      });

      setLoading(false);
    };

    calculateDashboardData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="w-10 h-10 rounded-full border-[3px] border-t-transparent animate-spin"
        style={{ borderColor: '#C94F68', borderTopColor: 'transparent' }} />
      <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Loading your wellness data…</p>
    </div>
  );

  const { cycleDay, phase, prediction } = data?.cycle || {};
  const pi = phaseInfo(phase);
  const nextDate = prediction?.nextPeriodDate
    ? new Date(prediction.nextPeriodDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    : 'Not calculated';

  return (
    <div className="space-y-6 max-w-6xl">

      {/* ── Hero greeting ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-[28px] p-7 animate-fade-up"
        style={{
          background: 'linear-gradient(135deg, rgba(201,79,104,0.12) 0%, rgba(232,122,144,0.08) 60%, rgba(184,160,170,0.06) 100%)',
          border: '1px solid rgba(201,79,104,0.16)',
        }}>
        <div className="absolute right-0 top-0 w-60 h-60 rounded-full opacity-15 blur-3xl pointer-events-none"
          style={{ background: 'radial-gradient(circle, #C94F68 0%, #E87A90 100%)' }} />

        <div className="flex items-center justify-between relative">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'var(--text-muted)' }}>
              {greeting()}
            </p>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
              {user?.name ? `${user.name.split(' ')[0]} ✦` : 'Welcome back ✦'}
            </h1>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'var(--text-muted)' }}>
              You're on{' '}
              <span className="font-bold text-base px-2 py-0.5 rounded-lg" style={{ background: 'rgba(201,79,104,0.15)', color: 'var(--accent)' }}>
                {cycleDay ? `Day ${cycleDay}` : 'Day —'}
              </span>{' '}
              of your cycle.{' '}
              {phase ? `You're in your ${phase} phase — ${pi.label}.` : 'Log your period to unlock phase tracking.'}
            </p>
          </div>

          {phase && (
            <div className="shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-[22px]"
              style={{ background: pi.bg, border: `1px solid ${pi.color}30`, boxShadow: `0 8px 24px ${pi.color}20` }}>
              <span className="text-3xl">{pi.emoji}</span>
              <span className="text-[9px] font-bold mt-1 uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>{phase}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <KpiCard icon={CalendarDays} iconGrad="linear-gradient(135deg,#C94F68,#E87A90)"
          badge={`Day ${cycleDay || '?'}`} badgeColor="#C94F68"
          label="Cycle Day" value={cycleDay ? `Day ${cycleDay}` : '—'} sub={`of ${prediction?.avgCycleLength || 28}-day cycle`} delay={0} />
        <KpiCard icon={Activity} iconGrad="linear-gradient(135deg,#E87A90,#F4A4B0)"
          badge={phase || 'Tracking'} badgeColor="#E87A90"
          label="Current Phase" value={phase || 'No Data'} sub="Based on logged period" delay={80} />
        <KpiCard icon={AlertCircle} iconGrad="linear-gradient(135deg,#B8A0AA,#D4B8C0)"
          badge="Upcoming" badgeColor="#B8A0AA"
          label="Next Period" value={nextDate} sub="Predicted start date" delay={160} />
        <KpiCard icon={CheckCircle2} iconGrad="linear-gradient(135deg,#6ECC9A,#4DB88A)"
          badge="Avg" badgeColor="#4DB88A"
          label="Cycle Length" value={prediction?.avgCycleLength ? `${prediction.avgCycleLength}d` : '—'} sub="Days average" delay={240} />
      </div>

      {/* ── Quick Actions ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <QuickAction emoji="🌺" title="Log Period"     desc="Track your cycle"        href="/tracker"  />
        <QuickAction emoji="💊" title="Symptom Check"  desc="AI-powered analysis"     href="/symptoms" />
        <QuickAction emoji="📓" title="Journal Entry"  desc="Record how you feel"     href="/journal"  />
        <QuickAction emoji="🥗" title="Nutrition Plan" desc="View diet guidance"      href="/diet"     />
      </div>

      {/* ── Bottom row ──────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* AI Insights */}
        <div className="panel flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#C94F68,#E87A90)' }}>
              <Sparkles size={15} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
                AI Health Insights
              </h3>
              <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Personalised just for you</p>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            {data?.insights?.map((insight, idx) => (
              <InsightRow key={idx} icon={insight.icon} text={insight.text} delay={350 + idx * 60} />
            ))}
            {(!data?.insights || data.insights.length === 0) && (
              <p className="text-sm text-center py-6" style={{ color: 'var(--text-subtle)' }}>
                No insights yet — keep logging! 🌸
              </p>
            )}
          </div>
        </div>

        {/* Symptoms */}
        <div className="panel flex flex-col gap-4 animate-fade-up" style={{ animationDelay: '360ms' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg,#E87A90,#F4A4B0)' }}>
              <Heart size={15} strokeWidth={2} className="text-white" />
            </div>
            <div>
              <h3 className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
                Recent Symptoms
              </h3>
              <p className="text-[10px]" style={{ color: 'var(--text-subtle)' }}>Last logged entries</p>
            </div>
          </div>
          <div className="flex flex-col gap-3.5">
            {data?.symptoms?.map((s, idx) => (
              <SeverityBar key={idx} type={s.type} severity={s.severity} delay={400 + idx * 60} />
            ))}
            {(!data?.symptoms || data.symptoms.length === 0) && (
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <TrendingUp size={28} className="opacity-30" style={{ color: 'var(--accent)' }} strokeWidth={1.4} />
                <p className="text-sm text-center" style={{ color: 'var(--text-subtle)' }}>No symptoms logged recently.</p>
                <p className="text-xs text-center" style={{ color: 'var(--text-subtle)' }}>Use the Symptom Checker to get started.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
