const mongoose = require("mongoose");

const documentSchema = new mongoose.Schema({
  filename: {
    type: String,
    required: true
  },
  originalName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  meetingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Meeting"
  },
  status: {
    type: String,
    enum: ["pending", "processing", "ready", "error"],
    default: "pending"
  },
  version: {
    type: Number,
    default: 1
  },
  eSignature: {
    signatureUrl: String,
    signatureDate: Date,
    signedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  },
  tags: [{
    type: String
  }],
  notes: {
    type: String,
    default: ""
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
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
documentSchema.index({ uploadedBy: 1, createdAt: -1 });
documentSchema.index({ meetingId: 1 });
documentSchema.index({ status: 1 });

// Virtual for file type detection
documentSchema.virtual("fileType").get(function() {
  if (!this.mimeType) return "unknown";
  if (this.mimeType.startsWith("image/")) return "image";
  if (this.mimeType.startsWith("video/")) return "video";
  if (this.mimeType.startsWith("audio/")) return "audio";
  if (this.mimeType.includes("pdf")) return "pdf";
  if (this.mimeType.includes("word")) return "document";
  if (this.mimeType.includes("excel") || this.mimeType.includes("csv")) return "spreadsheet";
  if (this.mimeType.includes("powerpoint")) return "presentation";
  return "other";
});

module.exports = mongoose.model("Document", documentSchema);
