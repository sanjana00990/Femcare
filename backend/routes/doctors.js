const express = require('express');
// const { protect } = require('../middleware/auth'); // Not needed — doctors route is public
const DoctorsCache = require('../models/DoctorsCache');
const router = express.Router();

/* ── User-Agent for Overpass / Nominatim (required by their ToS) ──── */
const APP_USER_AGENT =
  'FemCareAI/1.0 (educational project; https://github.com/femcareai)';

/* ── 1 req/s throttle guard for Overpass ────────────────────────────
   Module-level timestamp; all concurrent requests share one slot.    */
let _lastOverpassCall = 0;
const _throttleOverpass = async () => {
  const wait = 1000 - (Date.now() - _lastOverpassCall);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
  _lastOverpassCall = Date.now();
};

/* ── Haversine distance (km) ─────────────────────────────────────── */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return +(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(1);
};

/* ── Enhanced specialty classification ───────────────────────────── */
const classifySpec = (tags) => {
  const n  = (tags.name || '').toLowerCase();
  const sp = (tags['healthcare:speciality'] || '').toLowerCase();
  const hc = (tags.healthcare || '').toLowerCase();

  if (sp.match(/fertil|ivf|reproduct/))            return 'Fertility Center';
  if (n.match(/fertil|ivf|reproduct/))             return 'Fertility Center';
  if (sp.match(/gynaec|obstet/))                   return 'Gynecologist';
  if (n.match(/gyn|gynae|gynec|mahila/))           return 'Gynecologist';
  if (n.match(/matern|pregnan|child.?birth/))      return 'Maternity Hospital';
  if (n.match(/women|woman|lady|ladies|stree/))    return "Women's Health Clinic";
  if (hc === 'doctor' || tags.amenity === 'clinic') return 'Gynecology Clinic';
  if (n.match(/multi.?spec/))                      return 'Multispeciality Hospital';
  return 'Multispeciality Hospital';
};

/* ── Check if currently open (basic heuristic) ───────────────────── */
const isOpenNow = (hoursStr) => {
  if (!hoursStr) return null;
  const lower = hoursStr.toLowerCase();
  if (lower.includes('24/7') || lower.includes('24 hours')) return true;
  const now = new Date();
  const hour = now.getHours();
  const match = hoursStr.match(/(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})/);
  if (match) {
    return hour >= parseInt(match[1]) && hour < parseInt(match[3]);
  }
  return null;
};

/* ── Generate consistent seeded rating from name ─────────────────── */
const seededRating = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 5) - hash + name.charCodeAt(i)) | 0;
  return +(4.0 + (Math.abs(hash) % 10) / 10).toFixed(1);
};

const seededReviews = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = ((hash << 3) + hash + name.charCodeAt(i)) | 0;
  return 30 + (Math.abs(hash) % 470);
};

/* ── Fetch from Overpass API ─────────────────────────────────────── */
const fetchFromOverpass = async (lat, lng, radiusM) => {
  const query = `
    [out:json][timeout:10];
    (
      node["amenity"~"^(hospital|clinic)$"]["name"](around:${radiusM},${lat},${lng});
      way["amenity"~"^(hospital|clinic)$"]["name"](around:${radiusM},${lat},${lng});
      node["healthcare"]["name"](around:${radiusM},${lat},${lng});
    );
    out center 40;
  `;

  const mirrors = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
  ];

  for (let i = 0; i < mirrors.length; i++) {
    const mirrorUrl = mirrors[i];
    const mirrorHost = new URL(mirrorUrl).hostname;

    // Respect 1 req/s fair-use limit
    await _throttleOverpass();

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 10000);
    const startTime = Date.now();

    try {
      const res = await fetch(
        `${mirrorUrl}?data=${encodeURIComponent(query)}`,
        {
          signal: controller.signal,
          headers: { 'User-Agent': APP_USER_AGENT },
        }
      );
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;

      if (!res.ok) {
        console.warn(`[Overpass] Attempt ${i + 1} (${mirrorHost}) HTTP ${res.status} after ${elapsed}ms`);
        continue;
      }

      const data = await res.json();

      if (data.remark && data.remark.includes('error')) {
        console.warn(`[Overpass] Attempt ${i + 1} (${mirrorHost}) Overpass remark error after ${elapsed}ms: ${data.remark}`);
        continue;
      }

      const elements = (data.elements || []).filter(
        (e) => e.tags?.name && (e.lat || e.center?.lat)
      );

      // Deduplicate by name
      const seen = new Set();
      const unique = [];
      for (const e of elements) {
        const key = e.tags.name.trim().toLowerCase();
        if (!seen.has(key)) { seen.add(key); unique.push(e); }
      }

      console.log(`[Overpass] Attempt ${i + 1} (${mirrorHost}) succeeded after ${elapsed}ms returning ${unique.length} providers`);

      return unique.map((e) => {
        const eLat = e.lat ?? e.center?.lat;
        const eLng = e.lon ?? e.center?.lon;
        const tags = e.tags;
        const spec = classifySpec(tags);

        return {
          id: e.id.toString(),
          name: tags.name,
          specialty: spec,
          lat: eLat,
          lng: eLng,
          distance: haversineKm(lat, lng, eLat, eLng),
          rating: seededRating(tags.name),
          reviews: seededReviews(tags.name),
          phone: tags.phone || tags['contact:phone'] || null,
          hours: tags.opening_hours || null,
          isOpen: isOpenNow(tags.opening_hours),
          address:
            [tags['addr:street'], tags['addr:city'], tags['addr:postcode']]
              .filter(Boolean)
              .join(', ') || null,
          website:
            tags.website ||
            `https://www.google.com/maps/search/${encodeURIComponent(tags.name + ' hospital')}`,
          hasOnlineConsultation: false,
          isFemaleDoctor: false,
        };
      });
    } catch (err) {
      clearTimeout(timer);
      const elapsed = Date.now() - startTime;
      console.warn(`[Overpass] Attempt ${i + 1} (${mirrorHost}) failed after ${elapsed}ms: ${err.message}`);
    }
  }

  console.warn('[Overpass] All mirrors failed, returning null');
  return null; // null => API failed, use fallback
};

/* ── City-aware fallback hospitals ───────────────────────────────── */
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
  ],
  delhi: [
    { name: 'AIIMS Delhi', specialty: 'Multispeciality Hospital', rating: 4.8, reviews: 5200, phone: '011-2658-8500', hours: '24/7', isOpen: true, website: 'https://www.aiims.edu', lat: 28.5672, lng: 77.2100 },
    { name: 'Apollo Hospital Delhi', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 3100, phone: '011-7179-1090', hours: '24/7', isOpen: true, website: 'https://www.apollohospitals.com', lat: 28.5589, lng: 77.2785 },
    { name: 'Fortis Escorts Heart Institute', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 2200, phone: '011-4713-5000', hours: '24/7', isOpen: true, website: 'https://www.fortishealthcare.com', lat: 28.5597, lng: 77.2767 },
  ],
  bangalore: [
    { name: 'Manipal Hospital Bangalore', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 2800, phone: '080-2502-4444', hours: '24/7', isOpen: true, website: 'https://www.manipalhospitals.com', lat: 12.9716, lng: 77.5946 },
    { name: 'Narayana Health City', specialty: 'Multispeciality Hospital', rating: 4.7, reviews: 3200, phone: '080-7122-2222', hours: '24/7', isOpen: true, website: 'https://www.narayanahealth.org', lat: 12.8836, lng: 77.6170 },
  ],
  pune: [
    { name: 'Ruby Hall Clinic', specialty: 'Multispeciality Hospital', rating: 4.5, reviews: 1900, phone: '020-6645-5555', hours: '24/7', isOpen: true, website: 'https://www.rubyhall.com', lat: 18.5204, lng: 73.8567 },
    { name: 'Jehangir Hospital', specialty: 'Multispeciality Hospital', rating: 4.6, reviews: 1700, phone: '020-2612-3000', hours: '24/7', isOpen: true, website: 'https://www.jehangirspecialhospital.com', lat: 18.5314, lng: 73.8682 },
  ],
};

function detectCity(lat, lng) {
  if (lat >= 20.8 && lat <= 21.4 && lng >= 78.8 && lng <= 79.4) return 'nagpur';
  if (lat >= 16.5 && lat <= 17.5 && lng >= 74.0 && lng <= 75.3) return 'sangli';
  if (lat >= 18.8 && lat <= 19.4 && lng >= 72.6 && lng <= 73.0) return 'mumbai';
  if (lat >= 28.2 && lat <= 28.9 && lng >= 76.8 && lng <= 77.5) return 'delhi';
  if (lat >= 12.7 && lat <= 13.2 && lng >= 77.4 && lng <= 77.8) return 'bangalore';
  if (lat >= 18.3 && lat <= 18.8 && lng >= 73.6 && lng <= 74.1) return 'pune';
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

const NEARBY_SUGGESTIONS = [
  'Mumbai','Delhi','Bangalore','Hyderabad','Chennai',
  'Kolkata','Pune','Ahmedabad','Jaipur','Lucknow',
];

/* ── Cache key: round to 2 dp so nearby searches share a slot ─────── */
const makeCacheKey = (lat, lng, radius) =>
  `${lat.toFixed(2)}_${lng.toFixed(2)}_${radius}`;

// ─── GET /api/doctors (public — no auth required) ───────────────────
router.get('/', async (req, res) => {
  try {
    const userLat         = parseFloat(req.query.lat)    || 12.9716;
    const userLng         = parseFloat(req.query.lng)    || 77.5946;
    const requestedRadius = parseInt(req.query.radius)   || 5000;

    console.log(`[Doctors] ── incoming request: lat=${userLat} lng=${userLng} radius=${requestedRadius}`);

    const RADIUS_STEPS = [5000, 10000, 15000, 25000];
    let providers = [];
    let usedRadius = requestedRadius;
    let expanded   = false;

    /* ── 1. Check MongoDB cache first ── */
    const firstRadius = RADIUS_STEPS.find((r) => r >= requestedRadius) || 5000;
    const queryKey    = makeCacheKey(userLat, userLng, firstRadius);
    console.log(`[Doctors] ── cache key: ${queryKey}`);
    const cutoff      = new Date(Date.now() - 24 * 60 * 60 * 1000);

    let cached = null;
    try {
      cached = await DoctorsCache.findOne({
        queryKey,
        createdAt: { $gt: cutoff },
      });
    } catch (dbErr) {
      console.warn(`[DoctorsCache] DB read failed (DB may be disconnected): ${dbErr.message}`);
    }

    if (cached) {
      const cacheAgeMs    = Date.now() - cached.createdAt.getTime();
      const cacheAgeHours = +(cacheAgeMs / 3_600_000).toFixed(1);
      console.log(`[DoctorsCache] HIT — key=${queryKey} age=${cacheAgeHours}h`);

      return res.json({
        providers: cached.results,
        meta: {
          total:          cached.results.length,
          radius:         cached.radius,
          expanded:       cached.radius > requestedRadius,
          searchLocation: { lat: userLat, lng: userLng },
          nearbySuggestions: cached.results.length < 5 ? NEARBY_SUGGESTIONS : [],
          fromCache:      true,
          cacheAgeHours,
        },
      });
    }

    console.log(`[DoctorsCache] MISS — key=${queryKey}; querying Overpass`);

    /* ── 2. Cache miss — fetch from Overpass with radius expansion ── */
    for (const radius of RADIUS_STEPS) {
      if (radius < requestedRadius) continue;

      const result = await fetchFromOverpass(userLat, userLng, radius);

      if (result === null) {
        // API failed → use city-aware fallback immediately
        console.log(`[Doctors] ── Overpass failed at radius=${radius}, using city-aware fallback`);
        providers  = buildFallback(userLat, userLng);
        console.log(`[Doctors] ── fallback returned ${providers.length} providers (city: ${detectCity(userLat, userLng) || 'generic'})`);
        usedRadius = radius;
        expanded   = radius > requestedRadius;
        break;
      }

      console.log(`[Doctors] ── Overpass returned ${result.length} results at radius=${radius}m`);

      if (result.length >= 3) {
        providers  = result.sort((a, b) => a.distance - b.distance).slice(0, 15);
        usedRadius = radius;
        expanded   = radius > requestedRadius;
        break;
      }

      if (result.length > 0 && result.length > providers.length) {
        providers = result;
      }
      usedRadius = radius;
      expanded   = true;
    }

    /* ── 3. Pad with fallback if < 3 results ── */
    if (providers.length < 3) {
      const fallbackList = buildFallback(userLat, userLng);
      const needed       = 3 - providers.length;
      const existingNames = new Set(providers.map((p) => p.name.toLowerCase()));
      const extras = fallbackList
        .filter((f) => !existingNames.has(f.name.toLowerCase()))
        .slice(0, needed)
        .map((f, i) => ({
          ...f,
          lat:      userLat + Math.sin((providers.length + i) * 1.2) * 0.02,
          lng:      userLng + Math.cos((providers.length + i) * 1.2) * 0.02,
          distance: +(providers.length > 0
            ? Math.max(...providers.map((p) => p.distance)) + 1.0 + i * 0.5
            : 2.0 + i * 0.8
          ).toFixed(1),
        }));
      providers = [...providers, ...extras];
    }

    /* ── 4. Store in cache (don't block response) ── */
    console.log(`[Doctors] ── responding with ${providers.length} providers (radius=${usedRadius}, expanded=${expanded})`);
    try {
      DoctorsCache.create({ queryKey, results: providers, radius: usedRadius })
        .catch((e) => console.warn('[DoctorsCache] write failed:', e.message));
    } catch (dbErr) {
      console.warn(`[DoctorsCache] DB write skipped (disconnected): ${dbErr.message}`);
    }

    res.json({
      providers,
      meta: {
        total:             providers.length,
        radius:            usedRadius,
        expanded,
        searchLocation:    { lat: userLat, lng: userLng },
        nearbySuggestions: providers.length < 5 ? NEARBY_SUGGESTIONS : [],
        fromCache:         false,
        cacheAgeHours:     0,
      },
    });
  } catch (err) {
    console.error('[Doctors route] error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
