const cloudinary = require("../config/cloudinary");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

const CLOUDINARY_FOLDER =
  process.env.NODE_ENV === "production" ? "brush-bloom-products" : "brush-bloom-products-dev";

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: CLOUDINARY_FOLDER, resource_type: "image" },
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

const REFERENCE_FOLDER =
process.env.NODE_ENV === "production" ? "brush-bloom-order-references" : "brush-bloom-order-references-dev";

exports.uploadReferenceImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) throw new ApiError(400, "No files uploaded");
  if (files.length > 3) throw new ApiError(400, "Maximum 3 reference images allowed");

  let results;
  try {
    results = await Promise.all(
      files.map(
        (f) =>
          new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              { folder: REFERENCE_FOLDER, resource_type: "image" },
              (error, result) => (error ? reject(error) : resolve(result)),
            );
            stream.end(f.buffer);
          }),
      ),
    );
  } catch (err) {
    throw new ApiError(502, "Image upload failed. Please try again.");
  }

  res.status(201).json({ success: true, data: { urls: results.map((r) => r.secure_url) } });
});