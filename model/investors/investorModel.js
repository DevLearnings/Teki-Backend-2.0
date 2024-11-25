// models/investor.js

const mongoose = require("mongoose");

const investorSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  name: String,
  phoneNumber: String,
  investmentInterests: [String],
  pastInvestments: [String],
  network: [String],
  pitchers: [String],
  otp: String,
  connectionRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitcher" }],
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "Pitcher" }],
});

const Investor = mongoose.model("Investor", investorSchema);

module.exports = Investor;
