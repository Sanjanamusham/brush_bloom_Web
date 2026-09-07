const mongoose = require("mongoose");

const ORDER_STATUSES = [
  "Pending Confirmation",
  "Confirmed",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];

const orderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    productName: { type: String, required: true },
    productSlug: { type: String },
    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1, max: 50 },
  },
  { _id: false },
);

const orderSchema = new mongoose.Schema(
  {
    orderCode: { type: String, required: true, unique: true, index: true },
    customerName: { type: String, required: true, trim: true, minlength: 2, maxlength: 75 },
    // Stored normalized (digits only) so tracking lookups are exact-match and index-friendly.
    phone: { type: String, required: true, trim: true, index: true },
    address: { type: String, required: true, trim: true, minlength: 10, maxlength: 500 },
    pincode: {
      type: String,
      required: true,
      trim: true,
      match: [/^[1-9][0-9]{5}$/, "Invalid PIN code"],
    },
    note: { type: String, trim: true, maxlength: 1000 },
    referenceImages: {
      type: [String],
      default: [],
      validate: [(v) => v.length <= 3, "Maximum 3 reference images"],
    },
    referenceLink: { type: String, default: null, trim: true, maxlength: 500 },

    items: {
      type: [orderItemSchema],
      required: true,
      validate: [(v) => v.length > 0 && v.length <= 50, "Order must have 1-50 items"],
    },
    status: { type: String, enum: ORDER_STATUSES, default: "Pending Confirmation", index: true },
    deliveryNote: { type: String, trim: true, maxlength: 1000 },
    estimatedTotal: { type: Number, required: true, min: 0 },
    currency: { type: String, default: "INR" },

    // Reserved for a future payment gateway (Razorpay/Stripe) — never used today, no card/UPI data ever stored.
    paymentStatus: { type: String, default: "unpaid" },
    paymentProvider: { type: String, default: null },
    paymentReference: { type: String, default: null },
    paidAt: { type: Date, default: null },
    contactPreference: { type: String, enum: ["whatsapp", "email"], default: "whatsapp" },
    customerEmail: { type: String, trim: true, lowercase: true, default: null },

    // Reserved for future customer accounts; null for today's guest checkout flow.
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  },
  { timestamps: true },
);

orderSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Order", orderSchema);
module.exports.ORDER_STATUSES = ORDER_STATUSES;
