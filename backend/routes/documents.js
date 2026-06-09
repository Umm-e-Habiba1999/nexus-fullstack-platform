const express = require("express");
const router = express.Router();
const {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  signDocument,
  getDocumentsByMeeting
} = require("../controllers/documentController");

const { protect } = require("../middleware/auth");
const { uploadDocument: uploadMiddleware } = require("../middleware/upload");

/**
 * @route   POST /api/documents
 * @desc    Upload a document
 * @access  Private
 */
router.post("/", protect, uploadMiddleware, uploadDocument);

/**
 * @route   GET /api/documents
 * @desc    Get all documents for the current user
 * @access  Private
 */
router.get("/", protect, getDocuments);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document by ID
 * @access  Private
 */
router.get("/:id", protect, getDocumentById);

/**
 * @route   PUT /api/documents/:id
 * @desc    Update document metadata
 * @access  Private
 */
router.put("/:id", protect, updateDocument);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete("/:id", protect, deleteDocument);

/**
 * @route   POST /api/documents/:id/sign
 * @desc    Add e-signature to a document
 * @access  Private
 */
router.post("/:id/sign", protect, signDocument);

/**
 * @route   GET /api/documents/meeting/:meetingId
 * @desc    Get documents for a specific meeting
 * @access  Private
 */
router.get("/meeting/:meetingId", protect, getDocumentsByMeeting);

module.exports = router;
