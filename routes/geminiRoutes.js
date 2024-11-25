const express = require("express");
const router = express.Router();
 // Ensure you have this model
const { AIchat, suggestFriends,scheduleAppointment } = require("../controller/geminiController");

router.post("/", AIchat);
router.post("/friends", suggestFriends);
router.post('/appointments', scheduleAppointment);

module.exports = router;
