import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { NotebookPen, Trash2 } from 'lucide-react';

const LS_KEY = 'femcare_journal';
const loadJournal = () => { try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch { return []; } };
const saveJournal = (arr) => localStorage.setItem(LS_KEY, JSON.stringify(arr));

const Journal = () => {
  const [entries, setEntries] = useState([]);
  const [text, setText]       = useState('');
  const [msg, setMsg]         = useState('');

  const fetchEntries = async () => {
    let local = loadJournal();
    try {
      const { data } = await api.get('/symptoms');
      const serverEntries = (data.symptoms || []).filter(s => s.notes).map(s => ({
        _id: s._id,
        notes: s.notes,
        date: s.date || s.createdAt
      }));
      // Merge unique entries
      const merged = [...local];
      serverEntries.forEach(se => {
        if (!merged.some(m => m._id === se._id)) merged.push(se);
      });
      local = merged;
    } catch {
      console.log('Skipping backend fetch for journal, using local storage.');
    }
    setEntries(local.sort((a, b) => new Date(b.date) - new Date(a.date)));
  };

  useEffect(() => { fetchEntries(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    const newEntry = {
      _id: `jnl_${Date.now()}`,
      notes: text.trim(),
      date: new Date().toISOString()
    };

    const updated = [newEntry, ...loadJournal()].sort((a, b) => new Date(b.date) - new Date(a.date));
    saveJournal(updated);
    setEntries(updated);
    setText('');
    setMsg('✅ Entry saved successfully!');

    // Try background sync with backend if online
    try {
      await api.post('/symptoms', { type: 'Journal Entry', severity: 1, notes: text });
    } catch {
      console.log('Journal saved to local storage.');
    }

    setTimeout(() => setMsg(''), 3500);
  };

  const handleDelete = (id) => {
    const updated = loadJournal().filter(e => e._id !== id);
    saveJournal(updated);
    setEntries(updated);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
          style={{ background: 'linear-gradient(135deg,#C94F68,#E87A90)' }}>
          <NotebookPen size={16} strokeWidth={2} />
        </div>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
            Wellness Journal
          </h2>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your private space to reflect & log daily notes</p>
        </div>
      </div>

      {/* New entry */}
      <div className="panel">
        {msg && (
          <div className="mb-4 p-3 rounded-2xl text-sm"
            style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', color: '#10b981' }}>
            {msg}
          </div>
        )}
        <form onSubmit={handleSave} className="space-y-4">
          <textarea
            className="app-input h-36 resize-none"
            placeholder="How are you feeling today? Write freely — this is your safe space. 🌸"
            value={text}
            onChange={e => setText(e.target.value)}
            required
          />
          <div className="flex justify-end">
            <button type="submit" className="btn-primary">💕 Save Entry</button>
          </div>
        </form>
      </div>

      {/* Past entries */}
      <div>
        <h3 className="text-base font-bold mb-4" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
          Past Journal Entries ({entries.length})
        </h3>
        {entries.length === 0 ? (
          <div className="panel text-center py-10">
            <div className="text-4xl mb-3">📓</div>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No entries yet. Start writing above!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map(e => (
              <div key={e._id} className="panel animate-fade-up flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 rounded-full shrink-0"
                      style={{ background: 'var(--accent)' }} />
                    <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
                      {new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: 'var(--text-primary)' }}>{e.notes}</p>
                </div>
                <button onClick={() => handleDelete(e._id)}
                  className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-all hover:scale-110 mt-1"
                  style={{ background: 'rgba(201,79,104,0.08)', border: '1px solid rgba(201,79,104,0.15)' }}
                  title="Delete Entry">
                  <Trash2 size={12} style={{ color: '#C94F68' }} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;
