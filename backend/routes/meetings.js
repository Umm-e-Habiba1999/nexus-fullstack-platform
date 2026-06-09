const express = require("express");
const router = express.Router();

// Import middleware
const { protect } = require("../middleware/auth");

// Import controller functions
const {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeetingStatus,
  updateMeeting,
  deleteMeeting,
  getMeetingsByUser
} = require("../controllers/meetingController");

// ======================
// IMPORTANT: Specific routes first
// ======================

// Get meetings by user
router.get("/user/:userId", protect, getMeetingsByUser);

// Get all meetings for logged-in user
router.get("/", protect, getMeetings);

// Create meeting
router.post("/", protect, createMeeting);

// Get meeting by ID
router.get("/:id", protect, getMeetingById);

// Update meeting status
router.put("/:id/status", protect, updateMeetingStatus);

// Update meeting details
router.put("/:id", protect, updateMeeting);

// Delete meeting
router.delete("/:id", protect, deleteMeeting);

module.exports = router;