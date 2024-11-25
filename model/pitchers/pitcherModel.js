const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const User = require("../common/userModel");

const pitcherSchema = new Schema({
  company_name: { type: String, required: true },
  pitch: { type: String, required: true },
  funding_needed: { type: Number, required: true },
  idfront: { type: String, required: false },
  idback: { type: String, required: false },
  utilbill: { type: String, required: false },
  created_at: { type: Date, default: Date.now },
});

const Pitcher = User.discriminator("pitchers", pitcherSchema);

module.exports = Pitcher;
