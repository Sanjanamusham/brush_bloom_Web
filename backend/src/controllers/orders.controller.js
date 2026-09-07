const Product = require("../models/Product");
const Order = require("../models/Order");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");
const generateOrderCode = require("../utils/orderCode");
const { normalizePhone } = require("../validators/schemas");
const { sendOrderConfirmedEmail } = require("../utils/email");

// POST /api/orders — public. Creates an order request (no payment collected here).
exports.createOrder = asyncHandler(async (req, res) => {
  const { customerName, phone, addressLine1, landmark, city, state, pincode, note, referenceImages, referenceLink, items } =
    req.body;

  // Composed once, server-side, from individually-validated parts — the free-text
  // "address" stored on the order is never accepted directly from the client.
  const addressParts = [addressLine1];
  if (landmark) addressParts.push(landmark);
  addressParts.push(city, state);
  const address = `${addressParts.join(", ")} - ${pincode}`;

  const ids = [...new Set(items.map((i) => i.productId))];
  const products = await Product.find({ _id: { $in: ids } });
  if (products.length === 0) throw new ApiError(400, "No valid items in this order");

  const priced = items
    .map((item) => {
      const product = products.find((p) => p.id.toString() === item.productId);
      if (!product) return null;
      return {
        productId: product._id,
        productName: product.name,
        productSlug: product.slug,
        unitPrice: product.price,
        quantity: item.quantity,
      };
    })
    .filter(Boolean);

  if (priced.length === 0) throw new ApiError(400, "No valid items in this order");

  const estimatedTotal = priced.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const orderCode = await generateOrderCode();

  const order = await Order.create({
    orderCode,
    customerName,
    phone: normalizePhone(phone),
    address,
    pincode,
    note: note || undefined,
    referenceImages: referenceImages || [],
    referenceLink: referenceLink || undefined,
    items: priced,
    estimatedTotal,
    status: "Pending Confirmation",
  });

  res.status(201).json({
    success: true,
    data: {
      orderCode: order.orderCode,
      estimatedTotal: order.estimatedTotal,
      items: priced.map((i) => ({ name: i.productName, quantity: i.quantity })),
    },
  });
});

// POST /api/orders/track — public. Requires BOTH orderCode and phone to match — the only
// way a customer can read an order, so the full orders collection is never exposed publicly.
exports.trackOrder = asyncHandler(async (req, res) => {
  const { orderCode, phone } = req.body;
  const normalizedPhone = normalizePhone(phone);

  const order = await Order.findOne({ orderCode });

  if (!order || normalizePhone(order.phone) !== normalizedPhone) {
    return res.json({ success: true, data: { found: false } });
  }

  res.json({
    success: true,
    data: {
      found: true,
      order: {
        orderCode: order.orderCode,
        customerName: order.customerName,
        status: order.status,
        deliveryNote: order.deliveryNote || null,
        estimatedTotal: order.estimatedTotal,
        createdAt: order.createdAt,
        items: order.items.map((i) => ({
          name: i.productName,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        })),
      },
    },
  });
});

// GET /api/admin/orders — admin only. Supports ?status=&search= (orderCode or phone)
exports.listOrdersAdmin = asyncHandler(async (req, res) => {
  const { status, search } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const term = String(search).trim();
    filter.$or = [
      { orderCode: new RegExp(term, "i") },
      { phone: new RegExp(term.replace(/\D/g, "")) },
    ];
  }
  const orders = await Order.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: orders });
});

// GET /api/admin/orders/:id — admin only
exports.getOrderAdmin = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new ApiError(404, "Order not found");
  res.json({ success: true, data: order });
});

// PATCH /api/admin/orders/:id/status — admin only
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, deliveryNote } = req.body;
  const previous = await Order.findById(req.params.id);
  if (!previous) throw new ApiError(404, "Order not found");

  const order = await Order.findByIdAndUpdate(
    req.params.id,
    { status, ...(deliveryNote !== undefined ? { deliveryNote } : {}) },
    { new: true, runValidators: true },
  );

  let whatsappConfirmUrl = null;

  if (status === "Confirmed" && previous.status !== "Confirmed") {
    if (order.contactPreference === "email" && order.customerEmail) {
      await sendOrderConfirmedEmail(order.customerEmail, order);
    } else {
      const message = `Hi ${order.customerName}, your order ${order.orderCode} with Brush Bloom Handmade has been confirmed! Estimated total: Rs.${order.estimatedTotal}. Thank you for shopping with us.`;
      whatsappConfirmUrl = `https://wa.me/${order.phone}?text=${encodeURIComponent(message)}`;
    }
  }

  res.json({ success: true, data: order, whatsappConfirmUrl });
});

exports.cancelOrder = asyncHandler(async (req, res) => {
  const { orderCode, phone } = req.body;
  const normalizedPhone = normalizePhone(phone);

  const order = await Order.findOne({ orderCode });
  if (!order || normalizePhone(order.phone) !== normalizedPhone) {
    throw new ApiError(404, "Order not found");
  }

  if (order.status !== "Pending Confirmation") {
    throw new ApiError(
      409,
      "This order has already been confirmed and can no longer be cancelled here. Please message us on WhatsApp.",
    );
  }

  order.status = "Cancelled";
  await order.save();

  res.json({ success: true, data: { orderCode: order.orderCode, status: order.status } });
});
