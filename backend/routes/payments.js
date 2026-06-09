const express = require("express");
const router = express.Router();
const {
  depositFunds,
  transferFunds,
  getTransactionHistory,
  getTransactionById,
  handleWebhook
} = require("../controllers/paymentController");

const { protect } = require("../middleware/auth");

/**
 * @route   POST /api/payments/deposit
 * @desc    Deposit funds using Stripe
 * @access  Private
 */
router.post("/deposit", protect, depositFunds);

/**
 * @route   POST /api/payments/transfer
 * @desc    Transfer funds to another user
 * @access  Private
 */
router.post("/transfer", protect, transferFunds);

/**
 * @route   GET /api/payments/history
 * @desc    Get transaction history
 * @access  Private
 */
router.get("/history", protect, getTransactionHistory);

/**
 * @route   GET /api/payments/:id
 * @desc    Get transaction by ID
 * @access  Private
 */
router.get("/:id", protect, getTransactionById);

/**
 * @route   POST /api/payments/webhook
 * @desc    Stripe webhook handler
 * @access  Public (verified by webhook secret)
 */
router.post("/webhook", handleWebhook);

module.exports = router;
