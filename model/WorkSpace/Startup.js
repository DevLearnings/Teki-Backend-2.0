const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StartupSchema = new Schema({
  workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
  pitcher: { type: Schema.Types.ObjectId, ref: 'Pitcher', required: true },
  name: { type: String, required: true },
  description: { type: String },
  supplies: [{ type: Schema.Types.ObjectId, ref: 'Supply' }],
  tasks: [{ type: Schema.Types.ObjectId, ref: 'Task' }],
  socialMedia: [{ type: Schema.Types.ObjectId, ref: 'SocialMedia' }]
});

module.exports = mongoose.model('Startup', StartupSchema);
