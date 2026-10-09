import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Timer, Zap, Dumbbell } from 'lucide-react';

const fallbackExercises = [
  { emoji: '🧘', name: 'Yoga Flow',        duration: '30 min', intensity: 'low',    desc: 'Hormone balance & cramp relief' },
  { emoji: '🚶', name: 'Brisk Walking',    duration: '25 min', intensity: 'low',    desc: 'Boosts mood & circulation' },
  { emoji: '🏊', name: 'Swimming',         duration: '30 min', intensity: 'medium', desc: 'Low-impact full-body conditioning' },
  { emoji: '🚲', name: 'Cycling',          duration: '20 min', intensity: 'medium', desc: 'Cardiovascular endurance' },
  { emoji: '💪', name: 'Strength Training',duration: '35 min', intensity: 'high',   desc: 'Improves metabolism & bone density' },
  { emoji: '🤸', name: 'Pilates',          duration: '25 min', intensity: 'medium', desc: 'Core strength & flexibility' },
];

const intensityStyle = (intensity) => {
  if (intensity === 'high')   return { color: '#6F5CD0', bg: 'rgba(111,92,208,0.12)' };
  if (intensity === 'medium') return { color: '#D4850A', bg: 'rgba(212,133,10,0.10)' };
  return                             { color: '#4DB88A', bg: 'rgba(77,184,138,0.12)' };
};

const Exercise = () => {
  const [data, setData]   = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/exercise')
      .then(res => setData(res.data))
      .catch(() => { setError(true); setData({ condition: 'general', exercises: fallbackExercises }); });
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
            <Dumbbell size={16} strokeWidth={2} />
          </span>
          Exercise Planner
        </h2>
        <p className="text-sm mt-1 ml-10" style={{ color: 'var(--text-muted)' }}>
          Routines tailored for{' '}
          <span className="font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>
            {data.condition}
          </span>
        </p>
        {error && <p className="text-xs mt-1 ml-10" style={{ color: '#D4850A' }}>⚠️ Using default plan. Log in for personalised routines.</p>}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.exercises.map((ex, idx) => {
          const style = intensityStyle(ex.intensity);
          return (
            <div key={idx} className="panel group hover:-translate-y-1.5 relative overflow-hidden">
              {/* Background blob */}
              <div className="absolute -top-8 -right-8 w-28 h-28 rounded-full blur-2xl opacity-25 pointer-events-none transition-opacity group-hover:opacity-40"
                style={{ background: style.color }} />

              <div className="text-3xl mb-4">{ex.emoji}</div>
              <h3 className="text-base font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
                {ex.name}
              </h3>
              <p className="text-sm mb-5" style={{ color: 'var(--text-muted)' }}>{ex.desc}</p>

              <div className="flex items-center gap-3 pt-3" style={{ borderTop: '1px solid var(--border-soft)' }}>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold"
                  style={{ background: 'rgba(111,92,208,0.08)', color: 'var(--text-muted)' }}>
                  <Timer size={12} />
                  {ex.duration}
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize"
                  style={{ background: style.bg, color: style.color }}>
                  <Zap size={12} />
                  {ex.intensity}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Exercise;
