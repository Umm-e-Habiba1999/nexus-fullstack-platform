const { body, validationResult, param, query } = require("express-validator");

/**
 * Validation middleware - checks for validation errors
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = errors.array().map(err => ({
    field: err.path,
    message: err.msg
  }));

  return res.status(400).json({
    message: "Validation failed",
    errors: extractedErrors
  });
};

/**
 * Validate user registration
 */
const validateRegister = [
  body("name")
    .trim()
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2, max: 50 }).withMessage("Name must be between 2 and 50 characters"),

  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),

  body("role")
    .optional()
    .isIn(["investor", "entrepreneur"]).withMessage("Role must be investor or entrepreneur"),

  validate
];

/**
 * Validate user login
 */
const validateLogin = [
  body("email")
    .trim()
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please provide a valid email")
    .normalizeEmail(),

  body("password")
    .notEmpty().withMessage("Password is required"),

  validate
];

/**
 * Validate meeting scheduling
 */
const validateMeeting = [
  body("title")
    .trim()
    .notEmpty().withMessage("Meeting title is required")
    .isLength({ min: 3, max: 100 }).withMessage("Title must be between 3 and 100 characters"),

  body("date")
    .notEmpty().withMessage("Date is required")
    .isISO8601().withMessage("Please provide a valid date"),

  body("startTime")
    .notEmpty().withMessage("Start time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid time format (HH:MM)"),

  body("endTime")
    .notEmpty().withMessage("End time is required")
    .matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage("Invalid time format (HH:MM)"),

  body("participants")
    .optional()
    .isArray().withMessage("Participants must be an array"),

  body("type")
    .optional()
    .isIn(["investor-meeting", "entrepreneur-update", "pitch-session", "general"]).withMessage("Invalid meeting type"),

  validate
];

/**
 * Validate meeting status update
 */
const validateMeetingStatus = [
  param("id")
    .notEmpty().withMessage("Meeting ID is required")
    .isMongoId().withMessage("Invalid meeting ID"),

  body("status")
    .notEmpty().withMessage("Status is required")
    .isIn(["accepted", "rejected", "cancelled", "completed"]).withMessage("Invalid status"),

  validate
];

/**
 * Validate document upload
 */
const validateDocumentUpload = [
  body("meetingId")
    .optional()
    .isMongoId().withMessage("Invalid meeting ID"),

  body("tags")
    .optional()
    .isArray().withMessage("Tags must be an array"),

  validate
];

/**
 * Validate payment/deposit
 */
const validateDeposit = [
  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isNumeric().withMessage("Amount must be a number")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("Amount must be positive");
      }
      return true;
    }),

  body("paymentMethodId")
    .notEmpty().withMessage("Payment method ID is required"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage("Description too long"),

  validate
];

/**
 * Validate transfer
 */
const validateTransfer = [
  body("recipientId")
    .notEmpty().withMessage("Recipient ID is required")
    .isMongoId().withMessage("Invalid recipient ID"),

  body("amount")
    .notEmpty().withMessage("Amount is required")
    .isNumeric().withMessage("Amount must be a number")
    .custom((value) => {
      if (parseFloat(value) <= 0) {
        throw new Error("Amount must be positive");
      }
      return true;
    }),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 255 }).withMessage("Description too long"),

  validate
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateMeeting,
  validateMeetingStatus,
  validateDocumentUpload,
  validateDeposit,
  validateTransfer
};
