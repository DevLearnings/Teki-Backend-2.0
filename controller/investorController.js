const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const crypto = require("crypto");
const Joi = require("joi");
const Investor = require("../model/investors/investorModel");
const Pitcher = require("../model/pitchers/pitcherModel");
const Message = require("../model/messages/messageModel");

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Your Gmail email address
    pass: process.env.EMAIL_PASS, // Your Gmail password or app-specific password
  },
});

// Helper function to generate OTP
function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000); // Generate a 6-digit OTP
}

// Joi schema for validation
const investorSchema = Joi.object({
  username: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  name: Joi.string().required(),
  phoneNumber: Joi.string().required(),
  investmentInterests: Joi.array().items(Joi.string()).required(),
  pastInvestments: Joi.array().items(Joi.string()).required(),
  network: Joi.array().items(Joi.string()).required(),
  pitchers: Joi.array().items(Joi.string()).required(),
});

// POST /investors/register
const registerInvestor = async (req, res) => {
  try {
    const validatedData = await investorSchema.validateAsync(req.body);

    const {
      username,
      email,
      password,
      name,
      phoneNumber,
      investmentInterests,
      pastInvestments,
      network,
      pitchers,
    } = validatedData;

    // Check if email already exists
    let existingInvestor = await Investor.findOne({ email });
    if (existingInvestor) {
      return res.status(400).json({ error: "Email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate OTP
    const otp = generateOTP();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Email Verification",
      text: `Your OTP for email verification is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    // Create a new Investor instance
    const newInvestor = new Investor({
      username,
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      investmentInterests,
      pastInvestments,
      network,
      pitchers,
      otp, // Save OTP to the database
    });

    await newInvestor.save(); // Save the new investor

    // Respond with success status
    res.status(201).json({ message: "Investor registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Registration failed" });
  }
};

// POST /investors/login
const loginInvestor = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the investor by email
    const investor = await Investor.findOne({ email });

    if (!investor) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Compare hashed passwords
    const passwordMatch = await bcrypt.compare(password, investor.password);

    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    console.log(investor)
    // Successful login
    res.status(200).json(investor);
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Login failed" });
  }
};

// POST /investors/findme/:investorId
const findInvestorById = async (req, res) => {
  const { investorId } = req.params;

  try {
    if (!investorId) {
      return res.status(400).json({ error: "Investor ID required!" });
    }

    const investor = await Investor.findById(investorId);

    if (investor) {
      return res.status(200).json(investor);
    } else {
      return res.status(404).json({ error: "No results found!" });
    }
  } catch (err) {
    console.error("Find investor error:", err);
    res.status(500).json({ error: "Error finding investor" });
  }
};

// PUT /investors/:investorId
const updateInvestorById = async (req, res) => {
  const { investorId } = req.params;
  const {
    username,
    email,
    name,
    phoneNumber,
    investmentInterests,
    pastInvestments,
    network,
    pitchers,
  } = req.body;

  try {
    const updatedInvestor = await Investor.findByIdAndUpdate(
      investorId,
      {
        username,
        email,
        name,
        phoneNumber,
        investmentInterests,
        pastInvestments,
        network,
        pitchers,
      },
      { new: true }
    );

    if (!updatedInvestor) {
      return res.status(404).json({ error: "Investor not found" });
    }

    res.status(200).json(updatedInvestor);
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: "Failed to update investor" });
  }
};

// DELETE /investors/:investorId
const deleteInvestorById = async (req, res) => {
  const { investorId } = req.params;

  try {
    const deletedInvestor = await Investor.findByIdAndDelete(investorId);
    if (deletedInvestor) {
      return res.status(200).json({ message: "Investor deleted successfully" });
    } else {
      return res.status(404).json({ error: "Investor not found" });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ Error: err.message });
  }
};

// POST /investors/request-connect/:pitcherId
const requestConnectionWithPitcher = async (req, res) => {
  const { pitcherId } = req.params;
  const { investorId } = req.body;

  try {
    const investor = await Investor.findById(investorId);
    const pitcher = await Pitcher.findById(pitcherId);

    if (!investor || !pitcher) {
      return res.status(404).json({ error: "Investor or Pitcher not found" });
    }

    // Add pitcher to the connection requests
    investor.connectionRequests.push(pitcherId);
    await investor.save();

    // Send notification to pitcher (optional)
    // You can implement a notification system here

    res.status(200).json({ message: "Connection request sent" });
  } catch (err) {
    console.error("Request connection error:", err);
    res.status(500).json({ error: "Failed to send connection request" });
  }
};

// POST /investors/accept-connect/:investorId
const acceptConnectionWithPitcher = async (req, res) => {
  const { investorId } = req.params;
  const { pitcherId } = req.body;

  try {
    const investor = await Investor.findById(investorId);
    const pitcher = await Pitcher.findById(pitcherId);

    if (!investor || !pitcher) {
      return res.status(404).json({ error: "Investor or Pitcher not found" });
    }

    // Check if the pitcher has a connection request from the investor
    if (!investor.connectionRequests.includes(pitcherId)) {
      return res.status(400).json({ error: "No connection request from this pitcher" });
    }

    // Remove pitcher from connection requests and add to friends list
    investor.connectionRequests = investor.connectionRequests.filter(
      (id) => id.toString() !== pitcherId
    );
    investor.friends.push(pitcherId);
    await investor.save();

    res.status(200).json({ message: "Connection request accepted" });
  } catch (err) {
    console.error("Accept connection error:", err);
    res.status(500).json({ error: "Failed to accept connection request" });
  }
};

// POST /investors/send-message
const sendMessage = async (req, res) => {
  const { sender, receiver, messageText } = req.body;

  try {
    const newMessage = new Message({
      sender,
      receiver,
      messageText,
    });

    await newMessage.save();

    res.status(201).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

// GET /investors/messages/:userId
const getMessagesForUser = async (req, res) => {
  const { userId } = req.params;

  try {
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    });

    res.status(200).json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ error: "Failed to retrieve messages" });
  }
};

// POST /investors/forgot/:email
const forgotPassword = async (req, res) => {
  const { email } = req.params;

  try {
    const investor = await Investor.findOne({ email });

    if (!investor) {
      return res.status(404).json({ error: "Investor not found" });
    }

    // Generate OTP
    const otp = generateOTP();

    // Update OTP in the database
    investor.otp = otp;
    await investor.save();

    // Send OTP via email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "OTP for Password Reset",
      text: `Your OTP for password reset is ${otp}. It will expire in 10 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "OTP sent to email for password reset" });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ error: "Failed to send OTP for password reset" });
  }
};

module.exports = {
  registerInvestor,
  loginInvestor,
  findInvestorById,
  updateInvestorById,
  deleteInvestorById,
  requestConnectionWithPitcher,
  acceptConnectionWithPitcher,
  sendMessage,
  getMessagesForUser,
  forgotPassword,
};
