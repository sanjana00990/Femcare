import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Apple } from 'lucide-react';

const COLUMNS = [
  { key: 'eat',   label: '✅ Eat More',  accent: '#6F5CD0', bg: 'rgba(111,92,208,0.07)' },
  { key: 'limit', label: '⚠️ Limit',     accent: '#D4850A', bg: 'rgba(212,133,10,0.07)' },
  { key: 'avoid', label: '🚫 Avoid',     accent: '#B84040', bg: 'rgba(184,64,64,0.07)' },
];

const Diet = () => {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/diet')
      .then(res => {
        // Backend returns { condition, diet: { eat, limit, avoid } }
        const { condition, diet } = res.data;
        setData({ condition, ...diet });
      })
      .catch(() => {
        setError(true);
        setData({
          condition: 'general',
          eat:   [
            { emoji: '🥬', name: 'Leafy Greens',  why: 'Iron & folate support' },
            { emoji: '🐟', name: 'Fatty Fish',     why: 'Omega-3 reduces inflammation' },
            { emoji: '🫐', name: 'Berries',        why: 'Antioxidant & hormone support' },
            { emoji: '🥜', name: 'Nuts & Seeds',   why: 'Magnesium & healthy fats' },
            { emoji: '🫘', name: 'Legumes',        why: 'Plant protein & fibre' },
            { emoji: '🍠', name: 'Sweet Potato',   why: 'Complex carbs & B6' },
          ],
          limit: [
            { emoji: '🍞', name: 'Refined Carbs',  why: 'Spikes insulin levels' },
            { emoji: '🧂', name: 'High Sodium',    why: 'Worsens bloating' },
            { emoji: '☕', name: 'Caffeine',       why: 'Increases cortisol' },
            { emoji: '🍷', name: 'Alcohol',        why: 'Disrupts hormone balance' },
          ],
          avoid: [
            { emoji: '🍬', name: 'Refined Sugar',   why: 'Triggers inflammation' },
            { emoji: '🌭', name: 'Processed Meats', why: 'High in sodium & hormones' },
            { emoji: '🧋', name: 'Sugary Drinks',   why: 'Blood sugar spikes' },
            { emoji: '🍟', name: 'Trans Fats',      why: 'Hormonal disruption' },
          ],
        });
      });
  }, []);

  if (!data) return (
    <div className="flex justify-center py-12">
      <div className="w-9 h-9 border-[3px] border-t-transparent rounded-full animate-spin"
        style={{ borderColor: '#6F5CD0', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-xl font-bold flex items-center gap-2.5" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
          <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white"
            style={{ background: 'linear-gradient(135deg,#6F5CD0,#A596F0)' }}>
            <Apple size={16} strokeWidth={2} />
          </span>
          Diet & Nutrition
        </h2>
        <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>
          Personalised guidance for{' '}
          <span className="font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {data.condition}
          </span>
        </p>
        {error && <p className="text-xs mt-1 ml-10" style={{ color: '#D4850A' }}>⚠️ Using default plan — server offline.</p>}
      </div>

      {/* Columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {COLUMNS.map(col => {
          const items = data[col.key] || [];
          return (
            <div key={col.key} className="panel flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-3"
                style={{ borderBottom: '1px solid var(--border-soft)' }}>
                <h3 className="text-sm font-bold" style={{ color: col.accent, fontFamily: 'Poppins,sans-serif' }}>
                  {col.label}
                </h3>
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style={{ background: col.accent + '14', color: col.accent }}>
                  {items.length}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                {items.map((item, i) => {
                  // Handle both { name, emoji, why } objects and plain strings
                  const name  = typeof item === 'string' ? item : item.name;
                  const emoji = typeof item === 'string' ? null : item.emoji;
                  const why   = typeof item === 'string' ? null : item.why;
                  return (
                    <div key={i} className="flex items-start gap-2.5 p-2.5 rounded-xl transition-all duration-200 hover:translate-x-1"
                      style={{ background: col.bg, border: `1px solid ${col.accent}22` }}>
                      <span className="text-base shrink-0 mt-0.5">{emoji || '•'}</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold leading-tight" style={{ color: 'var(--text-primary)' }}>{name}</p>
                        {why && <p className="text-[10px] mt-0.5 leading-tight" style={{ color: 'var(--text-muted)' }}>{why}</p>}
                      </div>
                    </div>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-xs text-center py-4" style={{ color: 'var(--text-subtle)' }}>No data available.</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Diet;
