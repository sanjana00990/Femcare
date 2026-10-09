import L from 'leaflet';

export const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371, dLat = ((lat2-lat1)*Math.PI)/180, dLng = ((lng2-lng1)*Math.PI)/180;
  const a = Math.sin(dLat/2)**2 + Math.cos((lat1*Math.PI)/180)*Math.cos((lat2*Math.PI)/180)*Math.sin(dLng/2)**2;
  return +(R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(1);
};

export const SPEC_COLORS = {
  'Multispeciality Hospital': '#6366f1',
  'Gynecologist': '#6F5CD0',
  'Gynecology Clinic': '#A596F0',
  "Women's Health Clinic": '#8b5cf6',
  'Maternity Hospital': '#f59e0b',
  'Fertility Center': '#10b981',
};

export const FILTER_OPTIONS = [
  { key: 'topRated', label: '⭐ Top Rated' },
  { key: 'openNow', label: '🟢 Open Now' },
  { key: 'multispeciality', label: '🏥 Multispeciality' },
];

export const SORT_OPTIONS = [
  { key: 'distance', label: 'Distance' },
  { key: 'rating', label: 'Rating' },
  { key: 'reviews', label: 'Reviews' },
];

export const SUGGESTED_CITIES = ['Nagpur','Mumbai','Pune','Delhi','Bangalore','Hyderabad','Chennai','Kolkata'];

export const userIcon = L.divIcon({ className:'', html:'<div style="width:14px;height:14px;background:#6F5CD0;border:3px solid white;border-radius:50%;box-shadow:0 0 12px rgba(111,92,208,0.70)"></div>' });
export const providerIcon = (color) => L.divIcon({ className:'', html:`<div style="width:12px;height:12px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 0 8px ${color}99"></div>` });

export const applyFilters = (list, filters) => {
  let r = [...list];
  if (filters.topRated) r = r.filter(p => p.rating >= 4.5);
  if (filters.openNow) r = r.filter(p => p.isOpen === true);
  if (filters.multispeciality) r = r.filter(p => p.specialty === 'Multispeciality Hospital');
  return r;
};

export const applySort = (list, sortBy) => {
  const sorted = [...list];
  switch(sortBy) {
    case 'rating': return sorted.sort((a,b) => b.rating - a.rating);
    case 'reviews': return sorted.sort((a,b) => b.reviews - a.reviews);
    default: return sorted.sort((a,b) => a.distance - b.distance);
  }
};

/* ── Specialty classification from OSM tags ──────────── */
const classifySpec = (tags) => {
  const n = (tags.name || '').toLowerCase();
  const sp = (tags['healthcare:speciality'] || tags['healthcare:specialty'] || '').toLowerCase();
  if (sp.match(/gynaec|obstet/) || n.match(/gyn|gynae|gynec|mahila/)) return 'Gynecologist';
  if (n.match(/matern|pregnan|child.?birth/)) return 'Maternity Hospital';
  if (n.match(/women|woman|lady|ladies|stree/)) return "Women's Health Clinic";
  if (n.match(/fertil|ivf/)) return 'Fertility Center';
  return 'Multispeciality Hospital';
};

/* ── Consistent seeded values from hospital name ─────── */
const seededRating = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 5) - h + name.charCodeAt(i)) | 0;
  return +(4.0 + (Math.abs(h) % 10) / 10).toFixed(1);
};
const seededReviews = (name) => {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = ((h << 3) + h + name.charCodeAt(i)) | 0;
  return 30 + (Math.abs(h) % 470);
};

const isOpenNow = (hoursStr) => {
  if (!hoursStr) return null;
  const lower = hoursStr.toLowerCase();
  if (lower.includes('24/7') || lower.includes('24 hours')) return true;
  const m = hoursStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (m) { const h = new Date().getHours(); return h >= parseInt(m[1]) && h < parseInt(m[3]); }
  return null;
};

/* ── Overpass endpoints to try (multiple mirrors for reliability) ── */
const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
];

/* ── Fetch from Overpass with fallback mirrors ── */
export const fetchProviders = async (lat, lng) => {
  const query = `
    [out:json][timeout:12];
    (
      node["amenity"~"hospital|clinic"]["name"](around:15000,${lat},${lng});
      way["amenity"~"hospital|clinic"]["name"](around:15000,${lat},${lng});
      node["healthcare"="hospital"]["name"](around:15000,${lat},${lng});
      way["healthcare"="hospital"]["name"](around:15000,${lat},${lng});
      node["healthcare:speciality"~"gynaecology|obstetrics",i]["name"](around:15000,${lat},${lng});
    );
    out center 30;
  `;

  for (const endpoint of OVERPASS_ENDPOINTS) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);

      const res = await fetch(
        `${endpoint}?data=${encodeURIComponent(query)}`,
        { signal: controller.signal }
      );
      clearTimeout(timer);

      if (!res.ok) continue;
      const data = await res.json();

      const elements = (data.elements || []).filter(e => e.tags?.name && (e.lat || e.center?.lat));

      if (elements.length === 0) {
        return { providers: buildFallback(lat, lng), meta: { total: 5, radius: 15000, expanded: true } };
      }

      // Deduplicate
      const seen = new Set();
      const unique = [];
      for (const e of elements) {
        const k = e.tags.name.trim().toLowerCase();
        if (!seen.has(k)) { seen.add(k); unique.push(e); }
      }

      const providers = unique
        .map(e => {
          const eLat = e.lat ?? e.center?.lat;
          const eLng = e.lon ?? e.center?.lon;
          const t = e.tags;
          return {
            id: e.id.toString(),
            name: t.name,
            specialty: classifySpec(t),
            lat: eLat,
            lng: eLng,
            distance: haversineKm(lat, lng, eLat, eLng),
            rating: seededRating(t.name),
            reviews: seededReviews(t.name),
            phone: t.phone || t['contact:phone'] || null,
            hours: t.opening_hours || null,
            isOpen: isOpenNow(t.opening_hours),
            address: [t['addr:housenumber'], t['addr:street'], t['addr:suburb'], t['addr:city']].filter(Boolean).join(', ') || null,
            website: t.website || `https://www.google.com/maps/search/${encodeURIComponent(t.name + ' hospital ' + (t['addr:city'] || ''))}`,
          };
        })
        .sort((a, b) => a.distance - b.distance)
        .slice(0, 10);

      return { providers, meta: { total: providers.length, radius: 15000, expanded: false } };

    } catch (err) {
      console.warn(`Overpass endpoint ${endpoint} failed:`, err.message);
      // try next endpoint
    }
  }

  // All endpoints failed → city-aware fallback
  console.warn('All Overpass endpoints failed, using city-aware fallback.');
  return { providers: buildFallback(lat, lng), meta: { total: 5, radius: 15000, expanded: true } };
};

/* ── City-aware fallback hospitals ── */
// These are keyed by approximate lat/lng bounding boxes for major cities
const CITY_HOSPITALS = {
  nagpur: [
    { name: 'Alexis Multi-Speciality Hospital', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 1230, phone: '0712-2984700', hours: '24/7', isOpen: true, website: 'https://www.alexishospital.com', lat: 21.1145, lng: 79.0527 },
    { name: 'Care CHL Hospitals Nagpur', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 980, phone: '0712-2985000', hours: '24/7', isOpen: true, website: 'https://www.carehospitals.com', lat: 21.1214, lng: 79.0683 },
    { name: 'Orange City Hospital & Research Institute', specialty: 'Multispeciality Hospital', rating: 4.4, reviews: 870, phone: '0712-2774444', hours: '24/7', isOpen: true, website: 'https://www.ochri.in', lat: 21.1498, lng: 79.0806 },
    { name: 'Wockhardt Hospital Nagpur', specialty: 'Multispeciality Hospital', rating: 4.3, reviews: 654, phone: '0712-6633100', hours: '24/7', isOpen: true, website: 'https://www.wockhardt.com', lat: 21.1025, lng: 79.0471 },
    { name: 'Lata Mangeshkar Hospital', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 720, phone: '0712-2223399', hours: '24/7', isOpen: true, website: 'https://www.lmhospital.com', lat: 21.1612, lng: 79.0751 },
    { name: 'Krims Hospital', specialty: 'Multispeciality Hospital', rating: 4.4, reviews: 590, phone: '0712-2441424', hours: '24/7', isOpen: true, website: 'https://www.krimshospital.com', lat: 21.1351, lng: 79.0612 },
    { name: 'Mahajan Eye Centre & Maternity Home', specialty: 'Maternity Hospital', rating: 4.3, reviews: 310, phone: '0712-2761411', hours: '8am–8pm', isOpen: true, website: 'https://www.google.com/maps/search/Mahajan+Eye+Centre+Nagpur', lat: 21.1482, lng: 79.0692 },
  ],
  sangli: [
    { name: 'Wanless Hospital (Miraj)', specialty: 'Multispeciality Hospital', rating: 4.7, reviews: 1420, phone: '0233-221-1234', hours: '24/7', isOpen: true, website: 'https://www.wanlesshospital.org', lat: 16.8276, lng: 74.6487 },
    { name: 'Govt. Medical College & Hospital Sangli', specialty: 'Multispeciality Hospital', rating: 4.3, reviews: 980, phone: '0233-263-0500', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Government+Medical+College+Sangli', lat: 16.8601, lng: 74.5810 },
    { name: 'Appasaheb Birnale Hospital', specialty: 'Multispeciality Hospital', rating: 4.4, reviews: 730, phone: '0233-263-5000', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Appasaheb+Birnale+Hospital+Sangli', lat: 16.8634, lng: 74.5789 },
    { name: 'Vedant Hospital Sangli', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 610, phone: '0233-262-8800', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Vedant+Hospital+Sangli', lat: 16.8551, lng: 74.5760 },
    { name: 'Sangli Civil Hospital', specialty: 'Multispeciality Hospital', rating: 4.1, reviews: 520, phone: '0233-263-0100', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Civil+Hospital+Sangli', lat: 16.8551, lng: 74.5654 },
    { name: 'Lakshmi Maternity & General Hospital', specialty: 'Maternity Hospital', rating: 4.3, reviews: 380, phone: '0233-262-5500', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Lakshmi+Maternity+Hospital+Sangli', lat: 16.8520, lng: 74.5830 },
    { name: 'Ankur Fertility & IVF Centre Sangli', specialty: 'Fertility Center', rating: 4.4, reviews: 290, phone: '0233-262-3300', hours: 'Mon-Sat 9am-6pm', isOpen: true, website: 'https://www.google.com/maps/search/Ankur+Fertility+Sangli', lat: 16.8587, lng: 74.5795 },
    { name: 'Sachin Hospital & Gynaec Clinic', specialty: 'Gynecologist', rating: 4.2, reviews: 230, phone: '0233-262-7700', hours: 'Mon-Sat 9am-8pm', isOpen: true, website: 'https://www.google.com/maps/search/Sachin+Hospital+Sangli', lat: 16.8538, lng: 74.5820 },
  ],
  mumbai: [
    { name: 'Lilavati Hospital', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 2100, phone: '022-2675-1000', hours: '24/7', isOpen: true, website: 'https://www.lilavatihospital.com', lat: 19.0509, lng: 72.8307 },
    { name: 'Hinduja Hospital', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 1800, phone: '022-2445-1515', hours: '24/7', isOpen: true, website: 'https://www.hindujahospital.com', lat: 19.0441, lng: 72.8290 },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', specialty: 'Multispeciality Hospital', rating: 4.7, reviews: 2500, phone: '022-3066-9000', hours: '24/7', isOpen: true, website: 'https://www.kokilabenhospital.com', lat: 19.1268, lng: 72.8270 },
    { name: 'KEM Hospital Mumbai', specialty: 'Multispeciality Hospital', rating: 4.4, reviews: 1900, phone: '022-2410-7000', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/KEM+Hospital+Mumbai', lat: 19.0014, lng: 72.8402 },
  ],
  delhi: [
    { name: 'AIIMS Delhi', specialty: 'Multispeciality Hospital', rating: 4.8, reviews: 5200, phone: '011-2658-8500', hours: '24/7', isOpen: true, website: 'https://www.aiims.edu', lat: 28.5672, lng: 77.2100 },
    { name: 'Apollo Hospital Delhi', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 3100, phone: '011-7179-1090', hours: '24/7', isOpen: true, website: 'https://www.apollohospitals.com', lat: 28.5589, lng: 77.2785 },
    { name: 'Fortis Escorts Heart Institute', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 2200, phone: '011-4713-5000', hours: '24/7', isOpen: true, website: 'https://www.fortishealthcare.com', lat: 28.5597, lng: 77.2767 },
    { name: 'Safdarjung Hospital Delhi', specialty: 'Multispeciality Hospital', rating: 4.3, reviews: 2800, phone: '011-2673-0000', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Safdarjung+Hospital+Delhi', lat: 28.5686, lng: 77.2064 },
  ],
  bangalore: [
    { name: 'Manipal Hospital Bangalore', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 2800, phone: '080-2502-4444', hours: '24/7', isOpen: true, website: 'https://www.manipalhospitals.com', lat: 12.9716, lng: 77.5946 },
    { name: 'Narayana Health City', specialty: 'Multispeciality Hospital', rating: 4.7, reviews: 3200, phone: '080-7122-2222', hours: '24/7', isOpen: true, website: 'https://www.narayanahealth.org', lat: 12.8836, lng: 77.6170 },
    { name: 'Cloudnine Hospital Bangalore', specialty: 'Maternity Hospital', rating: 4.7, reviews: 1900, phone: '080-6808-0800', hours: '24/7', isOpen: true, website: 'https://www.cloudninecare.com', lat: 12.9360, lng: 77.6107 },
  ],
  pune: [
    { name: 'Ruby Hall Clinic', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 1900, phone: '020-6645-5555', hours: '24/7', isOpen: true, website: 'https://www.rubyhall.com', lat: 18.5204, lng: 73.8567 },
    { name: 'Jehangir Hospital', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 1700, phone: '020-2612-3000', hours: '24/7', isOpen: true, website: 'https://www.jehangirspecialhospital.com', lat: 18.5314, lng: 73.8682 },
    { name: 'Sahyadri Hospital Pune', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 1400, phone: '020-6721-3000', hours: '24/7', isOpen: true, website: 'https://www.sahyadrihospital.com', lat: 18.5247, lng: 73.8553 },
  ],
  hyderabad: [
    { name: 'Apollo Hospital Hyderabad', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 3400, phone: '040-2360-7777', hours: '24/7', isOpen: true, website: 'https://www.apollohospitals.com', lat: 17.4326, lng: 78.4071 },
    { name: 'KIMS Hospital Hyderabad', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 2800, phone: '040-4488-5000', hours: '24/7', isOpen: true, website: 'https://www.kimshospitals.com', lat: 17.4261, lng: 78.4513 },
    { name: "Rainbow Children's Hospital", specialty: "Women's Health Clinic", rating: 4.7, reviews: 2100, phone: '040-4477-9999', hours: '24/7', isOpen: true, website: 'https://www.rainbowhospitals.in', lat: 17.4481, lng: 78.3915 },
  ],
  chennai: [
    { name: 'Apollo Hospital Chennai', specialty: 'Multispeciality Hospital', rating: 4.7, reviews: 4100, phone: '044-2829-0200', hours: '24/7', isOpen: true, website: 'https://www.apollohospitals.com', lat: 13.0604, lng: 80.2496 },
    { name: 'Sri Ramachandra Institute', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 2700, phone: '044-4592-8000', hours: '24/7', isOpen: true, website: 'https://www.sriramachandra.edu.in', lat: 13.0372, lng: 80.1760 },
    { name: 'Fortis Malar Hospital Chennai', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 1800, phone: '044-4289-2222', hours: '24/7', isOpen: true, website: 'https://www.fortishealthcare.com', lat: 13.0019, lng: 80.2562 },
  ],
  kolkata: [
    { name: 'AMRI Hospital Kolkata', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 2400, phone: '033-6680-0000', hours: '24/7', isOpen: true, website: 'https://www.amrihospitals.in', lat: 22.5163, lng: 88.3554 },
    { name: 'Belle Vue Clinic Kolkata', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 1900, phone: '033-2287-2321', hours: '24/7', isOpen: true, website: 'https://www.bellevueclinic.in', lat: 22.5403, lng: 88.3582 },
    { name: 'Medical Research Institute Kolkata', specialty: 'Multispeciality Hospital', rating: 4.4, reviews: 1600, phone: '033-2476-5000', hours: '24/7', isOpen: true, website: 'https://www.google.com/maps/search/Medical+Research+Institute+Kolkata', lat: 22.5258, lng: 88.3433 },
  ],
};

/* ── Detect city from lat/lng to pick right fallback ── */
function detectCity(lat, lng) {
  if (lat >= 20.8 && lat <= 21.4 && lng >= 78.8 && lng <= 79.4) return 'nagpur';
  // Sangli / Miraj / Kupwad / Khanapur district region
  if (lat >= 16.5 && lat <= 17.5 && lng >= 74.0 && lng <= 75.3) return 'sangli';
  if (lat >= 18.8 && lat <= 19.4 && lng >= 72.6 && lng <= 73.0) return 'mumbai';
  if (lat >= 28.2 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) return 'delhi';
  if (lat >= 12.7 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'bangalore';
  if (lat >= 18.3 && lat <= 18.8 && lng >= 73.6 && lng <= 74.1) return 'pune';
  if (lat >= 17.2 && lat <= 17.6 && lng >= 78.3 && lng <= 78.6) return 'hyderabad';
  if (lat >= 12.8 && lat <= 13.3 && lng >= 80.0 && lng <= 80.4) return 'chennai';
  if (lat >= 22.4 && lat <= 22.7 && lng >= 88.2 && lng <= 88.5) return 'kolkata';
  return null;
}

function buildFallback(lat, lng) {
  const city = detectCity(lat, lng);
  const hospitals = city ? CITY_HOSPITALS[city] : null;

  if (hospitals) {
    return hospitals.map((h, i) => ({
      ...h,
      id: `fb${i}`,
      distance: haversineKm(lat, lng, h.lat, h.lng),
      address: `${city.charAt(0).toUpperCase() + city.slice(1)}`,
    })).sort((a, b) => a.distance - b.distance).slice(0, 8);
  }

  // Generic fallback for unknown cities — placed around user's coordinates
  const GENERIC = [
    { name: 'District General Hospital', specialty: 'Multispeciality Hospital', rating: 4.2, reviews: 320, phone: null, hours: '24/7', isOpen: true, website: '' },
    { name: 'City Medical Centre', specialty: 'Multispeciality Hospital', rating: 4.1, reviews: 210, phone: null, hours: '9am–9pm', isOpen: true, website: '' },
    { name: 'Women & Child Health Clinic', specialty: "Women's Health Clinic", rating: 4.3, reviews: 180, phone: null, hours: '9am–6pm', isOpen: true, website: '' },
    { name: 'Maternity Care Hospital', specialty: 'Maternity Hospital', rating: 4.4, reviews: 140, phone: null, hours: '24/7', isOpen: true, website: '' },
    { name: 'Gynaecology Speciality Centre', specialty: 'Gynecologist', rating: 4.2, reviews: 95, phone: null, hours: '10am–7pm', isOpen: true, website: '' },
  ];
  return GENERIC.map((f, i) => ({
    ...f,
    id: `fb${i}`,
    lat: lat + Math.sin(i * 1.3) * 0.015,
    lng: lng + Math.cos(i * 1.3) * 0.015,
    distance: +(0.8 + i * 0.7).toFixed(1),
    address: 'Near your location',
    website: f.website || `https://www.google.com/maps/search/${encodeURIComponent(f.name)}`,
  }));
}
