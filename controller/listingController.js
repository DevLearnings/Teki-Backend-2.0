const cloudinary = require("cloudinary").v2;
const Investor = require("../model/investors/investorModel");
const Pitcher = require("../model/pitchers/pitcherModel");
const FriendRequest = require("../model/FriendRequests/FriendRequest");

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

// Connect with a pitcher
exports.connectWithPitcher = async (req, res) => {
  try {
    const { pitcherId } = req.body;

    if (!pitcherId) {
      return res.status(400).json({ error: "Pitcher ID is required." });
    }

    const pitcher = await Pitcher.findById(pitcherId);

    if (!pitcher) {
      return res.status(404).json({ error: "Pitcher not found." });
    }

    // Logic to connect with the pitcher (e.g., add to connections, send notification, etc.)
    res.status(200).json({ message: "Connected with the pitcher successfully." });
  } catch (error) {
    console.error("Error connecting with pitcher:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Send a friend request to a pitcher
exports.sendFriendRequest = async (req, res) => {
  try {
    const { pitchId } = req.params;
    const { message } = req.body;

    if (!pitchId) {
      return res.status(400).json({ error: "Pitch ID is required." });
    }

    const pitcher = await Pitcher.findById(pitchId);

    if (!pitcher) {
      return res.status(404).json({ error: "Pitcher not found." });
    }

    const friendRequest = new FriendRequest({
      from: req.user.id,
      to: pitcher.id,
      message,
    });
    await friendRequest.save();

    res.status(200).json({ message: "Friend request sent successfully." });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ error: "Internal server error." });
  }
};

// Create a new pitcher listing
exports.createPitch = async (req, res) => {
  try {
    const {
      title,
      shortIdea,
      extendedIdea,
      link,
      category,
      teamMembers,
      targetMarket,
      revenueModel,
      visibility,
      createdBy,
    } = req.body;

    const baseVideo = req.files["baseVideo"]
      ? await uploadToCloudinary(req.files["baseVideo"][0])
      : null;
    const baseImage = req.files["baseImage"]
      ? await uploadToCloudinary(req.files["baseImage"][0])
      : null;
    const extendedVideo = req.files["extendedVideo"]
      ? await uploadToCloudinary(req.files["extendedVideo"][0])
      : null;
    const extendedImage = req.files["extendedImage"]
      ? await uploadToCloudinary(req.files["extendedImage"][0])
      : null;

    const newPitcher = new Pitcher({
      title,
      shortIdea,
      extendedIdea,
      baseVideo,
      baseImage,
      extendedVideo,
      extendedImage,
      link,
      category,
      teamMembers,
      targetMarket,
      revenueModel,
      visibility,
      createdBy,
    });

    await newPitcher.save();

    res.status(201).json({ message: "Idea Submitted Successfully", pitcher: newPitcher });
  } catch (err) {
    console.error("Error submitting idea:", err);
    res.status(500).json({ error: "Failed to submit idea" });
  }
};

// Update a pitcher listing
exports.updatePitch = async (req, res) => {
  try {
    const pitcherId = req.params.id;
    const { visibility } = req.body;

    const updatedPitcher = await Pitcher.findByIdAndUpdate(
      pitcherId,
      { visibility },
      { new: true }
    );

    if (!updatedPitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    res.json({
      message: "Pitcher updated successfully",
      pitcher: updatedPitcher,
    });
  } catch (err) {
    console.error("Error updating pitcher:", err);
    res.status(500).json({ error: "Failed to update pitcher" });
  }
};

// Delete a pitcher listing
exports.deletePitch = async (req, res) => {
  try {
    const pitcherId = req.params.id;

    const deletedPitcher = await Pitcher.findByIdAndDelete(pitcherId);

    if (!deletedPitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    res.json({ message: "Pitcher deleted successfully" });
  } catch (err) {
    console.error("Error deleting pitcher:", err);
    res.status(500).json({ error: "Failed to delete pitcher" });
  }
};

// Get details of a specific pitcher listing
exports.getPitch = async (req, res) => {
  try {
    const pitcherId = req.params.id;

    const pitcher = await Pitcher.findById(pitcherId);

    if (!pitcher) {
      return res.status(404).json({ error: "Pitcher not found" });
    }

    res.json({ pitcher });
  } catch (err) {
    console.error("Error fetching pitcher:", err);
    res.status(500).json({ error: "Failed to fetch pitcher" });
  }
};

// Get all pitcher listings
exports.getAllPitches = async (req, res) => { //problem
  try {
    const pitchers = await Pitcher.find();

    if (!pitchers) {
      return res.status(404).json({ error: "No pitchers found" });
    }

    res.json({ pitchers });
  } catch (err) {
    console.error("Error fetching pitchers:", err);
    res.status(500).json({ error: "Failed to fetch pitchers" });
  }
};

// Investors can connect with pitchers
exports.sendConnectionRequest = async (req, res) => {
  const { investorId, pitchId } = req.params;

  try {
    const investor = await Investor.findById(investorId);

    if (!investor) {
      return res.status(404).json({ error: "Investor not found" });
    }

    // Logic to connect investor with pitcher (e.g., send connection request, update connections, etc.)
    res.status(200).json({ message: "Connection request sent successfully" });
  } catch (err) {
    console.error("Error connecting with pitcher:", err);
    res.status(500).json({ error: "Failed to connect with pitcher" });
  }
};
