const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const multer = require("multer");
const pitcherController = require("../controller/pitcherController"); // Assuming controller path corrected

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Register a new pitcher
router.post(
  "/register",
  upload.fields([
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
  ]),
  [
    check("username", "Please enter a valid username").notEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Please enter a valid password").isLength({ min: 6 }),
    check("phoneNumber", "Please enter a valid phone number").isMobilePhone(),
    check(
      "socials.*.platform",
      "Please provide valid social media platforms"
    ).notEmpty(),
    check(
      "socials.*.link",
      "Please provide valid social media links"
    ).notEmpty(),
  ],
  pitcherController.registerPitcher
);

// Login a pitcher
router.post("/login", pitcherController.loginPitcher);

// Send OTP to pitcher's email
router.post("/send-otp", pitcherController.sendOtp);

// Update pitcher's profile
router.put(
  "/edit-profile",
  upload.fields([
    { name: "idCardFront", maxCount: 1 },
    { name: "idCardBack", maxCount: 1 },
    { name: "utilityBill", maxCount: 1 },
  ]),
  pitcherController.editProfile
);

// Get current pitcher's profile
router.get("/findme/:id", pitcherController.findMe);

// Send a connection request
router.post(
  "/send-connection-request",
  [
    check("investorId", "Investor ID is required").notEmpty(),
    check("pitcherId", "Pitcher ID is required").notEmpty(),
  ],
  pitcherController.sendConnectionRequest
);

// Get all connection requests for a pitcher
router.get("/connection-requests/:pitcherId", pitcherController.getConnectionRequests);

// Accept a connection request
router.post("/accept-connection-request/:requestId", pitcherController.acceptConnectionRequest);

router.post("/forgot/:username",pitcherController.forgotPassword)

module.exports = router;
