const express = require("express");
const ctrl = require("../controllers/orders.controller");
const validate = require("../middleware/validate");
const { sensitiveLimiter } = require("../middleware/security");
const { orderRequestSchema, trackOrderSchema } = require("../validators/schemas");
const uploadsCtrl = require("../controllers/uploads.controller");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.post("/", sensitiveLimiter, validate(orderRequestSchema), ctrl.createOrder);
router.post("/track", sensitiveLimiter, validate(trackOrderSchema), ctrl.trackOrder);
router.post("/reference-upload", sensitiveLimiter, upload.array("images", 3), uploadsCtrl.uploadReferenceImages);
router.post("/cancel", sensitiveLimiter, validate(trackOrderSchema), ctrl.cancelOrder);
module.exports = router;
