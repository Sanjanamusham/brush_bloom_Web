const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "brush-bloom-products", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );
    stream.end(buffer);
  });
}

exports.uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) throw new ApiError(400, "No files uploaded");

  let results;
  try {
    results = await Promise.all(files.map((f) => uploadBufferToCloudinary(f.buffer)));
  } catch (err) {
    throw new ApiError(502, "Image upload failed. Please try again.");
  }

  const urls = results.map((r) => r.secure_url);
  res.status(201).json({ success: true, data: { urls } });
});