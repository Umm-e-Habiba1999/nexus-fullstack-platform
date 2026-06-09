const mongoose = require("mongoose");

const meetingSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ""
  },
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],
  date: {
    type: Date,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  durationMinutes: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["scheduled", "accepted", "rejected", "cancelled", "completed"],
    default: "scheduled"
  },
  type: {
    type: String,
    enum: ["investor-meeting", "entrepreneur-update", "pitch-session", "general"],
    default: "general"
  },
  videoCallUrl: {
    type: String,
    default: ""
  },
  notes: {
    type: String,
    default: ""
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for faster queries
meetingSchema.index({ organizer: 1, date: 1 });
meetingSchema.index({ participants: 1, date: 1 });
meetingSchema.index({ status: 1, date: 1 });

// Method to check if meeting conflicts with existing meetings
meetingSchema.methods.hasConflict = async function() {
  const user = this.organizer;
  const participantIds = [user, ...this.participants];

  const conflictingMeeting = await mongoose.model("Meeting").findOne({
    _id: { $ne: this._id },
    participants: { $in: participantIds },
    date: this.date,
    status: { $ne: "cancelled" },
    $or: [
      // Current meeting's start time falls within another meeting
      {
        startTime: { $lte: this.startTime },
        endTime: { $gt: this.startTime }
      },
      // Current meeting's end time falls within another meeting
      {
        startTime: { $lt: this.endTime },
        endTime: { $gte: this.endTime }
      },
      // Current meeting completely contains another meeting
      {
        startTime: { $lte: this.startTime },
        endTime: { $gte: this.endTime }
      },
      // Current meeting is completely contained within another meeting
      {
        startTime: { $gte: this.startTime },
        endTime: { $lte: this.endTime }
      }
    ]
  });

  return conflictingMeeting !== null;
};

// Static method to check for conflicts without saving
meetingSchema.statics.checkConflict = async function(meetingData) {
  const { organizer, participants, date, startTime, endTime } = meetingData;
  const participantIds = [organizer, ...(participants || [])];

  const conflictingMeeting = await this.findOne({
    participants: { $in: participantIds },
    date: new Date(date),
    status: { $ne: "cancelled" },
    $or: [
      {
        startTime: { $lte: startTime },
        endTime: { $gt: startTime }
      },
      {
        startTime: { $lt: endTime },
        endTime: { $gte: endTime }
      },
      {
        startTime: { $lte: startTime },
        endTime: { $gte: endTime }
      },
      {
        startTime: { $gte: startTime },
        endTime: { $lte: endTime }
      }
    ]
  });

  return conflictingMeeting !== null;
};

module.exports = mongoose.model("Meeting", meetingSchema);
