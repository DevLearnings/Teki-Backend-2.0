const express = require('express');
const router = express.Router();
const Workspace = require('../model/WorkSpace/Workspace');
const Campaign = require('../model/WorkSpace/Campaign');
const Supply = require('../model/WorkSpace/Supply');
const Task = require('../model/WorkSpace/Task');
const Message = require("../model/messages/messageModel");
const Investor = require("../model/investors/investorModel");
const Pitcher = require("../model/pitchers/pitchModel");
const socketIo = require("socket.io");
const http = require("http");

const chatPort = process.env?.chatPort;

// Initialize socket.io
const chatServer = http.createServer();
const io = socketIo(chatServer);

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  // Handle chat messages from investors to pitchers
  socket.on("investorToPitcherMessage", async (data) => {
    try {
      const { senderId, receiverId, messageText } = data;

      // Save message to database
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        message: messageText,
        timestamp: new Date(),
      });

      await newMessage.save();

      // Emit the message to the receiver
      io.to(receiverId).emit("newMessage", newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });

  // Handle chat messages from pitchers to investors
  socket.on("pitcherToInvestorMessage", async (data) => {
    try {
      const { senderId, receiverId, messageText } = data;

      // Save message to database
      const newMessage = new Message({
        sender: senderId,
        receiver: receiverId,
        message: messageText,
        timestamp: new Date(),
      });

      await newMessage.save();

      // Emit the message to the receiver
      io.to(receiverId).emit("newMessage", newMessage);
    } catch (err) {
      console.error("Error sending message:", err);
    }
  });
});

// Start chat server
chatServer.listen(chatPort, () => {
  console.log(`Chat server running on port ${chatPort}`);
});

// Fetch workspaces for a user
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ message: 'userId is required' });

  try {
    const workspaces = await Workspace.find({ userId });
    res.json(workspaces);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workspaces', error });
  }
});

// Create a new workspace
router.post('/', async (req, res) => {
  const { userId, name } = req.body;
  if (!userId || !name) return res.status(400).json({ message: 'userId and name are required' });

  try {
    const newWorkspace = new Workspace({ userId, name });
    await newWorkspace.save();
    res.status(201).json(newWorkspace);
  } catch (error) {
    res.status(500).json({ message: 'Error creating workspace', error });
  }
});

// Fetch campaigns or supplies for a workspace
router.get('/:workspaceId/:type', async (req, res) => {
  const { workspaceId, type } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const Model = type === 'campaign' ? Campaign : Supply;
    const items = await Model.find({ workspaceId })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalItems = await Model.countDocuments({ workspaceId });

    res.json({
      items,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: `Error fetching ${type}s`, error });
  }
});

// Create a new campaign or supply
router.post('/:workspaceId/:type', async (req, res) => {
  const { workspaceId, type } = req.params;
  const data = req.body;

  try {
    const Model = type === 'campaign' ? Campaign : Supply;
    const newItem = new Model({ ...data, workspaceId });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(500).json({ message: `Error creating ${type}`, error });
  }
});

// Request supply
router.post('/:workspaceId/supply/request', async (req, res) => {
  const { workspaceId } = req.params;
  const { supplyId, quantity } = req.body;

  try {
    const supply = await Supply.findById(supplyId);
    if (!supply) return res.status(404).json({ message: 'Supply not found' });

    supply.quantity += quantity;
    await supply.save();

    res.json(supply);
  } catch (error) {
    res.status(500).json({ message: 'Error requesting supply', error });
  }
});

// Fetch tasks for a workspace (with pagination)
router.get('/:workspaceId/tasks', async (req, res) => {
  const { workspaceId } = req.params;
  const { status } = req.query;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    let query = { workspaceId };
    if (status) query.status = status;

    const tasks = await Task.find(query)
      .skip((page - 1) * limit)
      .limit(limit);
    const totalItems = await Task.countDocuments(query);

    res.json({
      items: tasks,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks', error });
  }
});

// Create a new task
router.post('/:workspaceId/tasks', async (req, res) => {
  const { workspaceId } = req.params;
  const { title, description, status, type } = req.body;

  try {
    const newTask = new Task({ workspaceId, title, description, status, type });
    await newTask.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task', error });
  }
});

// Update a task
router.put('/:workspaceId/tasks/:taskId', async (req, res) => {
  const { taskId } = req.params;
  const { status, completionDetails } = req.body;

  try {
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    task.status = status;
    if (status === 'completed' && completionDetails) {
      task.completionDetails = completionDetails;
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: 'Error updating task', error });
  }
});

// Share completed tasks with investors
router.get('/:workspaceId/tasks/completed/share', async (req, res) => {
  const { workspaceId } = req.params;
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  try {
    const completedTasks = await Task.find({ workspaceId, status: 'completed' })
      .skip((page - 1) * limit)
      .limit(limit);
    const totalItems = await Task.countDocuments({ workspaceId, status: 'completed' });

    res.json({
      items: completedTasks,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error sharing completed tasks', error });
  }
});

// Route to send message from investor to pitcher
router.post("/investor-to-pitcher", async (req, res) => {
  try {
    const { senderId, receiverId, messageText } = req.body;

    // Validate if sender and receiver exist (Investor and Pitcher)
    const sender = await Investor.findById(senderId);
    const receiver = await Pitcher.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    // Emit the message to the chat server
    io.emit("investorToPitcherMessage", { senderId, receiverId, messageText });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

// Route to send message from pitcher to investor
router.post("/pitcher-to-investor", async (req, res) => {
  try {
    const { senderId, receiverId, messageText } = req.body;

    // Validate if sender and receiver exist (Pitcher and Investor)
    const sender = await Pitcher.findById(senderId);
    const receiver = await Investor.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }

    // Emit the message to the chat server
    io.emit("pitcherToInvestorMessage", { senderId, receiverId, messageText });

    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
});

module.exports = router;