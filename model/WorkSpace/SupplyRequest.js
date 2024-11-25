const mongoose = require('mongoose');

const supplyRequestSchema = new mongoose.Schema({
  startupId: { type: mongoose.Schema.Types.ObjectId, ref: 'Startup', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  type: { type: String, enum: ['digital', 'physical', 'influencer'], required: true },
  received: { type: Boolean, default: false },
  // Add other supply request fields as needed
});

module.exports = mongoose.model('SupplyRequest', supplyRequestSchema);