const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// POST /api/admin/uploads — admin only. Accepts up to 8 image files (field name "images").
// Returns absolute URLs (not relative paths) so they render correctly regardless of which
// origin/port the frontend is served from — no per-template origin-prefixing needed.
exports.uploadImages = asyncHandler(async (req, res) => {
  const files = req.files || [];
  if (files.length === 0) throw new ApiError(400, "No files uploaded");

  const urls = files.map((f) => `${req.protocol}://${req.get("host")}/uploads/${f.filename}`);
  res.status(201).json({ success: true, data: { urls } });
});
