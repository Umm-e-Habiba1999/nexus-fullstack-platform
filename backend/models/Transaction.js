const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  type: {
    type: String,
    enum: ["deposit", "withdrawal", "transfer", "investment", "refund"],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: "USD",
    enum: ["USD", "EUR", "GBP"]
  },
  status: {
    type: String,
    enum: ["pending", "completed", "failed", "cancelled"],
    default: "pending"
  },
  description: {
    type: String,
    default: ""
  },
  referenceId: {
    type: String,
    default: ""
  },
  // For transfers
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  // For investments
  investmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Deal"
  },
  // Stripe specific fields
  stripePaymentIntentId: {
    type: String,
    default: ""
  },
  stripeChargeId: {
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

// Indexes for faster queries
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ referenceId: 1 });
transactionSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
