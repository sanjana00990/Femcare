const express = require('express');
const Cycle = require('../models/Cycle');
const { protect } = require('../middleware/auth');
const router = express.Router();

// Helper: predict next period from cycle history
function predictNextPeriod(cycles) {
  if (!cycles || cycles.length === 0) return null;
  const lengths = cycles
    .slice(-6)
    .filter(c => c.startDate && c.endDate)
    .map(c => {
      const next = cycles.find(nc => nc.startDate > c.startDate);
      if (next) return Math.round((new Date(next.startDate) - new Date(c.startDate)) / (1000 * 60 * 60 * 24));
      return null;
    })
    .filter(Boolean);

  const avgLength = lengths.length > 0
    ? Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length)
    : 28;

  const lastCycle = cycles[cycles.length - 1];
  const nextDate = new Date(lastCycle.startDate);
  nextDate.setDate(nextDate.getDate() + avgLength);
  return { nextPeriodDate: nextDate, avgCycleLength: avgLength };
}

// GET /api/cycle
router.get('/', protect, async (req, res) => {
  try {
    const cycles = await Cycle.find({ userId: req.user._id }).sort({ startDate: 1 });
    const prediction = predictNextPeriod(cycles);

    // Calculate current cycle day
    let cycleDay = null, phase = null;
    if (cycles.length > 0) {
      const lastStart = new Date(cycles[cycles.length - 1].startDate);
      cycleDay = Math.floor((Date.now() - lastStart) / (1000 * 60 * 60 * 24)) + 1;
      const avg = prediction?.avgCycleLength || 28;
      if (cycleDay <= 5) phase = 'Menstrual';
      else if (cycleDay <= 13) phase = 'Follicular';
      else if (cycleDay === 14) phase = 'Ovulatory';
      else phase = 'Luteal';
    }

    res.json({ cycles, prediction, cycleDay, phase });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/cycle
router.post('/', protect, async (req, res) => {
  try {
    const { startDate, endDate, flowIntensity, notes } = req.body;
    if (!startDate) return res.status(400).json({ message: 'Start date is required' });

    const cycle = await Cycle.create({
      userId: req.user._id, startDate, endDate, flowIntensity, notes
    });
    res.status(201).json(cycle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PATCH /api/cycle/:id  (update end date)
router.patch('/:id', protect, async (req, res) => {
  try {
    const cycle = await Cycle.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!cycle) return res.status(404).json({ message: 'Cycle not found' });
    res.json(cycle);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE /api/cycle/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Cycle.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    res.json({ message: 'Cycle deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
