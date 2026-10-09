import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Heart, Lock, Mail, User, Stethoscope } from 'lucide-react';

const Register = () => {
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [condition, setCondition] = useState('general');
  const [error, setError]       = useState('');
  const { register }            = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try { await register(name, email, password, condition); }
    catch (err) {
      const msg = err.response?.data?.message
        || err.message
        || 'Registration failed. Please try again.';
      setError(msg);
    }
  };

  const cardStyle = {
    background: isDark ? 'rgba(52,20,34,0.90)' : 'rgba(255,255,255,0.88)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    border: `1px solid ${isDark ? 'rgba(165,150,240,0.22)' : 'rgba(111,92,208,0.14)'}`,
    boxShadow: isDark
      ? '0 24px 60px rgba(21,18,31,0.50)'
      : '0 24px 60px rgba(111,92,208,0.08)',
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-10"
      style={{ background: isDark
        ? 'linear-gradient(145deg,#1A0D12 0%,#230F18 100%)'
        : 'linear-gradient(145deg,#FDF0F2 0%,#FFF5F7 50%,#F8EEF1 100%)' }}>

      <div className="bg-blob-1" />
      <div className="bg-blob-2" />

      {/* Theme toggle */}
      <button onClick={toggleTheme} title={isDark ? 'Light mode' : 'Dark mode'}
        className="fixed top-5 right-5 z-50 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
        style={{
          background: isDark ? 'linear-gradient(135deg,#383055,#4A426B)' : 'linear-gradient(135deg,#EEEAFB,#E3DDF7)',
          border: `1px solid ${isDark ? 'rgba(165,150,240,0.40)' : 'rgba(111,92,208,0.28)'}`,
          color: isDark ? '#A596F0' : '#6F5CD0',
        }}>
        {isDark ? <Sun size={15} strokeWidth={2.2} /> : <Moon size={15} strokeWidth={2} />}
      </button>

      <div className="relative z-10 w-full max-w-md mx-4">
        <div className="rounded-[28px] p-8" style={cardStyle}>

          <div className="text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mx-auto mb-5"
              style={{ background: 'linear-gradient(135deg,#6F5CD0 0%,#A596F0 100%)', boxShadow: '0 8px 24px rgba(111,92,208,0.40)' }}>
              <Heart size={24} strokeWidth={2.5} fill="white" />
            </div>
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'Poppins,sans-serif' }}>
              Join FemCare AI
            </h1>
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
              Your personalised wellness journey starts here
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-2xl text-sm"
              style={{ background: 'rgba(111,92,208,0.10)', border: '1px solid rgba(111,92,208,0.25)', color: '#6F5CD0' }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
              <input type="text" className="app-input pl-10" value={name}
                onChange={e => setName(e.target.value)} placeholder="Your full name" required />
            </div>
            <div className="relative">
              <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
              <input type="email" className="app-input pl-10" value={email}
                onChange={e => setEmail(e.target.value)} placeholder="name@example.com" required />
            </div>
            <div className="relative">
              <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-subtle)' }} />
              <input type="password" className="app-input pl-10" value={password}
                onChange={e => setPassword(e.target.value)} placeholder="Create a password" required />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--text-muted)' }}>
                Health Focus
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { value: 'general',   label: 'General',   emoji: '🌸' },
                  { value: 'pcos',      label: 'PCOS/PCOD', emoji: '🌿' },
                  { value: 'menopause', label: 'Menopause', emoji: '🌙' },
                ].map(opt => (
                  <button type="button" key={opt.value}
                    onClick={() => setCondition(opt.value)}
                    className="p-3 rounded-2xl text-xs font-semibold text-center transition-all duration-200 flex flex-col items-center gap-1.5"
                    style={{
                      background: condition === opt.value ? 'var(--accent-soft)' : 'var(--bg-input)',
                      border: `1.5px solid ${condition === opt.value ? 'var(--accent)' : 'var(--border-soft)'}`,
                      color: condition === opt.value ? 'var(--accent)' : 'var(--text-muted)',
                      boxShadow: condition === opt.value ? '0 0 12px rgba(111,92,208,0.20)' : 'none',
                    }}>
                    <span className="text-lg">{opt.emoji}</span>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-primary w-full mt-1 text-sm py-3">
              Create My Account
            </button>
          </form>

          <p className="text-sm text-center mt-5" style={{ color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <a href="/login" className="font-semibold hover:underline" style={{ color: 'var(--accent)' }}>Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
