const mongoose = require("mongoose");

const CATEGORIES = ["Wall Décor", "Mirror Frames", "Wall Clocks", "Custom Orders"];

const productSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[a-z0-9-]+$/, "Slug must be lowercase letters, numbers and dashes"],
      maxlength: 140,
      index: true,
    },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 140 },
    description: { type: String, default: "", trim: true, maxlength: 2000 },
    price: { type: Number, required: true, min: 0, max: 10_000_000 },
    currency: { type: String, default: "INR" },
    dimensions: { type: String, default: "", trim: true, maxlength: 120 },
    category: { type: String, required: true, enum: CATEGORIES, default: "Wall Décor" },
    images: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 8, "Maximum 8 images per product"],
    },
    inStock: { type: Boolean, default: true },
    featured: { type: Boolean, default: false },
    sortOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, sortOrder: 1 });

productSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Product", productSchema);
module.exports.CATEGORIES = CATEGORIES;
