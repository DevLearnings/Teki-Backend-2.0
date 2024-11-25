const mongoose = require('mongoose');

const workspaceSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  // Add other workspace fields as needed
});

module.exports = mongoose.model('Workspace', workspaceSchema);