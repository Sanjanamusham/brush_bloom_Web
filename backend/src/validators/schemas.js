const { z } = require("zod");

// Strips control characters and trims — basic input sanitisation, matches the original app.
const clean = (value) => value.replace(/[\u0000-\u001F\u007F]/g, "").trim();

const phoneSchema = z
  .string()
  .transform(clean)
  .refine((v) => /^[+]?[0-9][0-9\s-]{7,17}$/.test(v), {
    message: "Enter a valid phone number (8-18 digits)",
  });

// Digits only — used to match phone numbers regardless of spacing/+prefix.
const normalizePhone = (value) => value.replace(/\D/g, "");

const orderItemSchema = z.object({
  productId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid product id"),
  quantity: z.number().int().min(1).max(50),
});

const pincodeSchema = z
  .string()
  .transform(clean)
  .refine((v) => /^[1-9][0-9]{5}$/.test(v), {
    message: "Enter a valid 6-digit PIN code",
  });

const orderRequestSchema = z.object({
  customerName: z.string().transform(clean).pipe(z.string().min(2).max(100)),
  phone: phoneSchema,
  addressLine1: z.string().transform(clean).pipe(z.string().min(5).max(200)),
  landmark: z.string().transform(clean).pipe(z.string().max(150)).optional().or(z.literal("")),
  city: z.string().transform(clean).pipe(z.string().min(2).max(100)),
  state: z.string().transform(clean).pipe(z.string().min(2).max(100)),
  pincode: pincodeSchema,
  note: z.string().transform(clean).pipe(z.string().max(1000)).optional().or(z.literal("")),
  referenceImages: z.array(z.string().url().max(500)).max(3).optional().default([]),
  referenceLink: z.string().transform(clean).pipe(z.string().url().max(500)).optional().or(z.literal("")),
  items: z.array(orderItemSchema).min(1).max(50),
  contactPreference: z.enum(["whatsapp", "email"]).default("whatsapp"),
 customerEmail: z.string().email().optional().or(z.literal(""))
}).refine(
  (data) => data.contactPreference !== "email" || (data.customerEmail && data.customerEmail.length > 0),
  { message: "Email is required when email is your preferred contact method", path: ["customerEmail"] },
);

const trackOrderSchema = z.object({
  orderCode: z
    .string()
    .transform((v) => clean(v).toUpperCase())
    .pipe(z.string().min(4).max(40)),
  phone: phoneSchema,
});

const productSchema = z.object({
  name: z.string().transform(clean).pipe(z.string().min(2).max(140)),
  slug: z
    .string()
    .transform((v) => clean(v).toLowerCase())
    .pipe(z.string().regex(/^[a-z0-9-]+$/, "Use lowercase letters, numbers and dashes").max(140)),
  description: z.string().transform(clean).pipe(z.string().max(2000)).optional().or(z.literal("")),
  price: z.number().min(0).max(10_000_000),
  currency: z.string().optional(),
  dimensions: z.string().transform(clean).pipe(z.string().max(120)).optional().or(z.literal("")),
  category: z.enum(["Wall Décor", "Mirror Frames", "Custom Orders"]),
  images: z.array(z.string().transform(clean).pipe(z.string().min(1).max(500))).max(8).default([]),
  inStock: z.boolean().default(true),
  featured: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(9999).default(0),
});

const productUpdateSchema = productSchema.partial();

const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(200),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string().min(20).max(200),
  newPassword: z.string().min(8).max(200),
});

const orderStatusUpdateSchema = z.object({
  status: z.enum([
    "Pending Confirmation",
    "Confirmed",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
  ]),
  deliveryNote: z.string().transform(clean).pipe(z.string().max(1000)).optional().or(z.literal("")),
});

const pageViewSchema = z.object({
  path: z.string().transform(clean).pipe(z.string().min(1).max(300)),
  sessionId: z.string().transform(clean).pipe(z.string().min(8).max(100)),
});

const pageViewDurationSchema = z.object({
  sessionId: z.string().transform(clean).pipe(z.string().min(8).max(100)),
  path: z.string().transform(clean).pipe(z.string().min(1).max(300)),
  durationMs: z.number().min(0).max(2 * 60 * 60 * 1000),
});

module.exports = {
  clean,
  normalizePhone,
  orderRequestSchema,
  trackOrderSchema,
  productSchema,
  productUpdateSchema,
  adminLoginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  orderStatusUpdateSchema,
  pageViewDurationSchema,
  pageViewSchema
};
