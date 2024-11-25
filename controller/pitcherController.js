const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");
const cloudinary = require("cloudinary").v2;
const Pitcher = require("../model/pitchers/pitcherModel"); // Replace with your Pitcher model

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to send email
const sendEmail = async (to, subject, text) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (err) {
    console.error("Email sending error:", err);
    throw new Error("Failed to send email");
  }
};

// Function to upload file to Cloudinary
const uploadToCloudinary = async (file) => {
  try {
    const result = await cloudinary.uploader.upload(file.path);
    return result.secure_url; // Return the secure URL of the uploaded file
  } catch (err) {
    console.error("Error uploading to Cloudinary:", err);
    throw new Error("Failed to upload file to Cloudinary");
  }
};

// Register a new pitcher
exports.registerPitcher = async (req, res) => {
  // Validate and sanitize inputs
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { username, email, password, phoneNumber, socials } = req.body;

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Upload files to Cloudinary
    const idCardFront = req.files["idCardFront"]
      ? await uploadToCloudinary(req.files["idCardFront"][0])
      : null;
    const idCardBack = req.files["idCardBack"]
      ? await uploadToCloudinary(req.files["idCardBack"][0])
      : null;
    const utilityBill = req.files["utilityBill"]
      ? await uploadToCloudinary(req.files["utilityBill"][0])
      : null;

    // Create new Pitcher instance
    const newPitcher = new Pitcher({
      username,
      email,
      password: hashedPassword,
      phoneNumber,
      idCardFront,
      idCardBack,
      utilityBill,
      socials,
    });

    // Save pitcher to database
    await newPitcher.save();

    // Send verification email
    await sendEmail(
      email,
      "Registration Successful",
      "Welcome to our platform!"
    );

    res.status(201).json({ message: "Pitcher registered successfully" });
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).json({ error: "Failed to register pitcher" });
  }
};

// Login a pitcher
exports.loginPitcher = async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if pitcher exists
    const pitcher = await Pitcher.findOne({ username });

    if (!pitcher) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Validate password
    const isMatch = await bcrypt.compare(password, pitcher.password);

    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const payload = {
      pitcher: {
        id: pitcher.id,
      },
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: "1h" }, // Token expires in 1 hour
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
          user: {
            id: pitcher.id,
            username: pitcher.username,
            email: pitcher.email,
            phoneNumber: pitcher.phoneNumber,
          },
        });
      }
    );
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};

// Send OTP to pitcher's email
exports.sendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    // Generate random OTP
    const otp = Math.floor(100000 + Math.random() * 900000);

    // Send OTP via email
    await sendEmail(
      email,
      "OTP Verification",
      `Your OTP for verification is: ${otp}`
    );

    res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (err) {
    console.error("OTP sending error:", err);
    res.status(500).json({ error: "Failed to send OTP" });
  }
};

// Update pitcher's profile
exports.editProfile = async (req, res) => {
  try {
    const { username, email, phoneNumber, socials } = req.body;

    const pitcherId = req.pitcher.id; // Assuming you have middleware to get pitcher's ID from JWT

    // Upload files to Cloudinary if updated
    let idCardFront = null;
    let idCardBack = null;
    let utilityBill = null;

    if (req.files["idCardFront"]) {
      idCardFront = await uploadToCloudinary(req.files["idCardFront"][0]);
    }
    if (req.files["idCardBack"]) {
      idCardBack = await uploadToCloudinary(req.files["idCardBack"][0]);
    }
    if (req.files["utilityBill"]) {
      utilityBill = await uploadToCloudinary(req.files["utilityBill"][0]);
    }

    // Find and update pitcher's profile
    const updatedPitcher = await Pitcher.findByIdAndUpdate(
      pitcherId,
      {
        username,
        email,
        phoneNumber,
        socials,
        idCardFront,
        idCardBack,
        utilityBill,
      },
      { new: true } // Return updated document
    );

    if (!updatedPitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    res
      .status(200)
      .json({
        message: "Profile updated successfully",
        pitcher: updatedPitcher,
      });
  } catch (err) {
    console.error("Profile update error:", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// Get current pitcher's profile
exports.findMe = async (req, res) => {
  try {
    const pitcherId = req.pitcher.id; // Assuming you have middleware to get pitcher's ID from JWT

    // Find pitcher by ID
    const pitcher = await Pitcher.findById(pitcherId);

    if (!pitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    res.status(200).json(pitcher);
  } catch (err) {
    console.error("Find pitcher profile error:", err);
    res.status(500).json({ error: "Failed to find pitcher profile" });
  }
};

// Send a connection request
exports.sendConnectionRequest = async (req, res) => {
  const { investorId, pitcherId } = req.body;

  try {
    const investor = await Investor.findById(investorId);
    const pitcher = await Pitcher.findById(pitcherId);

    if (!investor || !pitcher) {
      return res.status(404).json({ error: "Investor or Pitcher not found" });
    }

    const newRequest = new ConnectionRequest({ investorId, pitcherId });
    await newRequest.save();

    res.status(201).json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error("Error sending connection request:", err);
    res.status(500).json({ error: "Failed to send connection request" });
  }
};

// Get all connection requests for a pitcher
exports.getConnectionRequests = async (req, res) => {
  const { pitcherId } = req.params;

  try {
    const requests = await ConnectionRequest.find({ pitcherId, status: "pending" })
      .populate("investorId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (err) {
    console.error("Error fetching connection requests:", err);
    res.status(500).json({ error: "Failed to fetch connection requests" });
  }
};

// Accept a connection request
exports.acceptConnectionRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    request.status = "accepted";
    await request.save();

    res.status(200).json({ message: "Connection request accepted" });
  } catch (err) {
    console.error("Error accepting connection request:", err);
    res.status(500).json({ error: "Failed to accept connection request" });
  }
};

// Reject a connection request
exports.rejectConnectionRequest = async (req, res) => {
  const { requestId } = req.params;

  try {
    const request = await ConnectionRequest.findById(requestId);

    if (!request) {
      return res.status(404).json({ error: "Connection request not found" });
    }

    request.status = "rejected";
    await request.save();

    res.status(200).json({ message: "Connection request rejected" });
  } catch (err) {
    console.error("Error rejecting connection request:", err);
    res.status(500).json({ error: "Failed to reject connection request" });
  }
};

// Controller function to request password reset for pitcher
exports.forgotPassword = async (req, res) => {
  const { username } = req.params;

  try {
    // Find the pitcher by username
    const pitcher = await Pitcher.findOne({ username });

    if (!pitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    // Generate a unique token for password reset
    const resetToken = jwt.sign(
      { id: pitcher._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    // Save the reset token to the pitcher's document
    pitcher.resetToken = resetToken;
    await pitcher.save();

    // Compose the password reset email
    const resetUrl = `http://yourdomain.com/reset/${resetToken}`; // Replace with your reset URL
    const html = `
      <p>Hello ${pitcher.username},</p>
      <p>You requested a password reset. Please click <a href="${resetUrl}">here</a> to reset your password.</p>
      <p>If you did not request this, please ignore this email.</p>
    `;

    // Send the password reset email
    await sendEmail(pitcher.email, "Password Reset Request", html);

    res.status(200).json({ message: "Password reset email sent" });
  } catch (err) {
    console.error("Password reset request error:", err);
    res.status(500).json({ error: "Failed to process password reset request" });
  }
};