const Product = require("../models/Product");
const ApiError = require("../utils/ApiError");
const asyncHandler = require("../utils/asyncHandler");

// GET /api/products  — public. Supports ?category=&minPrice=&maxPrice=&sort=
exports.listProducts = asyncHandler(async (req, res) => {
  const { category, minPrice, maxPrice, sort } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }

  const sortMap = {
    "price-asc": { price: 1 },
    "price-desc": { price: -1 },
    newest: { createdAt: -1 },
  };
  const sortSpec = sortMap[sort] || { sortOrder: 1, createdAt: -1 };

  const products = await Product.find(filter).sort(sortSpec);
  res.json({ success: true, data: products });
});

// GET /api/products/:slug — public
exports.getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug });
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});

// POST /api/admin/products — admin only
exports.createProduct = asyncHandler(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ success: true, data: product });
});

// PATCH /api/admin/products/:id — admin only
exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: product });
});

// DELETE /api/admin/products/:id — admin only
exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw new ApiError(404, "Product not found");
  res.json({ success: true, data: { id: req.params.id } });
});

// GET /api/admin/products — admin only (includes out-of-stock, all fields)
exports.listProductsAdmin = asyncHandler(async (req, res) => {
  const products = await Product.find().sort({ sortOrder: 1, createdAt: -1 });
  res.json({ success: true, data: products });
});
