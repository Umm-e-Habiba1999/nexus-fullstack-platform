const Document = require("../models/Document");
const { storeDocumentMetadata, addSignatureToDocument, getPaginatedDocuments } = require("../middleware/upload");

/**
 * Upload a document
 * POST /api/documents
 */
const uploadDocument = async (req, res) => {
  try {
    const { meetingId, tags, notes } = req.body;

    // Parse tags from string if needed
    const tagArray = tags ? (Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim())) : [];

    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Store document metadata
    const document = await storeDocumentMetadata(req.file, req.user.id, meetingId || null);

    // Add tags if provided
    if (tagArray.length > 0) {
      document.tags = tagArray;
      await document.save();
    }

    // Add notes if provided
    if (notes) {
      document.notes = notes;
      await document.save();
    }

    res.status(201).json({
      message: "Document uploaded successfully",
      document
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get all documents for the current user
 * GET /api/documents
 */
const getDocuments = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, type, tag } = req.query;

    const userId = req.user.id;
    const query = { uploadedBy: userId };

    if (status) {
      query.status = status;
    }

    // Filter by file type (image, pdf, document, etc.)
    if (type) {
      if (type === "image") {
        query.mimeType = { $regex: /^image\// };
      } else if (type === "pdf") {
        query.mimeType = { $regex: /pdf/ };
      } else if (type === "document") {
        query.mimeType = { $in: [/word/, /msword/] };
      } else if (type === "spreadsheet") {
        query.mimeType = { $in: [/excel/, /csv/, /spreadsheet/] };
      } else if (type === "presentation") {
        query.mimeType = { $in: [/powerpoint/, /presentation/] };
      }
    }

    if (tag) {
      query.tags = tag;
    }

    const skip = (page - 1) * limit;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("uploadedBy", "name email avatarUrl role");

    const total = await Document.countDocuments(query);

    res.json({
      documents,
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
 * Get document by ID
 * GET /api/documents/:id
 */
const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id)
      .populate("uploadedBy", "name email avatarUrl role")
      .populate("meetingId", "title date startTime");

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check authorization
    if (document.uploadedBy._id.toString() !== req.user.id && !req.user.role === "admin") {
      return res.status(403).json({ message: "Unauthorized to access this document" });
    }

    res.json({ document });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Update document metadata
 * PUT /api/documents/:id
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { tags, notes, status } = req.body;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check authorization
    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this document" });
    }

    if (tags !== undefined) {
      document.tags = Array.isArray(tags) ? tags : tags.split(",").map(t => t.trim());
    }

    if (notes !== undefined) {
      document.notes = notes;
    }

    if (status !== undefined) {
      document.status = status;
    }

    document.updatedAt = Date.now();
    await document.save();

    res.json({
      message: "Document updated successfully",
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Delete a document
 * DELETE /api/documents/:id
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check authorization
    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this document" });
    }

    // In production, you would also delete the file from storage here
    // await fs.unlink(path.join(__dirname, "../../uploads/documents", document.filename));

    await document.deleteOne();

    res.json({ message: "Document deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Add e-signature to a document
 * POST /api/documents/:id/sign
 */
const signDocument = async (req, res) => {
  try {
    const { id } = req.params;

    const document = await Document.findById(id);

    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check authorization - only uploadedBy can sign
    if (document.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to sign this document" });
    }

    const { signatureUrl, signatureDate } = req.body;

    document.eSignature = {
      signatureUrl,
      signatureDate: signatureDate || new Date(),
      signedBy: req.user.id
    };
    document.status = "signed";
    document.updatedAt = Date.now();

    await document.save();

    res.json({
      message: "Document signed successfully",
      document
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get documents for a specific meeting
 * GET /api/documents/meeting/:meetingId
 */
const getDocumentsByMeeting = async (req, res) => {
  try {
    const { meetingId } = req.params;

    const documents = await Document.find({ meetingId })
      .sort({ createdAt: -1 });

    res.json({ documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  uploadDocument,
  getDocuments,
  getDocumentById,
  updateDocument,
  deleteDocument,
  signDocument,
  getDocumentsByMeeting
};
