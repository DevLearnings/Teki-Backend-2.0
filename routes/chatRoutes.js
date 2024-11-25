// routes/chatRouter.js

const express = require('express');
const router = express.Router();
const chatController = require('../controller/chatController');

// Route to send message from investor to pitcher
router.post("/investor-to-pitcher", chatController.sendInvestorToPitcherMessage);

// Route to send message from pitcher to investor
router.post("/pitcher-to-investor", chatController.sendPitcherToInvestorMessage);

module.exports = router;