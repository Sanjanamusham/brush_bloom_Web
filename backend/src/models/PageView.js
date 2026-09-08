const mongoose = require("mongoose");

const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, trim: true, maxlength: 300 },
    sessionId: { type: String, required: true, trim: true, maxlength: 100 },
    durationMs: { type: Number, default: 0, min: 0, max: 2 * 60 * 60 * 1000 },
  },
  { timestamps: true },
);

pageViewSchema.index({ createdAt: -1 });
pageViewSchema.index({ sessionId: 1, createdAt: -1 });

module.exports = mongoose.model("PageView", pageViewSchema);