require("dotenv").config();
const express = require("express");
const router = express.Router();
const donationController = require("../controller/donationController");

// Create a new campaign
router.post("/", donationController.createCampaign); //who is creating the campaign must be added

// Get all campaigns
router.get("/", donationController.getAllCampaigns);

// Get a single campaign by ID
router.get("/:id", donationController.getCampaignById);

// Add a comment to a campaign
router.post("/:campaignId/comments", donationController.addComment);

// Show all comments for a campaign
router.get("/:campaignId/comments", donationController.showAllComments);

// Update campaign amount raised
router.put("/:id", donationController.updateCampaign);

// Create a payment intent
router.post("/payments", donationController.createPayment);

module.exports = router;