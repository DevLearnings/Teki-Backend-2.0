const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SocialMediaSchema = new Schema({
  startup: { type: Schema.Types.ObjectId, ref: 'Startup', required: true },
  platform: { type: String, required: true },
  handle: { type: String, required: true },
  followers: { type: Number }
});

module.exports = mongoose.model('SocialMedia', SocialMediaSchema);
