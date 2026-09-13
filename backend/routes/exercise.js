const express = require('express');
const { protect } = require('../middleware/auth');
const router = express.Router();

const exercisePlans = {
  general: [
    { emoji: '🧘', name: 'Yoga Flow', duration: '30 min', intensity: 'low', desc: 'Supports hormone balance & reduces cramps', phase: 'all' },
    { emoji: '🚶', name: 'Brisk Walking', duration: '25 min', intensity: 'low', desc: 'Boosts mood & circulation', phase: 'all' },
    { emoji: '🏊', name: 'Swimming', duration: '30 min', intensity: 'medium', desc: 'Low-impact full-body conditioning', phase: 'follicular' },
    { emoji: '🚲', name: 'Cycling', duration: '20 min', intensity: 'medium', desc: 'Cardiovascular endurance', phase: 'ovulatory' },
    { emoji: '💪', name: 'Strength Training', duration: '35 min', intensity: 'high', desc: 'Improves metabolism & bone density', phase: 'follicular' },
    { emoji: '🤸', name: 'Pilates', duration: '25 min', intensity: 'medium', desc: 'Core strength & flexibility', phase: 'luteal' }
  ],
  pcos: [
    { emoji: '🏃', name: 'HIIT Training', duration: '20 min', intensity: 'high', desc: 'Improves insulin sensitivity rapidly', phase: 'all' },
    { emoji: '🧘', name: 'Yin Yoga', duration: '30 min', intensity: 'low', desc: 'Reduces cortisol & supports adrenals', phase: 'all' },
    { emoji: '🚶', name: 'Power Walking', duration: '40 min', intensity: 'medium', desc: 'Low-impact cardio for weight management', phase: 'all' },
    { emoji: '💪', name: 'Resistance Training', duration: '35 min', intensity: 'high', desc: 'Builds lean muscle to manage androgens', phase: 'follicular' },
    { emoji: '🏊', name: 'Swimming', duration: '30 min', intensity: 'medium', desc: 'Full-body & stress reduction', phase: 'luteal' },
    { emoji: '🚲', name: 'Cycling', duration: '25 min', intensity: 'medium', desc: 'Cardiovascular health', phase: 'ovulatory' }
  ],
  menopause: [
    { emoji: '🧘', name: 'Restorative Yoga', duration: '35 min', intensity: 'low', desc: 'Reduces hot flashes & anxiety', phase: 'all' },
    { emoji: '💪', name: 'Weight Training', duration: '30 min', intensity: 'medium', desc: 'Critical for bone density', phase: 'all' },
    { emoji: '🚶', name: 'Walking', duration: '30 min', intensity: 'low', desc: 'Cardiovascular health & mood boost', phase: 'all' },
    { emoji: '🏊', name: 'Water Aerobics', duration: '40 min', intensity: 'medium', desc: 'Joint-friendly cardiovascular training', phase: 'all' },
    { emoji: '🤸', name: 'Pilates', duration: '25 min', intensity: 'low', desc: 'Core strength & balance', phase: 'all' },
    { emoji: '🧗', name: 'Tai Chi', duration: '20 min', intensity: 'low', desc: 'Balance, calm & stress reduction', phase: 'all' }
  ]
};

// GET /api/exercise
router.get('/', protect, async (req, res) => {
  try {
    const condition = req.user.condition || 'general';
    const { phase } = req.query;
    let exercises = exercisePlans[condition] || exercisePlans['general'];

    if (phase) {
      exercises = exercises.filter(e => e.phase === 'all' || e.phase === phase.toLowerCase());
    }

    res.json({ condition, exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
