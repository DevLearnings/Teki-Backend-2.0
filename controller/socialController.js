const Post = require("../models/Post");
const Message = require("../models/Message");
const LiveStream = require("../models/LiveStream");

// Create a new post
exports.createPost = async (req, res) => {
  const { title, content, category, tags, image } = req.body;

  try {
    const newPost = new Post({
      title,
      content,
      category,
      tags: tags.split(",").map(tag => tag.trim()),
      image,
      comments: [],
    });
    await newPost.save();
    res.status(201).json(newPost);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to create post." });
  }
};

// Get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find();
    res.status(200).json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to fetch posts." });
  }
};

// Send a message
exports.sendMessage = async (req, res) => {
  const { postId, friendId, text } = req.body;

  try {
    let message = await Message.findOne({ postId, friendId });
    if (!message) {
      message = new Message({
        postId,
        friendId,
        messages: [{ text, likes: 0 }],
      });
    } else {
      message.messages.push({ text, likes: 0 });
    }
    await message.save();
    res.status(201).json(message);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to send message." });
  }
};

// Like a message
exports.likeMessage = async (req, res) => {
  const { postId, friendId, messageIndex } = req.body;

  try {
    const message = await Message.findOne({ postId, friendId });
    if (message) {
      message.messages[messageIndex].likes++;
      await message.save();
      res.status(200).json(message);
    } else {
      res.status(404).json({ Alert: "Message not found." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to like message." });
  }
};

// Start a live stream
exports.startLiveStream = async (req, res) => {
  const { title, description, thumbnail, url } = req.body;

  try {
    const newStream = new LiveStream({
      title,
      description,
      thumbnail,
      url,
    });
    await newStream.save();
    res.status(201).json(newStream);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to start live stream." });
  }
};

// Get all live streams
exports.getAllLiveStreams = async (req, res) => {
  try {
    const streams = await LiveStream.find();
    res.status(200).json(streams);
  } catch (err) {
    console.error(err);
    res.status(500).json({ Alert: "Failed to fetch live streams." });
  }
};
