const mongoose = require('mongoose');

const symptomSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'Cramps', 'Bloating', 'Fatigue', 'Headache', 'Nausea',
      'Mood Swings', 'Acne', 'Back Pain', 'Breast Tenderness',
      'Hot Flashes', 'Insomnia', 'Anxiety', 'Heavy Flow',
      'Spotting', 'Irregular Cycle', 'Hair Loss', 'Weight Gain', 'Other'
    ]
  },
  severity: { type: Number, required: true, min: 1, max: 10 },
  date: { type: Date, default: Date.now },
  notes: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Symptom', symptomSchema);
