const express = require('express');
const Cycle = require('../models/Cycle');
const Symptom = require('../models/Symptom');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/insights  — Rule-based AI engine
router.get('/', protect, async (req, res) => {
  try {
    const [cycles, symptoms] = await Promise.all([
      Cycle.find({ userId: req.user._id }).sort({ startDate: 1 }),
      Symptom.find({ userId: req.user._id }).sort({ date: -1 }).limit(60)
    ]);

    const insights = [];
    const user = req.user;

    // --- Rule 1: Cycle Regularity ---
    if (cycles.length >= 3) {
      const lengths = [];
      for (let i = 1; i < cycles.length; i++) {
        const diff = Math.round((new Date(cycles[i].startDate) - new Date(cycles[i - 1].startDate)) / (1000 * 60 * 60 * 24));
        lengths.push(diff);
      }
      const avg = lengths.reduce((a, b) => a + b, 0) / lengths.length;
      const variance = Math.max(...lengths) - Math.min(...lengths);

      if (avg > 35) {
        insights.push({ icon: '⚠️', type: 'warning', text: '<strong>Irregular cycle detected.</strong> Your average cycle length is over 35 days, which may indicate a hormonal imbalance. Consider consulting a gynecologist.' });
      } else if (variance > 7) {
        insights.push({ icon: '📊', type: 'warning', text: `<strong>Cycle variability noted.</strong> Your cycles vary by ${variance} days. Consistent tracking will help identify patterns.` });
      } else {
        insights.push({ icon: '✅', type: 'info', text: '<strong>Regular cycle confirmed.</strong> Your cycle pattern appears consistent. Keep logging for better predictions.' });
      }
    }

    // --- Rule 2: PCOS Pattern ---
    const symptomTypes = symptoms.map(s => s.type);
    const hasAcne = symptomTypes.includes('Acne');
    const hasIrregular = symptomTypes.includes('Irregular Cycle');
    const hasHairLoss = symptomTypes.includes('Hair Loss');
    const hasWeightGain = symptomTypes.includes('Weight Gain');
    const pcosScore = [hasAcne, hasIrregular, hasHairLoss, hasWeightGain].filter(Boolean).length;

    if (pcosScore >= 2) {
      insights.push({ icon: '🩺', type: 'alert', text: '<strong>Possible PCOS/PCOD pattern.</strong> Multiple indicators detected (acne, hair loss, weight gain, irregular cycles). A hormonal panel test is strongly recommended.' });
    }

    // --- Rule 3: Menopause Indicators ---
    const hasHotFlashes = symptomTypes.includes('Hot Flashes');
    const hasInsomnia = symptomTypes.includes('Insomnia');
    const memoScore = [hasHotFlashes, hasInsomnia, hasWeightGain].filter(Boolean).length;
    if (memoScore >= 2 && user.age && user.age >= 40) {
      insights.push({ icon: '🌡️', type: 'warning', text: '<strong>Perimenopause indicators.</strong> Frequent hot flashes and insomnia logged. Consider a hormone level check with your doctor.' });
    }

    // --- Rule 4: Fatigue Focus ---
    const fatigueCount = symptoms.filter(s => s.type === 'Fatigue').length;
    if (fatigueCount >= 3) {
      insights.push({ icon: '🍃', type: 'tip', text: '<strong>Frequent fatigue detected.</strong> Ensure adequate iron and B12 intake. Consider a full blood count test to rule out anaemia.' });
    }

    // --- Rule 5: Current Phase Insight ---
    if (cycles.length > 0) {
      const lastStart = new Date(cycles[cycles.length - 1].startDate);
      const day = Math.floor((Date.now() - lastStart) / (1000 * 60 * 60 * 24)) + 1;
      let phaseMsg = '';
      if (day <= 5) phaseMsg = '<strong>Menstrual phase.</strong> Rest is essential. Iron-rich foods and gentle movement are recommended.';
      else if (day <= 13) phaseMsg = '<strong>Follicular phase.</strong> Energy is rising. Great time for cardio and strength training.';
      else if (day === 14) phaseMsg = '<strong>Ovulatory phase.</strong> Peak energy and mood. Optimal time for high-intensity workouts.';
      else phaseMsg = '<strong>Luteal phase.</strong> Progesterone is dominant. Expect energy dips. Prioritize rest and magnesium-rich foods.';
      insights.push({ icon: '🔵', type: 'info', text: phaseMsg });
    }

    // Fallback
    if (insights.length === 0) {
      insights.push({ icon: '📝', type: 'info', text: '<strong>Start tracking to get insights.</strong> Log your cycle and symptoms to receive personalized AI health insights.' });
    }

    res.json({ insights });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
