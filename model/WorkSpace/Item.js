const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String },
  type: { type: String, required: true }, // startup, supply, task, socialmedia
  userId: { type: mongoose.Schema.Types.ObjectId, required: true }
});

module.exports = mongoose.model("Item", itemSchema);
