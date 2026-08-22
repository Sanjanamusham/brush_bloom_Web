const express = require("express");
const ctrl = require("../controllers/products.controller");

const router = express.Router();

router.get("/", ctrl.listProducts);
router.get("/:slug", ctrl.getProductBySlug);

module.exports = router;
