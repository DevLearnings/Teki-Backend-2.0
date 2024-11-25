const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  description: String,
  status: {
    type: String,
    enum: ["todo", "inProgress", "done"],
    default: "todo",
  },
  completionImage: {
    url: String,
    description: String,
  },
}, { timestamps: true });

module.exports = mongoose.model("Task", taskSchema);