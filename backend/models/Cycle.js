const mongoose = require('mongoose');

const cycleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  cycleLength: { type: Number }, // auto-calculated
  flowIntensity: { type: String, enum: ['light', 'medium', 'heavy'], default: 'medium' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Auto-calculate cycle length when both dates are present
cycleSchema.pre('save', function(next) {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(new Date(this.endDate) - new Date(this.startDate));
    this.cycleLength = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  next();
});

module.exports = mongoose.model('Cycle', cycleSchema);
