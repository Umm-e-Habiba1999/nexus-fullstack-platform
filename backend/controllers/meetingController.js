const Meeting = require("../models/Meeting");
const User = require("../models/User");

/**
 * Create a new meeting
 * POST /api/meetings
 */
const createMeeting = async (req, res) => {
  try {
    const { title, description, participants, date, startTime, endTime, durationMinutes, type, notes } = req.body;

    // Validate required fields
    if (!title || !date || !startTime || !endTime) {
      return res.status(400).json({ message: "Please provide title, date, start time, and end time" });
    }

    // Validate time format (HH:MM)
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return res.status(400).json({ message: "Invalid time format. Use HH:MM (24-hour format)" });
    }

    const organizer = req.user.id;

    // Check for conflicts
    const hasConflict = await Meeting.checkConflict({
      organizer,
      participants,
      date,
      startTime,
      endTime
    });

    if (hasConflict) {
      return res.status(409).json({ message: "You have a scheduling conflict with this time slot" });
    }

    // Validate participants exist
    if (participants && participants.length > 0) {
      const existingParticipants = await User.find({ _id: { $in: participants } });
      if (existingParticipants.length !== participants.length) {
        return res.status(400).json({ message: "One or more participants do not exist" });
      }
    }

    const meeting = await Meeting.create({
      title,
      description,
      organizer,
      participants: participants || [],
      date,
      startTime,
      endTime,
      durationMinutes: durationMinutes || 30,
      status: "scheduled",
      type: type || "general",
      notes
    });

    res.status(201).json({
      message: "Meeting created successfully",
      meeting
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all meetings for the current user
 * GET /api/meetings
 */
const getMeetings = async (req, res) => {
  try {
    const { status, page = 1, limit = 10, type } = req.query;

    const userId = req.user.id;

    // Build query
    const query = {
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    if (type) {
      query.type = type;
    }

    const skip = (page - 1) * limit;

    const meetings = await Meeting.find(query)
      .populate("organizer", "name email avatarUrl")
      .populate("participants", "name email avatarUrl")
      .sort({ date: 1, startTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Meeting.countDocuments(query);

    res.json({
      meetings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a single meeting by ID
 * GET /api/meetings/:id
 */
const getMeetingById = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id)
      .populate("organizer", "name email avatarUrl bio")
      .populate("participants", "name email avatarUrl role");

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    // Check if user is authorized to view this meeting
    const userId = req.user.id;
    if (meeting.organizer._id.toString() !== userId.toString() &&
        !meeting.participants.some(p => p._id.toString() === userId.toString())) {
      return res.status(403).json({ message: "Unauthorized to view this meeting" });
    }

    res.json({ meeting });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update meeting status (accept/reject/cancel)
 * PUT /api/meetings/:id/status
 */
const updateMeetingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ["accepted", "rejected", "cancelled", "completed"];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status. Allowed: " + allowedStatuses.join(", ") });
    }

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const userId = req.user.id;

    // Only organizer can cancel, participants can accept/reject
    if (status === "cancelled" && meeting.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can cancel this meeting" });
    }

    // Participant can only accept/reject if not the organizer
    if (["accepted", "rejected"].includes(status) && meeting.organizer.toString() === userId.toString()) {
      return res.status(400).json({ message: "Organizer cannot accept/reject their own meeting" });
    }

    meeting.status = status;
    meeting.updatedAt = Date.now();

    const updatedMeeting = await meeting.save();

    res.json({
      message: `Meeting ${status}`,
      meeting: updatedMeeting
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update meeting details
 * PUT /api/meetings/:id
 */
const updateMeeting = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, participants, date, startTime, endTime, durationMinutes, type, notes } = req.body;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const userId = req.user.id;

    // Only organizer can update meeting details
    if (meeting.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can update this meeting" });
    }

    // If date/time changed, check for conflicts
    if (date || startTime || endTime) {
      const checkDate = date || meeting.date;
      const checkStartTime = startTime || meeting.startTime;
      const checkEndTime = endTime || meeting.endTime;

      const hasConflict = await Meeting.checkConflict({
        organizer: meeting.organizer,
        participants: participants || meeting.participants,
        date: checkDate,
        startTime: checkStartTime,
        endTime: checkEndTime
      });

      if (hasConflict) {
        return res.status(409).json({ message: "Scheduling conflict detected" });
      }
    }

    // Update fields
    if (title !== undefined) meeting.title = title;
    if (description !== undefined) meeting.description = description;
    if (participants !== undefined) meeting.participants = participants;
    if (date !== undefined) meeting.date = date;
    if (startTime !== undefined) meeting.startTime = startTime;
    if (endTime !== undefined) meeting.endTime = endTime;
    if (durationMinutes !== undefined) meeting.durationMinutes = durationMinutes;
    if (type !== undefined) meeting.type = type;
    if (notes !== undefined) meeting.notes = notes;
    meeting.updatedAt = Date.now();

    const updatedMeeting = await meeting.save();

    res.json({
      message: "Meeting updated successfully",
      meeting: updatedMeeting
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a meeting
 * DELETE /api/meetings/:id
 */
const deleteMeeting = async (req, res) => {
  try {
    const { id } = req.params;

    const meeting = await Meeting.findById(id);

    if (!meeting) {
      return res.status(404).json({ message: "Meeting not found" });
    }

    const userId = req.user.id;

    // Only organizer can delete
    if (meeting.organizer.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Only the organizer can delete this meeting" });
    }

    await meeting.deleteOne();

    res.json({ message: "Meeting deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get meetings by user (for dashboard view)
 * GET /api/meetings/user/:userId
 */
const getMeetingsByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.query;

    const query = {
      $or: [
        { organizer: userId },
        { participants: userId }
      ]
    };

    if (status) {
      query.status = status;
    }

    const meetings = await Meeting.find(query)
      .populate("organizer", "name email avatarUrl")
      .populate("participants", "name email avatarUrl")
      .sort({ date: 1, startTime: 1 });

    res.json({ meetings });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createMeeting,
  getMeetings,
  getMeetingById,
  updateMeetingStatus,
  updateMeeting,
  deleteMeeting,
  getMeetingsByUser
};
