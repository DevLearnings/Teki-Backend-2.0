const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { isEmail } = require("validator");
const Schema = mongoose.Schema;
require("dotenv").config();

const userSchema = new Schema({
  username: { type: String, required: true, trim: true },
  email: {
    type: String,
    required: [true, "Please enter an email"],
    unique: [true, "Email already in use"],
    validate: [isEmail, "Please enter a valid email."],
  },
  password: {
    type: String,
    required: true,
    minLength: [6, "Minimum password length is 6 characters"],
  },
  phonenumber:{
    type: Number,
    required: true,

  },
  role: {
    type: String,
    required: true,
    enum: ["pitcher", "investor"],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  this.updated_at = Date.now();
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
