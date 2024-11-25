// models/connectionRequest.js

const mongoose = require("mongoose");

const connectionRequestSchema = new mongoose.Schema({
  investorId: { type: mongoose.Schema.Types.ObjectId, ref: "Investor", required: true },
  pitcherId: { type: mongoose.Schema.Types.ObjectId, ref: "Pitcher", required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

const ConnectionRequest = mongoose.model("ConnectionRequest", connectionRequestSchema);

module.exports = ConnectionRequest;
