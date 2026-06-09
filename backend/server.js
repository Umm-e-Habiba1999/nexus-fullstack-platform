const express = require("express");
const cors = require("cors");
const http = require("http");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express(); // FIRST create app

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from uploads directory
app.use("/uploads/documents", express.static("./uploads/documents"));

// Routes (AFTER app creation)
const authRoutes = require("./routes/auth");
const meetingRoutes = require("./routes/meetings");
const documentRoutes = require("./routes/documents");
const paymentRoutes = require("./routes/payments");

app.use("/api/auth", authRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/payments", paymentRoutes);

// Test API
app.get("/api/test", (req, res) => {
  res.send("Backend is working 🚀");
});

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("DB Connected ✅"))
  .catch(err => console.log("DB Connection Error:", err));

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const { initSocket } = require("./config/socket");
const io = initSocket(server);

// Server run
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Socket.IO server initialized`);
});

module.exports = { app, io, server };
