const express = require("express");
const router = express.Router();
const listingController = require("../controller/listingController");

// Define routes for listing functionalities
router.post("/create", listingController.createPitch);
router.put("/:id", listingController.updatePitch);
router.delete("/:id", listingController.deletePitch);
router.get("/:id", listingController.getPitch);
router.get("/", listingController.getAllPitches);
router.post("/:pitchId/send-friend-request", listingController.sendFriendRequest);
router.post("/connect-with-pitcher", listingController.connectWithPitcher);
router.post("/investors/:investorId/connect/:pitchId", listingController.sendConnectionRequest);

module.exports = router;
