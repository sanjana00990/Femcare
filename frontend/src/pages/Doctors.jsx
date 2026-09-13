import React, { useState, useEffect, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Star, ExternalLink, Search, Navigation, Filter, SlidersHorizontal, Phone, Clock, ChevronDown, MapPinOff, ArrowUpRight, X, Globe, Stethoscope, ChevronRight } from 'lucide-react';
import { haversineKm, SPEC_COLORS, FILTER_OPTIONS, SORT_OPTIONS, SUGGESTED_CITIES, userIcon, providerIcon, applyFilters, applySort, fetchProviders as fetchProvidersAPI } from './doctorsHelpers';
import { useTheme } from '../context/ThemeContext';
import api from '../api/axios';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const ChangeView = ({center,zoom}) => { const map=useMap(); useEffect(()=>{map.setView(center,zoom)},[center,map,zoom]); return null; };

/* ── Provider Card ───────────────────────────────────── */
const ProviderCard = ({ p, idx, onClick }) => {
  const specColor = SPEC_COLORS[p.specialty] || '#C94F68';
  return (
    <div
      onClick={() => onClick(p)}
      className="rounded-2xl transition-all duration-200 hover:-translate-y-0.5 overflow-hidden animate-fade cursor-pointer"
      style={{ background:'var(--bg-glass)', border:'1px solid var(--border-soft)', boxShadow:'var(--shadow-card)', animationDelay:`${idx*60}ms` }}>
      <div className="flex items-start gap-3 p-3.5">
        <div className="w-7 h-7 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold mt-0.5"
          style={{ background: idx===0?'linear-gradient(135deg,#C94F68,#E87A90)':'var(--accent-soft)', color: idx===0?'#fff':'var(--accent)', border: idx===0?'none':'1px solid var(--border-soft)' }}>
          {idx+1}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-sm leading-tight truncate" style={{color:'var(--text-primary)'}}>{p.name}</h4>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:specColor+'18', color:specColor, border:`1px solid ${specColor}30`}}>{p.specialty}</span>
            {p.isOpen===true && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(16,185,129,0.12)',color:'#10b981'}}>● Open</span>}
            {p.isOpen===false && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(239,68,68,0.12)',color:'#ef4444'}}>● Closed</span>}
          </div>
          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(201,79,104,0.10)',color:'#C94F68'}}>📍 {p.distance} km</span>
            <div className="flex items-center gap-1 text-[11px]" style={{color:'var(--text-muted)'}}>
              <Star size={10} style={{color:'#E87A90',fill:'#E87A90'}} />
              <span className="font-semibold" style={{color:'var(--text-primary)'}}>{p.rating}</span>
              <span>({p.reviews})</span>
            </div>
          </div>
        </div>
        <ChevronRight size={14} className="shrink-0 mt-1" style={{color:'var(--text-muted)'}}/>
      </div>
      {p.address && (
        <div className="px-3.5 pb-3 flex items-center gap-1">
          <MapPin size={9} style={{color:'var(--text-subtle)',flexShrink:0}}/>
          <p className="text-[10px] truncate" style={{color:'var(--text-subtle)'}}>{p.address}</p>
        </div>
      )}
    </div>
  );
};

/* ── Hospital Detail Modal ───────────────────────────── */
const ProviderDetailModal = ({ p, onClose }) => {
  if (!p) return null;
  const specColor = SPEC_COLORS[p.specialty] || '#C94F68';
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{background:'rgba(0,0,0,0.55)',backdropFilter:'blur(4px)'}}
      onClick={onClose}>
      <div
        className="relative w-full max-w-md rounded-3xl overflow-hidden animate-fade"
        style={{background:'var(--bg-panel)',border:'1px solid var(--border-soft)',boxShadow:'0 24px 64px rgba(0,0,0,0.35)',maxHeight:'90vh',overflowY:'auto'}}
        onClick={e => e.stopPropagation()}>

        {/* Header gradient band */}
        <div className="p-5 pb-4" style={{background:`linear-gradient(135deg, ${specColor}22, ${specColor}08)`}}>
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110"
            style={{background:'var(--bg-glass)',border:'1px solid var(--border-soft)'}}>
            <X size={15} style={{color:'var(--text-muted)'}}/>
          </button>

          <div className="flex items-start gap-3 pr-8">
            <div className="w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center"
              style={{background:`linear-gradient(135deg,${specColor},${specColor}88)`}}>
              <Stethoscope size={20} color="#fff"/>
            </div>
            <div>
              <h3 className="font-bold text-base leading-snug" style={{color:'var(--text-primary)',fontFamily:'Poppins,sans-serif'}}>{p.name}</h3>
              <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full mt-1 inline-block"
                style={{background:specColor+'22',color:specColor,border:`1px solid ${specColor}40`}}>
                {p.specialty}
              </span>
            </div>
          </div>

          {/* Quick stats */}
          <div className="flex gap-3 mt-4">
            <div className="flex-1 rounded-2xl p-3 text-center" style={{background:'var(--bg-glass)',border:'1px solid var(--border-soft)'}}>
              <div className="flex items-center justify-center gap-1">
                <Star size={12} style={{color:'#E87A90',fill:'#E87A90'}}/>
                <span className="font-bold text-sm" style={{color:'var(--text-primary)'}}>{p.rating}</span>
              </div>
              <p className="text-[9px] mt-0.5" style={{color:'var(--text-muted)'}}>{p.reviews} reviews</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 text-center" style={{background:'var(--bg-glass)',border:'1px solid var(--border-soft)'}}>
              <span className="font-bold text-sm" style={{color:'#C94F68'}}>{p.distance} km</span>
              <p className="text-[9px] mt-0.5" style={{color:'var(--text-muted)'}}>away</p>
            </div>
            <div className="flex-1 rounded-2xl p-3 text-center" style={{background:'var(--bg-glass)',border:'1px solid var(--border-soft)'}}>
              {p.isOpen === true && <><span className="font-bold text-sm" style={{color:'#10b981'}}>Open</span><p className="text-[9px] mt-0.5" style={{color:'var(--text-muted)'}}>now</p></>}
              {p.isOpen === false && <><span className="font-bold text-sm" style={{color:'#ef4444'}}>Closed</span><p className="text-[9px] mt-0.5" style={{color:'var(--text-muted)'}}>now</p></>}
              {p.isOpen === null && <><span className="font-bold text-sm" style={{color:'var(--text-muted)'}}>–</span><p className="text-[9px] mt-0.5" style={{color:'var(--text-muted)'}}>unknown</p></>}
            </div>
          </div>
        </div>

        {/* Details list */}
        <div className="p-5 space-y-3">
          {p.address && (
            <div className="flex items-start gap-3 p-3 rounded-2xl" style={{background:'var(--accent-soft)',border:'1px solid var(--border-soft)'}}>
              <MapPin size={15} style={{color:'var(--accent)',flexShrink:0,marginTop:1}}/>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Address</p>
                <p className="text-sm font-medium mt-0.5" style={{color:'var(--text-primary)'}}>{p.address}</p>
              </div>
            </div>
          )}
          {p.phone && (
            <div className="flex items-start gap-3 p-3 rounded-2xl" style={{background:'var(--accent-soft)',border:'1px solid var(--border-soft)'}}>
              <Phone size={15} style={{color:'var(--accent)',flexShrink:0,marginTop:1}}/>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Phone</p>
                <a href={`tel:${p.phone}`} className="text-sm font-medium mt-0.5 hover:underline" style={{color:'var(--text-primary)'}}>{p.phone}</a>
              </div>
            </div>
          )}
          {p.hours && (
            <div className="flex items-start gap-3 p-3 rounded-2xl" style={{background:'var(--accent-soft)',border:'1px solid var(--border-soft)'}}>
              <Clock size={15} style={{color:'var(--accent)',flexShrink:0,marginTop:1}}/>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Hours</p>
                <p className="text-sm font-medium mt-0.5" style={{color:'var(--text-primary)'}}>{p.hours}</p>
              </div>
            </div>
          )}
          {p.website && (
            <div className="flex items-start gap-3 p-3 rounded-2xl" style={{background:'var(--accent-soft)',border:'1px solid var(--border-soft)'}}>
              <Globe size={15} style={{color:'var(--accent)',flexShrink:0,marginTop:1}}/>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider" style={{color:'var(--text-muted)'}}>Website</p>
                <a href={p.website} target="_blank" rel="noopener noreferrer"
                  className="text-sm font-medium mt-0.5 hover:underline break-all" style={{color:'var(--accent)'}}>
                  {p.website.replace(/^https?:\/\//,'').slice(0,45)}{p.website.length > 52 ? '…' : ''}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="px-5 pb-6 flex gap-3">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-bold py-3 rounded-2xl transition-all hover:-translate-y-0.5"
            style={{background:'linear-gradient(135deg,#C94F68,#E87A90)',color:'#fff',boxShadow:'0 4px 14px rgba(201,79,104,0.35)'}}>
            📍 Get Directions
          </a>
          <a href={p.website} target="_blank" rel="noopener noreferrer"
            className="flex-1 text-center text-sm font-bold py-3 rounded-2xl transition-all hover:-translate-y-0.5"
            style={{background:'var(--accent-soft)',color:'var(--accent)',border:'1px solid var(--border-soft)'}}>
            Book / Info <ArrowUpRight size={13} className="inline ml-0.5"/>
          </a>
        </div>
      </div>
    </div>
  );
};

/* ── Main Component ──────────────────────────────────── */
const Doctors = () => {
  const { isDark } = useTheme();
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [providers, setProviders] = useState([]);
  const [location, setLocation] = useState({ lat:12.9716, lng:77.5946 });
  const [locationName, setLocationName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [sortBy, setSortBy] = useState('distance');
  const [filters, setFilters] = useState({ topRated:false, openNow:false, multispeciality:false });
  const [meta, setMeta] = useState(null);
  const [showSortMenu, setShowSortMenu] = useState(false);

  /* ── Ref to track if location came from a explicit manual search ── */
  const isManualSearchRef = useRef(false);

  /* ── Fetch providers via backend API (with client fallback) ── */
  const loadProviders = useCallback(async (lat, lng) => {
    console.log(`[Doctors] ── loadProviders called: lat=${lat} lng=${lng}`);
    setLoading(true);
    try {
      const res = await api.get(`/doctors?lat=${lat}&lng=${lng}`);
      console.log(`[Doctors] ── backend returned ${res.data?.providers?.length || 0} providers`);
      setProviders(res.data?.providers || []);
      setMeta(res.data?.meta || null);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 401) {
        console.log('[Doctors] ── backend returned 401 (not logged in), using frontend fallback');
      } else {
        console.warn('[Doctors] ── backend API failed, using frontend fallback:', err.message);
      }
      try {
        const data = await fetchProvidersAPI(lat, lng);
        console.log(`[Doctors] ── frontend fallback returned ${data.providers?.length || 0} providers`);
        setProviders(data.providers || []);
        setMeta(data.meta || null);
      } catch {
        console.warn('[Doctors] ── frontend fallback also failed, showing empty');
        setProviders([]);
      }
    } finally { setLoading(false); }
  }, []);

  /* ── Reverse geocode location name ─────────────────── */
  const reverseGeocode = async (lat, lng) => {
    if (isManualSearchRef.current) {
      console.log(`[Doctors] ── skipping reverseGeocode (manual search, name already set)`);
      isManualSearchRef.current = false;
      return;
    }
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
      const data = await res.json();
      const addr = data.address || {};
      const name = addr.city || addr.town || addr.municipality || addr.district || addr.state_district || addr.county || 'Your Location';
      console.log(`[Doctors] ── reverseGeocode resolved: "${name}"`);
      setLocationName(name);
    } catch { setLocationName('Your Location'); }
  };

  useEffect(() => {
    loadProviders(location.lat, location.lng);
    reverseGeocode(location.lat, location.lng);
  }, [location, loadProviders]);

  /* ── Auto-detect on mount ──────────────────────────── */
  useEffect(() => {
    if (navigator.geolocation) {
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({lat:pos.coords.latitude, lng:pos.coords.longitude}); setLocating(false); },
        () => { setLocating(false); }, { timeout:8000 }
      );
    }
  }, []);

  const handleLocate = () => {
    setLocating(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => { setLocation({lat:pos.coords.latitude,lng:pos.coords.longitude}); setLocating(false); setSearchQuery(''); },
        () => { setLocating(false); alert('Could not get your location.'); }
      );
    } else setLocating(false);
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    console.log(`[Search] ── user searched: "${searchQuery.trim()}"`);
    setLocating(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.trim())}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data = await res.json();
      if (data?.length > 0) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        console.log(`[Search] ── geocoded "${searchQuery.trim()}" → lat=${lat} lng=${lng} (display_name: ${data[0].display_name})`);
        const searchTitle = searchQuery.trim().split(',')[0];
        const cleanName = searchTitle.charAt(0).toUpperCase() + searchTitle.slice(1);
        isManualSearchRef.current = true;
        setLocationName(cleanName);
        setLocation({ lat, lng });
      } else {
        console.warn(`[Search] ── Nominatim returned 0 results for "${searchQuery.trim()}"`);
        alert('Location not found. Try another city name or pincode.');
      }
    } catch (err) {
      console.error('[Search] ── geocoding failed:', err);
      alert('Error searching location.');
    }
    finally { setLocating(false); }
  };

  /* Input change — only updates state; search fires on submit/Enter only */
  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const toggleFilter = (key) => setFilters(prev => ({...prev, [key]:!prev[key]}));
  const activeFilterCount = Object.values(filters).filter(Boolean).length;

  /* ── Apply client-side filters + sort — max 10, min 2 ── */
  const displayed = applySort(applyFilters(providers, filters), sortBy).slice(0, 10);

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      <ProviderDetailModal p={selectedProvider} onClose={() => setSelectedProvider(null)} />
      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2.5" style={{color:'var(--text-primary)',fontFamily:'Poppins,sans-serif'}}>
            <span className="w-8 h-8 rounded-xl flex items-center justify-center text-white" style={{background:'linear-gradient(135deg,#C94F68,#E87A90)'}}>
              <MapPin size={16} strokeWidth={2}/>
            </span>
            Nearby Healthcare Providers
          </h2>
          <p className="text-sm mt-1 ml-10" style={{color:'var(--text-muted)'}}>
            {locationName ? `Showing results near ${locationName}` : 'Detecting your location…'}
            {meta?.expanded && <span className="ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full" style={{background:'rgba(245,158,11,0.14)',color:'#f59e0b'}}>Search expanded to {(meta.radius/1000).toFixed(0)} km</span>}
            {meta?.fromCache && meta?.cacheAgeHours >= 2 && <span className="ml-2 text-[10px] font-medium px-2 py-0.5 rounded-full" style={{background:'rgba(148,163,184,0.12)',color:'var(--text-muted)',border:'1px solid var(--border-soft)'}} title={`Cached ${meta.cacheAgeHours}h ago`}>🗄 Cached results</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <form onSubmit={handleSearch} className="flex flex-1 md:flex-none">
            <input type="text" placeholder="City, area, or pincode…" value={searchQuery} onChange={handleSearchInputChange}
              className="app-input rounded-r-none border-r-0 w-full md:w-64"/>
            <button type="submit" disabled={locating} className="btn-primary rounded-l-none whitespace-nowrap flex items-center gap-1.5" style={{borderRadius:'0 20px 20px 0'}}>
              <Search size={14}/> Search
            </button>
          </form>
          <button onClick={handleLocate} disabled={locating}
            className="px-4 py-2.5 rounded-2xl text-sm font-medium flex items-center gap-2 whitespace-nowrap transition-all hover:-translate-y-0.5"
            style={{background:'var(--accent-soft)',border:'1px solid var(--border-soft)',color:'var(--accent)'}}>
            <Navigation size={14}/> {locating?'…':'GPS'}
          </button>
        </div>
      </div>

      {/* ── Filters + Sort Bar ─────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 mr-1">
          <Filter size={13} style={{color:'var(--text-muted)'}}/>
          <span className="text-[11px] font-semibold" style={{color:'var(--text-muted)'}}>Filters</span>
          {activeFilterCount > 0 && <span className="w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white" style={{background:'var(--accent)'}}>{activeFilterCount}</span>}
        </div>
        {FILTER_OPTIONS.map(f => (
          <button key={f.key} onClick={()=>toggleFilter(f.key)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full transition-all duration-200 hover:-translate-y-0.5"
            style={filters[f.key]
              ? {background:'linear-gradient(135deg,#C94F68,#E87A90)',color:'#fff',border:'1px solid transparent',boxShadow:'0 2px 8px rgba(201,79,104,0.30)'}
              : {background:'var(--accent-soft)',color:'var(--accent)',border:'1px solid var(--border-soft)'}}>
            {f.label}
          </button>
        ))}
        <div className="ml-auto relative">
          <button onClick={()=>setShowSortMenu(!showSortMenu)}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 transition-all"
            style={{background:'var(--accent-soft)',color:'var(--accent)',border:'1px solid var(--border-soft)'}}>
            <SlidersHorizontal size={11}/> Sort: {SORT_OPTIONS.find(s=>s.key===sortBy)?.label} <ChevronDown size={10}/>
          </button>
          {showSortMenu && (
            <div className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden z-50 min-w-[140px]"
              style={{background:'var(--bg-glass)',border:'1px solid var(--border-soft)',boxShadow:'var(--shadow-hover)',backdropFilter:'blur(16px)'}}>
              {SORT_OPTIONS.map(s => (
                <button key={s.key} onClick={()=>{setSortBy(s.key);setShowSortMenu(false);}}
                  className="block w-full text-left text-[11px] font-medium px-4 py-2.5 transition-colors"
                  style={{color:sortBy===s.key?'var(--accent)':'var(--text-primary)',background:sortBy===s.key?'var(--accent-soft)':'transparent'}}>
                  {s.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Map + Cards Grid ───────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{minHeight:'560px'}}>
        {/* Map */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden z-0" style={{border:'1px solid var(--border-soft)',minHeight:'400px'}}>
          <MapContainer center={[location.lat,location.lng]} zoom={13} scrollWheelZoom={true} style={{height:'100%',width:'100%',minHeight:'400px'}}>
            <ChangeView center={[location.lat,location.lng]} zoom={13}/>
            {/* OSM tiles — free, no API key, no watermark.
                Dark mode: a CSS invert+hue-rotate filter is injected via a <style> tag
                so only the tile pane is affected; markers/popups stay unchanged. */}
            {isDark && (
              <style>{`.leaflet-tile-pane { filter: invert(100%) hue-rotate(180deg) brightness(0.70) contrast(0.90); }`}</style>
            )}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />
            <Marker position={[location.lat,location.lng]} icon={userIcon}>
              <Popup>Your Location</Popup>
            </Marker>
            {displayed.map(p => (
              <Marker key={p.id} position={[p.lat,p.lng]} icon={providerIcon(SPEC_COLORS[p.specialty]||'#E87A90')}>
                <Popup>
                  <div style={{fontWeight:700,color:'#8B2D40'}}>{p.name}</div>
                  <div style={{fontSize:11,color:SPEC_COLORS[p.specialty]||'#C94F68',marginTop:2}}>{p.specialty}</div>
                  <div style={{fontSize:10,color:'#888',marginTop:4}}>⭐ {p.rating} · {p.distance} km</div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        {/* Results Panel */}
        <div className="panel flex flex-col" style={{height:'600px',minHeight:'400px'}}>
          {/* Sticky header */}
          <div className="flex items-center justify-between pb-3 shrink-0" style={{borderBottom:'1px solid var(--border-soft)'}}>
            <h3 className="text-sm font-bold" style={{color:'var(--text-primary)',fontFamily:'Poppins,sans-serif'}}>Healthcare Providers</h3>
            <span className="chip">{displayed.length} found</span>
          </div>

          {/* Scrollable list */}
          <div className="flex-1 overflow-y-auto mt-3 space-y-3 pr-1" style={{scrollbarWidth:'thin'}}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{borderColor:'#C94F68',borderTopColor:'transparent'}}/>
              <p className="text-xs" style={{color:'var(--text-muted)'}}>Searching nearby healthcare providers…</p>
            </div>
          )}

          {!loading && displayed.map((p,idx) => <ProviderCard key={p.id} p={p} idx={idx} onClick={setSelectedProvider}/>)}

          {/* Empty state with suggestions */}
          {!loading && displayed.length === 0 && (
            <div className="flex flex-col items-center justify-center py-8 gap-4 flex-1">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{background:'var(--accent-soft)'}}>
                <MapPinOff size={24} style={{color:'var(--accent)'}}/>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold" style={{color:'var(--text-primary)'}}>No providers match your filters</p>
                <p className="text-xs mt-1" style={{color:'var(--text-subtle)'}}>Try adjusting filters or search a different area</p>
              </div>
              {activeFilterCount > 0 && (
                <button onClick={()=>setFilters({topRated:false,openNow:false,multispeciality:false})}
                  className="text-[11px] font-semibold px-4 py-2 rounded-full transition-all hover:-translate-y-0.5"
                  style={{background:'var(--accent-soft)',color:'var(--accent)',border:'1px solid var(--border-soft)'}}>
                  Clear all filters
                </button>
              )}
              <div className="w-full mt-2">
                <p className="text-[10px] font-bold uppercase tracking-wider mb-2 text-center" style={{color:'var(--text-subtle)'}}>Try these cities</p>
                <div className="flex flex-wrap gap-1.5 justify-center">
                  {SUGGESTED_CITIES.map(city => (
                    <button key={city} onClick={()=>{setSearchQuery(city);}} className="text-[10px] font-semibold px-2.5 py-1 rounded-full transition-all hover:-translate-y-0.5"
                      style={{background:'var(--accent-soft)',color:'var(--accent)',border:'1px solid var(--border-soft)'}}>
                      {city}
                    </button>
                  ))}
                </div>
              </div>
              <div className="w-full mt-2 p-3 rounded-xl" style={{background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.20)'}}>
                <p className="text-[11px] font-bold flex items-center gap-1.5" style={{color:'#10b981'}}>
                  📞 Online Consultation Available
                </p>
                <p className="text-[10px] mt-1" style={{color:'var(--text-muted)'}}>Connect with gynecologists and specialists online from anywhere</p>
                <a href="https://www.practo.com/online-consultation" target="_blank" rel="noopener noreferrer"
                  className="inline-block mt-2 text-[10px] font-bold px-3 py-1.5 rounded-full text-white"
                  style={{background:'linear-gradient(135deg,#10b981,#059669)'}}>
                  Consult Online →
                </a>
              </div>
            </div>
          )}
          </div>{/* end scrollable list */}
        </div>
      </div>

      {/* ── Specialty Legend ────────────────────────────── */}
      {!loading && displayed.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          <span className="text-[10px] font-bold uppercase tracking-wider" style={{color:'var(--text-subtle)'}}>Specialties:</span>
          {Object.entries(SPEC_COLORS).map(([spec,color]) => (
            <div key={spec} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full" style={{background:color}}/>
              <span className="text-[10px] font-medium" style={{color:'var(--text-muted)'}}>{spec}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Doctors;
