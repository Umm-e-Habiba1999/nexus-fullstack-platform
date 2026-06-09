const Transaction = require("../models/Transaction");
const User = require("../models/User");

// Lazy-initialized Stripe instance
let stripeInstance = null;

const getStripe = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = require("stripe")(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

/**
 * Check if Stripe is configured
 */
const isStripeEnabled = () => {
  return !!process.env.STRIPE_SECRET_KEY;
};

/**
 * Deposit funds using Stripe
 * POST /api/payments/deposit
 */
const depositFunds = async (req, res) => {
  try {
    const { amount, paymentMethodId, description } = req.body;
    const userId = req.user.id;

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    if (!isStripeEnabled()) {
      // Mock deposit for development without Stripe
      console.log("Stripe not configured - creating mock transaction");
      const transaction = await Transaction.create({
        userId,
        type: "deposit",
        amount,
        currency: "USD",
        status: "completed",
        description: description || "Deposit (mock - Stripe not configured)"
      });

      return res.status(200).json({
        message: "Deposit successful (mock mode)",
        transaction
      });
    }

    const stripe = getStripe();

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: "usd",
      payment_method: paymentMethodId,
      confirm: true,
      description: description || "Deposit to Nexus account",
      metadata: {
        userId,
        type: "deposit"
      }
    });

    // Create transaction record
    const transaction = await Transaction.create({
      userId,
      type: "deposit",
      amount,
      currency: "USD",
      status: paymentIntent.status === "succeeded" ? "completed" : "pending",
      stripePaymentIntentId: paymentIntent.id,
      stripeChargeId: paymentIntent.charges.data[0]?.id || "",
      description: description || "Deposit via Stripe"
    });

    res.status(200).json({
      message: "Deposit successful",
      transaction,
      clientSecret: paymentIntent.client_secret
    });
  } catch (error) {
    console.error("Deposit error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Transfer funds to another user
 * POST /api/payments/transfer
 */
const transferFunds = async (req, res) => {
  try {
    const { recipientId, amount, description } = req.body;
    const senderId = req.user.id;

    // Validate inputs
    if (!recipientId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Recipient and amount are required" });
    }

    // Check if recipient exists
    const recipient = await User.findById(recipientId);
    if (!recipient) {
      return res.status(404).json({ message: "Recipient not found" });
    }

    // Prevent self-transfer
    if (senderId.toString() === recipientId.toString()) {
      return res.status(400).json({ message: "Cannot transfer to yourself" });
    }

    // Create transaction record for sender (debit)
    const senderTransaction = await Transaction.create({
      userId: senderId,
      type: "transfer",
      amount,
      currency: "USD",
      status: "pending",
      recipientId,
      description: description || `Transfer to ${recipient.name}`
    });

    // Create transaction record for recipient (credit)
    const recipientTransaction = await Transaction.create({
      userId: recipientId,
      type: "transfer",
      amount,
      currency: "USD",
      status: "pending",
      description: description ? `Received from transfer: ${description}` : `Received transfer from ${req.user.name}`
    });

    res.status(200).json({
      message: "Transfer initiated",
      transactions: {
        sender: senderTransaction,
        recipient: recipientTransaction
      }
    });
  } catch (error) {
    console.error("Transfer error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get transaction history
 * GET /api/payments/history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const { page = 1, limit = 20, type, status } = req.query;

    const userId = req.user.id;

    const query = { userId };

    if (type) {
      query.type = type;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("recipientId", "name email avatarUrl role");

    const total = await Transaction.countDocuments(query);

    // Calculate balance
    const deposits = await Transaction.aggregate([
      { $match: { userId: userId, type: "deposit", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const withdrawals = await Transaction.aggregate([
      { $match: { userId: userId, type: "transfer", status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    const depositTotal = deposits[0]?.total || 0;
    const withdrawalTotal = withdrawals[0]?.total || 0;
    const currentBalance = depositTotal - withdrawalTotal;

    res.json({
      transactions,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      },
      balance: {
        current: currentBalance,
        currency: "USD"
      }
    });
  } catch (error) {
    console.error("Get history error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get transaction by ID
 * GET /api/payments/:id
 */
const getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;

    const transaction = await Transaction.findById(id)
      .populate("userId", "name email avatarUrl")
      .populate("recipientId", "name email avatarUrl");

    if (!transaction) {
      return res.status(404).json({ message: "Transaction not found" });
    }

    // Check authorization
    if (transaction.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to access this transaction" });
    }

    res.json({ transaction });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Mock Stripe webhook handler (for testing)
 * POST /api/payments/webhook
 */
const handleWebhook = async (req, res) => {
  try {
    // Check if Stripe is enabled
    if (!isStripeEnabled()) {
      return res.status(503).json({ message: "Stripe not configured" });
    }

    const stripe = getStripe();
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
    }

    // Handle different event types
    switch (event.type) {
      case "payment_intent.succeeded":
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: event.data.object.id },
          { status: "completed", updatedAt: Date.now() }
        );
        break;
      case "payment_intent.payment_failed":
        await Transaction.findOneAndUpdate(
          { stripePaymentIntentId: event.data.object.id },
          { status: "failed", updatedAt: Date.now() }
        );
        break;
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  depositFunds,
  transferFunds,
  getTransactionHistory,
  getTransactionById,
  handleWebhook,
  isStripeEnabled
};
