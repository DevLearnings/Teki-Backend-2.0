const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['requested', 'received'],
    default: 'requested'
  },
  type: {
    type: String,
    enum: ['digital', 'physical', 'influencer'],
    required: true
  },
  associatedCampaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Campaign'
  }
}, { timestamps: true });

module.exports = mongoose.model('Supply', supplySchema);
