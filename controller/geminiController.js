// controllers/chatController.js
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Pitch = require("../model/pitchers/pitchModel");
const Appointment = require("../model/appointments/appointmentModel");

const apiKey = process.env.GEMINI_KEY;

const AIchat = async (req, res) => {
  try {
    const { search, username } = req.body;

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `${search}, respond back to ${username}`;
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    // Format the response
    const formattedResponse = response
      .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") // Bold text between **
      .replace(/\n/g, "<br>") // Line breaks
      .replace(/[^\w\s<>/.\-?!,"']+$/g, ""); // Remove unwanted characters

    return res.status(200).json(formattedResponse);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ Alert: `Something went wrong: ${err.message}` });
  }
};

const suggestFriends = async (req, res) => {
  const { shortIdea } = req.body;
  if (!shortIdea) return res.status(400).json({ Alert: "Idea required" });

  try {
    // Fetch ideas from the listingsModel
    const listings = await Pitch.find({});
    const similarIdeas = [];

    // Compare shortIdea with each listing's idea
    listings.forEach((listing) => {
      if (listing.idea && listing.idea.includes(shortIdea)) {
        similarIdeas.push({
          username: listing.username,
          idea: listing.idea,
        });
      }
    });

    if (similarIdeas.length === 0) {
      return res.status(200).json({ message: "No similar ideas found." });
    }

    // Create friend request suggestions
    const friendSuggestions = similarIdeas.map((item) => ({
      username: item.username,
      idea: item.idea,
      suggestion: `You might want to connect with ${item.username} who has a similar idea: ${item.idea}`,
    }));

    return res.status(200).json(friendSuggestions);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ Alert: `Something went wrong: ${err.message}` });
  }
};

const scheduleAppointment = async (req, res) => {
  const { username, investorName, date, time, query } = req.body;
  if (!username || !investorName || !date || !time || !query) {
    return res.status(400).json({ Alert: "All fields are required" });
  }

  try {
    const newAppointment = new Appointment({
      username,
      investorName,
      date,
      time,
      query,
    });

    await newAppointment.save();
    return res.status(201).json({ message: "Appointment scheduled successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ Alert: `Something went wrong: ${err.message}` });
  }
};

module.exports = { AIchat, suggestFriends, scheduleAppointment };
