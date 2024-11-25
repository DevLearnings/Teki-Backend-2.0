require("dotenv").config();
const express = require("express");
const cors = require("cors");
const rateLimiter = require("./middleware/rateLimiter");
const extractUser = require("./middleware/auth");
const mongoose = require("mongoose");

const server = express();

// Middleware
server.use(express.json());
server.use(cors({ origin: "*" }));

server.use((req, res, next) => {
  console.log(`Received a request and it says ${JSON.stringify(req.body)}`);
  next();
});

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
};

server.use(errorHandler);
server.use(extractUser);
server.use(rateLimiter);

// Routes
server.use("/bots", require("./routes/geminiRoutes"));
server.use("/investors", require("./routes/InvestorRoutes"));
server.use("/pitchers", require("./routes/pitcherRoutes"));
server.use("/listings", require("./routes/listingsRoute"));
server.use("/donations", require('./routes/donationRoutes'));
server.use("/workplace", require("./routes/workSpaceRoutes"));
server.use("/chat", require("./routes/chatRoutes"));
server.use('/admins', require("./routes/adminRoutes"));

// Mongoose connection
const { CLUSTER, PORT } = process.env;

mongoose.connect(CLUSTER, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("Connected to MongoDB cluster!");
    // Start server after successful connection
    server.listen(PORT, () => {
      console.log(`Server is up on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error("Error connecting to MongoDB:", err.message);
  });
