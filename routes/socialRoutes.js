const express = require("express");
const router = express.Router();
const socialController = require("../controllers/socialController");

// Route to create a new post
router.post("/posts", socialController.createPost);

// Route to get all posts
router.get("/posts", socialController.getAllPosts);

// Route to handle sending a message
router.post("/messages", socialController.sendMessage);

// Route to handle liking a message
router.post("/messages/like", socialController.likeMessage);

// Route to start a live stream
router.post("/live-streams", socialController.startLiveStream);

// Route to get all live streams
router.get("/live-streams", socialController.getAllLiveStreams);

module.exports = router;
