const express = require('express');
const Cycle = require('../models/Cycle');
const Symptom = require('../models/Symptom');
const { protect } = require('../middleware/auth');
const router = express.Router();

// GET /api/report  — generates a full health report summary
router.get('/', protect, async (req, res) => {
  try {
    const [cycles, symptoms] = await Promise.all([
      Cycle.find({ userId: req.user._id }).sort({ startDate: 1 }),
      Symptom.find({ userId: req.user._id }).sort({ date: -1 }).limit(100)
    ]);

    const user = req.user;

    // Cycle summary
    let avgCycleLength = null, lastPeriodStart = null, lastPeriodEnd = null, cycleStatus = 'No data';
    if (cycles.length >= 2) {
      const lengths = [];
      for (let i = 1; i < cycles.length; i++) {
        lengths.push(Math.round((new Date(cycles[i].startDate) - new Date(cycles[i - 1].startDate)) / (1000 * 60 * 60 * 24)));
      }
      avgCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
      const maxVar = Math.max(...lengths) - Math.min(...lengths);
      cycleStatus = avgCycleLength > 35 ? 'Irregular (Long)' : maxVar > 7 ? 'Variable' : 'Regular';
    }
    if (cycles.length > 0) {
      const last = cycles[cycles.length - 1];
      lastPeriodStart = last.startDate;
      lastPeriodEnd = last.endDate;
    }

    // Symptom summary
    const freqMap = {};
    symptoms.forEach(s => { freqMap[s.type] = (freqMap[s.type] || 0) + 1; });
    const topSymptoms = Object.entries(freqMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const last30Symptoms = symptoms.filter(s => {
      const d = new Date(s.date);
      const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30);
      return d >= cutoff;
    });

    const report = {
      generatedAt: new Date(),
      patient: { name: user.name, email: user.email, condition: user.condition },
      cycleSummary: {
        totalCyclesLogged: cycles.length,
        avgCycleLength,
        lastPeriodStart,
        lastPeriodEnd,
        cycleStatus
      },
      symptomSummary: {
        totalLogged: symptoms.length,
        last30Days: last30Symptoms.length,
        topSymptoms
      },
      recentSymptoms: last30Symptoms.slice(0, 10),
      cycleHistory: cycles.slice(-6).map(c => ({
        startDate: c.startDate,
        endDate: c.endDate,
        flowIntensity: c.flowIntensity
      }))
    };

    res.json({ report });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
