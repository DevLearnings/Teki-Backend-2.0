const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const pitchSchema = new Schema({
  baseIdea: { type: String, required: true },
  ideaInDetail: { type: String, required: true },
  totalFund: { type: Number, required: true },
  initialFunding: { type: String, required: false },
  ideaOwner: {
    type: Schema.Types.ObjectId,
    required: true,
    trim: true,
    ref: "User",
  },

  created_at: { type: Date, default: Date.now },
});

const Pitch = mongoose.model("pitch", pitchSchema);

module.exports = Pitch;
