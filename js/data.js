/* ============================================================
   FemCare AI — App Data
   ============================================================ */
const APP_DATA = {
  user: { name: 'Sneha Agarwal', initials: 'SA', plan: 'Premium', cycleDay: 18, phase: 'Luteal', nextPeriod: 'May 10', cycleLength: 28 },

  cycleHistory: [
    { month: 'Nov', length: 27 }, { month: 'Dec', length: 29 },
    { month: 'Jan', length: 26 }, { month: 'Feb', length: 28 },
    { month: 'Mar', length: 30 }, { month: 'Apr', length: 28 }
  ],

  symptomFrequency: [
    { label: 'Cramps',    value: 85 },
    { label: 'Bloating',  value: 72 },
    { label: 'Fatigue',   value: 68 },
    { label: 'Headache',  value: 45 },
    { label: 'Mood Swings', value: 60 },
    { label: 'Acne',      value: 38 }
  ],

  recentSymptoms: [
    { name: 'Fatigue',     severity: 6, date: 'Apr 27' },
    { name: 'Bloating',    severity: 4, date: 'Apr 27' },
    { name: 'Mood Swings', severity: 7, date: 'Apr 26' },
    { name: 'Headache',    severity: 3, date: 'Apr 25' }
  ],

  aiInsights: [
    { icon: '🧠', type: 'info',    text: '<strong>Luteal phase detected.</strong> Progesterone is peaking — expect mood shifts and fatigue over the next 5–7 days.' },
    { icon: '⚡', type: 'warning', text: '<strong>Cycle irregularity noted.</strong> Your last 3 cycles varied by ±3 days. Consider logging stress levels.' },
    { icon: '🍃', type: 'tip',     text: '<strong>Magnesium boost recommended.</strong> Helps reduce cramping and improve sleep during luteal phase.' },
    { icon: '🩺', type: 'alert',   text: '<strong>PCOS risk indicator:</strong> Elevated androgen symptoms logged this cycle. Consult a specialist if persisting.' }
  ],

  symptoms: [
    'Cramps','Bloating','Fatigue','Headache','Nausea','Mood Swings','Acne',
    'Back Pain','Breast Tenderness','Hot Flashes','Insomnia','Anxiety',
    'Heavy Flow','Spotting','Irregular Cycle','Hair Loss','Weight Gain'
  ],

  suggestions: {
    Cramps:    { foods: ['Ginger tea','Dark chocolate','Turmeric milk','Salmon'], exercises: ['Light yoga','Child\'s pose','Walking'], tips: ['Apply heat pad','Stay hydrated','Avoid caffeine'] },
    Bloating:  { foods: ['Fennel seeds','Cucumber water','Peppermint tea','Banana'], exercises: ['Deep breathing','Gentle stretching','Seated twist'], tips: ['Eat smaller meals','Avoid carbonated drinks','Chew slowly'] },
    Fatigue:   { foods: ['Iron-rich spinach','Almonds','Eggs','Oats'], exercises: ['5-min meditation','Short walk','Yin yoga'], tips: ['Sleep 7-8 hours','Limit screen time at night','B12 supplement'] },
    Headache:  { foods: ['Magnesium-rich nuts','Water','Ginger','Avocado'], exercises: ['Neck stretches','Scalp massage','Rest'], tips: ['Avoid bright screens','Caffeine in moderation','Cold compress'] },
    'Mood Swings': { foods: ['Dark leafy greens','Walnuts','Complex carbs','Serotonin-boosting foods'], exercises: ['Aerobic exercise','Dance','Swimming'], tips: ['Journaling','Limit sugar','Mindfulness practice'] },
    default:   { foods: ['Leafy greens','Whole grains','Berries','Hydrate well'], exercises: ['Light yoga','Brisk walking','Stretching'], tips: ['Rest adequately','Track consistently','Stay hydrated'] }
  },

  diet: {
    eat: [
      { emoji: '🥬', name: 'Leafy Greens', why: 'Iron & folate support' },
      { emoji: '🐟', name: 'Fatty Fish',   why: 'Omega-3 reduces inflammation' },
      { emoji: '🫐', name: 'Berries',      why: 'Antioxidant & hormone support' },
      { emoji: '🥜', name: 'Nuts & Seeds', why: 'Magnesium & healthy fats' },
      { emoji: '🫘', name: 'Legumes',      why: 'Plant protein & fibre' },
      { emoji: '🍠', name: 'Sweet Potato', why: 'Complex carbs & B6' }
    ],
    limit: [
      { emoji: '🍞', name: 'Refined Carbs', why: 'Spikes insulin levels' },
      { emoji: '🧂', name: 'High Sodium',   why: 'Worsens bloating' },
      { emoji: '☕', name: 'Caffeine',       why: 'Increases cortisol' },
      { emoji: '🍷', name: 'Alcohol',        why: 'Disrupts hormone balance' }
    ],
    avoid: [
      { emoji: '🍬', name: 'Refined Sugar',     why: 'Triggers inflammation' },
      { emoji: '🌭', name: 'Processed Meats',   why: 'High in sodium & hormones' },
      { emoji: '🧋', name: 'Sugary Drinks',     why: 'Blood sugar spikes' },
      { emoji: '🍟', name: 'Trans Fats (fried)', why: 'Hormonal disruption' }
    ]
  },

  exercises: [
    { emoji: '🧘', name: 'Yoga Flow',       duration: '30 min', intensity: 'low',    desc: 'Supports hormone balance & reduces cramps' },
    { emoji: '🚶', name: 'Brisk Walking',   duration: '25 min', intensity: 'low',    desc: 'Boosts mood & circulation' },
    { emoji: '🏊', name: 'Swimming',        duration: '30 min', intensity: 'medium', desc: 'Low-impact full-body conditioning' },
    { emoji: '🚲', name: 'Cycling',         duration: '20 min', intensity: 'medium', desc: 'Cardiovascular endurance' },
    { emoji: '💪', name: 'Strength Training', duration: '35 min', intensity: 'high', desc: 'Improves metabolism & bone density' },
    { emoji: '🤸', name: 'Pilates',         duration: '25 min', intensity: 'medium', desc: 'Core strength & flexibility' }
  ],

  doctors: [
    { emoji: '👩‍⚕️', name: 'Dr. Priya Sharma',   spec: 'Gynaecologist & PCOS Specialist', dist: '1.2 km', rating: 4.9, reviews: 284, hospital: 'Apollo Clinic' },
    { emoji: '🩺',   name: 'Dr. Anita Verma',    spec: 'Reproductive Endocrinologist',    dist: '2.5 km', rating: 4.7, reviews: 196, hospital: 'Fortis Hospital' },
    { emoji: '👩‍⚕️', name: 'Dr. Kavya Nair',     spec: 'Menopause & Hormonal Health',     dist: '3.1 km', rating: 4.8, reviews: 152, hospital: 'Max Healthcare' },
    { emoji: '🩺',   name: 'Dr. Sunita Reddy',   spec: 'Gynaecologist & Obstetrician',    dist: '4.0 km', rating: 4.6, reviews: 319, hospital: 'Manipal Hospital' }
  ],

  journalEntries: [
    { date: 'Apr 27, 2026', text: 'Feeling unusually tired today. Had mild cramps in the evening. Drank chamomile tea which helped a bit.', tags: ['Fatigue','Cramps','Luteal'] },
    { date: 'Apr 25, 2026', text: 'Mood was all over the place this afternoon. Had a headache by 3pm. Took a short walk and felt better.', tags: ['Mood Swings','Headache'] },
    { date: 'Apr 22, 2026', text: 'Energy levels were great today. Completed 30-min yoga session. No significant symptoms.', tags: ['High Energy','Yoga','Follicular'] },
    { date: 'Apr 19, 2026', text: 'Period started. Flow is moderate. Cramps manageable with heat therapy.', tags: ['Period Start','Cramps','Heavy Flow'] }
  ],

  weeklyActivity: [
    { day: 'Mon', pct: 80, done: true  },
    { day: 'Tue', pct: 60, done: true  },
    { day: 'Wed', pct: 95, done: true  },
    { day: 'Thu', pct: 40, done: true  },
    { day: 'Fri', pct: 70, done: true  },
    { day: 'Sat', pct: 30, done: false },
    { day: 'Sun', pct: 0,  done: false }
  ]
};
