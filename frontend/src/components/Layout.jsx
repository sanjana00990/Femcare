import React, { useContext, useState, useRef, useEffect, useCallback } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, CalendarDays, Activity, NotebookPen,
  LineChart, Apple, Dumbbell, FileText, MapPin,
  Bell, Settings, LogOut, BookOpen, Sparkles, Search,
  Sun, Moon, Heart, Menu, X, User as UserIcon, Shield, CircleHelp,
  ChevronRight
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

/* ── Searchable pages ─────────────────────────────────────────────── */
const PAGES = [
  { label: 'Dashboard',        path: '/',         icon: LayoutDashboard, keywords: 'home overview cycle summary' },
  { label: 'Period Tracker',   path: '/tracker',  icon: CalendarDays,    keywords: 'period log date calendar flow' },
  { label: 'Symptom Checker',  path: '/symptoms', icon: Activity,        keywords: 'symptoms pain cramp mood bloat ai' },
  { label: 'Symptom Journal',  path: '/journal',  icon: NotebookPen,     keywords: 'journal log notes write entry' },
  { label: 'Cycle Insights',   path: '/insights', icon: LineChart,       keywords: 'insights analytics chart graph trend' },
  { label: 'Learn',            path: '/learn',    icon: BookOpen,        keywords: 'learn articles education health tips' },
  { label: 'Diet & Nutrition', path: '/diet',     icon: Apple,           keywords: 'diet nutrition food eat avoid meal' },
  { label: 'Exercise',         path: '/exercise', icon: Dumbbell,        keywords: 'exercise workout fitness yoga stretch' },
  { label: 'Reports',          path: '/report',   icon: FileText,        keywords: 'report health summary download pdf' },
  { label: 'Nearby Doctors',   path: '/doctors',  icon: MapPin,          keywords: 'doctors hospital clinic nearby map' },
];

const Layout = ({ children }) => {
  const { user, logout } = useContext(AuthContext);
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Top bar dropdown states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [settingsToast, setSettingsToast] = useState('');

  /* ── Build dynamic notifications from user data ─────────────── */
  const buildNotifications = useCallback(() => {
    const cond = user?.condition || 'general';
    const items = [
      {
        title: 'Log your symptoms today',
        desc: 'Tracking daily keeps insights accurate.',
        time: '2 hours ago',
        icon: <Activity size={13} color="#6F5CD0" />,
      },
      {
        title: cond === 'pcos'
          ? 'PCOS Tip: Try spearmint tea today'
          : cond === 'menopause'
            ? 'Menopause Tip: Stay hydrated & cool'
            : 'Cycle Insight ready for you',
        desc: 'Personalised for your health profile.',
        time: '5 hours ago',
        icon: <Sparkles size={13} color="#f59e0b" />,
      },
      {
        title: 'Period prediction updated',
        desc: 'Check your tracker for the latest forecast.',
        time: '1 day ago',
        icon: <CalendarDays size={13} color="#8b5cf6" />,
      },
    ];
    return items.map((n, i) => ({ ...n, id: i, read: false }));
  }, [user]);

  const [notifications, setNotifications] = useState([]);
  useEffect(() => { setNotifications(buildNotifications()); }, [buildNotifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = (e) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOneRead = (id) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  /* ── Settings actions ───────────────────────────────────────── */
  const showToast = (msg) => {
    setSettingsToast(msg);
    setTimeout(() => setSettingsToast(''), 3000);
  };

  const headerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setShowSearch(false);
        setShowNotifications(false);
        setShowSettings(false);
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const closeAllDropdowns = () => {
    setShowSearch(false);
    setShowNotifications(false);
    setShowSettings(false);
    setShowProfile(false);
  };

  const toggleDropdown = (setter, current) => {
    closeAllDropdowns();
    setter(!current);
  };

  /* ── Search filter ───────────────────────────────────────────── */
  const q = searchQuery.toLowerCase().trim();
  const searchResults = q
    ? PAGES.filter(p =>
        p.label.toLowerCase().includes(q) ||
        p.keywords.includes(q)
      )
    : PAGES;

  const handleSearchNav = (path) => {
    closeAllDropdowns();
    setSearchQuery('');
    navigate(path);
  };

  const handleSearchKey = (e) => {
    if (e.key === 'Enter' && searchResults.length > 0) {
      handleSearchNav(searchResults[0].path);
    }
  };

  /* ── Styles ──────────────────────────────────────────── */
  const iconBtn = {
    background: isDark ? 'rgba(42,36,65,0.80)' : 'rgba(255,255,255,0.70)',
    border: `1px solid ${isDark ? 'rgba(165,150,240,0.22)' : 'rgba(111,92,208,0.14)'}`,
    color: isDark ? '#A9A2C4' : '#665E80',
  };

  const dropdownStyle = {
    background: isDark ? 'rgba(31,27,46,0.95)' : 'rgba(255,255,255,0.95)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: `1px solid ${isDark ? 'rgba(165,150,240,0.20)' : 'rgba(111,92,208,0.15)'}`,
    boxShadow: isDark ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(111,92,208,0.08)',
  };

  const NavItem = ({ to, icon: Icon, label }) => (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `group flex items-center gap-3 px-4 py-2.5 rounded-2xl text-sm font-medium transition-all duration-200 ${
          isActive
            ? 'nav-active'
            : isDark
              ? 'hover:bg-rose-primary/10'
              : 'hover:bg-rose-primary/8'
        }`
      }
      style={({ isActive }) => ({
        color: isActive
          ? 'var(--accent)'
          : isDark
            ? '#E3DDF7'
            : '#2B2540',
      })}
    >
      {({ isActive }) => (
        <>
          <span className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-rose-primary' : ''}`}
            style={isActive ? { color: 'var(--accent)' } : {}}>
            <Icon size={17} strokeWidth={isActive ? 2.2 : 1.8} />
          </span>
          <span className="leading-none tracking-tight">{label}</span>
          {isActive && (
            <span className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse-rose"
              style={{ background: 'var(--accent)' }} />
          )}
        </>
      )}
    </NavLink>
  );

  const SectionLabel = ({ children }) => (
    <div className="text-[9px] font-bold uppercase tracking-[0.16em] px-4 pt-5 pb-1.5"
      style={{ color: isDark ? '#A9A2C4' : '#2B2540' }}>
      {children}
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden relative">
      <div className="bg-blob-1" />
      <div className="bg-blob-2" />
      <div className="bg-blob-3" />

      {/* ── Sidebar ───────────────────────────────────────── */}
      <aside
        className={`relative z-20 shrink-0 flex flex-col transition-all duration-300 ${sidebarOpen ? 'w-[238px]' : 'w-0 overflow-hidden'}`}
        style={{
          background: isDark
            ? 'linear-gradient(180deg, rgba(21,18,31,0.98) 0%, rgba(15,12,25,0.98) 100%)'
            : 'linear-gradient(180deg, #EEEAFB 0%, #E3DDF7 60%, #EEEAFB 100%)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRight: `1px solid ${isDark ? 'rgba(165,150,240,0.16)' : 'rgba(111,92,208,0.14)'}`,
          boxShadow: isDark
            ? '4px 0 30px rgba(21,18,31,0.30)'
            : '4px 0 24px rgba(111,92,208,0.08)',
        }}
      >
        {/* Logo */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl flex items-center justify-center text-white shrink-0"
            style={{
              background: 'linear-gradient(135deg, #6F5CD0 0%, #A596F0 100%)',
              boxShadow: '0 4px 16px rgba(111,92,208,0.45)',
            }}>
            <Heart size={16} strokeWidth={2.5} fill="currentColor" />
          </div>
          <div>
            <h1 className="font-semibold text-sm leading-tight tracking-tight"
              style={{ color: isDark ? '#F0EDFA' : '#2B2540', fontFamily: 'Poppins, sans-serif' }}>
              FemCare 
            </h1>
            <p className="text-[10px] leading-tight mt-0.5" style={{ color: 'var(--text-subtle)' }}>
              Women's Wellness
            </p>
          </div>
        </div>

        {/* Soft divider */}
        <div className="soft-divider mx-4 mb-1" />

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 pb-4 flex flex-col">
          <SectionLabel>Overview</SectionLabel>
          <NavItem to="/"         icon={LayoutDashboard} label="Dashboard"       />

          <SectionLabel>Tracking</SectionLabel>
          <NavItem to="/tracker"  icon={CalendarDays}    label="Period Tracker"  />
          <NavItem to="/symptoms" icon={Activity}        label="Symptom Checker" />
          <NavItem to="/journal"  icon={NotebookPen}     label="Symptom Journal" />
          <NavItem to="/insights" icon={LineChart}       label="Cycle Insights"  />

          <SectionLabel>Wellness</SectionLabel>
          <NavItem to="/learn"    icon={BookOpen}        label="Learn"           />
          <NavItem to="/diet"     icon={Apple}           label="Diet & Nutrition" />
          <NavItem to="/exercise" icon={Dumbbell}        label="Exercise"        />

          <SectionLabel>Records</SectionLabel>
          <NavItem to="/report"   icon={FileText}        label="Reports"         />
          <NavItem to="/doctors"  icon={MapPin}          label="Nearby Doctors"  />
        </nav>

        {/* User footer */}
        <div className="soft-divider mx-4 mb-3" />
        <div className="mx-3 mb-4 p-3 rounded-2xl flex items-center justify-between gap-2"
          style={{ background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
              style={{
                background: 'linear-gradient(135deg, #A596F0 0%, #6F5CD0 100%)',
                boxShadow: '0 3px 12px rgba(111,92,208,0.40)',
              }}>
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold leading-tight truncate" style={{ color: 'var(--text-primary)' }}>
                {user?.name || 'User'}
              </p>
              <p className="text-[10px] leading-tight mt-0.5 truncate" style={{ color: 'var(--accent)' }}>
                {user?.condition === 'general' ? 'Wellness Plan' : (user?.condition?.toUpperCase() + ' Focus')}
              </p>
            </div>
          </div>
          <button onClick={handleLogout} title="Log out"
            className="transition-colors shrink-0 hover:opacity-70" style={{ color: 'var(--text-subtle)' }}>
            <LogOut size={15} strokeWidth={1.8} />
          </button>
        </div>
      </aside>

      {/* ── Main ─────────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">

        {/* Header */}
        <header ref={headerRef} className="shrink-0 h-[64px] flex items-center justify-between px-6 transition-all duration-300 relative"
          style={{
            background: 'var(--bg-header)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid var(--border-soft)',
          }}>

          <div className="flex items-center gap-3">
            {/* Hamburger */}
            <button onClick={() => setSidebarOpen(p => !p)}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:opacity-80 lg:hidden"
              style={iconBtn}>
              {sidebarOpen ? <X size={15} /> : <Menu size={15} />}
            </button>

            {/* Page brand */}
            <div className="flex items-center gap-2.5">
              <h2 className="font-semibold text-base tracking-tight"
                style={{ color: 'var(--text-primary)', fontFamily: 'Poppins, sans-serif' }}>
                FemCare Portal
              </h2>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full font-semibold hidden sm:inline-block"
                style={{ color: 'var(--accent)', background: 'var(--accent-soft)', border: '1px solid var(--border-soft)' }}>
                ✦ Premium
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 relative">
            {/* ── Settings toast ─────────────────────────── */}
            {settingsToast && (
              <div
                className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] px-5 py-3 rounded-2xl text-sm font-medium shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200"
                style={{ background: isDark ? '#1F1B2E' : '#fff', color: 'var(--text-primary)', border: '1px solid var(--border-soft)', boxShadow: '0 8px 32px rgba(111,92,208,0.08)' }}>
                {settingsToast}
              </div>
            )}

            {/* Search */}
            <div className="relative">
              <button onClick={() => toggleDropdown(setShowSearch, showSearch)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:opacity-80" style={{...iconBtn, ...(showSearch ? {background: 'var(--accent-soft)', color: 'var(--accent)'} : {})}}>
                <Search size={14} strokeWidth={2} />
              </button>
              {showSearch && (
                <div className="absolute top-12 right-0 w-72 rounded-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={dropdownStyle}>
                  <div className="relative flex items-center mb-2">
                    <Search size={13} className="absolute left-3" style={{ color: 'var(--text-subtle)' }} />
                    <input
                      type="text" autoFocus
                      placeholder="Search pages — e.g. &quot;Diet&quot;, &quot;Tracker&quot;&hellip;"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearchKey}
                      className="w-full bg-transparent outline-none pl-9 pr-3 py-2 text-sm rounded-xl"
                      style={{ border: '1px solid var(--border-soft)', color: 'var(--text-primary)' }}
                    />
                  </div>
                  <div className="flex flex-col gap-0.5 max-h-64 overflow-y-auto">
                    {searchResults.length > 0 ? searchResults.map(page => {
                      const Icon = page.icon;
                      return (
                        <button
                          key={page.path}
                          onClick={() => handleSearchNav(page.path)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl w-full text-left transition-all hover:bg-black/5"
                        >
                          <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0"
                            style={{ background: 'var(--accent-soft)' }}>
                            <Icon size={12} style={{ color: 'var(--accent)' }} />
                          </div>
                          <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{page.label}</span>
                          <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--text-subtle)' }} />
                        </button>
                      );
                    }) : (
                      <p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No pages found for &ldquo;{searchQuery}&rdquo;</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => toggleDropdown(setShowNotifications, showNotifications)} className="relative w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:opacity-80" style={{...iconBtn, ...(showNotifications ? {background: 'var(--accent-soft)', color: 'var(--accent)'} : {})}}>
                <Bell size={14} strokeWidth={2} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 text-[8px] font-bold text-white flex items-center justify-center rounded-full"
                    style={{ background: 'linear-gradient(135deg,#A596F0,#6F5CD0)' }}>
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifications && (
                <div className="absolute top-12 right-0 w-80 rounded-2xl py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={dropdownStyle}>
                  <div className="px-4 pb-2 mb-2 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border-soft)' }}>
                    <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Notifications</h3>
                    {unreadCount > 0 && (
                      <span onClick={markAllRead} className="text-[10px] cursor-pointer hover:underline font-medium" style={{ color: 'var(--accent)' }}>Mark all read</span>
                    )}
                  </div>
                  <div className="flex flex-col max-h-[300px] overflow-y-auto">
                    {notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markOneRead(n.id)}
                        className="flex items-start gap-3 px-4 py-2.5 hover:bg-black/5 cursor-pointer transition-colors"
                        style={{ opacity: n.read ? 0.55 : 1 }}
                      >
                        <div className="mt-0.5 p-1.5 rounded-full shrink-0" style={{ background: 'var(--accent-soft)' }}>{n.icon}</div>
                        <div className="min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-xs font-medium leading-snug" style={{ color: 'var(--text-primary)' }}>{n.title}</p>
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1" style={{ background: 'var(--accent)' }} />}
                          </div>
                          {n.desc && <p className="text-[10px] mt-0.5 leading-snug" style={{ color: 'var(--text-muted)' }}>{n.desc}</p>}
                          <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-subtle)' }}>{n.time}</p>
                        </div>
                      </div>
                    ))}
                    {notifications.length === 0 && (
                      <p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>You're all caught up! 🎉</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Settings */}
            <div className="relative">
              <button onClick={() => toggleDropdown(setShowSettings, showSettings)} className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:opacity-80" style={{...iconBtn, ...(showSettings ? {background: 'var(--accent-soft)', color: 'var(--accent)'} : {})}}>
                <Settings size={14} strokeWidth={2} />
              </button>
              {showSettings && (
                <div className="absolute top-12 right-0 w-56 rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={dropdownStyle}>
                  <div
                    onClick={() => { closeAllDropdowns(); navigate('/report'); }}
                    className="px-4 py-2.5 hover:bg-black/5 cursor-pointer flex items-center gap-3 transition-colors">
                    <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Account</span>
                    <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--text-subtle)' }} />
                  </div>
                  <div
                    onClick={() => { showToast('🔒 Your data is stored securely and never shared with third parties.'); closeAllDropdowns(); }}
                    className="px-4 py-2.5 hover:bg-black/5 cursor-pointer flex items-center gap-3 transition-colors">
                    <Shield size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Privacy</span>
                  </div>
                  <div
                    onClick={() => {
                      const current = localStorage.getItem('notifPref') !== 'off';
                      localStorage.setItem('notifPref', current ? 'off' : 'on');
                      showToast(current ? '🔕 Notifications turned off.' : '🔔 Notifications turned on.');
                      closeAllDropdowns();
                    }}
                    className="px-4 py-2.5 hover:bg-black/5 cursor-pointer flex items-center gap-3 transition-colors">
                    <Bell size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Preferences</span>
                  </div>
                  <div className="mx-4 my-1 soft-divider" />
                  <a
                    href="mailto:support@femcare.ai"
                    onClick={closeAllDropdowns}
                    className="px-4 py-2.5 hover:bg-black/5 flex items-center gap-3 transition-colors">
                    <CircleHelp size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>Help & Support</span>
                  </a>
                </div>
              )}
            </div>

            {/* Dark / Light toggle */}
            <button onClick={() => { closeAllDropdowns(); toggleTheme(); }} title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, #383055 0%, #4A426B 100%)'
                  : 'linear-gradient(135deg, #EEEAFB 0%, #E3DDF7 100%)',
                border: `1px solid ${isDark ? 'rgba(165,150,240,0.40)' : 'rgba(111,92,208,0.28)'}`,
                color: isDark ? '#A596F0' : '#6F5CD0',
                boxShadow: isDark ? '0 0 14px rgba(111,92,208,0.30)' : '0 0 10px rgba(111,92,208,0.18)',
              }}>
              {isDark ? <Sun size={14} strokeWidth={2.2} /> : <Moon size={14} strokeWidth={2} />}
            </button>

            {/* Avatar */}
            <div className="relative">
              <div onClick={() => toggleDropdown(setShowProfile, showProfile)} className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white cursor-pointer transition-transform hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #A596F0 0%, #6F5CD0 100%)',
                  boxShadow: '0 4px 16px rgba(111,92,208,0.42)',
                }}>
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              {showProfile && (
                <div className="absolute top-12 right-0 w-52 rounded-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200" style={dropdownStyle}>
                  <div className="px-4 py-3 border-b mb-1" style={{ borderColor: 'var(--border-soft)' }}>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white shrink-0"
                        style={{ background: 'linear-gradient(135deg, #A596F0 0%, #6F5CD0 100%)' }}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>{user?.name || 'User'}</p>
                        <p className="text-[10px] truncate" style={{ color: 'var(--text-subtle)' }}>{user?.email || 'user@example.com'}</p>
                      </div>
                    </div>
                    <div className="mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full inline-block"
                      style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
                      {user?.condition === 'general' ? 'Wellness Plan' : (user?.condition?.toUpperCase() + ' Focus')}
                    </div>
                  </div>
                  <div
                    onClick={() => { closeAllDropdowns(); navigate('/report'); }}
                    className="px-4 py-2.5 hover:bg-black/5 cursor-pointer flex items-center gap-3 transition-colors">
                    <UserIcon size={14} style={{ color: 'var(--text-muted)' }} />
                    <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>My Profile</span>
                    <ChevronRight size={12} className="ml-auto" style={{ color: 'var(--text-subtle)' }} />
                  </div>
                  <div onClick={handleLogout} className="px-4 py-2.5 hover:bg-black/5 cursor-pointer flex items-center gap-3 transition-colors">
                    <LogOut size={14} style={{ color: '#ef4444' }} />
                    <span className="text-sm font-medium" style={{ color: '#ef4444' }}>Log Out</span>
                  </div>
                </div>
              )}
            </div>
            
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scroll-smooth" onClick={closeAllDropdowns}>
          {children}
        </div>
      </main>
    </div>
  );
};

export default Layout;
