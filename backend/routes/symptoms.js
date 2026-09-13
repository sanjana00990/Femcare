const express = require('express');
const Symptom = require('../models/Symptom');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/symptoms
router.get('/', protect, async (req, res) => {
  try {
    const { limit = 50, days } = req.query;
    let query = { userId: req.user._id };
    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days));
      query.date = { $gte: since };
    }
    const symptoms = await Symptom.find(query).sort({ date: -1 }).limit(parseInt(limit));

    // Frequency analysis
    const freqMap = {};
    symptoms.forEach(s => {
      freqMap[s.type] = (freqMap[s.type] || 0) + 1;
    });
    const frequency = Object.entries(freqMap)
      .map(([label, count]) => ({ label, value: Math.round((count / symptoms.length) * 100) }))
      .sort((a, b) => b.value - a.value);

    res.json({ symptoms, frequency });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/symptoms
router.post('/', protect, async (req, res) => {
  try {
    const { type, severity, date, notes } = req.body;
    if (!type || !severity) return res.status(400).json({ message: 'Type and severity are required' });

    const symptom = await Symptom.create({
      userId: req.user._id, type, severity, date: date || new Date(), notes
    });
    res.status(201).json(symptom);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/symptoms/analyze  — get suggestions based on symptom input
router.post('/analyze', protect, async (req, res) => {
  try {
    const { symptoms } = req.body; // array of symptom names
    const suggestionMap = {
      'Cramps':    { foods: ['Ginger tea', 'Dark chocolate', 'Turmeric milk', 'Salmon'], exercises: ['Light yoga', "Child's pose", 'Walking'], tips: ['Apply heat pad', 'Stay hydrated', 'Avoid caffeine'] },
      'Bloating':  { foods: ['Fennel seeds', 'Cucumber water', 'Peppermint tea', 'Banana'], exercises: ['Deep breathing', 'Gentle stretching', 'Seated twist'], tips: ['Eat smaller meals', 'Avoid carbonated drinks', 'Chew slowly'] },
      'Fatigue':   { foods: ['Iron-rich spinach', 'Almonds', 'Eggs', 'Oats'], exercises: ['5-min meditation', 'Short walk', 'Yin yoga'], tips: ['Sleep 7-8 hours', 'Limit screen time at night', 'B12 supplement'] },
      'Headache':  { foods: ['Magnesium-rich nuts', 'Water', 'Ginger', 'Avocado'], exercises: ['Neck stretches', 'Scalp massage', 'Rest'], tips: ['Avoid bright screens', 'Caffeine in moderation', 'Cold compress'] },
      'Mood Swings': { foods: ['Dark leafy greens', 'Walnuts', 'Complex carbs'], exercises: ['Aerobic exercise', 'Dance', 'Swimming'], tips: ['Journaling', 'Limit sugar', 'Mindfulness practice'] },
      'Acne':      { foods: ['Zinc-rich foods', 'Green tea', 'Omega-3 fish', 'Pumpkin seeds'], exercises: ['Cardio 30min', 'Yoga'], tips: ['Reduce dairy', 'Manage stress', 'Stay hydrated'] },
      'Hot Flashes': { foods: ['Flaxseeds', 'Soy products', 'Cool water', 'Leafy greens'], exercises: ['Swimming', 'Light walk', 'Cooling yoga'], tips: ['Wear breathable fabrics', 'Avoid spicy food', 'Stay in cool spaces'] },
      'Insomnia':  { foods: ['Chamomile tea', 'Tryptophan-rich turkey', 'Magnesium foods', 'Kiwi'], exercises: ['Gentle yoga', 'Evening walk'], tips: ['Sleep hygiene routine', 'No screens 1hr before bed', 'Consistent wake time'] },
      'default':   { foods: ['Leafy greens', 'Whole grains', 'Berries', 'Hydrate well'], exercises: ['Light yoga', 'Brisk walking', 'Stretching'], tips: ['Rest adequately', 'Track consistently', 'Stay hydrated'] }
    };

    const key = symptoms && symptoms.find(s => suggestionMap[s]) || 'default';
    res.json({ suggestions: suggestionMap[key], analyzedSymptoms: symptoms });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/symptoms/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Symptom.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Symptom deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
