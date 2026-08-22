const express = require("express");
const productsCtrl = require("../controllers/products.controller");
const ordersCtrl = require("../controllers/orders.controller");
const uploadsCtrl = require("../controllers/uploads.controller");
const validate = require("../middleware/validate");
const { requireAdmin } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const {
  productSchema,
  productUpdateSchema,
  orderStatusUpdateSchema,
} = require("../validators/schemas");

const router = express.Router();

router.use(requireAdmin);

router.get("/products", productsCtrl.listProductsAdmin);
router.post("/products", validate(productSchema), productsCtrl.createProduct);
router.patch("/products/:id", validate(productUpdateSchema), productsCtrl.updateProduct);
router.delete("/products/:id", productsCtrl.deleteProduct);

router.get("/orders", ordersCtrl.listOrdersAdmin);
router.get("/orders/:id", ordersCtrl.getOrderAdmin);
router.patch("/orders/:id/status", validate(orderStatusUpdateSchema), ordersCtrl.updateOrderStatus);

router.post("/uploads", upload.array("images", 8), uploadsCtrl.uploadImages);

module.exports = router;
