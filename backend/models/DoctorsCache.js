const mongoose = require('mongoose');

/**
 * MongoDB-backed cache for Overpass API results.
 * Documents are automatically expired after 24 hours via the TTL index.
 */
const doctorsCacheSchema = new mongoose.Schema({
  queryKey: { type: String, required: true, index: true },  // e.g. "12.97_77.59_5000"
  results:  { type: Array,  required: true },               // providers array
  radius:   { type: Number, required: true },
  createdAt:{ type: Date,   default: Date.now },
});

// TTL index — MongoDB auto-deletes documents 24h after createdAt
doctorsCacheSchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 });

module.exports = mongoose.model('DoctorsCache', doctorsCacheSchema);
