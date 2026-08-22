const express = require("express");
const ctrl = require("../controllers/orders.controller");
const validate = require("../middleware/validate");
const { sensitiveLimiter } = require("../middleware/security");
const { orderRequestSchema, trackOrderSchema } = require("../validators/schemas");

const router = express.Router();

router.post("/", sensitiveLimiter, validate(orderRequestSchema), ctrl.createOrder);
router.post("/track", sensitiveLimiter, validate(trackOrderSchema), ctrl.trackOrder);

module.exports = router;
