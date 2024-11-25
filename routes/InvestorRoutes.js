const express = require("express");
const router = express.Router();
const investorController = require("../controller/investorController");

// POST /investors/register
router.post("/register", investorController.registerInvestor);

// POST /investors/login
router.post("/login", investorController.loginInvestor);

// POST /investors/findme/:investorId
router.post("/findme/:investorId", investorController.findInvestorById);

// PUT /investors/:investorId
router.put("/:investorId", investorController.updateInvestorById);

// DELETE /investors/:investorId
router.delete("/:investorId", investorController.deleteInvestorById);

// POST /investors/request-connect/:pitcherId
router.post("/request-connect/:pitcherId", investorController.requestConnectionWithPitcher);

// POST /investors/accept-connect/:investorId
router.post("/accept-connect/:investorId", investorController.acceptConnectionWithPitcher);

// POST /investors/send-message
router.post("/send-message", investorController.sendMessage);

// GET /investors/messages/:userId
router.get("/messages/:userId", investorController.getMessagesForUser);

// POST /investors/forgot/:email
router.post("/forgot/:email", investorController.forgotPassword);

module.exports = router;
