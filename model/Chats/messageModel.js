// models/message.js

const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, refPath: 'senderModel' },
  senderModel: { type: String, required: true, enum: ['Investor', 'Pitcher'] },
  receiverId: { type: mongoose.Schema.Types.ObjectId, refPath: 'receiverModel' },
  receiverModel: { type: String, required: true, enum: ['Investor', 'Pitcher'] },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
