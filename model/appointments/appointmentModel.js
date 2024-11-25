// models/appointmentModel.js
const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  username: { type: String, required: true },
  investorName: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  query: { type: String, required: true },
});

module.exports = mongoose.model('Appointment', appointmentSchema);
