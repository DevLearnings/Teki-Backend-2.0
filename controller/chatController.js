// controllers/chatController.js

const socketIo = require("socket.io");
const http = require("http");
const Message = require("../model/messages/messageModel");
const Investor = require("../model/investors/investorModel");
const Pitcher = require("../model/pitchers/pitchModel");

// Initialize socket.io
const chatServer = http.createServer();
const io = socketIo(chatServer);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });

  socket.on("investorToPitcherMessage", handleInvestorToPitcherMessage);
  socket.on("pitcherToInvestorMessage", handlePitcherToInvestorMessage);
});

async function handleInvestorToPitcherMessage(data) {
  try {
    const { senderId, receiverId, messageText } = data;
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message: messageText,
      timestamp: new Date(),
    });
    await newMessage.save();
    io.to(receiverId).emit("newMessage", newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

async function handlePitcherToInvestorMessage(data) {
  try {
    const { senderId, receiverId, messageText } = data;
    const newMessage = new Message({
      sender: senderId,
      receiver: receiverId,
      message: messageText,
      timestamp: new Date(),
    });
    await newMessage.save();
    io.to(receiverId).emit("newMessage", newMessage);
  } catch (err) {
    console.error("Error sending message:", err);
  }
}

async function sendInvestorToPitcherMessage(req, res) {
  try {
    const { senderId, receiverId, messageText } = req.body;
    const sender = await Investor.findById(senderId);
    const receiver = await Pitcher.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }
    io.emit("investorToPitcherMessage", { senderId, receiverId, messageText });
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}

async function sendPitcherToInvestorMessage(req, res) {
  try {
    const { senderId, receiverId, messageText } = req.body;
    const sender = await Pitcher.findById(senderId);
    const receiver = await Investor.findById(receiverId);
    if (!sender || !receiver) {
      return res.status(404).json({ error: "Sender or receiver not found" });
    }
    io.emit("pitcherToInvestorMessage", { senderId, receiverId, messageText });
    res.status(200).json({ message: "Message sent successfully" });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
}

module.exports = {
  chatServer,
  sendInvestorToPitcherMessage,
  sendPitcherToInvestorMessage,
};