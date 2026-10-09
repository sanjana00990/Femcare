import React, { useState, useEffect } from 'react';
import { CalendarDays, Droplets, Trash2 } from 'lucide-react';

const FLOWS = [
  { label: 'Light',    value: 'light',    color: '#C5C0D8' },
  { label: 'Medium',   value: 'medium',   color: '#A596F0' },
  { label: 'Heavy',    value: 'heavy',    color: '#6F5CD0' },
  { label: 'Spotting', value: 'spotting', color: '#A9A2C4' },
];

/* ── localStorage helpers ── */
const LS_KEY = 'femcare_cycles';
const loadCycles  = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveCycles  = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

const Tracker = () => {
  const [form, setForm]       = useState({ startDate: '', endDate: '', flowIntensity: 'medium', notes: '' });
  const [cycles, setCycles]   = useState([]);
  const [msg, setMsg]         = useState('');
  const [loading, setLoading] = useState(false);

  /* load on mount */
  useEffect(() => { setCycles(loadCycles().sort((a, b) => new Date(b.startDate) - new Date(a.startDate))); }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.startDate) { setMsg('⚠️ Please pick a start date.'); return; }
    setLoading(true);

    /* calculate cycle length if end date provided */
    const cycleLength = form.endDate
      ? Math.round((new Date(form.endDate) - new Date(form.startDate)) / (1000 * 60 * 60 * 24)) + 1
      : null;

    const newCycle = {
      _id: `local_${Date.now()}`,
      ...form,
      cycleLength,
      createdAt: new Date().toISOString(),
    };

    const updated = [newCycle, ...loadCycles()].sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
    saveCycles(updated);
    setCycles(updated);
    setForm({ startDate: '', endDate: '', flowIntensity: 'medium', notes: '' });
    setMsg('✅ Cycle logged successfully!');
    setLoading(false);
    setTimeout(() => setMsg(''), 3500);
  };

  const handleDelete = (id) => {
    const updated = loadCycles().filter(c => c._id !== id);
    saveCycles(updated);
    setCycles(updated);
  };

  const FlowBadge = ({ cycle }) => {
    const f = FLOWS.find(f => f.value === cycle.flowIntensity) || FLOWS[1];
    return (
      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full"
        style={{ background: f.color + '20', color: f.color, border: `1px solid ${f.color}40` }}>
        {f.label}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
            <CalendarDays size={16} strokeWidth={2} />
          </span>
          Period Tracker
        </h2>
        <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>Log your cycle for personalised insights</p>
      </div>

      {/* Log form */}
      <div className="panel">
        {msg && (
          <div className="mb-5 p-3 rounded-2xl text-sm"
            style={{
              background: msg.startsWith('✅') ? 'rgba(16,185,129,0.08)' : 'rgba(111,92,208,0.08)',
              border: msg.startsWith('✅') ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(111,92,208,0.20)',
              color: msg.startsWith('✅') ? '#10b981' : '#6F5CD0',
            }}>
            {msg}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Start Date
              </label>
              <input type="date" className="app-input" value={form.startDate}
                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} required />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                End Date
              </label>
              <input type="date" className="app-input" value={form.endDate}
                onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted)' }}>
              Flow Intensity
            </label>
            <div className="flex gap-2 flex-wrap">
              {FLOWS.map(f => (
                <button type="button" key={f.value}
                  onClick={() => setForm(p => ({ ...p, flowIntensity: f.value }))}
                  className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 hover:-translate-y-0.5 flex items-center gap-1.5"
                  style={{
                    background: form.flowIntensity === f.value ? f.color : 'var(--bg-input)',
                    color: form.flowIntensity === f.value ? '#fff' : 'var(--text-muted)',
                    border: `1.5px solid ${form.flowIntensity === f.value ? f.color : 'var(--border-soft)'}`,
                    boxShadow: form.flowIntensity === f.value ? `0 4px 12px ${f.color}40` : 'none',
                  }}>
                  <Droplets size={12} />
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
              Notes (optional)
            </label>
            <textarea className="app-input h-24 resize-none" placeholder="How are you feeling this cycle?"
              value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
          </div>

          <div className="flex justify-end">
            <button type="submit" disabled={loading} className="btn-primary">
              {loading ? 'Saving…' : '🌸 Log Cycle'}
            </button>
          </div>
        </form>
      </div>

      {/* Stats row */}
      {cycles.length > 0 && (() => {
        const withLength = cycles.filter(c => c.cycleLength);
        const avgLen = withLength.length > 0
          ? Math.round(withLength.reduce((a, c) => a + c.cycleLength, 0) / withLength.length)
          : null;
        const last = cycles[0];
        const daysSince = last?.startDate
          ? Math.floor((Date.now() - new Date(last.startDate)) / (1000 * 60 * 60 * 24))
          : null;
        return (
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Cycles Logged', value: cycles.length },
              { label: 'Avg Length', value: avgLen ? `${avgLen} days` : 'N/A' },
              { label: 'Days Since Last', value: daysSince !== null ? `${daysSince}d ago` : 'N/A' },
            ].map(s => (
              <div key={s.label} className="panel text-center py-4">
                <p className="text-2xl font-black" style={{ color: 'var(--accent)', fontFamily: 'Poppins,sans-serif' }}>{s.value}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider mt-1" style={{ color: 'var(--text-muted)' }}>{s.label}</p>
              </div>
            ))}
          </div>
        );
      })()}

      {/* History */}
      <div>
        <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
          Cycle History
        </h3>
        {cycles.length === 0 ? (
          <div className="panel text-center py-10">
            <div className="text-4xl mb-3">🌸</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No cycles logged yet. Start tracking above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {cycles.map((c, i) => (
              <div key={c._id || i} className="panel hover:-translate-y-0.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shrink-0"
                    style={{ background: 'linear-gradient(135deg,#A596F0,#6F5CD0)', boxShadow: '0 4px 12px rgba(111,92,208,0.30)' }}>
                    <CalendarDays size={16} strokeWidth={2} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {new Date(c.startDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      {c.endDate && (
                        <span className="font-normal text-xs ml-2" style={{ color: 'var(--text-muted)' }}>
                          → {new Date(c.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {c.cycleLength ? `${c.cycleLength}-day period` : 'No end date set'}
                      {c.notes ? ` · ${c.notes.substring(0, 40)}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <FlowBadge cycle={c} />
                  <button onClick={() => handleDelete(c._id)}
                    className="w-7 h-7 rounded-full flex items-center justify-center transition-all hover:scale-110"
                    style={{ background: 'rgba(111,92,208,0.08)', border: '1px solid rgba(111,92,208,0.15)' }}
                    title="Delete">
                    <Trash2 size={12} style={{ color: '#6F5CD0' }} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Tracker;
