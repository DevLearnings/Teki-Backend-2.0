const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
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
  profile: {
    type: String,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('campaigns', campaignSchema);