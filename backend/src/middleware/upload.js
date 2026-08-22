const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const ApiError = require("../utils/ApiError");

const UPLOAD_DIR = path.join(__dirname, "..", "..", "public", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// Only these are accepted — checked against BOTH the declared mimetype AND the
// file extension, since mimetype alone can be spoofed by the client.
const ALLOWED_MIME_TO_EXT = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIME_TO_EXT[file.mimetype];
    // Never trust the client-supplied filename — generate our own random name.
    const randomName = crypto.randomBytes(16).toString("hex");
    cb(null, `${randomName}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  const allowedExt = ALLOWED_MIME_TO_EXT[file.mimetype];
  const actualExt = path.extname(file.originalname).toLowerCase();

  if (!allowedExt) {
    return cb(new ApiError(400, "Only JPG, PNG, WEBP or GIF images are allowed"));
  }
  // Guard against a mismatched extension/mimetype pair (basic anti-spoofing check).
  if (actualExt && actualExt !== allowedExt && !(actualExt === ".jpeg" && allowedExt === ".jpg")) {
    return cb(new ApiError(400, "File extension does not match its content type"));
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 8, // matches Product.images max
  },
});

module.exports = { upload, UPLOAD_DIR };
