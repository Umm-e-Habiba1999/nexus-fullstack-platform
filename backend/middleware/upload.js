const multer = require("multer");
const path = require("path");
const Document = require("../models/Document");

// Storage configuration - stores files locally for now
// For production, consider using AWS S3 (see commented config below)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = process.env.UPLOAD_PATH || "./uploads/documents";
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

// File filter - only allow specific file types
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/csv",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Invalid file type. Allowed types: ${allowedTypes.join(", ")}`));
  }
};

// Upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: process.env.MAX_FILE_SIZE ? parseInt(process.env.MAX_FILE_SIZE) : 10 * 1024 * 1024 // 10MB default
  }
});

/**
 * Upload single document
 */
const uploadDocument = upload.single("document");

/**
 * Upload multiple documents
 */
const uploadDocuments = upload.array("documents", 10);

/**
 * Upload signature image
 */
const uploadSignature = upload.single("signature");

/**
 * AWS S3 Storage Configuration (alternative to local storage)
 * Uncomment and configure for S3 usage
 */
/*
const { S3Client } = require("@aws-sdk/client-s3");
const { S3Storage } = require("multer-s3");

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const s3Storage = S3Storage({
  s3,
  bucket: process.env.AWS_S3_BUCKET,
  metadata: (req, file, cb) => {
    cb(null, { fieldName: file.fieldname });
  },
  key: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `documents/${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});
*/

/**
 * Helper to store document metadata in DB
 */
const storeDocumentMetadata = async (fileData, userId, meetingId = null) => {
  return await Document.create({
    filename: fileData.filename,
    originalName: fileData.originalName,
    fileUrl: `${process.env.API_URL || "http://localhost:5000"}/uploads/documents/${fileData.filename}`,
    mimeType: fileData.mimetype,
    fileSize: fileData.size,
    uploadedBy: userId,
    meetingId,
    status: "ready"
  });
};

/**
 * Helper to update document with e-signature
 */
const addSignatureToDocument = async (documentId, signatureData, userId) => {
  return await Document.findByIdAndUpdate(
    documentId,
    {
      eSignature: {
        signatureUrl: signatureData,
        signatureDate: new Date(),
        signedBy: userId
      },
      status: "signed",
      updatedAt: Date.now()
    },
    { new: true }
  );
};

/**
 * Helper to get paginated documents
 */
const getPaginatedDocuments = async (userId, page = 1, limit = 10, status = null) => {
  const query = { uploadedBy: userId };
  if (status) {
    query.status = status;
  }

  const skip = (page - 1) * limit;

  const documents = await Document.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Document.countDocuments(query);

  return {
    documents,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};

module.exports = {
  uploadDocument,
  uploadDocuments,
  uploadSignature,
  storeDocumentMetadata,
  addSignatureToDocument,
  getPaginatedDocuments,
  upload
};
